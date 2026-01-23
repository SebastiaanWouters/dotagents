---
name: chef
description: Conducts user interviews via Telegram. Sends blocking questions with inline buttons, waits for response. Supports sending AND receiving screenshots/images. Use for gathering requirements, confirmations, or free-text input during agent tasks.
---

# Chef 👨‍🍳

Your witty Telegram sous-chef. Blocks until the human responds.

> 📸 **Photo support**: Send screenshots TO user (`sendPhoto`) or request screenshots FROM user (`askPhoto`)

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

// Multiple choice → returns index
await chef.choice("🛠️ Stack?", ["React", "Vue", "Svelte"]);

// Yes/No → returns boolean  
await chef.confirm("🚀 Ship it?");

// Free text → returns string
await chef.ask("📛 Project name?");

// Fire & forget notification
await chef.notify("🎬 Lights, camera, coding!");

// Send a screenshot/image to user
await chef.sendPhoto("/path/to/screenshot.png", "👀 Check this out!");

// Ask user for a screenshot → returns path to /tmp
const photoPath = await chef.askPhoto("📸 Send me a screenshot?");
// photoPath = "/tmp/chef-photo-uuid.jpg"
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

## 📸 Screenshot Workflows

**Send screenshot TO user** (show them something):
```typescript
await chef.sendPhoto("/tmp/screenshot.png", "🖼️ Here's the current UI");
```

**Request screenshot FROM user** (blocks until they send one or skip):
```typescript
const photoPath = await chef.askPhoto("🐛 Send me a screenshot of the bug?");
// photoPath = "/tmp/chef-photo-abc123.jpg" or null if user types "skip"
// Use look_at tool to analyze the image
if (photoPath) {
  // Analyze with look_at tool
}
```

**Visual debugging flow:**
```typescript
// 1. Ask user for screenshot of the problem
const bugPhoto = await chef.askPhoto("🐛 What's broken? Screenshot please!");

// 2. Analyze with look_at tool, implement fix, then...

// 3. Send screenshot of the fix for confirmation
await chef.sendPhoto("/tmp/fixed-ui.png", "✅ Fixed it! Look good?");
const approved = await chef.confirm("🚀 Ship it?");
```

## Rules

- `choice`, `confirm`, `ask`, `askPhoto` → blocks until human responds
- `notify`, `sendPhoto` → fire & forget, no waiting
- `askPhoto` downloads to `/tmp/chef-photo-{uuid}.{ext}` or returns `null` if user types "skip"
- Always use emojis in messages
- Keep notifications under 280 chars (tweet-sized)
- Be clever, not cringe
