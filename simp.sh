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
8. Output: DONE

If no tickets available:
1. Output: NO_TICKETS'

ASK_USER='Use the chef skill to ask the user: "No tickets. What should I work on?"

Wait for their response. Output exactly what they said, nothing else.'

HANDLE_REQUEST='The user requested:

%s

1. Use chef skill to notify: "Working on your request..."
2. Implement the request completely (code, tests if needed)
3. Commit and push if code was changed
4. Use chef skill to notify user with summary of what was done
5. Output: DONE'

# --- Main loop ---

while true; do
    result=$($CLAUDE "$WORK_ON_TICKET" 2>&1) || true

    if [[ "$result" == *"NO_TICKETS"* ]]; then
        user_input=$($CLAUDE "$ASK_USER" 2>&1) || true

        if [[ -z "$user_input" || "$user_input" == *"timeout"* ]]; then
            continue
        fi

        if [[ "$user_input" == "stop" || "$user_input" == "pause" || "$user_input" == "wait" ]]; then
            echo "[simp] User requested stop. Exiting."
            exit 0
        fi

        # shellcheck disable=SC2059
        prompt=$(printf "$HANDLE_REQUEST" "$user_input")
        $CLAUDE "$prompt" || true
    fi

    sleep 1
done
