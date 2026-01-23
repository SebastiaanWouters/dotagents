#!/usr/bin/env bash
#
# simp.sh - Autonomous ticket implementation loop
#
# A simple while loop that runs Claude Code repeatedly.
# Claude handles everything using the ticket and chef skills.
#

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

CLAUDE="claude --dangerously-skip-permissions --print"
LOG_FILE="simp.log"

log() {
    echo "[simp $(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# --- Prompts ---

WORK_ON_TICKET='Use the ticket skill to get the next available ticket.

If a ticket exists:
1. Use chef skill to notify user: "Starting work on: <ticket-id> - <title>"
2. Implement the ticket completely (functionality, tests, good coverage)
3. Use code-review skill to review your changes
4. Implement all review suggestions
5. Commit and push
6. Close the ticket with tk close
7. Use chef skill to notify user with a summary of what was done
8. As your final line, output exactly: SIMP_DONE

If no tickets available, output exactly: SIMP_NO_TICKETS'

ASK_USER='Use the chef skill to ask the user: "No tickets. What should I work on?"

Wait for their response. As your final line, output exactly: SIMP_USER_SAID:<their response>'

HANDLE_REQUEST='The user requested:

%s

1. Use chef skill to notify: "Working on your request..."
2. Implement the request completely (code, tests if needed)
3. Commit and push if code was changed
4. Use chef skill to notify user with summary of what was done
5. As your final line, output exactly: SIMP_DONE'

# --- Main loop ---

log "Starting simp loop"

while true; do
    log "Checking for tickets..."
    result=$($CLAUDE "$WORK_ON_TICKET" 2>>"$LOG_FILE") || true

    if [[ "$result" == *"SIMP_NO_TICKETS"* ]]; then
        log "No tickets, asking user..."
        response=$($CLAUDE "$ASK_USER" 2>>"$LOG_FILE") || true

        # Extract user input from SIMP_USER_SAID:<input>
        if [[ "$response" =~ SIMP_USER_SAID:(.*)$ ]]; then
            user_input="${BASH_REMATCH[1]}"
            user_input="${user_input## }"  # trim leading space
        else
            log "No valid response, retrying..."
            continue
        fi

        # Check for stop commands (case insensitive)
        user_lower="${user_input,,}"
        if [[ "$user_lower" == "stop" || "$user_lower" == "pause" || "$user_lower" == "wait" ]]; then
            log "User requested stop. Exiting."
            exit 0
        fi

        log "Handling user request: $user_input"
        prompt="${HANDLE_REQUEST/\%s/$user_input}"
        $CLAUDE "$prompt" 2>>"$LOG_FILE" || true
    else
        log "Ticket work completed"
    fi

    sleep 1
done