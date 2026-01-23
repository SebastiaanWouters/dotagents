---
name: chef
description: Conducts user interviews via Telegram. Sends blocking questions with inline buttons, waits for response. Use for gathering requirements, confirmations, or free-text input during agent tasks.
---

# Chef

Telegram Q&A for AI agent interviews. Blocks until user responds.

## Setup

Requires in `.env`:
```
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
```

## Import

```typescript
import { chef } from "./skills/chef/scripts/chef.ts";
```

## API

### Multiple Choice
```typescript
const idx = await chef.choice("What's your preferred stack?", [
  "React + Node",
  "Vue + Python", 
  "Svelte + Go",
  "Other"
]);
// User sees:
// What's your preferred stack?
//
// A) React + Node
// B) Vue + Python
// C) Svelte + Go
// D) Other
//
// [A] [B] [C] [D]  <- grid buttons
//
// Returns: 0, 1, 2, or 3
```

Optional columns parameter (default 4):
```typescript
await chef.choice("Pick one:", options, 3);  // 3 buttons per row
```

### Yes/No
```typescript
const ok = await chef.confirm("Deploy to production?");
// Returns: true or false
```

### Free Text
```typescript
const name = await chef.ask("What should we name this project?");
// Returns: string
```

### Notification
```typescript
await chef.notify("Interview complete. Processing answers...");
```

## Interview Pattern

```typescript
import { chef } from "./skills/chef/scripts/chef.ts";

await chef.notify("Starting requirements interview...");

const stack = await chef.choice("Preferred framework?", ["React", "Vue", "Svelte"]);
const needsAuth = await chef.confirm("Need authentication?");
const projectName = await chef.ask("Project name?");

await chef.notify(`Got it: ${["React","Vue","Svelte"][stack]}, auth=${needsAuth}, name=${projectName}`);
```

## Behavior

- All methods block until user responds (infinite timeout)
- Choice: lists options A-Z in message, shows letter-only grid buttons
- Confirm: Yes/No buttons, also accepts text (yes/y/ok or no/n)
- Ask: waits for any text message
- Edits original message with ✅ and selected answer when answered
