# Flow Questions

User journey questions tailored by project type. Ask these in Round 6.

## Web App / SPA Flow

### Batch Questions

```typescript
const flow = await chef.batch([
  { 
    question: "🚪 First visit experience?", 
    options: [
      "Landing page → signup",
      "Direct to login", 
      "Public content → gated features",
      "Onboarding wizard",
      "Free trial → paywall",
      "N/A"
    ] 
  },
  { 
    question: "🎮 Core loop (what do users DO)?", 
    options: [
      "Create → edit → share",
      "Browse → consume → react",
      "Input → process → output",
      "Track → review → improve",
      "Search → compare → decide",
      "Upload → transform → download",
      "N/A"
    ] 
  },
  { 
    question: "📈 Progression mechanics?", 
    options: [
      "None (utility tool)",
      "Levels/XP/achievements",
      "Unlockable features",
      "Usage-based limits (freemium)",
      "Content accumulation",
      "Streaks/habits",
      "N/A"
    ] 
  },
  { 
    question: "🏁 What's the 'end state'?", 
    options: [
      "No end (ongoing use)",
      "Goal completion (then done)",
      "Export/download deliverable",
      "Subscription renewal cycle",
      "Project completion → archive",
      "N/A"
    ] 
  },
], "🗺️ User journey...");
```

### Follow-up: Screens

```typescript
const screens = await chef.ask("📱 List the main screens/pages (comma-separated, e.g., 'dashboard, settings, profile, project view'):");
```

### Conditional Follow-ups

```typescript
// If onboarding wizard selected
if (firstVisit === "Onboarding wizard") {
  const onboarding = await chef.ask("🧙 What steps in the onboarding? (e.g., 'name, preferences, connect accounts, tutorial')");
}

// If progression selected
if (progression !== "None (utility tool)") {
  const progressionDetails = await chef.ask("🎯 What triggers progression? (e.g., 'complete tasks', 'daily login', 'invite friends')");
}

// If goal completion end state
if (endState === "Goal completion (then done)") {
  const goals = await chef.ask("🏆 What defines goal completion? (e.g., 'finish course', 'hit target weight', 'complete project')");
}
```

---

## CLI/TUI Flow

### Batch Questions

```typescript
const cliFlow = await chef.batch([
  { 
    question: "🚪 Entry point?", 
    options: [
      "Single command (do one thing)",
      "Interactive prompt (ask questions)",
      "Config file + run",
      "Subcommand structure (git-style)",
      "Pipe-friendly (stdin→stdout)",
      "N/A"
    ] 
  },
  { 
    question: "🎮 Execution mode?", 
    options: [
      "One-shot (run and exit)",
      "Watch mode (react to changes)",
      "REPL/interactive session",
      "Daemon (background service)",
      "Pipeline step",
      "N/A"
    ] 
  },
  { 
    question: "📊 Primary output?", 
    options: [
      "Text to stdout",
      "Generated files",
      "Modified files in-place",
      "Side effects (API calls, DB writes)",
      "TUI interface",
      "N/A"
    ] 
  },
  { 
    question: "🏁 End state?", 
    options: [
      "Exit 0 (success) / Exit 1 (error)",
      "Persistent daemon until killed",
      "Watch until Ctrl+C",
      "Interactive until user quits",
      "N/A"
    ] 
  },
], "🗺️ CLI flow...");
```

### Follow-up: Commands

```typescript
const commands = await chef.ask("⌨️ List main commands/subcommands (e.g., 'init, run, build, deploy'):");
```

### Conditional Follow-ups

```typescript
// If subcommand structure
if (entryPoint === "Subcommand structure (git-style)") {
  const subcommands = await chef.ask("📋 Describe the subcommand tree (e.g., 'project [create|list|delete], config [get|set]'):");
}

// If config file based
if (entryPoint === "Config file + run") {
  const configFormat = await chef.batch([
    { question: "📄 Config format?", options: ["JSON", "YAML", "TOML", "TypeScript", ".env", "N/A"] },
  ], "⚙️ Config...");
}

// If watch mode
if (executionMode === "Watch mode (react to changes)") {
  const watchTargets = await chef.ask("👁️ What files/events to watch? (e.g., 'src/**/*.ts', 'file changes in ./input')");
}
```

---

## API/Backend Flow

### Batch Questions

```typescript
const apiFlow = await chef.batch([
  { 
    question: "🚪 API style?", 
    options: [
      "REST (resource-based)",
      "GraphQL (query-based)",
      "RPC (action-based)",
      "WebSocket (bidirectional)",
      "Message queue consumer",
      "Hybrid",
      "N/A"
    ] 
  },
  { 
    question: "🔄 Request lifecycle?", 
    options: [
      "Stateless (each request independent)",
      "Session-based (server state)",
      "Token + refresh flow",
      "Webhook-driven (external triggers)",
      "Long-polling",
      "N/A"
    ] 
  },
  { 
    question: "📊 Response types?", 
    options: [
      "JSON responses",
      "File/blob streaming",
      "Server-sent events (SSE)",
      "Binary protocol",
      "HTML (server-rendered)",
      "N/A"
    ] 
  },
  { 
    question: "⏱️ Background work?", 
    options: [
      "None (sync only)",
      "Job queue (async processing)",
      "Scheduled tasks (cron)",
      "Event-driven (pub/sub)",
      "N/A"
    ] 
  },
], "🗺️ API flow...");
```

### Follow-up: Resources/Endpoints

```typescript
const endpoints = await chef.ask("🔌 List main resources/endpoint groups (e.g., 'users, projects, tasks, webhooks'):");
```

### Conditional Follow-ups

```typescript
// If job queue selected
if (backgroundWork === "Job queue (async processing)") {
  const jobs = await chef.ask("📬 What jobs need async processing? (e.g., 'email sending, PDF generation, image resize')");
}

// If webhooks involved
if (requestLifecycle === "Webhook-driven (external triggers)") {
  const webhookSources = await chef.ask("🪝 What services send webhooks? (e.g., 'Stripe, GitHub, Twilio')");
}

// If GraphQL
if (apiStyle === "GraphQL (query-based)") {
  const graphqlDetails = await chef.batch([
    { question: "📊 Query complexity?", options: ["Simple queries", "Nested relations", "Subscriptions", "Federation", "N/A"] },
  ], "GraphQL details...");
}
```

---

## SPEC.md Flow Section Template

After gathering flow answers, include in spec:

```markdown
## User Flow & Journey

### Entry Point
- **First visit:** [Landing page → signup / Direct to login / etc.]
- **Onboarding:** [Steps if applicable]

### Core Loop
**What users DO repeatedly:**
[Create → edit → share / Browse → consume → react / etc.]

### Progression
- **Type:** [None / Levels / Unlockables / etc.]
- **Triggers:** [What drives progression]

### Screens/Commands/Endpoints
| Name | Purpose | Access |
|------|---------|--------|
| [Dashboard] | [Main view] | [Authenticated] |
| [Settings] | [User prefs] | [Authenticated] |
| ... | ... | ... |

### End State
- **Completion:** [No end / Goal completion / Export deliverable]
- **Success looks like:** [User has X / User achieved Y]
```

---

## Smart Skipping

Don't ask obvious questions based on previous context:

```typescript
// Skip progression for utility tools
if (scope === "MVP — one killer feature" && vision.includes("tool")) {
  // Default: "None (utility tool)"
}

// Skip onboarding for CLI
if (projectType === "CLI/TUI") {
  // Don't ask about onboarding wizards
}

// Skip screens question for API-only
if (projectType === "API/Backend only") {
  // Ask about endpoints instead
}
```
