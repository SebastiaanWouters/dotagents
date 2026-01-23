# Simp Knowledge Base

> Learnings not captured in code or commits. Keep concise, use references.

## Architecture Decisions

- Chef script uses Bun, not Node/ts-node: `bun -e "import { chef } from '...'; await chef.notify('msg')"`
- tk has no `init` command — just `mkdir -p .tickets` to initialize

## Gotchas & Workarounds

- Chef CLI requires inline bun eval, not direct script execution with args
- tk returns error if .tickets/ doesn't exist — simp.sh now creates it (simp.sh#L8)
- `chef.askPhoto()` returns `string | null` — user can type "skip" to cancel (.claude/skills/chef/scripts/chef.ts#L365)

## User Preferences

- Don't claim queue state before checking (no "no tickets" in initial check-in)
- Always use recursive-handoff (not regular handoff) after completing work — maintains iteration tracking
- Update KNOWLEDGE.md before handoff

## External Dependencies

- playwriter MCP: use `aria-ref` from `accessibilitySnapshot()` for exploration, convert to CI-safe locators for committed tests
