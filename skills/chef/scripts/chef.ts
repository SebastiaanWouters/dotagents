/**
 * Chef - Non-blocking Telegram Q&A for AI agents
 * 
 * Usage:
 *   import { chef } from "./chef.ts";
 *   
 *   // Non-blocking: send question, poll for answer
 *   const qid = await chef.send("What's the project name?");
 *   // ... agent does other work ...
 *   const answer = await chef.check(qid);  // null if not answered yet
 *   
 *   // Blocking (with short timeout for compatibility)
 *   const name = await chef.ask("Name?", { timeout: 10000 }); // 10s timeout
 *   
 *   // Choice with full visibility
 *   const choice = await chef.sendChoice("Pick:", ["A", "B"], { allowOther: true });
 *   const picked = await chef.check(choice);
 *   
 *   // Check for notes (user sends: /note remember to add tests)
 *   const notes = await chef.checkNotes();
 *   
 *   // Check inbox for any messages
 *   const messages = await chef.inbox();
 * 
 * Setup: TELEGRAM_BOT_TOKEN via env var or .env/.env.local
 */

import { mkdir, readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

const API = "https://api.telegram.org/bot";
const CHEF_DIR = join(import.meta.dir, ".chef");
const QUEUE_DIR = join(CHEF_DIR, "queue");

interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  text?: string;
  date: number;
  from?: { id: number; first_name?: string; username?: string };
}

interface Update {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: { id: string; data?: string; message?: TelegramMessage };
}

interface Question {
  id: string;
  type: "ask" | "choice" | "confirm";
  question: string;
  options?: string[];
  allowOther?: boolean;
  messageId: number;
  chatId: number;
  createdAt: number;
  answeredAt?: number;
  answer?: string | number | boolean | null;
  expired?: boolean;
}

interface Note {
  id: number;
  text: string;
  timestamp: Date;
  raw: string;
}

interface InboxMessage {
  id: number;
  text: string;
  timestamp: Date;
  isNote: boolean;
  isCommand: boolean;
}

interface NotifyOptions {
  typing?: boolean;
}

interface SendOptions {
  allowOther?: boolean;
  timeout?: number;
}

// Ensure chef directories exist
async function ensureChefDirs() {
  try {
    await mkdir(CHEF_DIR, { recursive: true });
    await mkdir(QUEUE_DIR, { recursive: true });
  } catch {}
}

// Walk up from cwd to find .env files
async function loadEnv() {
  const locations: string[] = [];
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    locations.push(`${dir}/.env.local`, `${dir}/.env`);
    const parent = dir.replace(/\/[^/]+$/, "");
    if (parent === dir) break;
    dir = parent;
  }
  
  for (const path of locations) {
    try {
      const file = Bun.file(path);
      if (await file.exists()) {
        const text = await file.text();
        for (const line of text.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eq = trimmed.indexOf("=");
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            let val = trimmed.slice(eq + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || 
                (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
        break;
      }
    } catch {}
  }
}

function getConfig() {
  const token = Bun.env.TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
  const chatId = Bun.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;
  
  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN not found.");
    console.error("   Set via: export TELEGRAM_BOT_TOKEN=xxx");
    console.error("   Or add to .env: TELEGRAM_BOT_TOKEN=xxx");
    process.exit(1);
  }
  if (!chatId) {
    console.error("❌ TELEGRAM_CHAT_ID not found.");
    console.error("   Set via: export TELEGRAM_CHAT_ID=xxx");
    console.error("   Or add to .env: TELEGRAM_CHAT_ID=xxx");
    console.error("   (Message your bot, then check https://api.telegram.org/bot<TOKEN>/getUpdates)");
    process.exit(1);
  }
  
  return {
    api: `${API}${token}`,
    chatId: parseInt(chatId),
    timeout: parseInt(Bun.env.PROMPT_TIMEOUT_MS ?? process.env.PROMPT_TIMEOUT_MS ?? "1800000"),
  };
}

await loadEnv();
await ensureChefDirs();

async function call<T>(api: string, method: string, body?: object): Promise<T> {
  const res = await fetch(`${api}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json() as { ok: boolean; result: T; description?: string };
  if (!json.ok) throw new Error(json.description ?? "Telegram API error");
  return json.result;
}

function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

class ChefClient {
  private cfg = getConfig();
  private chatId: number;
  private offset = 0;
  private processedNotes: Set<number> = new Set();

  constructor() {
    this.chatId = this.cfg.chatId;
  }

  private async sendMessage(text: string, keyboard?: object): Promise<number> {
    const result = await call<TelegramMessage>(this.cfg.api, "sendMessage", {
      chat_id: this.chatId,
      text,
      ...(keyboard && { reply_markup: keyboard }),
    });
    return result.message_id;
  }

  private async sendTyping(): Promise<void> {
    try {
      await call(this.cfg.api, "sendChatAction", {
        chat_id: this.chatId,
        action: "typing",
      });
    } catch {}
  }

  private async confirmAnswer(messageId: number, question: string, selected: string): Promise<void> {
    // Edit message: show selected answer, remove buttons
    try {
      await call(this.cfg.api, "editMessageText", {
        chat_id: this.chatId,
        message_id: messageId,
        text: `${question}\n\n✅ ${selected}`,
        reply_markup: { inline_keyboard: [] },
      });
    } catch {}
  }

  private async saveQuestion(q: Question): Promise<void> {
    const file = Bun.file(join(QUEUE_DIR, `${q.id}.json`));
    await Bun.write(file, JSON.stringify(q, null, 2));
  }

  private async loadQuestion(id: string): Promise<Question | null> {
    try {
      const file = Bun.file(join(QUEUE_DIR, `${id}.json`));
      if (await file.exists()) {
        return await file.json();
      }
    } catch {}
    return null;
  }

  private async deleteQuestion(id: string): Promise<void> {
    try {
      await unlink(join(QUEUE_DIR, `${id}.json`));
    } catch {}
  }

  // Poll Telegram for new updates (does NOT advance offset - caller decides)
  private async pollUpdates(): Promise<Update[]> {
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      timeout: 0, // Non-blocking
      allowed_updates: ["message", "callback_query"],
    });
    return updates;
  }

  // Acknowledge updates by advancing offset
  private async ackUpdate(updateId: number): Promise<void> {
    await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: updateId + 1,
      limit: 1,
      timeout: 0,
    });
    this.offset = updateId;
  }

  // Process updates and match to pending questions
  private async processUpdates(): Promise<void> {
    const updates = await this.pollUpdates();
    if (updates.length === 0) return;

    // Load all pending questions
    const files = await readdir(QUEUE_DIR).catch(() => []);
    const questions: Question[] = [];
    for (const f of files) {
      if (f.endsWith(".json")) {
        const q = await this.loadQuestion(f.replace(".json", ""));
        if (q && q.answer === undefined && !q.expired) questions.push(q);
      }
    }

    for (const u of updates) {
      let matched = false;

      // Handle callback queries (button clicks)
      if (u.callback_query?.message) {
        const data = u.callback_query.data ?? "";
        const msgId = u.callback_query.message.message_id;
        const chatId = u.callback_query.message.chat.id;
        
        let selected = "";
        
        // Find matching question by message ID
        const q = questions.find(q => q.messageId === msgId && q.chatId === chatId);
        if (q) {
          if (q.type === "choice") {
            if (data !== "other") {
              const idx = parseInt(data);
              if (!isNaN(idx) && q.options) {
                q.answer = idx;
                q.answeredAt = Date.now();
                await this.saveQuestion(q);
                selected = q.options[idx];
                matched = true;
              }
            }
          } else if (q.type === "confirm") {
            q.answer = data === "y";
            q.answeredAt = Date.now();
            await this.saveQuestion(q);
            selected = data === "y" ? "Yes" : "No";
            matched = true;
          }
        }
        
        // Acknowledge callback and update message
        try {
          await call(this.cfg.api, "answerCallbackQuery", { 
            callback_query_id: u.callback_query.id,
          });
          
          if (matched && q) {
            await this.confirmAnswer(msgId, q.question, selected);
          }
        } catch {}
      }

      // Handle text messages
      if (u.message?.chat.id && u.message.text) {
        const txt = u.message.text.trim();
        const chatId = u.message.chat.id;
        const userMsgId = u.message.message_id;
        
        // Skip /note commands - handled separately
        if (txt.toLowerCase().startsWith("/note ")) continue;
        
        // Find most recent unanswered question for this chat
        const q = questions
          .filter(q => q.answer === undefined && q.chatId === chatId)
          .sort((a, b) => b.createdAt - a.createdAt)[0];
        
        if (q) {
          if (q.type === "ask") {
            q.answer = txt;
            q.answeredAt = Date.now();
            await this.saveQuestion(q);
            matched = true;
          } else if (q.type === "choice") {
            const n = parseInt(txt);
            if (n >= 1 && n <= (q.options?.length ?? 0)) {
              q.answer = n - 1;
              q.answeredAt = Date.now();
              await this.saveQuestion(q);
              matched = true;
            } else if (q.allowOther && isNaN(n)) {
              q.answer = txt;
              q.answeredAt = Date.now();
              await this.saveQuestion(q);
              matched = true;
            }
          } else if (q.type === "confirm") {
            const lower = txt.toLowerCase();
            if (["yes", "y", "1", "ok"].includes(lower)) {
              q.answer = true;
              q.answeredAt = Date.now();
              await this.saveQuestion(q);
              matched = true;
            } else if (["no", "n", "0"].includes(lower)) {
              q.answer = false;
              q.answeredAt = Date.now();
              await this.saveQuestion(q);
              matched = true;
            }
          }
          
        }
      }

      // Acknowledge processed updates
      if (matched) {
        await this.ackUpdate(u.update_id);
      }
    }
  }

  // ==================== NON-BLOCKING API ====================

  // Send a question, return ID immediately
  async send(question: string): Promise<string> {
    
    const id = generateId();
    const messageId = await this.sendMessage(question);
    
    const q: Question = {
      id,
      type: "ask",
      question,
      messageId,
      chatId: this.chatId!,
      createdAt: Date.now(),
    };
    await this.saveQuestion(q);
    return id;
  }

  // Send a choice question, return ID immediately
  async sendChoice(question: string, options: string[], opts?: SendOptions): Promise<string> {
    
    const id = generateId();
    
    const fullQuestion = `${question}\n\n${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}${opts?.allowOther ? "\n\nOr type your own answer:" : ""}`;
    
    const rows = options.map((o, i) => [{ 
      text: `${i + 1}. ${o.slice(0, 30)}${o.length > 30 ? "…" : ""}`, 
      callback_data: `${i}` 
    }]);
    if (opts?.allowOther) {
      rows.push([{ text: "✏️ Other (type below)", callback_data: "other" }]);
    }

    const messageId = await this.sendMessage(fullQuestion, { inline_keyboard: rows });
    
    const q: Question = {
      id,
      type: "choice",
      question,
      options,
      allowOther: opts?.allowOther,
      messageId,
      chatId: this.chatId!,
      createdAt: Date.now(),
    };
    await this.saveQuestion(q);
    return id;
  }

  // Send a confirm question, return ID immediately
  async sendConfirm(question: string): Promise<string> {
    
    const id = generateId();
    
    const kb = { inline_keyboard: [[
      { text: "✅ Yes", callback_data: "y" },
      { text: "❌ No", callback_data: "n" },
    ]]};

    const messageId = await this.sendMessage(question, kb);
    
    const q: Question = {
      id,
      type: "confirm",
      question,
      messageId,
      chatId: this.chatId!,
      createdAt: Date.now(),
    };
    await this.saveQuestion(q);
    return id;
  }

  // Check if a question has been answered (non-blocking)
  async check(id: string): Promise<string | number | boolean | null> {
    await this.processUpdates();
    const q = await this.loadQuestion(id);
    if (!q) return null;
    if (q.answer !== undefined) {
      await this.deleteQuestion(id); // Clean up
      return q.answer;
    }
    return null;
  }

  // Check without deleting (peek)
  async peek(id: string): Promise<string | number | boolean | null> {
    await this.processUpdates();
    const q = await this.loadQuestion(id);
    if (!q) return null;
    return q.answer ?? null;
  }

  // Wait for answer with timeout (blocking but short)
  async wait(id: string, timeoutMs: number = 10000): Promise<string | number | boolean | null> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const answer = await this.check(id);
      if (answer !== null) return answer;
      await Bun.sleep(1000);
    }
    return null;
  }

  // Cancel a pending question
  async cancel(id: string): Promise<void> {
    await this.deleteQuestion(id);
  }

  // List pending questions
  async pending(): Promise<Question[]> {
    await this.processUpdates();
    const files = await readdir(QUEUE_DIR).catch(() => []);
    const questions: Question[] = [];
    for (const f of files) {
      if (f.endsWith(".json")) {
        const q = await this.loadQuestion(f.replace(".json", ""));
        if (q && q.answer === undefined) questions.push(q);
      }
    }
    return questions.sort((a, b) => a.createdAt - b.createdAt);
  }

  // ==================== BLOCKING API (convenience, short timeout) ====================

  // Blocking ask with short default timeout
  async ask(question: string, opts?: { timeout?: number }): Promise<string | null> {
    const id = await this.send(question);
    const answer = await this.wait(id, opts?.timeout ?? 30000);
    return typeof answer === "string" ? answer : null;
  }

  // Blocking choice with short default timeout
  async choice(question: string, options: string[], opts?: SendOptions): Promise<number | string | null> {
    const id = await this.sendChoice(question, options, opts);
    const answer = await this.wait(id, opts?.timeout ?? 30000);
    if (typeof answer === "number") return answer;
    if (typeof answer === "string") return answer;
    return null;
  }

  // Blocking confirm with short default timeout
  async confirm(question: string, opts?: { timeout?: number }): Promise<boolean | null> {
    const id = await this.sendConfirm(question);
    const answer = await this.wait(id, opts?.timeout ?? 30000);
    return typeof answer === "boolean" ? answer : null;
  }

  // ==================== NOTIFICATIONS ====================

  async notify(message: string, opts?: NotifyOptions): Promise<void> {
    
    
    if (opts?.typing) {
      await this.sendTyping();
    }
    
    try {
      await this.sendMessage(message);
    } catch {}
  }

  // ==================== NOTES & INBOX ====================

  // Check for /note messages - returns all, agent decides relevance
  async checkNotes(opts?: { markAsRead?: boolean }): Promise<Note[]> {
    
    await this.processUpdates();
    
    const markAsRead = opts?.markAsRead ?? true;
    
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: this.offset + 1,
      timeout: 0,
      allowed_updates: ["message"],
    });
    
    const notes: Note[] = [];
    
    for (const u of updates) {
      if (u.message?.chat.id !== this.chatId) continue;
      if (this.processedNotes.has(u.update_id)) continue;
      
      const text = u.message.text?.trim() ?? "";
      
      if (text.toLowerCase().startsWith("/note ")) {
        const noteText = text.slice(6).trim();
        notes.push({
          id: u.update_id,
          text: noteText,
          timestamp: new Date(u.message.date * 1000),
          raw: text,
        });
        
        if (markAsRead) {
          this.processedNotes.add(u.update_id);
          this.offset = u.update_id;
        }
      }
    }
    
    return notes;
  }

  // Check inbox for any messages
  async inbox(opts?: { includeNotes?: boolean; limit?: number }): Promise<InboxMessage[]> {
    
    await this.processUpdates();
    
    const includeNotes = opts?.includeNotes ?? true;
    const limit = opts?.limit ?? 50;
    
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: this.offset + 1,
      timeout: 0,
      allowed_updates: ["message"],
    });
    
    const messages: InboxMessage[] = [];
    
    for (const u of updates.slice(-limit)) {
      if (u.message?.chat.id !== this.chatId) continue;
      
      const text = u.message.text?.trim() ?? "";
      if (!text) continue;
      
      const isNote = text.toLowerCase().startsWith("/note ");
      const isCommand = text.startsWith("/");
      
      if (!includeNotes && isNote) continue;
      
      messages.push({
        id: u.update_id,
        text: isNote ? text.slice(6).trim() : text,
        timestamp: new Date(u.message.date * 1000),
        isNote,
        isCommand,
      });
      
      this.offset = u.update_id;
    }
    
    return messages;
  }

  // Clear all pending questions
  async clearQueue(): Promise<void> {
    const files = await readdir(QUEUE_DIR).catch(() => []);
    for (const f of files) {
      if (f.endsWith(".json")) {
        await unlink(join(QUEUE_DIR, f)).catch(() => {});
      }
    }
  }

  clearNotesCache(): void {
    this.processedNotes.clear();
  }
}

export const chef = new ChefClient();
export { ChefClient };
export type { Question, Note, InboxMessage, NotifyOptions, SendOptions };

// CLI test
if (import.meta.main) {
  const cmd = process.argv[2];
  
  if (cmd === "pending") {
    const pending = await chef.pending();
    console.log(`Pending questions: ${pending.length}`);
    for (const q of pending) {
      console.log(`  [${q.id}] ${q.type}: ${q.question.slice(0, 50)}...`);
    }
  } else if (cmd === "check" && process.argv[3]) {
    const answer = await chef.check(process.argv[3]);
    console.log(`Answer: ${answer ?? "(not yet)"}`);
  } else if (cmd === "notes") {
    const notes = await chef.checkNotes();
    console.log(`Notes: ${notes.length}`);
    for (const n of notes) {
      console.log(`  - ${n.text}`);
    }
  } else if (cmd === "inbox") {
    const messages = await chef.inbox();
    console.log(`Inbox: ${messages.length}`);
    for (const m of messages) {
      console.log(`  ${m.isNote ? "[NOTE]" : ""} ${m.text}`);
    }
  } else if (cmd === "clear") {
    await chef.clearQueue();
    console.log("Queue cleared");
  } else {
    console.log("Chef - Non-blocking Telegram Q&A\n");
    console.log("Commands:");
    console.log("  bun chef.ts pending       - List pending questions");
    console.log("  bun chef.ts check <id>    - Check if answered");
    console.log("  bun chef.ts notes         - Check for /note messages");
    console.log("  bun chef.ts inbox         - Check all messages");
    console.log("  bun chef.ts clear         - Clear pending queue");
    console.log("\nAPI:");
    console.log("  const id = await chef.send('Question?')  // non-blocking");
    console.log("  const answer = await chef.check(id)      // poll for answer");
    console.log("  const answer = await chef.wait(id, 10000) // wait with timeout");
  }
}
