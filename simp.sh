#!/usr/bin/env bash
#
# simp.sh - Autonomous ticket implementation loop
#
# Implements tickets one by one:
# 1. Pick next ready ticket
# 2. Implement, test, review, commit, push
# 3. Report to user via Telegram
# 4. Repeat
#
# When no tickets: ask user what to do, then continue loop.
#
# Requirements:
# - claude (Claude Code CLI)
# - tk (ticket CLI)
# - bun (for chef notifications)
# - .env with TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# --- Configuration ---
CLAUDE_ARGS="--dangerously-skip-permissions --print"
CHEF_SCRIPT="$SCRIPT_DIR/skills/chef/scripts/chef.ts"

# --- Logging ---
log() {
    echo "[simp] $(date '+%Y-%m-%d %H:%M:%S') $*"
}

log_error() {
    echo "[simp] $(date '+%Y-%m-%d %H:%M:%S') ERROR: $*" >&2
}

# --- Chef wrappers (Telegram communication) ---
chef_notify() {
    local message="$1"
    bun -e "
        import { chef } from '$CHEF_SCRIPT';
        await chef.notify(\`$message\`);
    " 2>/dev/null || log_error "Failed to send notification"
}

chef_ask() {
    local question="$1"
    bun -e "
        import { chef } from '$CHEF_SCRIPT';
        const answer = await chef.ask(\`$question\`);
        console.log(answer);
    " 2>/dev/null
}

# --- Ticket helpers ---
get_next_ticket() {
    # Get first ready ticket ID (tickets with resolved dependencies)
    tk ready --limit 1 2>/dev/null | head -1 | awk '{print $1}' || echo ""
}

get_ticket_title() {
    local ticket_id="$1"
    tk show "$ticket_id" 2>/dev/null | head -1 | sed 's/^# //' || echo "$ticket_id"
}

# --- Claude prompts ---
IMPLEMENT_PROMPT='You are implementing a ticket. Use the ticket skill to understand what needs to be done.

Ticket ID: %s

Your task:
1. Run `tk show %s` to read the ticket details and acceptance criteria
2. Understand what needs to be implemented
3. Implement the functionality completely
4. Write tests with good coverage
5. Run all tests and ensure they pass
6. Do a thorough code review of your changes
7. Fix any issues found in the review
8. Commit with a clear message referencing the ticket
9. Push to remote
10. Close the ticket with `tk close %s`

Be thorough. Ask questions via chef skill only if truly blocked.
When done, output a brief summary of what was implemented.'

REVIEW_HANDOFF_PROMPT='Review the code changes and implement all suggested improvements.

Previous implementation summary:
%s

Your task:
1. Review the recent commits for this ticket
2. Check code quality, edge cases, error handling
3. Implement any improvements needed
4. Run tests again to verify
5. Commit fixes if any
6. Push to remote

Output a brief summary of review findings and fixes applied.'

USER_REQUEST_PROMPT='The user has requested:

%s

Implement this request:
1. Understand what is being asked
2. Implement it completely
3. Write tests if applicable
4. Run tests and ensure they pass
5. Commit and push the changes

Be thorough. Output a brief summary when done.'

# --- Main loop functions ---
implement_ticket() {
    local ticket_id="$1"
    local title
    title=$(get_ticket_title "$ticket_id")

    log "Starting implementation of ticket: $ticket_id - $title"
    chef_notify "Starting work on ticket: $ticket_id - $title"

    # Phase 1: Implement the ticket
    local prompt
    # shellcheck disable=SC2059
    prompt=$(printf "$IMPLEMENT_PROMPT" "$ticket_id" "$ticket_id" "$ticket_id")

    log "Running implementation..."
    local impl_result
    if ! impl_result=$(echo "$prompt" | claude $CLAUDE_ARGS 2>&1); then
        log_error "Implementation failed for $ticket_id"
        chef_notify "Implementation failed for $ticket_id. Check logs."
        return 1
    fi

    # Phase 2: Code review and handoff
    log "Running code review handoff..."
    local review_prompt
    # shellcheck disable=SC2059
    review_prompt=$(printf "$REVIEW_HANDOFF_PROMPT" "$impl_result")

    local review_result
    if ! review_result=$(echo "$review_prompt" | claude $CLAUDE_ARGS 2>&1); then
        log_error "Review handoff failed for $ticket_id"
        chef_notify "Review handoff failed for $ticket_id. Check logs."
        return 1
    fi

    log "Ticket $ticket_id completed"
    chef_notify "Completed ticket: $ticket_id - $title

Summary:
$review_result"

    return 0
}

handle_user_request() {
    local request="$1"

    log "Handling user request: $request"
    chef_notify "Working on your request..."

    local prompt
    # shellcheck disable=SC2059
    prompt=$(printf "$USER_REQUEST_PROMPT" "$request")

    local result
    if ! result=$(echo "$prompt" | claude $CLAUDE_ARGS 2>&1); then
        log_error "Failed to handle user request"
        chef_notify "Failed to complete request. Check logs."
        return 1
    fi

    log "User request completed"
    chef_notify "Completed your request.

Summary:
$result"

    return 0
}

main_loop() {
    log "Starting simp loop"
    chef_notify "Simp loop started. Ready to work on tickets."

    while true; do
        local ticket_id
        ticket_id=$(get_next_ticket)

        if [[ -n "$ticket_id" ]]; then
            # Have a ticket to work on
            if ! implement_ticket "$ticket_id"; then
                log "Failed to implement $ticket_id, continuing to next..."
                sleep 2
            fi
        else
            # No tickets available
            log "No tickets available, asking user what to do"
            local user_input
            user_input=$(chef_ask "No tickets available. What should I work on next? (Type a task or 'wait' to pause)")

            if [[ -z "$user_input" ]]; then
                # Timeout or empty response, ask again
                log "No response from user, asking again..."
                continue
            fi

            if [[ "$user_input" == "wait" || "$user_input" == "pause" || "$user_input" == "stop" ]]; then
                log "User requested pause, exiting loop"
                chef_notify "Simp loop paused. Run simp.sh to resume."
                break
            fi

            # User provided a task
            if ! handle_user_request "$user_input"; then
                log "Failed to handle user request, continuing..."
            fi
        fi

        # Small delay between iterations
        sleep 1
    done

    log "Simp loop ended"
}

# --- Entry point ---
main() {
    # Verify dependencies
    if ! command -v claude &>/dev/null; then
        log_error "claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code"
        exit 1
    fi

    if ! command -v tk &>/dev/null; then
        log_error "tk CLI not found. Ticket skill required."
        exit 1
    fi

    if ! command -v bun &>/dev/null; then
        log_error "bun not found. Required for chef notifications."
        exit 1
    fi

    if [[ ! -f "$CHEF_SCRIPT" ]]; then
        log_error "Chef script not found at: $CHEF_SCRIPT"
        exit 1
    fi

    main_loop
}

main "$@"
