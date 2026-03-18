---
name: commit
description: Use when asked to create a git commit, split changes into commits, or write a commit message. Prefer small commits that are easy to review. Follow this repo's commit message pattern when clear from recent history or touched-path history; otherwise default to conventional commits. Never commit gitignored, ephemeral, generated, local-only, or secret files.
---

# Commit
Goal: small commits. Easy review wins.

Start:
- `git status --short`
- `git diff --stat`
- `git diff`
- `git log --oneline -n 20`
- If needed: `git log --oneline -- <path>`

Slice:
- One concern per commit.
- Split unrelated edits.
- If diff feels big, split more.
- Do not mix refactor + behavior change unless tiny and inseparable.
- Leave unrelated work unstaged.

Stage:
- Prefer explicit paths: `git add path/to/file`.
- Avoid `git add .` and `git commit -a` in dirty trees.
- If staged too much: `git restore --staged <path>`.
- Review exact commit with `git diff --cached --stat` and `git diff --cached`.

Keep out:
- Never commit gitignored files.
- Never commit ephemeral files: logs, caches, temp output, build artifacts, local env files, editor junk, downloaded files.
- When unsure: `git check-ignore -v <path>`.
- If file looks generated or local-only, leave it out unless user explicitly wants it committed.

Message:
- Infer pattern from recent commits first.
- Prefer touched-path history over repo-wide history when it shows a clear style.
- If project style is mixed or unclear, default to conventional commits.
- Keep subject short, specific, imperative, no trailing period.
- Safe defaults: `feat(scope): add x`, `fix(scope): handle y`, `refactor(scope): simplify z`, `docs(scope): update w`, `chore(scope): clean up q`.

Commit:
- Commit only the reviewed slice.
- After commit, verify with `git show --stat --oneline HEAD`.
- If nothing clean and coherent to commit, say so instead of forcing one.
