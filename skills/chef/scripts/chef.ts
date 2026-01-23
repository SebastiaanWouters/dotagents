/**
 * Chef - Ask questions via Telegram
 * 
 * Usage:
 *   import { chef } from "./chef.ts";
 *   const choice = await chef.choice("Pick:", ["A", "B", "C"]);
 *   const ok = await chef.confirm("Proceed?");
 *   const text = await chef.ask("Name?");
 * 
 * Setup: TELEGRAM_BOT_TOKEN via env var or .env/.env.local, then message your bot once.
 */

const API = "https://api.telegram.org/bot";

interface Update {
  update_id: number;
  message?: { chat: { id: number }; text?: string };
  callback_query?: { id: string; data?: string; message?: { chat: { id: number } } };
}

// Load .env/.env.local from project root if not already loaded
// Bun auto-loads from cwd, but we also check common locations
async function loadEnv() {
  const locations = [
    ".env.local",
    ".env",
    `${process.cwd()}/.env.local`,
    `${process.cwd()}/.env`,
  ];
  
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
            // Remove quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || 
                (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            // Only set if not already in environment (env vars take precedence)
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
        break; // Stop after first found file
      }
    } catch {
      // Ignore read errors
    }
  }
}

function getConfig() {
  // Check both Bun.env and process.env for compatibility
  const token = Bun.env.TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("❌ TELEGRAM_BOT_TOKEN not found.");
    console.error("   Set via: export TELEGRAM_BOT_TOKEN=xxx");
    console.error("   Or add to .env.local: TELEGRAM_BOT_TOKEN=xxx");
    process.exit(1);
  }
  return {
    api: `${API}${token}`,
    timeout: parseInt(Bun.env.PROMPT_TIMEOUT_MS ?? process.env.PROMPT_TIMEOUT_MS ?? "1800000"),
  };
}

// Load env on module init
await loadEnv();

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

class ChefClient {
  private cfg = getConfig();
  private chatId: number | null = null;
  private offset = 0;

  private async init() {
    if (this.chatId) return;
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", { limit: 10 });
    for (const u of [...updates].reverse()) {
      const id = u.message?.chat.id ?? u.callback_query?.message?.chat.id;
      if (id) { this.chatId = id; this.offset = u.update_id; return; }
    }
    console.error("❌ No chat found. Message your bot on Telegram first.");
    process.exit(1);
  }

  private async send(text: string, keyboard?: object) {
    await call(this.cfg.api, "sendMessage", {
      chat_id: this.chatId,
      text,
      ...(keyboard && { reply_markup: keyboard }),
    });
  }

  private async poll(timeout: number): Promise<Update[]> {
    const updates = await call<Update[]>(this.cfg.api, "getUpdates", {
      offset: this.offset + 1,
      timeout,
      allowed_updates: ["message", "callback_query"],
    });
    for (const u of updates) this.offset = u.update_id;
    return updates;
  }

  private async clear() {
    try {
      const u = await call<Update[]>(this.cfg.api, "getUpdates", { offset: -1, limit: 1 });
      if (u.length) this.offset = u[0].update_id;
    } catch {}
  }

  async choice(question: string, options: string[]): Promise<number | null> {
    await this.init();
    
    const rows: { text: string; callback_data: string }[][] = [];
    let row: { text: string; callback_data: string }[] = [];
    options.forEach((o, i) => {
      row.push({ text: `${i + 1}. ${o}`, callback_data: `${i}` });
      if (row.length === 3 || i === options.length - 1) { rows.push(row); row = []; }
    });

    try { await this.send(question, { inline_keyboard: rows }); } 
    catch { return null; }

    const start = Date.now();
    await this.clear();

    while (Date.now() - start < this.cfg.timeout) {
      const t = Math.min(30, Math.max(1, Math.floor((this.cfg.timeout - (Date.now() - start)) / 1000)));
      try {
        for (const u of await this.poll(t)) {
          if (u.callback_query?.message?.chat.id === this.chatId) {
            const i = parseInt(u.callback_query.data ?? "");
            if (i >= 0 && i < options.length) return i;
          }
          if (u.message?.chat.id === this.chatId && u.message.text) {
            const n = parseInt(u.message.text);
            if (n >= 1 && n <= options.length) return n - 1;
          }
        }
      } catch { await Bun.sleep(2000); }
    }
    return null;
  }

  async confirm(question: string): Promise<boolean | null> {
    await this.init();
    
    const kb = { inline_keyboard: [[
      { text: "✅ Yes", callback_data: "y" },
      { text: "❌ No", callback_data: "n" },
    ]]};

    try { await this.send(question, kb); } 
    catch { return null; }

    const start = Date.now();
    await this.clear();

    while (Date.now() - start < this.cfg.timeout) {
      const t = Math.min(30, Math.max(1, Math.floor((this.cfg.timeout - (Date.now() - start)) / 1000)));
      try {
        for (const u of await this.poll(t)) {
          if (u.callback_query?.message?.chat.id === this.chatId) {
            if (u.callback_query.data === "y") return true;
            if (u.callback_query.data === "n") return false;
          }
          if (u.message?.chat.id === this.chatId && u.message.text) {
            const txt = u.message.text.toLowerCase().trim();
            if (["yes", "y", "1", "ok"].includes(txt)) return true;
            if (["no", "n", "0"].includes(txt)) return false;
          }
        }
      } catch { await Bun.sleep(2000); }
    }
    return null;
  }

  async ask(question: string): Promise<string | null> {
    await this.init();
    
    try { await this.send(question); } 
    catch { return null; }

    const start = Date.now();
    await this.clear();

    while (Date.now() - start < this.cfg.timeout) {
      const t = Math.min(30, Math.max(1, Math.floor((this.cfg.timeout - (Date.now() - start)) / 1000)));
      try {
        for (const u of await this.poll(t)) {
          if (u.message?.chat.id === this.chatId && u.message.text) {
            return u.message.text;
          }
        }
      } catch { await Bun.sleep(2000); }
    }
    return null;
  }

  async notify(message: string): Promise<void> {
    await this.init();
    try { await this.send(message); } catch {}
  }
}

export const chef = new ChefClient();
export { ChefClient };

// CLI test
if (import.meta.main) {
  console.log("Testing chef...\n");
  
  const c = await chef.choice("Pick one:", ["Option A", "Option B", "Option C"]);
  console.log(`Choice: ${c === null ? "timeout" : c}`);
  
  const ok = await chef.confirm("Continue?");
  console.log(`Confirm: ${ok === null ? "timeout" : ok}`);
  
  const txt = await chef.ask("Enter text:");
  console.log(`Text: ${txt ?? "timeout"}`);
  
  await chef.notify("Done!");
}
