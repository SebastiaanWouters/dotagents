---
name: mise-en-place
description: "Transforms raw ideas into specs + tickets via Telegram interview. Triggers on: mise-en-place, prep my idea, spec this out, from idea to tickets. Uses chef for BLOCKING questions, tk for tickets, compound for research."
---

# Mise-en-Place 🍳

**Everything in its place before cooking begins.**

Transform a vague idea into a complete spec, research the stack, then decompose into tickets—via BLOCKING Telegram chat.

## Three Phases

| Phase | Purpose | Output |
|-------|---------|--------|
| **Discovery** | Extract requirements via funnel questioning | `SPEC.md` |
| **Research** | Prime knowledge base with stack docs | Compound store |
| **Decomposition** | Break spec into dependency-ordered tickets | Tickets via `tk` |

## Quick Start

```typescript
import { chef } from "./skills/chef/scripts/chef.ts";
```

1. Run Discovery → produce `SPEC.md`
2. User confirms spec
3. Run Research → prime compound (see [research-phase.md](references/research-phase.md))
4. Run Decomposition → create tickets (see [ticket-generation.md](references/ticket-generation.md))

---

## Phase 1: Discovery

**Core Principle:** Start broad, narrow progressively. ALL batch questions are BLOCKING with N/A option.

See [questioning-strategy.md](references/questioning-strategy.md) for detailed strategy.
See [tech-stack-options.md](references/tech-stack-options.md) for all option lists.

### Round 1: Wide Open (BLOCKING)

```typescript
const vision = await chef.ask("🌟 Paint me the picture — what are you building and why?");
const users = await chef.ask("👥 Who's going to use this? Describe their pain point.");
const success = await chef.ask("🎯 How will you know this succeeded? What's 'done'?");
```

### Round 2: Project Type (BLOCKING batch)

```typescript
const projectType = await chef.batch([
  { question: "🏗️ What kind of project?", options: ["Full-stack web app", "SPA (frontend only)", "CLI/TUI", "API/Backend only", "N/A"] },
  { question: "📦 Scope for v1?", options: ["MVP — one killer feature", "Small — 2-3 features", "Medium — full flow", "Large — complete product", "N/A"] },
], "🍳 Let's narrow it down...");
```

### Round 3: Tech Stack (BLOCKING batch, adapts to project type)

**Full-stack:**
```typescript
const stack = await chef.batch([
  { question: "🏗️ Framework?", options: ["Laravel + Inertia", "TanStack Start", "Nuxt", "SvelteKit", "N/A"] },
  { question: "⚛️ Frontend?", options: ["React", "Vue", "Svelte", "Vanilla JS", "N/A"] },
  { question: "🔀 Router?", options: ["Inertia", "React Router", "TanStack Router", "Framework built-in", "N/A"] },
  { question: "📦 Bundler?", options: ["Vite", "Rspack", "Framework default", "N/A"] },
], "⚙️ Tech stack...");
```

**SPA:** Same but without full-stack framework option.

**CLI/TUI:**
```typescript
const cliStack = await chef.batch([
  { question: "💻 Language?", options: ["TypeScript/Bun", "Rust", "Go", "PHP (Laravel Zero)", "Bash", "N/A"] },
  { question: "🎨 TUI framework?", options: ["Ink (React)", "Bubble Tea", "Ratatui", "None (simple CLI)", "N/A"] },
  { question: "📦 Distribution?", options: ["npm package", "Binary releases", "Homebrew", "Docker", "Script only", "N/A"] },
], "⚙️ CLI/TUI setup...");
```

### Round 3.5: Styling & Components

```typescript
const styling = await chef.batch([
  { question: "🎨 Styling?", options: ["Tailwind v4", "Plain CSS", "N/A"] },
  { question: "🧩 Components?", options: ["shadcn/ui (React)", "shadcn-vue", "shadcn-svelte", "Nuxt UI", "Flux UI (Laravel)", "None/custom", "N/A"] },
], "🎨 Styling...");
```

### Round 4: Backend & Data

```typescript
const backend = await chef.batch([
  { question: "💾 Database?", options: ["Convex (all-in-one)", "SQLite", "MySQL", "PostgreSQL", "N/A"] },
  { question: "🔄 Real-time?", options: ["None", "Notifications only", "Live updates (WebSocket)", "Multiplayer/collab (CRDT)", "N/A"] },
], "🔧 Backend...");
```

### Round 5: Auth & Users

```typescript
const auth = await chef.batch([
  { question: "🔐 Auth provider?", options: ["WorkOS", "Better Auth", "Clerk", "Laravel built-in", "None (public)", "N/A"] },
  { question: "👤 Roles?", options: ["Single role", "Admin + User", "Multi-tenant", "Custom RBAC", "N/A"] },
  { question: "💳 Payments?", options: ["None", "One-time (Stripe)", "Subscription (Stripe)", "Credits/usage-based", "N/A"] },
], "🔒 Auth...");
```

### Round 6: User Flow & Journey

Questions adapt based on project type. See [flow-questions.md](references/flow-questions.md) for all variants.

**For web/SPA apps:**
```typescript
const flow = await chef.batch([
  { question: "🚪 First visit?", options: ["Landing page → signup", "Direct to login", "Public content → gated features", "Onboarding wizard", "N/A"] },
  { question: "🎮 Core loop?", options: ["Create → edit → share", "Browse → consume → react", "Input → process → output", "Track → review → improve", "N/A"] },
  { question: "📈 Progression?", options: ["None (utility tool)", "Levels/XP", "Unlockable features", "Usage-based limits", "Content accumulation", "N/A"] },
  { question: "🏁 End state?", options: ["No end (ongoing use)", "Goal completion", "Export/download result", "Subscription renewal", "N/A"] },
], "🗺️ User journey...");

// Follow-up based on answers
const screens = await chef.ask("📱 List the main screens/pages a user would visit (comma-separated):");
```

**For CLI/TUI:**
```typescript
const cliFlow = await chef.batch([
  { question: "🚪 Entry point?", options: ["Single command", "Interactive prompt", "Config file + run", "Subcommand structure", "N/A"] },
  { question: "🎮 Core loop?", options: ["One-shot execution", "Watch mode", "REPL/interactive", "Pipeline (stdin→stdout)", "N/A"] },
  { question: "📊 Output?", options: ["Text to stdout", "Generated files", "Modified files in-place", "Side effects (API calls)", "N/A"] },
  { question: "🏁 End state?", options: ["Exit 0 (success)", "Persistent daemon", "Watch until killed", "Interactive until quit", "N/A"] },
], "🗺️ CLI flow...");

const commands = await chef.ask("⌨️ List the main commands/subcommands (comma-separated):");
```

**For API/Backend:**
```typescript
const apiFlow = await chef.batch([
  { question: "🚪 Entry point?", options: ["REST endpoints", "GraphQL", "WebSocket connection", "Message queue consumer", "N/A"] },
  { question: "🔄 Request flow?", options: ["Stateless CRUD", "Session-based", "Token + refresh", "Webhook-driven", "N/A"] },
  { question: "📊 Output?", options: ["JSON responses", "File streaming", "Server-sent events", "Background jobs", "N/A"] },
], "🗺️ API flow...");

const endpoints = await chef.ask("🔌 List the main endpoint groups/resources (comma-separated):");
```

### Round 6.5: Features (conditional)

Only ask if triggered by previous answers:

```typescript
// If dashboard UI selected in Round 8
if (designStyle === "Dashboard/data-heavy") {
  await chef.batch([
    { question: "📊 Charts?", options: ["Basic", "Advanced (D3/Recharts)", "Real-time", "None", "N/A"] },
    { question: "📋 Tables?", options: ["Simple", "Sortable/filterable", "Server-side pagination", "Inline editing", "N/A"] },
  ], "📈 Dashboard features...");
}

// If real-time selected in Round 4
if (realtimeNeeds !== "None") {
  await chef.batch([
    { question: "🔔 Notifications?", options: ["In-app only", "Push (web)", "Email", "All channels", "N/A"] },
    { question: "🔄 Sync?", options: ["Optimistic UI", "Conflict resolution", "Offline-first", "N/A"] },
  ], "⚡ Real-time features...");
}
```

### Round 7: Tooling & Quality

```typescript
const tooling = await chef.batch([
  { question: "🧹 Linting?", options: ["Biome", "ESLint + Prettier", "Oxlint + Oxfmt", "Ultracite", "Laravel Pint (PHP)", "N/A"] },
  { question: "🧪 Testing?", options: ["Vitest", "Pest (PHP)", "PHPUnit", "Playwright (E2E)", "Vitest + Playwright", "N/A"] },
], "🛠️ Tooling...");
```

### Round 8: Design & Theme

```typescript
const design = await chef.batch([
  { question: "🖼️ Style?", options: ["Minimal/clean", "Bold/vibrant", "Dashboard/data-heavy", "Playful/creative", "Corporate/professional", "Brutalist", "N/A"] },
  { question: "🌗 Theme?", options: ["Light only", "Dark only", "Light + dark toggle", "System preference", "N/A"] },
  { question: "🎭 Personality?", options: ["Serious/trustworthy", "Friendly/approachable", "Techy/developer-focused", "Fun/casual", "Luxury/premium", "N/A"] },
], "🎨 Design...");
```

### Round 9: Best Practices

```typescript
const practices = await chef.batch([
  { question: "📁 Structure?", options: ["Feature-based (colocation)", "Layer-based (controllers/models)", "Domain-driven", "Framework default", "N/A"] },
  { question: "🔒 Type safety?", options: ["Strict TypeScript", "Loose TypeScript", "PHP strict types", "No types", "N/A"] },
  { question: "📝 Docs?", options: ["JSDoc/PHPDoc comments", "README per feature", "Full docs site", "Minimal/none", "N/A"] },
  { question: "🚀 CI/CD?", options: ["GitHub Actions", "GitLab CI", "None for now", "N/A"] },
], "📚 Best practices...");
```

### Round 10: Final Details (open-ended)

```typescript
const libs = await chef.ask("📚 Any specific libraries, APIs, or integrations?");
const concerns = await chef.collect("⚠️ Concerns, constraints, must-haves? (type LFG when done)", "lfg", 120000);
```

---

## Spec Generation

After gathering, synthesize into `SPEC.md`. See [spec-template.md](references/spec-template.md) for full template.

**Key sections:**

```markdown
# [Project Name] Specification

## Vision / Target Users / Success Criteria
## Project Type & Scope
## Tech Stack
  - Framework / Frontend / Router / Bundler
  - Styling / Components
  - Database / Real-time
  - Auth / Roles / Payments
  - Linting / Testing
## User Flow & Journey
  - First visit / Entry point
  - Core loop / Main actions
  - Progression mechanics
  - Screens / Commands / Endpoints
  - End state
## Design & Theme
## Best Practices
## Features (Core + Supporting)
## Integrations & Constraints
## Open Questions
```

---

## Phase 2: Research

After user confirms spec, research all chosen technologies and prime compound.

See [research-phase.md](references/research-phase.md) for full process.

**Summary:**
1. Extract stack from SPEC.md
2. `web_search` + `read_web_page` for each tech (setup, patterns, integration, gotchas)
3. `compound store` with categorized docs
4. Notify user via chef

---

## Phase 3: Decomposition

Use [ticket-generation.md](references/ticket-generation.md) to break spec into tickets.

```bash
# 1. Create parent epic
tk create "[Project Name]" -t epic --description "..."

# 2. Create phase epics
tk create "Phase 1: Foundation" -t epic --parent <parent-id>

# 3. Create atomic tasks with acceptance criteria
tk create "Set up project structure" -t task --parent <phase-id> \
  --acceptance "- [ ] Project initialized
- [ ] TypeScript configured
- [ ] Linting setup"

# 4. Wire dependencies
tk dep <task-2-id> <task-1-id>
```

**Standard breakdown:**
```
Epic: [Feature Name]
├── Phase 1: Foundation (setup, schema, API structure)
├── Phase 2: Core Feature (backend, UI, integration)
└── Phase 3: Polish (errors, tests, docs)
```

---

## Workflow

See [workflow.md](references/workflow.md) for full diagram.

```
Idea → R1-R10 Questions → SPEC.md → Confirm → Research → Compound → Tickets → Ralph 🚀
```

---

## Rules

- **ALL batch() are BLOCKING** — waits for every answer
- **ALWAYS include N/A** — lets user skip gracefully
- **Start OPEN, end SPECIFIC** — funnel from vision to details
- **Adapt to project type** — CLI gets CLI questions, web gets web questions
- **Keep messages tweet-sized** (< 280 chars)
- **Be witty** — this is chef territory 👨‍🍳

---

## Integration with Ralph

After mise-en-place completes:

```bash
"run ralph" → picks up tasks in dependency order (with primed compound)
```
