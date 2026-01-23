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
  message?: { message_id: number; chat: { id: number }; text?: string };
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

function getConfig() {
  const token = Bun.env.TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
  const chatId = Bun.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN not found. Set in .env");
    process.exit(1);
  }
  if (!chatId) {
    console.error("❌ TELEGRAM_CHAT_ID not found. Set in .env");
    process.exit(1);
  }

  return { api: `${API}${token}`, chatId: parseInt(chatId) };
}

await loadEnv();

async function call<T>(api: string, method: string, body?: object): Promise<T> {
  const res = await fetch(`${api}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.description ?? "API error");
  return json.result;
}

class ChefClient {
  private cfg = getConfig();
  private offset = 0;

  private async send(text: string, keyboard?: object): Promise<number> {
    const result = await call<{ message_id: number }>(this.cfg.api, "sendMessage", {
      chat_id: this.cfg.chatId,
      text,
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

  async choice(question: string, options: string[]): Promise<number> {
    const rows = options.map((o, i) => [{ text: `${i + 1}. ${o}`, callback_data: `${i}` }]);
    const msgId = await this.send(question, { inline_keyboard: rows });

    while (true) {
      for (const u of await this.poll()) {
        if (u.callback_query?.message?.chat.id === this.cfg.chatId &&
            u.callback_query.message.message_id === msgId) {
          const idx = parseInt(u.callback_query.data ?? "");
          if (idx >= 0 && idx < options.length) {
            await this.ackCallback(u.callback_query.id);
            await this.editMessage(msgId, `${question}\n\n✅ ${options[idx]}`);
            return idx;
          }
        }
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          const n = parseInt(u.message.text);
          if (n >= 1 && n <= options.length) {
            await this.editMessage(msgId, `${question}\n\n✅ ${options[n - 1]}`);
            return n - 1;
          }
        }
      }
    }
  }

  async confirm(question: string): Promise<boolean> {
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
    const msgId = await this.send(question);

    while (true) {
      for (const u of await this.poll()) {
        if (u.message?.chat.id === this.cfg.chatId && u.message.text) {
          await this.editMessage(msgId, `${question}\n\n✅ ${u.message.text}`);
          return u.message.text;
        }
      }
    }
  }

  async notify(message: string): Promise<void> {
    await this.send(message);
  }
}

export const chef = new ChefClient();
export { ChefClient };

if (import.meta.main) {
  console.log("Chef - Blocking Telegram Q&A\n");
  console.log("API:");
  console.log("  chef.choice('Pick:', ['A', 'B'])  → index");
  console.log("  chef.confirm('Continue?')         → boolean");
  console.log("  chef.ask('Name?')                 → string");
  console.log("  chef.notify('Done!')              → void");
}
