---
name: chef
description: Telegram communication for AI agents. ALL methods are BLOCKING. Use for user interviews, status updates, and feedback collection.
---

# Chef 👨‍🍳

Your witty Telegram sous-chef. **ALL methods are BLOCKING.**

## Personality

Be funny, concise, smart. Use emojis liberally. Examples:

- ❌ "Starting work on ticket #123"
- ✅ "🚀 Diving into #123 — hold my keyboard"

- ❌ "Completed: added auth, fixed 3 bugs, updated tests"  
- ✅ "✅ Done! Auth ✓ | 3 bugs squashed 🐛💀 | Tests green 🟢"

- ❌ "Build passed. Deploying to staging."
- ✅ "🎉 Build passed! Shipping to staging... 🚢"

Keep it punchy. One-liners > paragraphs.

## Setup

`.env`:
```
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
```

## API

```typescript
import { chef } from "./skills/chef/scripts/chef.ts";

// Multiple choice - BLOCKING, waits for answer
await chef.choice("🛠️ Stack?", ["React", "Vue", "Svelte"]); // returns index|null

// Yes/No - BLOCKING
await chef.confirm("🚀 Ship it?"); // returns boolean|null

// Free text - BLOCKING
await chef.ask("📛 Project name?"); // returns string|null

// Collect multiple responses until stopword - BLOCKING
await chef.collect("Any remarks?", "lfg", 60000); // returns {responses[], stopped, timedOut}

// Batch questions - BLOCKS until ALL answered (N/A always last option!)
const answers = await chef.batch([
  { question: "🖥️ Platform?", options: ["Web", "Mobile", "Desktop", "N/A"] },
  { question: "🔐 Auth?", options: ["None", "Simple", "OAuth", "N/A"] },
], "🍳 Quick setup questions:");
// answers: [{ question, options, answer, answerIndex }]

// Sequential interview - BLOCKING each question
const results = await chef.interview([
  { type: "ask", question: "📛 Project name?" },
  { type: "choice", question: "🎯 Scope?", options: ["MVP", "V1", "Full"] },
  { type: "confirm", question: "🚀 Ready to start?" },
]);
// results.get("📛 Project name?") → "MyApp"

// Fire & forget notification (only non-blocking method)
await chef.notify("🎬 Lights, camera, coding!");
```

## Patterns

**Start of task:**
```typescript
await chef.notify("🎬 Starting ticket #42 — LFG!");
```

**End of task:**
```typescript
await chef.notify("✅ #42 complete! Auth added 🔐 | 2 bugs obliterated 💥 | Tests passing 🟢");
```

**Quick interview:**
```typescript
const stack = await chef.choice("🍽️ What's cooking?", ["React", "Vue", "Svelte"]);
const auth = await chef.confirm("🔐 Need auth?");
const name = await chef.ask("📛 Name this beast?");
await chef.notify(`🧾 Order up: ${name} w/ ${["React","Vue","Svelte"][stack!]}${auth ? " + auth 🔒" : ""}`);
```

**Batch questions (mise-en-place style):**
```typescript
// All questions sent at once, BLOCKS until ALL answered
// N/A is always last option - allows user to "skip" without breaking flow
const techStack = await chef.batch([
  { question: "⚛️ Frontend?", options: ["React", "Vue", "Svelte", "N/A"] },
  { question: "🎨 UI lib?", options: ["Tailwind", "shadcn", "MUI", "N/A"] },
  { question: "🗄️ Database?", options: ["PostgreSQL", "SQLite", "MongoDB", "N/A"] },
], "🔧 Tech stack questions...");

// Progress shown: "✨ 2/3 done — 1 to go"
// Final: "🎉 All questions answered — LFG!"
```

## Rules

- `choice()` → BLOCKING, waits for answer
- `batch()` → BLOCKING, waits until ALL questions answered
- `confirm()` → BLOCKING, waits for Yes/No
- `ask()` → BLOCKING, waits for free text
- `collect()` → BLOCKING, waits for stopword
- `interview()` → BLOCKING, sequential questions
- `notify()` → fire & forget (only non-blocking method)
- **batch() questions MUST have N/A as last option** — convention for "skip"
- **NEVER use `ask()` for questions with options** → use `choice()` instead
- Always use emojis in messages
- Keep notifications under 280 chars (tweet-sized)
- Be clever, not cringe
