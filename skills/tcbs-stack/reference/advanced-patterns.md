# Advanced TCBS Patterns

## Important Notes

### Convex Version Requirement
Convex + Better Auth requires **Convex v1.25.0 or later**. Always use `convex@latest`.

### expectAuth: true
When using `expectAuth: true` in `ConvexQueryClient`, authenticated queries won't run before authentication is ready. However, if a user signs out and signs back in, errors may occur. **Reload the page on sign out** to avoid issues.

## Authentication Plugins

Better-Auth supports plugins for extended authentication:

```typescript
// src/lib/auth-client.tsx
import { createAuthClient } from "better-auth/react";
import {
  convexClient,
  magicLinkClient,
  emailOTPClient,
  twoFactorClient,
  anonymousClient,
} from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    anonymousClient(),
  ],
});
```

```typescript
// convex/auth.ts - Backend plugin setup
import { magicLink, emailOTP, twoFactor, anonymous } from "better-auth/plugins";

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    plugins: [
      convex({ authConfig }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendEmail(ctx, { to: email, subject: "Sign in link", url });
        },
      }),
      emailOTP({
        sendVerificationOTP: async ({ email, otp }) => {
          await sendEmail(ctx, { to: email, subject: "Your code", otp });
        },
      }),
      twoFactor(),
      anonymous(),
    ],
  });
};
```

## OAuth Providers

Configure social login in Convex environment:

```bash
# convex/.env.local
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

```typescript
// convex/auth.ts
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    // ...
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
  });
};
```

## User Triggers

Sync Better-Auth users to your custom tables:

```typescript
// convex/auth.ts
export const authComponent = createClient<DataModel>(components.betterAuth, {
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        const userId = await ctx.db.insert("users", {
          email: authUser.email,
          name: authUser.name,
          image: authUser.image,
          createdAt: Date.now(),
        });
        await authComponent.setUserId(ctx, authUser._id, userId);
      },
      onUpdate: async (ctx, authUser) => {
        const user = await ctx.db.query("users")
          .withIndex("authId", (q) => q.eq("authId", authUser._id))
          .first();
        if (user) {
          await ctx.db.patch(user._id, {
            name: authUser.name,
            image: authUser.image,
          });
        }
      },
      onDelete: async (ctx, authUser) => {
        const user = await ctx.db.query("users")
          .withIndex("authId", (q) => q.eq("authId", authUser._id))
          .first();
        if (user) {
          await ctx.db.delete(user._id);
        }
      },
    },
  },
});
```

## Email Integration with Resend

```typescript
// convex/email.tsx
import { Resend } from "@react-email/resend";
import { components } from "./_generated/api";
import { ActionCtx } from "./_generated/server";

const resend = new Resend(components.resend);

export async function sendEmail(
  ctx: ActionCtx,
  { to, subject, html }: { to: string; subject: string; html: string }
) {
  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to,
    subject,
    html,
  });
}
```

## SSR Data Preloading

Preload data during SSR for faster initial render:

```typescript
// src/routes/_authed/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/_authed/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {})),
      context.queryClient.ensureQueryData(convexQuery(api.todos.get, {})),
    ]);
  },
  component: Dashboard,
});
```

## Real-time Subscriptions

Convex provides automatic real-time updates:

```typescript
import { useQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";

function TodoList() {
  // Automatically updates when data changes
  const { data: todos } = useQuery(api.todos.get);

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo._id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

## Server Functions with Auth

Access auth in TanStack Start server functions:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { fetchAuthQuery, fetchAuthMutation } from "~/lib/auth-server";
import { api } from "convex/_generated/api";

export const getProtectedData = createServerFn({ method: "GET" }).handler(
  async () => {
    // Automatically includes auth token
    const user = await fetchAuthQuery(api.auth.getCurrentUser, {});
    if (!user) throw new Error("Unauthorized");
    return fetchAuthQuery(api.data.getPrivate, { userId: user._id });
  }
);
```

## Using Better Auth API from Convex

Better Auth's `auth.api` methods run inside Convex functions, not TanStack Start server code:

```typescript
// convex/users.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { createAuth, authComponent } from "./auth";

export const updatePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers,
    });
  },
});
```

Then call from a server action:

```typescript
// src/actions.ts
"use server";
import { fetchAuthMutation } from "~/lib/auth-server";
import { api } from "../convex/_generated/api";

export async function updatePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  await fetchAuthMutation(api.users.updatePassword, {
    currentPassword,
    newPassword,
  });
}
```

## Custom Middleware

```typescript
// src/lib/middleware.ts
import { createMiddleware } from "@tanstack/react-start";
import { getToken } from "./auth-server";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const token = await getToken();
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  return next();
});

// Use in routes
export const Route = createFileRoute("/api/protected")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async () => Response.json({ secret: "data" }),
    },
  },
});
```

## File Uploads with Convex

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: { storageId: v.id("_storage"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    await ctx.db.insert("files", {
      storageId: args.storageId,
      name: args.name,
      userId: user._id,
    });
  },
});
```

```typescript
// Frontend upload component
import { useMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";

function FileUpload() {
  const generateUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);

  const handleUpload = async (file: File) => {
    const url = await generateUrl();
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await response.json();
    await saveFile({ storageId, name: file.name });
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />;
}
```

## Pagination

```typescript
// convex/posts.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { cursor: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { cursor, limit = 10 }) => {
    const results = await ctx.db
      .query("posts")
      .order("desc")
      .paginate({ cursor, numItems: limit });

    return {
      posts: results.page,
      nextCursor: results.continueCursor,
      isDone: results.isDone,
    };
  },
});
```

## Error Handling

```typescript
import { ConvexError } from "convex/values";

// In mutations
export const update = mutation({
  args: { id: v.id("todos"), text: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const todo = await ctx.db.get(args.id);
    
    if (!todo) {
      throw new ConvexError("Todo not found");
    }
    if (todo.userId !== user._id) {
      throw new ConvexError("Not authorized");
    }
    
    await ctx.db.patch(args.id, { text: args.text });
  },
});

// Frontend error handling
import { useMutation } from "@convex-dev/react-query";

function TodoItem({ todo }) {
  const update = useMutation(api.todos.update);

  const handleUpdate = async (text: string) => {
    try {
      await update({ id: todo._id, text });
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data);
      }
    }
  };
}
```

## Testing

```typescript
// convex/todos.test.ts
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

test("create todo", async () => {
  const t = convexTest(schema);
  
  // Setup auth
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", { email: "test@example.com" });
  });

  // Run mutation
  await t.mutation(api.todos.create, { text: "Test todo" });

  // Verify
  const todos = await t.query(api.todos.get);
  expect(todos).toHaveLength(1);
  expect(todos[0].text).toBe("Test todo");
});
```
