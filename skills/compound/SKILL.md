---
name: compound
description: "Knowledge retrieval, storage, and design system management for iterative agent loops. Use 'compound retrieve' at start, 'compound store' at end, 'compound design' for UI consistency. Prevents duplicates, manages size, keeps docs organized."
---

# Compound 🧠

Efficient project knowledge and design system management. Retrieve context fast, store learnings without bloat, maintain consistent UI across pages.

## Commands

| Command | When | Purpose |
|---------|------|---------|
| `compound retrieve` | Start of iteration | Find relevant knowledge for current task |
| `compound store` | End of iteration | Persist learnings not captured in code |
| `compound design retrieve` | Before building UI | Load design system tokens and patterns |
| `compound design store` | After UI decisions | Persist design tokens, patterns, components |
| `compound design sync` | Cross-page work | Ensure consistency with existing UI |

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
| **Design system** | `docs/design/` | `docs/design/tokens.md` |

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

## Compound Design

**Goal:** Maintain consistent UI across all pages through tracked design tokens, patterns, and component decisions.

### Design System Location

All design system knowledge lives in `docs/design/`:

| File | Purpose | Example Content |
|------|---------|-----------------|
| `docs/design/tokens.md` | Design tokens | Colors, spacing, typography, shadows |
| `docs/design/components.md` | Component patterns | Button variants, card styles, form inputs |
| `docs/design/layout.md` | Layout conventions | Grid systems, page structures, breakpoints |
| `docs/design/decisions.md` | Design rationale | Why X font, why Y color palette |

### Compound Design Retrieve

**Before building ANY UI component:**

```bash
# Check for existing design system
ls docs/design/ 2>/dev/null

# Load tokens first (always)
cat docs/design/tokens.md 2>/dev/null

# Load component patterns if building components
cat docs/design/components.md 2>/dev/null
```

**If no design system exists:** Create one during first UI work. Don't proceed with UI without establishing tokens.

### Compound Design Store

**After making UI decisions, persist them:**

#### Step 1: Extract Tokens from Implementation

From your CSS/code, extract reusable tokens:

```markdown
# docs/design/tokens.md
---
updated: 2024-01-23
---

## Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | oklch(55% 0.18 250) | CTAs, links, active states |
| `--color-surface` | oklch(98% 0.01 250) | Card backgrounds |
| `--color-text` | oklch(20% 0.02 250) | Body text |
| `--color-muted` | oklch(50% 0.01 250) | Secondary text |

## Typography
| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | 'Instrument Serif', serif | Headings |
| `--font-body` | 'Inter', sans-serif | Body text |
| `--text-base` | clamp(1rem, 0.95rem + 0.25vw, 1.125rem) | Base size |

## Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 0.25rem | Tight groupings |
| `--space-sm` | 0.5rem | Related items |
| `--space-md` | 1rem | Default gap |
| `--space-lg` | 2rem | Section separation |
| `--space-xl` | 4rem | Major divisions |

## Radius & Shadows
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Buttons, inputs |
| `--radius-md` | 8px | Cards |
| `--shadow-sm` | 0 1px 2px oklch(0% 0 0 / 0.05) | Subtle elevation |
```

#### Step 2: Document Component Patterns

```markdown
# docs/design/components.md
---
updated: 2024-01-23
---

## Buttons
- Primary: solid bg, `--color-primary`, white text
- Secondary: border only, `--color-primary` border/text
- Ghost: no border, subtle hover bg
- All: `--radius-sm`, 0.5rem 1rem padding

## Cards
- Surface color bg, `--radius-md`
- Padding: `--space-md` to `--space-lg`
- NO nested cards, NO excessive shadows

## Forms
- Labels above inputs, `--space-xs` gap
- Inputs: border, `--radius-sm`, `--space-sm` padding
- Error states: red tint, message below
```

#### Step 3: Record Design Decisions

```markdown
# docs/design/decisions.md
---
updated: 2024-01-23
---

## Color Palette
Chose warm-tinted neutrals (hue 60) for approachable feel.
Primary blue (hue 250) for trust and professionalism.

## Typography
Instrument Serif for display: distinctive without being flashy.
Inter for body: proven legibility, variable font support.

## Spacing Scale
4px base unit (0.25rem). Powers of 2 scaling for rhythm.
```

### Compound Design Sync

**When working on a new page in existing project:**

1. **Load ALL design files first**
   ```bash
   cat docs/design/tokens.md docs/design/components.md 2>/dev/null
   ```

2. **Verify consistency before writing UI**
   - Use exact token names from `tokens.md`
   - Follow component patterns from `components.md`
   - Match existing layout conventions from `layout.md`

3. **Update design system if extending**
   - Adding a new component variant? Update `components.md`
   - Need a new spacing value? Add to `tokens.md` with rationale
   - Never create one-off values—extend the system or reuse existing

### Design System Anti-Patterns

❌ **Hardcoding values instead of tokens**
```css
/* Wrong */
color: #3b82f6;
padding: 16px;

/* Right - use established tokens */
color: var(--color-primary);
padding: var(--space-md);
```

❌ **Creating inconsistent component variants**
```jsx
/* Wrong - different button styles per page */
<button className="rounded-lg px-4">  {/* Page A */}
<button className="rounded-md px-6">  {/* Page B */}

/* Right - one consistent pattern */
<Button variant="primary">
```

❌ **Ignoring existing design system**
```bash
# Wrong - building UI without checking
# Just start coding...

# Right - always check first
cat docs/design/tokens.md
# Then build using those tokens
```

❌ **Storing design tokens in code comments**
```css
/* Wrong - tokens scattered in code */
/* Primary color: #3b82f6, spacing: 16px */

/* Right - centralized in docs/design/ */
```

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

### Design Retrieve Checklist
- [ ] Check if `docs/design/` exists
- [ ] Load `tokens.md` (always, first)
- [ ] Load `components.md` if building components
- [ ] Load `layout.md` if building pages
- [ ] If no design system, create one before UI work

### Design Store Checklist
- [ ] Extract tokens from implementation
- [ ] Document component patterns used
- [ ] Record design decisions with rationale
- [ ] Use consistent token names
- [ ] Update `updated:` date in frontmatter

### Design Sync Checklist
- [ ] Load ALL design files before new page
- [ ] Use exact token names (no hardcoded values)
- [ ] Follow component patterns exactly
- [ ] If extending: update design docs, don't create one-offs


