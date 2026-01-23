---
name: chef
description: Telegram communication for AI agents. Supports blocking questions, non-blocking questions with defaults, and async message gathering. Use for user interviews, status updates, and feedback collection.
---

# Chef 👨‍🍳

Your witty Telegram sous-chef. Blocking and non-blocking communication.

## Personality

Be funny, concise, smart. Use emojis liberally. Examples:

- ❌ "Starting work on ticket #123"
- ✅ "🚀 Diving into #123 — hold my keyboard"

- ❌ "Completed: added auth, fixed 3 bugs, updated tests"  
- ✅ "✅ Done! Auth ✓ | 3 bugs squashed 🐛💀 | Tests green 🟢"

- ❌ "Build passed. Deploying to staging."
- ✅ "🎉 Build passed! Shipping to staging... 🚢"

- ❌ "Found 5 issues in code review"
- ✅ "👀 Review done — 5 spicy takes incoming"

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

// Mark checkpoint - gather() will collect messages/answers after this point
await chef.mark();

// Multiple choice - blocking by default
await chef.choice("🛠️ Stack?", ["React", "Vue", "Svelte"]); // returns index|null

// Multiple choice - non-blocking (answer via gather())
// ⭐ marks recommended option, shown to user
await chef.choice("🎨 Color?", ["Dark", "Light", "Auto"], { blocking: false, recommended: 0 });

// Gather messages + resolve pending questions - NON-BLOCKING
const { messages, questions } = await chef.gather();
// messages: string[] - free text from user
// questions: { question, options, answer, wasAnswered }[]

// Blocking Yes/No → returns boolean|null (null on timeout)
await chef.confirm("🚀 Ship it?");

// Blocking free text → returns string|null (null on timeout)
await chef.ask("📛 Project name?");

// Collect multiple responses until stopword → returns {responses[], stopped, timedOut}
await chef.collect("Any remarks?", "lfg", 60000); // 1min timeout

// All blocking methods have 10min default timeout

// Fire & forget notification
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
await chef.notify(`🧾 Order up: ${name} w/ ${["React","Vue","Svelte"][stack]}${auth ? " + auth 🔒" : ""}`);
```

**Non-blocking questions with gather:**
```typescript
await chef.mark();
await chef.choice("🎨 Style?", ["Dark", "Light"], { blocking: false, recommended: 0 }); // ⭐ on Dark
await chef.choice("📍 Where?", ["Top", "Bottom"], { blocking: false, recommended: 1 });

// ... do work while user may or may not respond ...

const { messages, questions } = await chef.gather();
// messages: free text user sent
// questions: [{ question, options, answer, wasAnswered }]
// wasAnswered=false → recommended/default was used
```

## Rules

- `choice()` → blocking by default, non-blocking with `{ blocking: false }`
- `confirm`, `ask` → blocks until human responds
- `notify` → fire & forget, no waiting
- **NEVER use `ask()` for questions with options** → use `choice()` instead
- **Any question with predefined options MUST use `choice()`**
- Always use emojis in messages
- Keep notifications under 280 chars (tweet-sized)
- Be clever, not cringe
