---
name: compound
description: "Knowledge retrieval and storage for iterative agent loops. Use 'compound retrieve' at start, 'compound store' at end. Prevents duplicates, manages size, keeps docs organized."
---

# Compound 🧠

Efficient project knowledge management. Retrieve context fast, store learnings without bloat.

## Commands

| Command | When | Purpose |
|---------|------|---------|
| `compound retrieve` | Start of iteration | Find relevant knowledge for current task |
| `compound store` | End of iteration | Persist learnings not captured in code |

---

## Compound Retrieve

**Goal:** Get relevant context in <30 seconds with minimal token waste.

### Step 1: Index Scan
```bash
# List all knowledge files (cached mentally for the session)
find docs -name "*.md" -type f 2>/dev/null | head -50
```

### Step 2: Keyword Extraction
From the current ticket/task, extract 3-5 keywords:
- Entity names (User, Auth, API)
- Technical terms (JWT, WebSocket, migration)
- Domain concepts (billing, notifications)

### Step 3: Targeted Grep
```bash
# Search for keywords in docs (parallel, fast)
grep -ril "keyword1\|keyword2\|keyword3" docs/ | head -10
```

### Step 4: Smart Read
- **Small files (<100 lines):** Read fully
- **Large files:** Read only matching sections (grep -B2 -A5)
- **Index files (README, index.md):** Skim for pointers

### Step 5: Relevance Filter
Only load knowledge that's **directly applicable**:
- ✅ "JWT refresh tokens expire after 7 days" (for auth task)
- ❌ "We chose React over Vue" (not relevant to auth)

**Output:** Mental model of relevant project context, ready to apply.

---

## Compound Store

**Goal:** Persist valuable learnings without creating duplicates or bloat.

### Step 1: Identify Storable Knowledge

Only store what **code comments can't capture**:
- ✅ Why we chose X over Y (decision rationale)
- ✅ Non-obvious gotchas discovered during implementation
- ✅ Cross-component relationships not visible in one file
- ✅ External API quirks, rate limits, undocumented behavior
- ❌ What the code does (that's what code is for)
- ❌ How to run commands (put in README or AGENTS.md)

### Step 2: Duplicate Check (CRITICAL)

**Before writing ANYTHING, search for existing coverage:**

```bash
# Check if topic already exists
grep -ril "topic keyword" docs/

# Check similar filenames
find docs -name "*keyword*" -type f
```

**If found:**
- Read the existing file
- UPDATE it rather than create new
- Merge new info into existing sections
- Add/update the `updated:` frontmatter date

### Step 3: Choose Location

| Content Type | Location | Example |
|--------------|----------|---------|
| Architecture decisions | `docs/arch/` | `docs/arch/auth-flow.md` |
| Why X over Y | `docs/decisions/` | `docs/decisions/adr-001-db-choice.md` |
| Gotchas, edge cases | `docs/gotchas/` | `docs/gotchas/jwt-refresh-edge-cases.md` |
| Reusable patterns | `docs/patterns/` | `docs/patterns/error-handling.md` |
| External API notes | `docs/integrations/` | `docs/integrations/stripe-webhooks.md` |

### Step 4: File Format

```markdown
---
tags: [searchable, terms, here]
updated: 2024-01-23
related: [../arch/auth.md, ../patterns/error-handling.md]
---

# Clear Descriptive Title

## Context
[Why this knowledge exists - 1-2 sentences]

## Key Points
- Bullet points for scannability
- One concept per bullet
- Include specifics (numbers, names, versions)

## Examples (if applicable)
[Code or scenarios that illustrate the point]

## See Also
- [Related doc](../path/to/related.md)
```

### Step 5: Size Management

**Per-file limits:**
- Target: 50-150 lines per file
- Max: 200 lines (split if larger)
- One focused topic per file

**Folder hygiene:**
```bash
# Check folder sizes periodically
find docs -name "*.md" | wc -l  # Should stay <50 files

# Find potential duplicates (similar names)
ls docs/**/*.md | sort | uniq -d
```

**If docs/ grows too large (>50 files):**
1. Consolidate related small files
2. Archive obsolete knowledge to `docs/_archive/`
3. Merge overlapping content

---

## Anti-Patterns

❌ **Creating near-duplicate files**
```
docs/gotchas/auth-issues.md
docs/gotchas/authentication-problems.md  # DUPLICATE!
```

❌ **Storing obvious information**
```markdown
# How to Start the Server
Run `npm start`  # This belongs in README!
```

❌ **Huge monolithic files**
```
docs/knowledge.md  # 500 lines of everything
```

❌ **Vague file names**
```
docs/notes.md
docs/stuff.md
docs/misc.md
```

❌ **Forgetting to update existing files**
```bash
# Wrong: Create new file
touch docs/gotchas/jwt-issue-2.md

# Right: Update existing
edit docs/gotchas/jwt-refresh-edge-cases.md
```

---

## Quick Reference

### Retrieve Checklist
- [ ] List docs structure
- [ ] Extract task keywords
- [ ] Grep for relevant files
- [ ] Read only what's needed
- [ ] Apply context to task

### Store Checklist  
- [ ] Is this code-external knowledge?
- [ ] Search for existing coverage
- [ ] Update existing OR create focused new file
- [ ] Add frontmatter (tags, updated, related)
- [ ] Keep file <150 lines
- [ ] Verify no duplicates created


