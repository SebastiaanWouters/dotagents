---
name: chef
description: Blocking Telegram prompts for AI agents. Sends questions to user via Telegram bot with inline buttons, waits indefinitely for response. Use for multiple choice, yes/no confirms, or free text input during task execution.
---

# Chef

Blocking Telegram Q&A. Send question → wait for answer → return to agent.

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
const idx = await chef.choice("Which database?", ["PostgreSQL", "SQLite", "MySQL"]);
// Returns: 0, 1, or 2
```

### Yes/No
```typescript
const ok = await chef.confirm("Deploy to production?");
// Returns: true or false
```

### Free Text
```typescript
const name = await chef.ask("Project name?");
// Returns: string
```

### Notification (no response)
```typescript
await chef.notify("Task complete!");
```

## Behavior

- All methods block until user responds (infinite timeout)
- Inline buttons for choice/confirm, text reply for ask
- Confirms answer back to user in Telegram
- Returns typed values directly (no null handling needed)
