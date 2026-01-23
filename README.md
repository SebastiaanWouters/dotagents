# dotagents

A collection of reusable AI agent skills for coding assistants like [Amp](https://ampcode.com) and [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Quick Start

```bash
npx add-skills sebastiaanwouters/dotagents
```

## simp.sh — Autonomous Task Loop

`simp.sh` runs an autonomous loop that picks up tickets, implements them, and collects feedback via Telegram.

### Required Skills

| Skill | Purpose |
|-------|---------|
| `chef` | Telegram communication (notifications, questions, feedback) |
| `compound` | Knowledge retrieval/storage from `docs/` |
| `ticket` | Ticket management via `tk` CLI |
| `bullet-tracer` | Implementation approach (vertical slices) |
| `mise-en-place` | Setup phase: idea → spec → tickets (runs if no tickets exist) |
| `agents-md` | Initialize AGENTS.md with project guidelines |

### Required Tools

| Tool | Install |
|------|---------|
| `tk` | `go install github.com/wedow/ticket/cmd/tk@latest` |
| `amp` | [ampcode.com](https://ampcode.com) |

### Environment

```bash
# .env
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
```

### Usage

```bash
./simp.sh
# If no tickets exist → runs mise-en-place setup (interviews you via Telegram)
# If tickets exist → runs main implementation loop
```

### Related Skills

| Skill | Purpose |
|-------|---------|
| `ralph` | Alternative autonomous loop with different setup phase |

---

## Available Skills

| Skill | Description |
|-------|-------------|
| `agent-browser` | Browser automation for web testing, form filling, screenshots |
| `agents-md` | Create/refactor AGENTS.md files with progressive disclosure |
| `bullet-tracer` | Implement features via tracer bullet (minimal e2e slice first) |
| `chef` | Telegram communication for AI agents (blocking/non-blocking Q&A) |
| `code-review` | Deep code review using Grug, Unix, Clean Code principles |
| `commit` | Create logical git commits with conventional messages |
| `compound` | Knowledge retrieval/storage for `docs/` (dedup, size management) |
| `convex` | Build production-ready Convex applications |
| `documentation-lookup` | Query library/framework docs via Context7 |
| `frontend-design` | Production-grade frontend interfaces with high design quality |
| `git-master` | Git expert for atomic commits, rebase/squash, and history search |
| `interviewer` | Clarify requirements through structured interviews |
| `librarian` | Multi-repository codebase exploration across GitHub/npm/PyPI |
| `mise-en-place` | Transform ideas → specs → granular tickets via Telegram interview |
| `playwriter` | Chrome browser control via Playwright MCP |
| `prd` | Generate Product Requirements Documents |
| `ralph` | Autonomous feature development loop |
| `recursive-handoff` | Execute tasks repeatedly with clean context |
| `simplifier` | Simplify code for clarity and maintainability |
| `skill-creator` | Guide for creating new skills |
| `svelte-code-writer` | Svelte 5 documentation lookup and code analysis |
| `teacher` | Learning guidance through Socratic/Feynman methods |
| `ticket` | Manage tickets with tk CLI |
| `tmux` | Spawn and manage background processes |

## License

MIT
