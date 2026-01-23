#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

flock -n /tmp/simp.lock -c 'true' || { echo "simp already running"; exit 1; }

ticket=$(tk ready --limit 1 2>/dev/null | awk 'NR==1{print $1}') || true

if [[ -n "$ticket" ]]; then
    amp --dangerously-allow-all -x "Use chef skill to notify: '🎬 Simp online! Starting ticket $ticket — LFG!'

Use recursive-handoff skill to iterate over tickets until none left:

For each ticket:
1. tk show <ticket> to read it
2. Implement autonomously with tests
3. Use amp-review skill, fix all issues
4. Commit and push
5. tk close <ticket>
6. Use chef to notify completion with a witty summary (what was done, emojis, keep it punchy)

Current ticket: $ticket

Be as autonomous as possible during implementation. When all tickets done, use chef skill to ask user what's next. When you receive a response, immediately use chef to send a short confirmation like '👍 Got it! On it...' before starting work."
else
    amp --dangerously-allow-all -x "Use chef skill to notify: '🔍 Simp checking in — no tickets in queue!'

Then use chef skill to ask the user what to work on next.
When you receive a response, immediately use chef to send a short confirmation like '👍 Got it! On it...' before starting work.
Implement their request fully, using chef skill to ask clarifying questions if needed.
When done, use chef to send a witty summary of what was accomplished."
fi
