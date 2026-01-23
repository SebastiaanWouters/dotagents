---
name: chef
description: Ask user questions via Telegram bot. Provides choice(), confirm(), and ask() functions to get user input with tap-to-answer buttons and 30-minute timeout. Zero dependencies, uses native fetch. Useful when agent needs clarification or user decision during task execution.
---

# Chef

Ask users questions via Telegram, get responses programmatically.

## Setup

Set `TELEGRAM_BOT_TOKEN` via any of:
- Export: `export TELEGRAM_BOT_TOKEN=xxx`
- Project `.env.local`: `TELEGRAM_BOT_TOKEN=xxx`
- Project `.env`: `TELEGRAM_BOT_TOKEN=xxx`

Then message your bot once on Telegram.

## Usage

```typescript
import { chef } from "./chef.ts";

// Multiple choice - returns index (0,1,2...) or null on timeout
const choice = await chef.choice("Which database?", ["PostgreSQL", "MySQL", "SQLite"]);

// Yes/No - returns true/false or null on timeout
const ok = await chef.confirm("Deploy to production?");

// Free text - returns string or null on timeout
const name = await chef.ask("Project name?");

// Notification (no response)
await chef.notify("Task complete!");
```

## Handling Responses

```typescript
const choice = await chef.choice("Environment?", ["prod", "staging", "dev"]);

if (choice === null) {
  // Timeout or error - use default
  env = "dev";
} else {
  env = ["prod", "staging", "dev"][choice];
}
```

## Config

- `TELEGRAM_BOT_TOKEN` - Required
- `PROMPT_TIMEOUT_MS` - Default 1800000 (30 min)
