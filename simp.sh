#!/usr/bin/env bash
#
# simp.sh - Autonomous ticket implementation loop
#
# Uses tk directly for tickets, chef directly for Telegram, Claude only for implementation.
#

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

CLAUDE="claude --dangerously-skip-permissions --print"
LOG_FILE="simp.log"

log() { echo "[simp $(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

notify() {
    bun -e "import{chef}from'./skills/chef/scripts/chef.ts';await chef.notify(\`$1\`)" 2>/dev/null || true
}

ask() {
    bun -e "import{chef}from'./skills/chef/scripts/chef.ts';console.log(await chef.ask(\`$1\`))" 2>/dev/null
}

# --- Shared prompt section ---

CHEF_INSTRUCTIONS='COMMUNICATION: Use the chef skill to communicate with the user via Telegram.
- chef.notify(msg) - Send status updates (non-blocking)
- chef.ask(question) - Ask free-text questions (blocking, waits for response)
- chef.confirm(question) - Ask yes/no questions (blocking)
- chef.choice(question, options) - Multiple choice (blocking)

Be autonomous during implementation. Only use chef to ask questions between iterations when you need clarification or user input that cannot be resolved by investigating the codebase.'

# --- Main loop ---

log "Starting simp loop"
notify "Simp loop started"

while true; do
    log "Checking for tickets..."
    ticket=$(tk ready --limit 1 2>/dev/null | awk 'NR==1{print $1}') || true

    if [[ -n "$ticket" ]]; then
        title=$(tk show "$ticket" 2>/dev/null | head -1 | sed 's/^# //') || title="$ticket"
        log "Working on: $ticket - $title"
        notify "Starting: $ticket - $title"

        prompt="Implement ticket: $ticket

1. Read the ticket with tk show $ticket
2. Implement completely (functionality, tests, good coverage)
3. Use code-review skill to review your changes
4. Implement all review suggestions
5. Commit and push
6. Close with tk close $ticket

Output a brief summary of what was done.

$CHEF_INSTRUCTIONS"

        result=$($CLAUDE "$prompt" 2>>"$LOG_FILE") || true
        log "Completed: $ticket"
        notify "Done: $ticket - $title"$'\n\n'"$result"
    else
        log "No tickets, asking user..."
        user_input=$(ask "No tickets. What should I work on?") || true

        [[ -z "$user_input" ]] && { log "No response, retrying..."; continue; }

        case "${user_input,,}" in
            stop|pause|wait)
                log "User requested stop"
                notify "Simp loop stopped"
                exit 0
                ;;
        esac

        log "Working on: $user_input"
        notify "Working on: $user_input"

        prompt="Implement this request:

$user_input

1. Implement completely (code, tests if needed)
2. Commit and push if code was changed

Output a brief summary of what was done.

$CHEF_INSTRUCTIONS"

        result=$($CLAUDE "$prompt" 2>>"$LOG_FILE") || true
        log "Completed request"
        notify "Done: $user_input"$'\n\n'"$result"
    fi

    sleep 1
done
