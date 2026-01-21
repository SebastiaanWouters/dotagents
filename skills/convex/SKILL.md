---
name: convex
description: Build production-ready Convex applications. Triggers on Convex development, backend functions, realtime data, schema design. Use context7 for detailed examples and latest API docs.
references:
  - references/patterns.md
---

# Convex Development

Build reactive, type-safe backends with Convex.

## When to Use Context7

For detailed examples, API specifics, or latest patterns:

```
Use context7 to look up: [specific topic]
```

Topics: queries, mutations, actions, schema validators, indexes, file storage, HTTP actions, cron jobs, agents, auth

## Core Concepts

### Function Types

| Type | Purpose | Database Access | External APIs |
|------|---------|-----------------|---------------|
| `query` | Read data, cached & reactive | Yes | No |
| `mutation` | Write data, transactional | Yes | No |
| `action` | External integrations | Via runQuery/runMutation | Yes |
| `httpAction` | Webhooks, custom endpoints | Via runQuery/runMutation | Yes |

### Function Structure

```typescript
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

export const myFunction = query({
  args: { id: v.id("tableName") },
  returns: v.object({ name: v.string() }),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Validators

| Validator | TypeScript Type |
|-----------|-----------------|
| `v.string()` | `string` |
| `v.number()` | `number` |
| `v.boolean()` | `boolean` |
| `v.id("table")` | `Id<"table">` |
| `v.array(v.string())` | `string[]` |
| `v.object({...})` | `{...}` |
| `v.optional(v.string())` | `string \| undefined` |
| `v.union(v.literal("a"), v.literal("b"))` | `"a" \| "b"` |

## Schema & Indexes

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
```

**Index Rules:**
- Always use `.withIndex()` instead of `.filter()` for queries
- Compound indexes: `["field1", "field2"]` - order matters
- First field in compound index must have equality check

## Error Handling

```typescript
import { ConvexError } from "convex/values";

// Throw user-facing errors
throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });

// Client handling
try {
  await mutation();
} catch (e) {
  if (e instanceof ConvexError) {
    console.log(e.data.code, e.data.message);
  }
}
```

## Realtime (React)

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Auto-subscribes, auto-updates
const data = useQuery(api.myModule.myQuery, { arg: "value" });

// Skip query conditionally (don't use conditional hooks)
const data = useQuery(api.myModule.myQuery, userId ? { userId } : "skip");

// Mutations
const doThing = useMutation(api.myModule.myMutation);
await doThing({ arg: "value" });
```

## Actions & External APIs

```typescript
"use node";  // Required for Node.js APIs

export const callExternalAPI = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    // Call external API
    const response = await fetch("https://api.example.com", {
      method: "POST",
      body: JSON.stringify({ query: args.query }),
    });

    // Store result via mutation
    await ctx.runMutation(api.results.store, {
      data: await response.json()
    });
  },
});
```

## HTTP Actions

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    // Verify signature, process webhook
    await ctx.runMutation(api.events.store, { event: body });
    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

## File Storage

```typescript
// Generate upload URL (mutation)
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Get file URL (query)
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

## Scheduling

```typescript
// Schedule for later
await ctx.scheduler.runAfter(60000, api.tasks.process, { taskId });

// Cron jobs in convex/crons.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();
crons.interval("cleanup", { hours: 24 }, api.tasks.cleanup);
export default crons;
```

## Critical Rules

1. **Never** call external APIs from queries or mutations - use actions
2. **Never** access `ctx.db` directly in actions - use `runQuery`/`runMutation`
3. **Always** define `args` and `returns` validators
4. **Always** use indexes for queries, not `.filter()`
5. **Always** handle `undefined` loading state in React

## Quick Reference

See [patterns.md](references/patterns.md) for copy-paste patterns.

## Deep Dives via Context7

For comprehensive examples, use context7:
- "convex query patterns"
- "convex mutation with validation"
- "convex file upload react"
- "convex webhook signature verification"
- "convex agent threads"
