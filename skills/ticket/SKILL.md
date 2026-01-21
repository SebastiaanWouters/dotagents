---
name: ticket
description: Manage tickets with tk CLI. Triggers on "create ticket", "list tickets", "what's next", "blocked", "close ticket", "ticket status", "work on next ticket/issue".
---

# Ticket Management with tk

Minimal ticket system with dependency tracking. Tickets stored as markdown in `.tickets/`.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `tk create "title"` | Create ticket |
| `tk ls` | List all tickets |
| `tk ready` | Show tickets ready to work on |
| `tk blocked` | Show blocked tickets |
| `tk show <id>` | View ticket details |
| `tk start <id>` | Mark in progress |
| `tk close <id>` | Close ticket |
| `tk dep <id> <dep-id>` | Add dependency |

Supports partial ID matching: `tk show 5c4` matches `nw-5c46`.

## Creating Tickets

```bash
tk create "Implement auth" \
  -t feature \
  -p 1 \
  --acceptance "Users can login with email/password" \
  --design "Use JWT tokens, refresh every 24h"
```

Options:
- `-t, --type`: bug, feature, task, epic, chore (default: task)
- `-p, --priority`: 0-4 where 0=highest (default: 2)
- `-d, --description`: Detailed description
- `--acceptance`: Acceptance criteria (when is it done?)
- `--design`: Design/implementation notes
- `-a, --assignee`: Who owns it
- `--parent`: Parent ticket for subtasks
- `--external-ref`: Link to external tracker (gh-123, JIRA-456)

## Acceptance Criteria

Always include acceptance criteria when creating tickets. This defines "done":

```bash
tk create "Add user settings page" \
  --acceptance "- User can change password
- User can update email
- Changes persist after logout"
```

For existing tickets, use `tk edit <id>` to add acceptance criteria to the markdown file.

## Dependencies

Tickets can depend on other tickets. A ticket is "blocked" until its dependencies are closed.

```bash
# ticket-a depends on ticket-b (b must close before a is ready)
tk dep ticket-a ticket-b

# View dependency tree
tk dep tree ticket-a
tk dep tree --full ticket-a  # Show duplicates

# Remove dependency
tk undep ticket-a ticket-b

# Link related tickets (symmetric, no blocking)
tk link ticket-a ticket-b ticket-c
```

## Finding Work: ls, ready, blocked

**List all tickets:**
```bash
tk ls                    # All tickets
tk ls --status=open      # Only open
tk ls --status=in_progress
```

**Find what to work on next:**
```bash
tk ready    # Open/in-progress tickets with ALL dependencies resolved
```

**Find blocked work:**
```bash
tk blocked  # Tickets waiting on unresolved dependencies
```

**Recently closed:**
```bash
tk closed            # Last 20 closed
tk closed --limit=50
```

## Working on Tickets

```bash
tk start <id>   # Set to in_progress
tk close <id>   # Set to closed
tk reopen <id>  # Set back to open
```

## Adding Notes

```bash
tk add-note <id> "Found edge case with null values"

# Or pipe from stdin
echo "Deployment complete" | tk add-note <id>
```

## Finishing a Ticket

Before closing, verify acceptance criteria are met:

1. `tk show <id>` - Review acceptance criteria
2. Verify each criterion is satisfied
3. `tk close <id>` - Close the ticket
4. `tk ready` - See what's unblocked next

## Querying Tickets

```bash
tk query                           # All tickets as JSON
tk query '.[] | select(.type == "bug")'  # Filter with jq
```

## Workflow Example

```bash
# 1. Create epic and subtasks
tk create "User Authentication" -t epic
# Returns: auth-7f3a

tk create "Design auth schema" -t task --parent auth-7f3a
# Returns: schema-2b1c

tk create "Implement login endpoint" -t task --parent auth-7f3a \
  --acceptance "POST /login returns JWT on valid credentials"
# Returns: login-9d4e

# 2. Set dependencies
tk dep login-9d4e schema-2b1c  # login depends on schema

# 3. Check what's ready
tk ready  # Shows schema-2b1c (login is blocked)

# 4. Work and close
tk start schema-2b1c
tk close schema-2b1c

# 5. Now login is ready
tk ready  # Shows login-9d4e
```
