---
name: chef
description: Non-blocking Telegram Q&A for AI agents. Send questions, poll for answers - no blocking waits. Supports choice/confirm/ask, notes collection, and inbox polling. Agent receives all notes and decides relevance.
---

# Chef

Telegram Q&A for AI agents. Non-blocking send/check pattern.

## Setup

Requires in `.env`:
```
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
```

## Import

```typescript
import { chef } from "./.claude/skills/chef/scripts/chef.ts";
```

## Questions

### Multiple Choice
```typescript
const idx = await chef.choice("Which database?", ["PostgreSQL", "SQLite", "MySQL"]);
// Returns: 0, 1, 2, or null (timeout)

// Allow free text answer
const answer = await chef.choice("Database?", ["PG", "SQLite"], { allowOther: true });
// Returns: 0, 1, "custom text", or null
```

### Yes/No
```typescript
const ok = await chef.confirm("Deploy to production?");
// Returns: true, false, or null
```

### Free Text
```typescript
const name = await chef.ask("Project name?");
// Returns: string or null
```

## Non-Blocking Pattern

```typescript
// Send immediately, get ID
const id = await chef.sendChoice("Pick:", ["A", "B"]);
const id = await chef.sendConfirm("Continue?");
const id = await chef.send("Name?");

// Check later (non-blocking)
const answer = await chef.check(id);  // null if not answered

// Wait with timeout
const answer = await chef.wait(id, 30000);  // 30s

// List pending
const pending = await chef.pending();

// Cancel
await chef.cancel(id);
```

## Inbox & Notes

```typescript
// Get all unread messages
const messages = await chef.inbox();
// [{ id, text, timestamp, isNote, isCommand }]

// Get /note messages only
const notes = await chef.checkNotes();
// [{ id, text, timestamp, raw }]
```

## Notifications

```typescript
await chef.notify("Task complete!");
await chef.notify("Processing...", { typing: true });
```

## CLI

```bash
bun chef.ts pending
bun chef.ts check <id>
bun chef.ts notes
bun chef.ts inbox
bun chef.ts clear
```
