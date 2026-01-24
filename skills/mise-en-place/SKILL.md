---
name: mise-en-place
description: "Transforms raw ideas into complete specs via adaptive interview. Triggers on: mise-en-place, prep my idea, spec this out. Uses chef (Telegram) or built-in conversation, compound for knowledge priming."
---

# Mise-en-Place 🍳

**Everything in its place before cooking begins.**

Transform a vague idea into a complete, implementation-ready specification through an adaptive conversation.

## Goal

Build a complete mental model of what we're building:
- **What** we're building and why
- **Who** it's for and their journey
- **How** it works technically (exact stack, libraries, integrations)
- **How** it looks and feels (design, theme, personality)
- **What** each part/page/step does in detail

## Communication Mode

**Two modes available:**

| Mode | When to use | How |
|------|-------------|-----|
| **Chef (Telegram)** | User says "use chef" or "via telegram" | Load chef skill, use `chef ask` for BLOCKING questions |
| **Built-in (default)** | Normal conversation | Ask questions directly in chat, wait for user response |

If chef is not explicitly requested, use built-in conversation mode.

## Three Phases

| Phase | Purpose | Output |
|-------|---------|--------|
| **Discovery** | Adaptive interview to extract full picture | `docs/SPEC.md` |
| **Research** | Prime knowledge base with stack docs | Compound store |
| **Initialize** | Set up agent guidelines for implementation | `AGENTS.md` |

---

## Phase 1: Discovery

Ask intelligent, open-ended questions. Each question builds on previous answers. Wait for user response before proceeding.

### Starting Point

Ask the user to paint the full picture — the problem, the solution, who it's for.

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

#### 7. Constraints & Requirements
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
- Constraints & Requirements
- Open Questions

---

## Phase 2: Research & Prime Compound

After spec is written, research all chosen technologies and store in compound.

1. **Extract stack** from SPEC.md
2. **Research each technology** via web_search and read_web_page:
   - Installation, configuration, patterns
   - Integration with other stack items
   - Common gotchas
3. **Store in compound** — for each tech: setup commands, config files, API patterns, code examples, pitfalls
4. **Notify completion** — via chef if using Telegram mode, otherwise inform user in chat

---

## Phase 3: Initialize AGENTS.md

Use the `agents-md` skill to create project-specific agent guidelines based on the spec.

This ensures implementing agents know:
- Project structure and conventions
- Tech stack specifics and patterns
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
