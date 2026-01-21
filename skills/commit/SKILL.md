---
name: commit
description: Create logical git commits with conventional messages. Accepts optional description and file list (defaults to all local changes). Groups related changes into atomic commits.
---

# Git Commit Skill

Create clean, atomic git commits following project conventions.

## Arguments

- `description` (optional): What the commit should accomplish
- `files` (optional): Specific files to commit (defaults to all local changes)

Example invocations:
- `/commit` - commit all changes
- `/commit fix login validation` - commit all changes with context
- `/commit src/auth.ts src/utils.ts` - commit specific files

## Workflow

### 1) Gather Context

Run these commands to understand the current state:

```bash
git status --short
git diff HEAD
git log --oneline -10
```

Analyze:
- What files have changed and why
- The project's existing commit message style and conventions
- Whether changes span multiple logical concerns

### 2) Filter Unwanted Files

**Auto-exclude (silently skip):**
- OS files: `.DS_Store`, `Thumbs.db`, `Desktop.ini`
- Editor artifacts: `.idea/`, `.vscode/` (unless already tracked), `*.swp`, `*~`
- Ephemeral files: `*.log`, `*.tmp`, `*.cache`
- Common ignores: `node_modules/`, `__pycache__/`, `.pytest_cache/`, `dist/`, `build/`
- Files matching `.gitignore` patterns

**Auto-exclude with warning:**
- Secrets: `.env*`, `credentials.*`, `*.pem`, `*.key`, files containing API keys/tokens
- Large binary files not typically versioned

**Ask user before including:**
- New file types not seen in git history
- Files with suspicious patterns (e.g., hardcoded passwords, connection strings)
- Uncommonly large files
- Anything ambiguous

When in doubt, ask. When certain it's unwanted, exclude silently.

### 3) Plan Atomic Commits

Each commit should address ONE logical change. Split work when changes span:
- A refactor AND a bug fix
- A feature AND test updates
- Multiple unrelated fixes
- Code changes AND documentation updates

For each planned commit, identify:
- Which files belong together
- A clear, concise commit message

### 4) Match Project Commit Style

Adapt to the project's conventions observed in `git log`. Common patterns:
- Conventional commits: `type(scope): description` (e.g., `fix(auth): validate email format`)
- Simple imperative: `Fix login validation bug`
- Prefixed: `SCONE-5341: add user dashboard`

Use the same style as recent commits in the project.

### 5) Stage and Commit

For each logical group:

```bash
git add <files>
git commit -m "<message>"
```

If user provided a description, incorporate it into the commit message.
If user provided specific files, only commit those files.

### 6) Verify

After committing, run `git status` to confirm the working tree state.

## Commit Message Guidelines

- Use imperative mood ("Add feature" not "Added feature")
- First line: 50 chars or less, summarizes the change
- Body (if needed): Explain WHY, not WHAT (the diff shows what)
- Reference issues if applicable: `Fixes #123`

## Safety Checks

Before any commit:
1. Auto-exclude obvious junk files (no need to mention)
2. Warn and exclude detected secrets
3. Ask about uncertain/ambiguous files
4. Ensure commit is atomic (one logical change)
