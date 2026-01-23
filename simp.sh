#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

flock -n /tmp/simp.lock -c 'true' || { echo "simp already running"; exit 1; }

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

Use recursive-handoff skill to iterate over tickets until none left:

For each ticket:
1. tk show <ticket> to read it
2. Implement autonomously with tests
3. Use amp-review skill, fix all issues
4. Commit and push
5. tk close <ticket>
6. Use chef to notify completion with a witty summary (what was done, emojis, keep it punchy)

Current ticket: $ticket

Be as autonomous as possible during implementation. When all tickets done, use chef skill to ask user what's next. When you receive a response, immediately use chef to send a short confirmation like '👍 Got it! On it...' before starting work.${KNOWLEDGE_EPILOGUE}"
else
    run_amp "${KNOWLEDGE_PREAMBLE}Use chef skill to notify: '🔍 Simp checking in — no tickets in queue!'

Use recursive-handoff skill to loop continuously:

Each iteration:
1. Check for ready tickets with 'tk ready --limit 1'
2. If ticket exists:
   - tk show <ticket> to read it
   - Implement autonomously with tests
   - Use amp-review skill, fix all issues
   - Commit and push
   - tk close <ticket>
   - Use chef to notify completion with a witty summary
3. If no tickets:
   - Use chef skill to ask the user what to work on next
   - If user responds with nothing/enough/done/stop/no/nope/quit/exit or similar negative response:
     - Use chef to send '👋 Alright, signing off! Ping me when you need me.'
     - EXIT the loop (finish condition met)
   - Otherwise:
     - Immediately use chef to send '👍 Got it! On it...'
     - Implement their request fully, using chef to ask clarifying questions if needed
     - When done, use chef to send a witty summary of what was accomplished
     - Continue to next iteration${KNOWLEDGE_EPILOGUE}"
fi
