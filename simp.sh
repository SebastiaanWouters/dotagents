#!/usr/bin/env bash
#
# simp.sh - Autonomous ticket implementation loop
#
# Uses tk directly for tickets, chef directly for Telegram, Claude only for implementation.
#

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

CLAUDE="claude --dangerously-skip-permissions --print"
LOG_FILE="simp.log"

log() {
    echo "[simp $(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    bun -e "import{chef}from'./skills/chef/scripts/chef.ts';await chef.notify(\`$1\`)" 2>/dev/null || true
}

ask() {
    bun -e "import{chef}from'./skills/chef/scripts/chef.ts';console.log(await chef.ask(\`$1\`))" 2>/dev/null
}

# --- Prompts ---

WORK_ON_TICKET='Implement ticket: %s

1. Read the ticket with tk show %s
2. Implement completely (functionality, tests, good coverage)
3. Use code-review skill to review your changes
4. Implement all review suggestions
5. Commit and push
6. Close with tk close %s

Output a brief summary of what was done.'

HANDLE_REQUEST='Implement this request:

%s

1. Implement completely (code, tests if needed)
2. Commit and push if code was changed

Output a brief summary of what was done.'

# --- Main loop ---

log "Starting simp loop"
notify "Simp loop started"

while true; do
    log "Checking for tickets..."
    ticket=$(tk ready --limit 1 2>/dev/null | head -1 | awk '{print $1}') || true

    if [[ -n "$ticket" ]]; then
        title=$(tk show "$ticket" 2>/dev/null | head -1 | sed 's/^# //') || title="$ticket"
        log "Working on ticket: $ticket - $title"
        notify "Starting: $ticket - $title"

        prompt="${WORK_ON_TICKET//\%s/$ticket}"
        result=$($CLAUDE "$prompt" 2>>"$LOG_FILE") || true

        log "Ticket $ticket completed"
        notify "Done: $ticket - $title

$result"
    else
        log "No tickets, asking user..."
        user_input=$(ask "No tickets. What should I work on?") || true

        if [[ -z "$user_input" ]]; then
            log "No response, retrying..."
            continue
        fi

        user_lower="${user_input,,}"
        if [[ "$user_lower" == "stop" || "$user_lower" == "pause" || "$user_lower" == "wait" ]]; then
            log "User requested stop. Exiting."
            notify "Simp loop stopped"
            exit 0
        fi

        log "Handling request: $user_input"
        notify "Working on: $user_input"

        prompt="${HANDLE_REQUEST/\%s/$user_input}"
        result=$($CLAUDE "$prompt" 2>>"$LOG_FILE") || true

        log "Request completed"
        notify "Done: $user_input

$result"
    fi

    sleep 1
done