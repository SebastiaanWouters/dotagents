#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

flock -n /tmp/simp.lock -c 'true' || { echo "simp already running"; exit 1; }

# Initialize tickets directory if not present
mkdir -p .tickets

run_amp() {
    if ! amp --dangerously-allow-all -x "$1"; then
        echo "[simp] amp exited with error, continuing..."
    fi
}

ticket=$(tk ready --limit 1 2>/dev/null | awk 'NR==1{print $1}') || true

KNOWLEDGE_PREAMBLE="
FIRST: Read and internalize docs/KNOWLEDGE.md and AGENTS.md before starting.

"

KNOWLEDGE_EPILOGUE="

FINALLY: Before finishing, update docs/KNOWLEDGE.md with any new learnings:
- Only add knowledge NOT already in code/commits
- Use file references (path/to/file#L10-20) instead of verbose content
- Keep sections concise, delete stale entries
"

if [[ -n "$ticket" ]]; then
    run_amp "${KNOWLEDGE_PREAMBLE}Use chef skill to notify: '🎬 Simp online! Starting ticket $ticket — LFG!'

Use recursive-handoff skill to process tickets until all done, then ask user what's next.

LOOP FLOW:
1. Check for ready tickets with 'tk ready --limit 1'
2. IF TICKET EXISTS:
   - tk show <ticket> to read it
   - Implement autonomously with tests
   - Use amp-review skill, fix all issues
   - Commit and push
   - tk close <ticket>
   - Use chef to notify completion with witty summary
   - Update docs/KNOWLEDGE.md
   - Use recursive-handoff to continue (fresh context for next ticket)

3. IF NO TICKETS:
   - Use chef to ask user what to work on next
   - If NEGATIVE response (nothing/enough/done/stop/no/nope/quit/exit):
     - Use chef: '👋 Alright, signing off! Ping me when you need me.'
     - EXIT (finish condition met)
   - If POSITIVE response (task/idea/description):
     - Use chef: '👍 Got it! On it...'
     - Implement request, ask chef questions if needed
     - Use chef to send witty completion summary
     - Update docs/KNOWLEDGE.md
     - Use recursive-handoff to continue (fresh context)

Current ticket to start: $ticket
${KNOWLEDGE_EPILOGUE}"
else
    run_amp "${KNOWLEDGE_PREAMBLE}Use chef skill to notify: '🔍 Simp checking in!'

Use recursive-handoff skill to loop continuously.

LOOP FLOW:
1. Check for ready tickets with 'tk ready --limit 1'
2. IF TICKET EXISTS:
   - tk show <ticket> to read it
   - Implement autonomously with tests
   - Use amp-review skill, fix all issues
   - Commit and push
   - tk close <ticket>
   - Use chef to notify completion with witty summary
   - Update docs/KNOWLEDGE.md
   - Use recursive-handoff to continue (fresh context for next ticket)

3. IF NO TICKETS:
   - Use chef to ask user what to work on next
   - If NEGATIVE response (nothing/enough/done/stop/no/nope/quit/exit):
     - Use chef: '👋 Alright, signing off! Ping me when you need me.'
     - EXIT (finish condition met)
   - If POSITIVE response (task/idea/description):
     - Use chef: '👍 Got it! On it...'
     - Implement request, ask chef questions if needed
     - Use chef to send witty completion summary
     - Update docs/KNOWLEDGE.md
     - Use recursive-handoff to continue (fresh context)
${KNOWLEDGE_EPILOGUE}"
fi
