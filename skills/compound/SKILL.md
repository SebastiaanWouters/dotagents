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

**Primary (mise-en-place generated):**
- `docs/DESIGN_SYSTEM.md` — Single comprehensive file with all tokens, patterns, layouts

**Secondary (granular structure):**

| File | Purpose | Example Content |
|------|---------|-----------------|
| `docs/design/tokens.md` | Design tokens | Colors, spacing, typography, shadows |
| `docs/design/components.md` | Component patterns | Button variants, card styles, form inputs |
| `docs/design/layout.md` | Layout conventions | Grid systems, page structures, breakpoints |
| `docs/design/decisions.md` | Design rationale | Why X font, why Y color palette |

### Compound Design Retrieve

**Before building ANY UI component:**

```bash
# Check for mise-en-place generated design system FIRST
cat docs/DESIGN_SYSTEM.md 2>/dev/null

# If not found, check granular structure
ls docs/design/ 2>/dev/null && cat docs/design/tokens.md 2>/dev/null
```

**Priority order:**
1. `docs/DESIGN_SYSTEM.md` (mise-en-place generated) — load this if it exists
2. `docs/design/` directory — fallback for granular structure

**If no design system exists:** Run mise-en-place Phase 2, or create one during first UI work. Don't proceed with UI without establishing tokens.

### Compound Design Store

**After making UI decisions, persist them.**

#### If `docs/DESIGN_SYSTEM.md` exists (mise-en-place generated)

**UPDATE the existing file** — don't create separate files. The mise-en-place format includes:

```markdown
# docs/DESIGN_SYSTEM.md sections:
- Design Tokens (Colors, Typography, Spacing, Border Radius, Shadows, Breakpoints)
- Component Patterns (Buttons, Inputs, Cards, etc.)
- Layout Patterns
- Iconography
- Motion & Animation
- Dark Mode (if applicable)
```

**When storing new design knowledge:**
1. Read the existing `docs/DESIGN_SYSTEM.md`
2. Find the relevant section
3. ADD or UPDATE entries — never duplicate
4. Keep the mise-en-place structure intact

#### If no design system exists (creating from scratch)

Create `docs/DESIGN_SYSTEM.md` following mise-en-place format:

```markdown
# Design System
---
updated: 2024-01-23
---

## Design Tokens

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary | oklch(55% 0.18 250) | CTAs, links, active states |
| Surface | oklch(98% 0.01 250) | Card backgrounds |
| Text | oklch(20% 0.02 250) | Body text |
| Muted | oklch(50% 0.01 250) | Secondary text |

### Typography
| Property | Value |
|----------|-------|
| Font (headings) | 'Instrument Serif', serif |
| Font (body) | 'Inter', sans-serif |
| Base size | clamp(1rem, 0.95rem + 0.25vw, 1.125rem) |
| Scale | xs, sm, base, lg, xl, 2xl |

### Spacing
| Size | Value |
|------|-------|
| 1 | 0.25rem |
| 2 | 0.5rem |
| 4 | 1rem |
| 8 | 2rem |
| 16 | 4rem |

### Border Radius
| Size | Value |
|------|-------|
| sm | 4px |
| md | 8px |
| lg | 12px |
| full | 9999px |

### Shadows
| Size | Value |
|------|-------|
| sm | 0 1px 2px oklch(0% 0 0 / 0.05) |
| md | 0 4px 6px oklch(0% 0 0 / 0.1) |

## Component Patterns

### Buttons
- Primary: solid bg, primary color, white text
- Secondary: border only, primary border/text
- Ghost: no border, subtle hover bg
- All: radius-sm, 0.5rem 1rem padding

### Cards
- Surface color bg, radius-md
- Padding: spacing-4 to spacing-8
- NO nested cards, NO excessive shadows

### Forms
- Labels above inputs, spacing-1 gap
- Inputs: border, radius-sm, spacing-2 padding
- Error states: red tint, message below

## Layout Patterns
- Container max-width: 1280px
- Sidebar width: 280px
- Page padding: spacing-4 (mobile), spacing-8 (desktop)

## Motion & Animation
- Duration (fast): 150ms
- Duration (normal): 300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Compound Design Sync

**When working on a new page in existing project:**

1. **Load the design system first**
   ```bash
   # Primary: mise-en-place generated
   cat docs/DESIGN_SYSTEM.md 2>/dev/null

   # Fallback: granular structure
   cat docs/design/tokens.md docs/design/components.md 2>/dev/null
   ```

2. **Verify consistency before writing UI**
   - Use exact token names from Design Tokens section
   - Follow component patterns exactly
   - Match existing layout conventions

3. **Update design system if extending**
   - Adding a new component variant? Update Component Patterns section
   - Need a new spacing value? Add to Design Tokens section with rationale
   - Never create one-off values—extend the system or reuse existing
   - **Always update the existing file**—don't create parallel structures

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
cat docs/DESIGN_SYSTEM.md  # or docs/design/tokens.md
# Then build using those tokens
```

❌ **Storing design tokens in code comments**
```css
/* Wrong - tokens scattered in code */
/* Primary color: #3b82f6, spacing: 16px */

/* Right - centralized in docs/DESIGN_SYSTEM.md */
```

❌ **Creating parallel design systems**
```bash
# Wrong - mise-en-place created DESIGN_SYSTEM.md but you create docs/design/
docs/DESIGN_SYSTEM.md  # exists from mise-en-place
docs/design/tokens.md  # DON'T create this too!

# Right - update the existing file
# Edit docs/DESIGN_SYSTEM.md directly
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
- [ ] Check for `docs/DESIGN_SYSTEM.md` first (mise-en-place)
- [ ] Fallback: check `docs/design/` directory
- [ ] Load the full design system before any UI work
- [ ] If no design system, run mise-en-place or create one

### Design Store Checklist
- [ ] Check which format exists (DESIGN_SYSTEM.md vs docs/design/)
- [ ] UPDATE existing file—never create parallel structures
- [ ] Add new tokens/patterns to appropriate sections
- [ ] Keep mise-en-place structure if that's what exists
- [ ] Update `updated:` date in frontmatter

### Design Sync Checklist
- [ ] Load design system before new page
- [ ] Use exact token names (no hardcoded values)
- [ ] Follow component patterns exactly
- [ ] If extending: update existing design file, don't create one-offs
- [ ] Never create `docs/design/` if `DESIGN_SYSTEM.md` exists


