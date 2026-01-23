---
name: ticket
description: Manage tickets with tk CLI. Triggers on "create ticket", "list tickets", "what's next", "blocked", "close ticket", "ticket status", "work on next ticket/issue".
---

# Ticket Management with tk

## Installation

If `tk` is not available (`which tk` returns nothing), install from: `wedow/ticket`

```bash
go install github.com/wedow/ticket/cmd/tk@latest
```

Minimal ticket system with dependency tracking. Tickets stored as markdown in `.tickets/`.

Works from any subdirectory—walks parent directories to find `.tickets/`.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `tk create "title"` | Create ticket |
| `tk ls` / `tk list` | List all tickets |
| `tk ready` | Tickets ready to work on (deps resolved) |
| `tk blocked` | Tickets waiting on dependencies |
| `tk closed` | Recently closed tickets |
| `tk show <id>` | View ticket details |
| `tk edit <id>` | Open in $EDITOR |
| `tk start <id>` | Mark in progress |
| `tk close <id>` | Close ticket |
| `tk reopen <id>` | Reopen ticket |
| `tk dep <id> <dep-id>` | Add dependency |
| `tk dep tree <id>` | Show dependency tree |
| `tk dep cycle` | Detect dependency cycles |
| `tk undep <id> <dep-id>` | Remove dependency |
| `tk link <id> <id>...` | Link related tickets (symmetric) |
| `tk unlink <id> <id>` | Remove link |
| `tk add-note <id> "text"` | Append timestamped note |
| `tk query [jq-filter]` | Output as JSON |

Supports partial ID matching: `tk show 5c4` matches `nw-5c46`.

## Creating Tickets

```bash
tk create "Implement auth" -t feature -p 1 \
  --acceptance "Users can login" --tags ui,backend
```

Options:
- `-t, --type`: bug, feature, task, epic, chore (default: task)
- `-p, --priority`: 0-4, 0=highest (default: 2)
- `-d, --description`: Detailed description
- `--acceptance`: Acceptance criteria (see below)
- `--design`: Design/implementation notes
- `-a, --assignee`: Who owns it
- `--parent`: Parent ticket ID
- `--tags`: Comma-separated tags
- `--external-ref`: External tracker link (gh-123, JIRA-456)

## Acceptance Criteria

**Always include acceptance criteria.** This defines "done" and prevents ambiguity.

```bash
tk create "User settings page" --acceptance "- User can change password
- User can update email
- Changes persist after logout"
```

Before closing a ticket:
1. `tk show <id>` — review acceptance criteria
2. Verify each criterion is satisfied
3. `tk close <id>`

## Filtering

```bash
tk ls -T urgent           # by tag
tk ls --status=open       # by status
tk ready -T backend
tk closed --limit=50
```

## Dependencies

```bash
tk dep ticket-a ticket-b      # a depends on b
tk dep tree ticket-a          # view tree
tk dep tree --full ticket-a   # show duplicates
tk undep ticket-a ticket-b    # remove
tk dep cycle                  # find cycles
```

## Linked Tickets

Symmetric relationships (no blocking):
```bash
tk link ticket-a ticket-b ticket-c
tk unlink ticket-a ticket-b
```

## Notes

```bash
tk add-note <id> "Found edge case"
echo "Deploy complete" | tk add-note <id>
```

## Workflow

```bash
tk create "Auth system" -t epic                    # auth-7f3a
tk create "Design schema" --parent auth-7f3a       # sch-2b1c
tk create "Login endpoint" --parent auth-7f3a \
  --acceptance "POST /login returns JWT"           # log-9d4e

tk dep log-9d4e sch-2b1c   # login depends on schema
tk ready                   # shows sch-2b1c
tk start sch-2b1c
tk close sch-2b1c
tk ready                   # now shows log-9d4e
```
