# TanStack Start Server Functions vs Convex Functions

When building with the TCBS stack, one of the most important architectural decisions is choosing between TanStack Start server functions and Convex functions. This guide provides clear guidelines.

## Quick Decision Chart

| Use Case | Use This | Why |
|----------|----------|-----|
| Database CRUD | **Convex query/mutation** | Transactional, real-time, type-safe |
| Real-time data | **Convex query** | Automatic subscriptions, live updates |
| Third-party APIs (Stripe, etc.) | **Convex action** | Runs close to data, can schedule/retry |
| Auth route handlers | **TanStack Start server route** | HTTP handlers for cookies/redirects |
| SSR data preloading | **TanStack Start loader** | Pre-fetch Convex queries for SSR |
| Form validation before submit | **TanStack Start server fn** | Quick validation without hitting Convex |
| Proxy to external auth | **TanStack Start server fn** | Better-Auth routing to Convex |
| File processing before upload | **TanStack Start server fn** | Transform data before sending to Convex |

## The Core Principle

**Convex is your database and backend logic layer. TanStack Start is your rendering and HTTP layer.**

```
┌─────────────────────────────────────────────────────────────┐
│                    TanStack Start                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Components  │  │  Loaders    │  │ Server Functions    │  │
│  │ (React)     │  │  (SSR)      │  │ (HTTP, validation)  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
└─────────┼────────────────┼─────────────────────┼─────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Convex Backend                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Queries    │  │  Mutations  │  │      Actions        │  │
│  │ (read data) │  │(write data) │  │ (external services) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│                    ┌──────────┐                              │
│                    │ Database │                              │
│                    └──────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## When to Use Convex Functions

### ✅ Convex Queries - Use for:
- **All database reads** - Queries are reactive and transactional
- **Real-time data** - Automatic live updates via subscriptions
- **Computed data** - Aggregations, joins, filtered lists

```typescript
// convex/todos.ts
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Automatically reactive - UI updates when data changes
    return ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
```

### ✅ Convex Mutations - Use for:
- **All database writes** - Transactional, consistent
- **Business logic with data** - Validation that requires DB checks
- **Atomic operations** - Multiple writes that must succeed together

```typescript
// convex/todos.ts
export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx); // Auth check
    
    // Check business rules
    const count = await ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .collect();
    
    if (count.length >= 100) {
      throw new ConvexError("Todo limit reached");
    }
    
    // Write - all or nothing
    return ctx.db.insert("todos", {
      text: args.text,
      userId: user._id,
      completed: false,
    });
  },
});
```

### ✅ Convex Actions - Use for:
- **Third-party API calls** (Stripe, OpenAI, email services)
- **Operations that need database access AND external services**
- **Long-running operations** (up to 10 minutes)

```typescript
// convex/payments.ts
export const processPayment = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    // Read order from database
    const order = await ctx.runQuery(internal.orders.get, { id: args.orderId });
    
    // Call Stripe
    const charge = await stripe.charges.create({
      amount: order.total,
      currency: "usd",
    });
    
    // Update order status
    await ctx.runMutation(internal.orders.markPaid, {
      id: args.orderId,
      chargeId: charge.id,
    });
    
    return { success: true };
  },
});
```

## When to Use TanStack Start Server Functions

### ✅ Server Functions - Use for:
- **Auth route handlers** (proxying to Better-Auth/Convex)
- **Quick input validation** before Convex calls
- **Data transformation** before/after Convex calls
- **Non-database operations** that don't need Convex features

```typescript
// src/lib/auth-server.ts - Auth proxy
export const { handler, getToken } = convexBetterAuthReactStart({
  convexUrl: process.env.VITE_CONVEX_URL!,
  convexSiteUrl: process.env.VITE_CONVEX_SITE_URL!,
});
```

```typescript
// src/routes/api/upload.ts - File preprocessing
export const preprocessImage = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file") as File;
    
    // Validate/transform before Convex
    const resized = await sharp(await file.arrayBuffer())
      .resize(800, 800)
      .toBuffer();
    
    // Then upload to Convex storage
    // ...
  });
```

### ✅ Route Loaders - Use for:
- **SSR data preloading** - Fetch Convex data before render
- **Auth checks before render** - Redirect unauthenticated users

```typescript
// src/routes/_authed/index.tsx
export const Route = createFileRoute("/_authed/")({
  loader: async ({ context }) => {
    // Preload Convex queries for SSR
    await Promise.all([
      context.queryClient.ensureQueryData(convexQuery(api.todos.get, {})),
      context.queryClient.ensureQueryData(convexQuery(api.user.current, {})),
    ]);
  },
  component: Dashboard,
});
```

### ✅ Server Routes - Use for:
- **Webhook handlers** - Stripe webhooks, etc.
- **API endpoints** for external consumers
- **Auth callbacks** - OAuth redirects

```typescript
// src/routes/api/webhooks/stripe.ts
export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature")!;
        const body = await request.text();
        
        // Verify webhook, then call Convex
        const event = stripe.webhooks.constructEvent(body, sig, secret);
        
        // Forward to Convex for processing
        await convexClient.mutation(api.stripe.handleWebhook, { event });
        
        return new Response("OK");
      },
    },
  },
});
```

## Anti-Patterns to Avoid

### ❌ Don't: Call actions directly from client for critical operations

**Bad:**
```typescript
// Client calls action directly - no guarantee it runs
const sendEmail = useAction(api.emails.send);
onClick={() => sendEmail({ to: user.email })}
```

**Good:**
```typescript
// Mutation captures intent, schedules action
export const requestEmailVerification = mutation({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Record the intent
    await ctx.db.insert("emailRequests", { userId: user._id, type: "verify" });
    
    // Schedule the action - guaranteed to run
    await ctx.scheduler.runAfter(0, internal.emails.sendVerification, {
      userId: user._id,
    });
  },
});
```

### ❌ Don't: Put database logic in TanStack server functions

**Bad:**
```typescript
// TanStack server function doing database work
export const getTodos = createServerFn().handler(async () => {
  // NO! You lose Convex's reactivity, transactions, and type safety
  const todos = await db.query("SELECT * FROM todos");
  return todos;
});
```

**Good:**
```typescript
// Convex query for database work
export const list = query({
  handler: async (ctx) => {
    return ctx.db.query("todos").collect();
  },
});

// Use in component with real-time updates
const { data: todos } = useSuspenseQuery(convexQuery(api.todos.list, {}));
```

### ❌ Don't: Multiple runQuery/runMutation in actions

**Bad:**
```typescript
export const processOrder = action({
  handler: async (ctx, args) => {
    // Two separate transactions - inconsistent!
    const order = await ctx.runQuery(internal.orders.get, { id: args.id });
    const user = await ctx.runQuery(internal.users.get, { id: order.userId });
    // order and user might reflect different database states!
  },
});
```

**Good:**
```typescript
// Combine into single query
export const getOrderWithUser = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    const user = order ? await ctx.db.get(order.userId) : null;
    return { order, user }; // Guaranteed consistent!
  },
});

export const processOrder = action({
  handler: async (ctx, args) => {
    // Single consistent read
    const { order, user } = await ctx.runQuery(internal.orders.getWithUser, {
      orderId: args.id,
    });
  },
});
```

## Real-Time vs One-Time Data

This is perhaps the most important distinction:

### Convex Queries = Subscriptions (Real-time)
```typescript
// This automatically updates when todos change
const { data: todos } = useSuspenseQuery(convexQuery(api.todos.list, {}));
```

### TanStack Server Functions = One-Time Fetch
```typescript
// This fetches once and does NOT auto-update
const getData = createServerFn().handler(async () => {
  return fetchAuthQuery(api.todos.list, {});
});

// Must manually invalidate to refresh
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["todos"] });
```

**If you need real-time updates, use Convex queries directly.**

## Decision Flowchart

```
Start
  │
  ▼
Does it involve database read/write?
  │
  ├── YES ──► Does it need third-party API?
  │             │
  │             ├── YES ──► Use Convex ACTION
  │             │           (schedule from mutation for reliability)
  │             │
  │             └── NO ──► Read or Write?
  │                          │
  │                          ├── Read ──► Use Convex QUERY
  │                          │
  │                          └── Write ──► Use Convex MUTATION
  │
  └── NO ──► Is it HTTP handling (auth, webhooks)?
               │
               ├── YES ──► Use TanStack SERVER ROUTE
               │
               └── NO ──► Is it SSR preloading?
                            │
                            ├── YES ──► Use TanStack LOADER
                            │           (calling Convex queries)
                            │
                            └── NO ──► Use TanStack SERVER FUNCTION
                                       (validation, transformation)
```

## Summary

| Layer | TanStack Start | Convex |
|-------|---------------|--------|
| **Purpose** | HTTP layer, SSR, routing | Database, business logic |
| **State** | Request-scoped | Persistent, reactive |
| **Real-time** | No (manual invalidation) | Yes (automatic) |
| **Transactions** | No | Yes |
| **Third-party APIs** | Possible | Actions (recommended) |
| **Auth handling** | Route handlers | Functions use auth context |
| **Best for** | Rendering, HTTP concerns | Data, logic, external services |

**Remember:** Convex gives you transactions, real-time subscriptions, and automatic consistency. Only use TanStack Start server functions for HTTP concerns (routing, auth proxying, webhooks) or preprocessing before Convex calls.
