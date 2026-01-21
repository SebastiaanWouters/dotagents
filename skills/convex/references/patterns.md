# Convex Patterns Cheatsheet

Copy-paste patterns for common operations.

## CRUD Operations

### List with Pagination

```typescript
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Get by ID

```typescript
export const get = query({
  args: { id: v.id("items") },
  returns: v.union(v.object({ /* schema */ }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Create

```typescript
export const create = mutation({
  args: { name: v.string(), status: v.string() },
  returns: v.id("items"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", {
      name: args.name,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});
```

### Update (Patch)

```typescript
export const update = mutation({
  args: { id: v.id("items"), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
```

### Delete

```typescript
export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

## Query Patterns

### With Index (Always Prefer)

```typescript
const users = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", email))
  .unique();
```

### Compound Index

```typescript
// Schema: .index("by_org_role", ["orgId", "role"])
const admins = await ctx.db
  .query("users")
  .withIndex("by_org_role", (q) =>
    q.eq("orgId", orgId).eq("role", "admin")
  )
  .collect();
```

### Range Query

```typescript
const recent = await ctx.db
  .query("events")
  .withIndex("by_timestamp", (q) =>
    q.gte("timestamp", startTime).lt("timestamp", endTime)
  )
  .collect();
```

## React Hooks

### Paginated Query

```typescript
const { results, status, loadMore } = usePaginatedQuery(
  api.items.list,
  {},
  { initialNumItems: 20 }
);

// Load more on scroll
if (status === "CanLoadMore") {
  loadMore(20);
}
```

### Optimistic Update

```typescript
const addItem = useMutation(api.items.create).withOptimisticUpdate(
  (localStore, args) => {
    const existing = localStore.getQuery(api.items.list, {});
    if (existing) {
      localStore.setQuery(api.items.list, {}, [
        ...existing,
        { _id: crypto.randomUUID(), ...args },
      ]);
    }
  }
);
```

## File Upload (React)

```typescript
const generateUploadUrl = useMutation(api.files.generateUploadUrl);
const saveFile = useMutation(api.files.save);

async function handleUpload(file: File) {
  const uploadUrl = await generateUploadUrl();

  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const { storageId } = await result.json();
  await saveFile({ storageId, filename: file.name });
}
```

## Webhook Handler

```typescript
http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    const body = await request.text();

    // Verify signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    await ctx.runMutation(api.webhooks.process, { event });
    return new Response("OK", { status: 200 });
  }),
});
```

## Internal Functions

```typescript
import { internalMutation, internalQuery } from "./_generated/server";

// Only callable from other Convex functions
export const processInternal = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, args) => {
    // Sensitive logic
  },
});

// Call from action
await ctx.runMutation(internal.module.processInternal, { data });
```

## Auth Pattern

```typescript
export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});
```

## Schema Migration Pattern

```typescript
// 1. Add new field as optional
// 2. Run backfill
export const backfill = internalMutation({
  handler: async (ctx) => {
    const items = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("newField"), undefined))
      .take(100);

    for (const item of items) {
      await ctx.db.patch(item._id, { newField: computeValue(item) });
    }

    if (items.length === 100) {
      await ctx.scheduler.runAfter(0, internal.migrations.backfill);
    }
  },
});
// 3. Make field required in schema
```
