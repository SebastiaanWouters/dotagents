---
name: mise-en-place
description: "Transforms raw ideas into complete specs via adaptive interview. Triggers on: mise-en-place, prep my idea, spec this out. Starts from SPEC.md or user-specified file. Uses chef (Telegram) or built-in conversation, compound for knowledge priming."
---

# Mise-en-Place 🍳

**Everything in its place before cooking begins.**

Transform an idea into a complete, implementation-ready specification through adaptive conversation, starting from existing documentation.

## Goal

Build a complete mental model of what we're building:
- **What** we're building and why
- **Who** it's for and their journey
- **How** it works technically (exact stack, libraries, integrations)
- **How** it looks and feels (design system, theme, personality)
- **What** each part/page/step does in detail

## Communication Mode

**Two modes available:**

| Mode | When to use | How |
|------|-------------|-----|
| **Chef (Telegram)** | User says "use chef" or "via telegram" | Load chef skill, use `chef ask` for BLOCKING questions |
| **Built-in (default)** | Normal conversation | Ask questions directly in chat, wait for user response |

If chef is not explicitly requested, use built-in conversation mode.

## Five Phases

| Phase | Purpose | Output |
|-------|---------|--------|
| **0. Bootstrap** | Read existing spec file as starting point | Context for discovery |
| **1. Discovery** | Adaptive interview to fill gaps | `docs/SPEC.md` |
| **2. Design System** | Create visual/component foundation | `docs/DESIGN_SYSTEM.md` |
| **3. Research** | Prime knowledge base with stack docs | Compound store |
| **4. Initialize** | Set up agent guidelines for implementation | `AGENTS.md` |

---

## Phase 0: Bootstrap

**Start here — never from scratch.**

### Source File

1. Check for existing spec file in this order:
   - User-specified file (if provided, e.g., "use README.md" or "start from docs/idea.md")
   - `SPEC.md` in project root
   - `docs/SPEC.md`
   - `README.md` as fallback

2. Read the file and extract:
   - Project description/vision
   - Any mentioned features or requirements
   - Tech stack hints
   - Design preferences
   - Referenced resources (URLs, repos, apps)

3. Summarize what you learned and what's still missing before proceeding to Discovery.

### Gather Resources (Optional)

Ask user for reference materials:
- **URLs** — Documentation, design inspiration, competitor sites
- **Example apps** — "Like Notion but for X", "Similar to Linear's UI"
- **GitHub repos** — Reference implementations, starter templates, design systems
- **Figma/design files** — If available

Store these references for use in Discovery and Design System phases.

---

## Phase 1: Discovery

Ask intelligent, open-ended questions. Each question builds on previous answers. Wait for user response before proceeding.

### Starting Point

Review what Bootstrap phase extracted, then identify gaps. Focus questions on what's unclear or missing — don't re-ask what's already documented.

### Adaptive Questioning

Dynamically choose your next question based on what's missing or unclear. Fill these knowledge areas:

#### 1. Problem & Users
- What specific pain point does this solve?
- Who experiences this pain? Describe them.
- How do they currently deal with it?
- What would success look like for them?

#### 2. User Journey (Start to Finish)
- How does someone discover/find this?
- What's the signup/onboarding flow?
- What's the core action they repeat?
- What progression or value accumulation happens?
- How does a session typically end?
- What brings them back?

#### 3. Structure & Parts
- What are all the pages/screens/views?
- For each page: what can the user do there?
- How do pages connect/flow into each other?
- What's always visible (nav, sidebar, etc)?
- What are the key states (loading, empty, error, success)?

#### 4. Tech Stack (Be Specific)
Ask about each layer, get exact library/framework names:
- Frontend framework & version
- Routing solution
- State management approach
- Styling approach (CSS framework, component library)
- Backend/API approach
- Database & ORM
- Authentication method
- Real-time needs (if any)
- File storage (if any)
- Third-party integrations/APIs
- Deployment target

#### 5. Design & Theme
- What's the visual style? (Show examples/references if possible)
- Color palette or mood?
- Typography feel?
- Light/dark mode?
- Brand personality (serious, playful, minimal, bold)?
- Any existing brand assets to match?

#### 6. Features Deep-Dive
For each major feature:
- What exactly does it do?
- What inputs does it need?
- What outputs/results does it produce?
- What edge cases exist?
- How does it interact with other features?

#### 7. Deployment & Infrastructure
- Where will this be hosted? (Fly.io, Vercel, AWS, self-hosted, etc.)
- Domain name / URL structure?
- Environment setup (staging, production)?
- CI/CD requirements? (GitHub Actions, etc.)
- SSL/TLS needs?
- CDN for assets?
- Monitoring/logging requirements?
- Backup strategy?
- Scaling expectations? (concurrent users, traffic patterns)

#### 8. Constraints & Requirements
- Timeline or deadline?
- Performance requirements?
- Accessibility needs?
- Security/compliance needs?
- Budget constraints?
- Team size/skills?

### Question Strategy

- After each answer, analyze what's still unclear or missing
- Ask the MOST valuable next question
- Go deep on unclear areas — don't accept vague answers for critical details
- Be specific about tech — get exact library names, not categories

### Wrapping Up Discovery

When you have the full picture, confirm understanding with the user before writing the spec.

---

## Spec Generation

Generate `docs/SPEC.md` covering:

- Vision & Problem
- Target Users
- User Journey (discovery → onboarding → core usage → return)
- Pages & Structure (every page with purpose and capabilities)
- Features (full detail, inputs, outputs, edge cases)
- Tech Stack (exact technologies with versions)
- Design & Theme (visual direction, references, personality)
- Data Model (key entities and relationships)
- Integrations (third-party services and APIs)
- Deployment & Infrastructure (hosting, CI/CD, environments, scaling)
- Constraints & Requirements
- Open Questions

---

## Phase 2: Design System

Create a design foundation based on the spec, gathered resources, and project description.

### Inputs

Use these sources to inform the design system:
- **SPEC.md** — Design & Theme section, brand personality
- **Reference resources** — URLs, example apps, GitHub repos from Bootstrap phase
- **Tech stack** — Component library choice affects design tokens

### Research References

For each provided resource:
- **URLs** — Fetch and analyze visual patterns, color usage, typography, spacing
- **Example apps** — Document what makes their design work (if accessible)
- **GitHub repos** — Check for existing design tokens, theme configs, component patterns
- **Design systems** — If referencing known systems (Tailwind, Radix, shadcn), pull their conventions

### Generate `docs/DESIGN_SYSTEM.md`

Create a comprehensive design system document:

#### 1. Design Tokens
```
Colors:
  - Primary: [hex] — usage
  - Secondary: [hex] — usage
  - Accent: [hex] — usage
  - Background: [hex]
  - Surface: [hex]
  - Text: [hex primary, hex secondary, hex muted]
  - Border: [hex]
  - Error/Success/Warning: [hex each]

Typography:
  - Font families (headings, body, mono)
  - Scale (xs, sm, base, lg, xl, 2xl, etc.)
  - Line heights
  - Font weights

Spacing:
  - Base unit (e.g., 4px or 0.25rem)
  - Scale (1, 2, 3, 4, 6, 8, 12, 16, etc.)

Border Radius:
  - none, sm, md, lg, full

Shadows:
  - sm, md, lg, xl

Breakpoints:
  - sm, md, lg, xl, 2xl
```

#### 2. Component Patterns
Define patterns for core UI elements:
- Buttons (variants: primary, secondary, ghost, destructive; sizes: sm, md, lg)
- Inputs (text, select, checkbox, radio, toggle)
- Cards (with header, body, footer patterns)
- Modals/Dialogs
- Navigation (header, sidebar, tabs, breadcrumbs)
- Lists & Tables
- Loading states (skeleton, spinner)
- Empty states
- Error states
- Notifications/Toasts

#### 3. Layout Patterns
- Page layouts (sidebar, stacked, centered)
- Grid systems
- Container widths
- Responsive behavior

#### 4. Iconography
- Icon library choice (Lucide, Heroicons, etc.)
- Size conventions
- Usage patterns

#### 5. Motion & Animation
- Transition durations (fast, normal, slow)
- Easing curves
- Animation patterns (fade, slide, scale)

#### 6. Dark Mode (if applicable)
- Token overrides for dark theme
- Component adjustments

### Integration with Tech Stack

Based on the chosen styling approach:
- **Tailwind** — Generate `tailwind.config.js` theme extension
- **CSS Variables** — Generate `:root` variable definitions
- **styled-components/emotion** — Generate theme object
- **Component library (shadcn, Radix)** — Document customization approach

---

## Phase 3: Research & Prime Compound

After spec and design system are written, research all chosen technologies and store in compound.

1. **Extract stack** from SPEC.md
2. **Research each technology** via web_search and read_web_page:
   - Installation, configuration, patterns
   - Integration with other stack items
   - Common gotchas
3. **Include design system** — Store design tokens and patterns for implementing agents
4. **Store in compound** — for each tech: setup commands, config files, API patterns, code examples, pitfalls
5. **Notify completion** — via chef if using Telegram mode, otherwise inform user in chat

---

## Phase 4: Initialize AGENTS.md

Use the `agents-md` skill to create project-specific agent guidelines based on the spec and design system.

This ensures implementing agents know:
- Project structure and conventions
- Tech stack specifics and patterns
- **Design system tokens and patterns**
- Commands for build, test, lint, etc.
- Code style preferences
- Any project-specific rules from the spec

---

## Rules

- **Open questions over multiple choice** — let users express freely
- **Each question builds on previous** — show you're listening
- **Go deep on unclear areas** — don't accept vague answers for critical details
- **Be specific about tech** — get exact library names, not categories
- **One question at a time** — wait for user response before asking next
- **Batch when appropriate** — in built-in mode, can group 2-3 related questions if context warrants it
