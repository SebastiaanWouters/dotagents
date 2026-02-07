# dotagents

A collection of reusable AI agent skills for coding assistants like [Amp](https://ampcode.com) and [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Quick Start

```bash
npx add-skills sebastiaanwouters/dotagents
```

---

## Agent-Assisted Setup

Tell your agent:

```
Set up sebastiaanwouters/dotagents
```

The agent will:
1. **Interview you** — Which agent (Amp/Claude Code)? What workflows (loopy, mise-en-place)? Which skills needed?
2. **Clone the repo** — Fetch skills from GitHub
3. **Copy skills** — Install to `.amp/skills/` or `.claude/skills/` based on your agent
4. **Configure MCP** — Merge any required MCP server configs
5. **Check dependencies** — Verify required tools (bun, tk, etc.) are installed

This works because agents can read this README and follow the structure.

---

## Prerequisites

### Philosophy

Skills are **package-manager agnostic**. Your project decides which package manager to use (npm, bun, pnpm, yarn). Skills that reference "typecheck" or "tests" mean whatever commands your project uses—document these in your `AGENTS.md`.

Only skills with their **own scripts** (chef, picasso) require a specific runtime (bun).

### Required Tools

| Tool | Install | Used By |
|------|---------|---------|
| `bun` | [bun.sh](https://bun.sh) | chef scripts, picasso scripts, agent-browser |
| `tk` | `go install github.com/wedow/ticket/cmd/tk@latest` | ticket |
| `codex` | OpenAI Codex CLI | loopy |
| `claude` | Anthropic Claude CLI | loopy |

### Optional Tools

| Tool | Install | Used By |
|------|---------|---------|
| `flyctl` | [fly.io/docs/flyctl/install](https://fly.io/docs/flyctl/install/) | flyctl (Fly.io deployments) |
| `bw` | [bitwarden.com/help/cli](https://bitwarden.com/help/cli/) | bitwarden (secrets retrieval) |
| `ffmpeg` | `apt install ffmpeg` / `brew install ffmpeg` | picasso (video/gif processing) |
| `convert` | `apt install imagemagick` / `brew install imagemagick` | picasso (image post-processing) |
| Chrome + [Playwriter Extension](https://chromewebstore.google.com/detail/playwriter) | Chrome Web Store | playwriter |

### Environment Variables

Create a `.env` file in your project root:

```bash
# Required for chef (Telegram communication)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Required for picasso (image generation)
FAL_API_KEY=your_fal_api_key

# Optional: Bitwarden session (set after `bw unlock`)
BW_SESSION=your_session_key
```

**Getting Telegram credentials:**
1. Create a bot via [@BotFather](https://t.me/botfather) → get `TELEGRAM_BOT_TOKEN`
2. Send a message to your bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates` → get `chat.id`

**Getting FAL API key:**
1. Sign up at [fal.ai](https://fal.ai)
2. Generate API key from dashboard

---

## Mise-en-Place: Project Setup Workflow

**"Everything in its place before cooking begins."**

The `mise-en-place` skill transforms raw ideas into implementation-ready specs.

### What It Does

| Phase | Purpose | Output |
|-------|---------|--------|
| **0. Bootstrap** | Read existing spec file (SPEC.md, README.md) | Starting context |
| **1. Discovery** | Adaptive interview to fill knowledge gaps | `docs/SPEC.md` |
| **2. Design System** | Create visual/component foundation | `docs/design/` folder |
| **3. Research** | Prime knowledge base with stack docs | Compound store |
| **4. Initialize** | Set up agent guidelines | `AGENTS.md` |

### Skills Involved

| Skill | Role in Mise-en-Place |
|-------|----------------------|
| `mise-en-place` | Orchestrates the entire setup flow |
| `chef` | Handles all Telegram Q&A during interview |
| `compound` | Stores discovered knowledge and design system |
| `ticket` | Creates granular implementation tickets |
| `agents-md` | Generates project-specific guidelines |

### Manual Usage

```bash
# Via Amp or Claude Code
"use mise-en-place"
"prep my idea"
"spec this out"
```

---

## loopy — Autonomous Task Loop

Runs a simple autonomous loop by repeatedly executing a prompt file with your chosen agent CLI.

### Required Skills

| Skill | Purpose |
|-------|---------|
| `chef` | Telegram communication (notifications, questions, feedback) |
| `compound` | Knowledge retrieval/storage from `docs/` |
| `ticket` | Ticket management via `tk` CLI |
| `bullet-tracer` | Implementation approach (vertical slices) |
| `mise-en-place` | Setup phase: idea/spec → prd.json via interview + research |
| `ratatouille` | Implement PRD tasks one-by-one with tracer bullets + progress tracking |
| `agents-md` | Initialize AGENTS.md with project guidelines |

### Usage

```bash
./loopy --prompt /path/to/prompt.txt --agent codex --max-iterations 20
```

---

## Available Skills

### Core Workflow

| Skill | Description | Triggers |
|-------|-------------|----------|
| `mise-en-place` | Transform idea/spec → prd.json via interview + research | "prep my idea", "spec this out", "mise-en-place:" |
| `ratatouille` | Implement one prd.json task per iteration | "ratatouille:" |
| `chef` | Telegram communication (blocking Q&A, notifications) |
| `compound` | Knowledge retrieval/storage + design system | "compound retrieve", "compound store" |
| `ticket` | Manage tickets with tk CLI | "create ticket", "what's next" |
| `bullet-tracer` | Implement features via vertical slices |

### Browser Automation

| Skill | Description | Triggers |
|-------|-------------|----------|
| `agent-browser` | CLI browser automation for testing/scraping | "use agent browser" |
| `playwriter` | Chrome control via Playwright MCP | "use playwriter" |
| `e2e-tester` | Generate CI-ready Playwright/Pest tests | "e2e test", "test the UI" |

### Development

| Skill | Description | Triggers |
|-------|-------------|----------|
| `code-review` | Deep review using Grug/Unix/Clean Code principles | "review this code" |
| `git-master` | Atomic commits, rebase/squash, history search | "git help" |
| `simplify-code` | Simplify code for clarity | "simplify this" |
| `agents-md` | Create/refactor AGENTS.md files | "create AGENTS.md" |

### Documentation & Research

| Skill | Description | Triggers |
|-------|-------------|----------|
| `documentation-lookup` | Query library/framework docs via Context7 MCP | "use context7" |
| `librarian` | Multi-repo exploration (GitHub/npm/PyPI/crates) | Deep code research |
| `prd` | Generate Product Requirements Documents | "write a PRD" |
| `teacher` | Learning guidance via Socratic/Feynman methods | "teach me about X" |

### Framework-Specific

| Skill | Description | Triggers |
|-------|-------------|----------|
| `convex` | Build production-ready Convex applications | "use convex" |
| `svelte-code-writer` | Svelte 5 docs lookup and code analysis | Svelte projects |
| `react` | React patterns and best practices | React projects |
| `react-router` | React Router v7 API and examples | React Router usage |
| `laravel-boost` | Laravel development via Context7 MCP | Laravel projects |
| `flyctl` | Deploy/manage apps on Fly.io | "fly deploy" |
| `pwa` | Progressive Web App implementation | "add PWA support" |

### Assets & Design

| Skill | Description | Triggers |
|-------|-------------|----------|
| `picasso` | Generate visual assets via fal.ai (icons, logos, sprites) | "generate icon", "picasso" |
| `frontend-design` | Production-grade UI with high design quality | UI implementation |

### Utilities

| Skill | Description | Triggers |
|-------|-------------|----------|
| `bitwarden` | Retrieve secrets from Bitwarden vault | Missing env vars |
| `tmux` | Spawn and manage background processes | "run in background" |
| `recursive-handoff` | Execute tasks repeatedly with clean context | Long-running tasks |
| `interview` | Clarify requirements through structured interviews | "interview me" |
| `create-skill` | Guide for creating new skills | "create a skill" |
| `skill-from-github` | Import skills from GitHub repos | "import skill from X" |

---

## MCP Servers

Some skills provide MCP (Model Context Protocol) server configurations:

| Skill | MCP Server | Purpose |
|-------|------------|---------|
| `documentation-lookup` | Context7 (HTTP) | Library/framework documentation |
| `playwriter` | Playwriter (npx) | Chrome browser control |
| `laravel-boost` | Context7 (HTTP) | Laravel documentation |
| `e2e-tester` | Playwright (npx) | E2E test execution |

MCP configs are in `skills/<skill>/mcp.json`.

---

## Project Structure

```
dotagents/
├── README.md
├── AGENTS.md           # Project guidelines for agents
├── loopy               # Autonomous task loop
└── skills/
    ├── mise-en-place/  # Project setup workflow
    ├── chef/           # Telegram communication
    │   └── scripts/    # chef.ts, cli.ts
    ├── compound/       # Knowledge management
    ├── ticket/         # Ticket management
    ├── picasso/        # Image generation
    │   └── scripts/    # fal-generate.ts
    └── .../            # Other skills
```

## License

MIT
