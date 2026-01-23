/**
 * Chef - Blocking Telegram Q&A for AI agents
 *
 * Usage:
 *   import { chef } from "./skills/chef/scripts/chef.ts";
 *
 *   const idx = await chef.choice("Pick:", ["A", "B", "C"]);
 *   const ok = await chef.confirm("Proceed?");
 *   const text = await chef.ask("Name?");
 *   await chef.notify("Done!");
 *
 * Setup: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 */

const API = "https://api.telegram.org/bot";

interface Update {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
  callback_query?: { id: string; data?: string; message?: { message_id: number; chat: { id: number } } };
}

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
        const content = await file.text();
        for (const line of content.split("\n")) {
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

class ChefError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ChefError";
  }
}

function getConfig() {
  const token = Bun.env.TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
  const chatIdStr = Bun.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;

  if (!token || token.trim() === "") {
    throw new ChefError("TELEGRAM_BOT_TOKEN not found or empty. Set in .env", "MISSING_TOKEN");
  }
  if (!chatIdStr || chatIdStr.trim() === "") {
    throw new ChefError("TELEGRAM_CHAT_ID not found or empty. Set in .env", "MISSING_CHAT_ID");
  }

  const chatId = parseInt(chatIdStr.trim(), 10);
  if (isNaN(chatId)) {
    throw new ChefError(`TELEGRAM_CHAT_ID must be a number, got: "${chatIdStr}"`, "INVALID_CHAT_ID");
  }

  return { api: `${API}${token.trim()}`, chatId };
}

await loadEnv();

async function call<T>(api: string, method: string, body?: object): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${api}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ChefError(`Network error: ${err instanceof Error ? err.message : "fetch failed"}`, "NETWORK_ERROR");
  }

  if (!res.ok) {
    throw new ChefError(`HTTP ${res.status}: ${res.statusText}`, "HTTP_ERROR");
  }

  let json: { ok: boolean; result?: T; description?: string };
  try {
    json = await res.json();
  } catch {
    throw new ChefError("Invalid JSON response from Telegram API", "PARSE_ERROR");
  }

  if (!json.ok) {
    throw new ChefError(json.description ?? "Telegram API error", "API_ERROR");
  }

  return json.result as T;
}

interface PendingQuestion {
  id: number;
  question: string;
  options: string[];
  recommended: number;
  messageId: number;
  answered: boolean;
  answer?: number;
}

interface ChoiceOptions {
  blocking?: boolean;
  recommended?: number;
  cols?: number;
  timeout?: number;
}

class ChefClient {
  private cfg = getConfig();
  private offset = 0;
  private initialized = false;
  private checkpoint = 0;
  private pendingQuestions: PendingQuestion[] = [];
  private questionCounter = 0;

  private async init(): Promise<void> {
    if (this.initialized) return;
    // Fetch latest update_id to skip old messages
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: -1,
      limit: 1,
    });
    if (updates.length > 0) {
      this.offset = updates[0].update_id;
      this.checkpoint = this.offset;
    }
    this.initialized = true;
  }

  /** Mark current position - gather() will collect messages after this point */
  async mark(): Promise<void> {
    await this.init();
    this.checkpoint = this.offset;
    this.pendingQuestions = [];
  }

  /** Gather all messages and resolve pending questions - non-blocking */
  async gather(): Promise<{
    messages: string[];
    questions: Array<{ question: string; options: string[]; answer: string; wasAnswered: boolean }>;
  }> {
    await this.init();
    const messages: string[] = [];
    
    // Get all pending updates without long polling
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: this.checkpoint + 1,
      timeout: 0,
      allowed_updates: ["message", "callback_query"],
    });
    
    for (const u of updates) {
      // Check for callback answers to pending questions
      if (u.callback_query?.message?.chat.id === this.cfg.chatId) {
        const msgId = u.callback_query.message.message_id;
        const pq = this.pendingQuestions.find(q => q.messageId === msgId && !q.answered);
        if (pq && u.callback_query.data) {
          const idx = parseInt(u.callback_query.data);
          if (idx >= 0 && idx < pq.options.length) {
            pq.answered = true;
            pq.answer = idx;
            await this.ackCallback(u.callback_query.id);
            await this.editMessage(msgId, `${pq.question}\n\n✅ ${this.indexToLetter(idx)}) ${pq.options[idx]}`);
          }
        }
      }
      // Check for text answers (letter response)
      if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
        const txt = u.message.text.trim();
        const letterIdx = this.letterToIndex(txt);
        
        // Try to match to unanswered question
        const pq = this.pendingQuestions.find(q => !q.answered && letterIdx >= 0 && letterIdx < q.options.length);
        if (pq && letterIdx >= 0) {
          pq.answered = true;
          pq.answer = letterIdx;
          await this.editMessage(pq.messageId, `${pq.question}\n\n✅ ${this.indexToLetter(letterIdx)}) ${pq.options[letterIdx]}`);
        } else {
          // Regular message, not a question answer
          messages.push(txt);
        }
      }
      this.offset = u.update_id;
    }
    
    // Resolve all pending questions (use recommended for unanswered)
    const questions = this.pendingQuestions.map(pq => ({
      question: pq.question,
      options: pq.options,
      answer: pq.options[pq.answered ? pq.answer! : pq.recommended],
      wasAnswered: pq.answered,
    }));
    
    // Update checkpoint so subsequent gather() won't re-process
    this.checkpoint = this.offset;
    
    return { messages, questions };
  }

  /** @deprecated Use choice() with { blocking: false } instead */
  async question(question: string, options: string[], recommended: number = 0): Promise<void> {
    return this.choice(question, options, { blocking: false, recommended });
  }

  private async send(text: string, keyboard?: object): Promise<number> {
    const result = await call<{ message_id: number }>(this.cfg.api, "sendMessage", {
      chat_id: this.cfg.chatId,
      text,
      parse_mode: "Markdown",
      ...(keyboard && { reply_markup: keyboard }),
    });
    return result.message_id;
  }

  private async editMessage(messageId: number, text: string): Promise<void> {
    try {
      await call(this.cfg.api, "editMessageText", {
        chat_id: this.cfg.chatId,
        message_id: messageId,
        text,
        reply_markup: { inline_keyboard: [] },
      });
    } catch {}
  }

  private async poll(): Promise<Update[]> {
    await this.init();
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: this.offset + 1,
      timeout: 30,
      allowed_updates: ["message", "callback_query"],
    });
    for (const u of updates) this.offset = u.update_id;
    return updates;
  }

  private async ackCallback(callbackId: string): Promise<void> {
    try {
      await call(this.cfg.api, "answerCallbackQuery", { callback_query_id: callbackId });
    } catch {}
  }

  private indexToLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  private letterToIndex(letter: string): number {
    const upper = letter.toUpperCase();
    if (upper.length === 1 && upper >= "A" && upper <= "Z") {
      return upper.charCodeAt(0) - 65;
    }
    return -1;
  }

  /** Multiple choice question - blocking by default, or non-blocking with { blocking: false } */
  async choice(question: string, options: string[], opts: ChoiceOptions = {}): Promise<number | null | void> {
    const { blocking = true, recommended = 0, cols = 4, timeout = 600000 } = opts;
    
    if (!options || options.length === 0) {
      throw new ChefError("choice() requires at least one option", "INVALID_OPTIONS");
    }
    if (options.length > 26) {
      throw new ChefError("choice() supports max 26 options (A-Z)", "TOO_MANY_OPTIONS");
    }
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }
    
    const safeRecommended = recommended < 0 || recommended >= options.length ? 0 : recommended;

    await this.init();

    const optionsList = blocking
      ? options.map((o, i) => `  ${this.indexToLetter(i)}) ${o}`).join("\n")
      : options.map((o, i) => `  ${this.indexToLetter(i)}) ${o}${i === safeRecommended ? " ⭐" : ""}`).join("\n");
    
    const hint = blocking
      ? `💡 _Tap a button or type ${options.length > 1 ? `A-${this.indexToLetter(options.length - 1)}` : "A"}_`
      : `💡 _Tap or ignore (default: ${this.indexToLetter(safeRecommended)})_`;
    
    const fullQuestion = `${question}\n\n${optionsList}\n\n${hint}`;

    const buttons = options.map((_, i) => ({ text: this.indexToLetter(i), callback_data: `${i}` }));
    const rows: { text: string; callback_data: string }[][] = [];
    for (let i = 0; i < buttons.length; i += cols) {
      rows.push(buttons.slice(i, i + cols));
    }

    const msgId = await this.send(fullQuestion, { inline_keyboard: rows });

    if (!blocking) {
      this.pendingQuestions.push({
        id: ++this.questionCounter,
        question,
        options,
        recommended: safeRecommended,
        messageId: msgId,
        answered: false,
      });
      return;
    }

    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      for (const u of await this.poll()) {
        if (u.callback_query?.message?.chat.id === this.cfg.chatId &&
            u.callback_query.message.message_id === msgId) {
          const idx = parseInt(u.callback_query.data ?? "");
          if (idx >= 0 && idx < options.length) {
            await this.ackCallback(u.callback_query.id);
            await this.editMessage(msgId, `${question}\n\n✅ ${this.indexToLetter(idx)}) ${options[idx]}`);
            return idx;
          }
        }
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          const txt = u.message.text.trim();
          const idx = this.letterToIndex(txt);
          if (idx >= 0 && idx < options.length) {
            await this.editMessage(msgId, `${question}\n\n✅ ${this.indexToLetter(idx)}) ${options[idx]}`);
            return idx;
          }
        }
      }
    }
    return null;
  }

  async confirm(question: string, timeoutMs: number = 600000): Promise<boolean | null> {
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }

    const kb = { inline_keyboard: [[
      { text: "✅ Yes", callback_data: "y" },
      { text: "❌ No", callback_data: "n" },
    ]]};
    const msgId = await this.send(question, kb);
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      for (const u of await this.poll()) {
        if (u.callback_query?.message?.chat.id === this.cfg.chatId &&
            u.callback_query.message.message_id === msgId) {
          const d = u.callback_query.data;
          if (d === "y" || d === "n") {
            await this.ackCallback(u.callback_query.id);
            await this.editMessage(msgId, `${question}\n\n✅ ${d === "y" ? "Yes" : "No"}`);
            return d === "y";
          }
        }
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          const txt = u.message.text.toLowerCase().trim();
          if (["yes", "y", "1", "ok"].includes(txt)) {
            await this.editMessage(msgId, `${question}\n\n✅ Yes`);
            return true;
          }
          if (["no", "n", "0"].includes(txt)) {
            await this.editMessage(msgId, `${question}\n\n✅ No`);
            return false;
          }
        }
      }
    }
    return null;
  }

  async ask(question: string, timeoutMs: number = 600000): Promise<string | null> {
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }

    const msgId = await this.send(question);
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      for (const u of await this.poll()) {
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          await this.editMessage(msgId, `${question}\n\n✅`);
          return u.message.text;
        }
      }
    }
    return null;
  }

  async notify(message: string): Promise<void> {
    if (!message || message.trim() === "") {
      throw new ChefError("message cannot be empty", "EMPTY_MESSAGE");
    }

    await this.send(message);
  }

  async collect(question: string, stopword: string = "lfg", timeoutMs: number = 600000): Promise<{ responses: string[]; stopped: boolean; timedOut: boolean }> {
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }

    const responses: string[] = [];
    const stopLower = stopword.toLowerCase();
    const deadline = Date.now() + timeoutMs;
    
    await this.send(`${question}\n\n💡 _Type "${stopword.toUpperCase()}" when done_`);

    while (Date.now() < deadline) {
      for (const u of await this.poll()) {
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          const txt = u.message.text.trim();
          if (txt.toLowerCase() === stopLower) {
            return { responses, stopped: true, timedOut: false };
          }
          responses.push(txt);
          await this.send(`📝 Got it! Keep going or "${stopword.toUpperCase()}" to finish`);
        }
      }
    }
    return { responses, stopped: false, timedOut: true };
  }
}

export const chef = new ChefClient();
export { ChefClient, ChefError };

if (import.meta.main) {
  console.log("Chef - Blocking Telegram Q&A for user interviews\n");
  console.log("API:");
  console.log("  chef.mark()                              → void (checkpoint, clears pending questions)");
  console.log("  chef.gather()                            → {messages[], questions[]} (non-blocking)");
  console.log("  chef.choice(q, opts, {blocking,recommended,cols,timeout})");
  console.log("                                           → index|null (blocking, default)");
  console.log("                                           → void (non-blocking, resolved by gather)");
  console.log("  chef.confirm(q, timeout?)                → boolean|null (blocking Yes/No, 10min default)");
  console.log("  chef.ask(q, timeout?)                    → string|null (blocking free text, 10min default)");
  console.log("  chef.collect(q, stopword?, timeout?)     → {responses[], stopped, timedOut} (10min default)");
  console.log("  chef.notify(msg)                         → void (fire & forget)");
}
