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
 *   await chef.sendPhoto("/path/to/image.png", "Check this out!");
 *   const photoPath = await chef.askPhoto("Send me a screenshot?");
 *
 * Setup: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 */

import { randomUUID } from "crypto";

const API = "https://api.telegram.org/bot";

interface PhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

interface Update {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    photo?: PhotoSize[];
    caption?: string;
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

class ChefClient {
  private cfg = getConfig();
  private offset = 0;
  private initialized = false;

  private async init(): Promise<void> {
    if (this.initialized) return;
    // Fetch latest update_id to skip old messages
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: -1,
      limit: 1,
    });
    if (updates.length > 0) {
      this.offset = updates[0].update_id;
    }
    this.initialized = true;
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

  async choice(question: string, options: string[], cols: number = 4): Promise<number> {
    if (!options || options.length === 0) {
      throw new ChefError("choice() requires at least one option", "INVALID_OPTIONS");
    }
    if (options.length > 26) {
      throw new ChefError("choice() supports max 26 options (A-Z)", "TOO_MANY_OPTIONS");
    }
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }

    const optionsList = options.map((o, i) => `${this.indexToLetter(i)}) ${o}`).join("\n");
    const hint = `\n\n💡 _Tap a button or type ${options.length > 1 ? `A-${this.indexToLetter(options.length - 1)}` : "A"}_`;
    const fullQuestion = `${question}\n\n${optionsList}${hint}`;

    const buttons = options.map((_, i) => ({ text: this.indexToLetter(i), callback_data: `${i}` }));
    const rows: { text: string; callback_data: string }[][] = [];
    for (let i = 0; i < buttons.length; i += cols) {
      rows.push(buttons.slice(i, i + cols));
    }

    const msgId = await this.send(fullQuestion, { inline_keyboard: rows });

    while (true) {
      for (const u of await this.poll()) {
        if (u.callback_query?.message?.chat.id === this.cfg.chatId &&
            u.callback_query.message.message_id === msgId) {
          const idx = parseInt(u.callback_query.data ?? "");
          if (idx >= 0 && idx < options.length) {
            await this.ackCallback(u.callback_query.id);
            await this.editMessage(msgId, `${fullQuestion}\n\n✅ ${this.indexToLetter(idx)}) ${options[idx]}`);
            return idx;
          }
        }
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          const txt = u.message.text.trim();
          const idx = this.letterToIndex(txt);
          if (idx >= 0 && idx < options.length) {
            await this.editMessage(msgId, `${fullQuestion}\n\n✅ ${this.indexToLetter(idx)}) ${options[idx]}`);
            return idx;
          }
        }
      }
    }
  }

  async confirm(question: string): Promise<boolean> {
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }

    const kb = { inline_keyboard: [[
      { text: "✅ Yes", callback_data: "y" },
      { text: "❌ No", callback_data: "n" },
    ]]};
    const msgId = await this.send(question, kb);

    while (true) {
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
  }

  async ask(question: string): Promise<string> {
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }

    const msgId = await this.send(question);

    while (true) {
      for (const u of await this.poll()) {
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          await this.editMessage(msgId, `${question}\n\n✅`);
          return u.message.text;
        }
      }
    }
  }

  async notify(message: string): Promise<void> {
    if (!message || message.trim() === "") {
      throw new ChefError("message cannot be empty", "EMPTY_MESSAGE");
    }

    await this.send(message);
  }

  async sendPhoto(filePath: string, caption?: string): Promise<void> {
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      throw new ChefError(`File not found: ${filePath}`, "FILE_NOT_FOUND");
    }

    const formData = new FormData();
    formData.append("chat_id", String(this.cfg.chatId));
    formData.append("photo", file);
    if (caption) {
      formData.append("caption", caption);
      formData.append("parse_mode", "Markdown");
    }

    let res: Response;
    try {
      res = await fetch(`${this.cfg.api}/sendPhoto`, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      throw new ChefError(`Network error: ${err instanceof Error ? err.message : "fetch failed"}`, "NETWORK_ERROR");
    }

    if (!res.ok) {
      const body = await res.text();
      throw new ChefError(`HTTP ${res.status}: ${body}`, "HTTP_ERROR");
    }
  }

  private async downloadFile(fileId: string): Promise<string> {
    const fileInfo = await call<{ file_path: string }>(this.cfg.api, "getFile", { file_id: fileId });
    const downloadUrl = `https://api.telegram.org/file/bot${this.cfg.api.replace(API, "")}/${fileInfo.file_path}`;

    let res: Response;
    try {
      res = await fetch(downloadUrl);
    } catch (err) {
      throw new ChefError(`Failed to download file: ${err instanceof Error ? err.message : "fetch failed"}`, "DOWNLOAD_ERROR");
    }

    if (!res.ok) {
      throw new ChefError(`HTTP ${res.status} downloading file`, "HTTP_ERROR");
    }

    const ext = fileInfo.file_path.split(".").pop() || "jpg";
    const localPath = `/tmp/chef-photo-${randomUUID()}.${ext}`;
    const buffer = await res.arrayBuffer();
    await Bun.write(localPath, buffer);

    return localPath;
  }

  async askPhoto(question: string): Promise<string | null> {
    if (!question || question.trim() === "") {
      throw new ChefError("question cannot be empty", "EMPTY_QUESTION");
    }

    const msgId = await this.send(`${question}\n\n📸 _Send a photo (or type "skip" to cancel)_`);

    while (true) {
      for (const u of await this.poll()) {
        if (u.message?.chat.id === this.cfg.chatId) {
          if (u.message.photo && u.message.photo.length > 0) {
            const largestPhoto = u.message.photo[u.message.photo.length - 1];
            const localPath = await this.downloadFile(largestPhoto.file_id);
            await this.editMessage(msgId, `${question}\n\n✅ Photo received`);
            return localPath;
          }
          if (u.message.text) {
            const txt = u.message.text.toLowerCase().trim();
            if (["skip", "cancel", "no", "none", "n"].includes(txt)) {
              await this.editMessage(msgId, `${question}\n\n⏭️ Skipped`);
              return null;
            }
          }
        }
      }
    }
  }
}

export const chef = new ChefClient();
export { ChefClient, ChefError };

if (import.meta.main) {
  console.log("Chef - Blocking Telegram Q&A for user interviews\n");
  console.log("API:");
  console.log("  chef.choice(q, opts, cols?)  → index (A-Z grid buttons)");
  console.log("  chef.confirm(q)              → boolean (Yes/No)");
  console.log("  chef.ask(q)                  → string (free text)");
  console.log("  chef.notify(msg)             → void (no response)");
  console.log("  chef.sendPhoto(path, cap?)   → void (send image)");
  console.log("  chef.askPhoto(q)             → string (path to /tmp)");
}
