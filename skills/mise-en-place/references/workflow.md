# Workflow Diagram

```
User: "I want to build a habit tracker"
           │
           ▼
    ┌─────────────┐
    │  Round 1    │ Open questions (vision, users, success)
    │  Wide Open  │ BLOCKING
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 2    │ Project type & scope
    │  Narrow     │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 3    │ Tech stack (framework, frontend, router, bundler)
    │  Stack      │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 3.5  │ Styling & components
    │  Styling    │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 4    │ Database & real-time
    │  Backend    │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 5    │ Auth provider, roles, payments
    │  Auth       │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 6    │ First visit, core loop, progression, end state
    │  Flow       │ BLOCKING batch + N/A (adapts to project type)
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 6.5  │ Feature-specific details
    │  Features   │ BLOCKING (conditional)
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 7    │ Linting, formatting, testing
    │  Tooling    │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 8    │ Design style, color theme, personality
    │  Design     │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 9    │ Structure, types, docs, CI/CD
    │  Practices  │ BLOCKING batch + N/A
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Round 10   │ Libraries, concerns, constraints
    │  Details    │ Open-ended
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Generate   │ → SPEC.md
    │  Spec       │
    └─────────────┘
           │
     User confirms
           │
           ▼
    ┌─────────────┐
    │  Phase 2    │ web_search + read_web_page for each tech
    │  Research   │ Extract APIs, patterns, gotchas
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Compound   │ → Store docs, examples, integration guides
    │  Store      │ Prime knowledge for Ralph
    └─────────────┘
           │
           ▼
    ┌─────────────┐
    │  Generate   │ → Epic + Tasks via `tk`
    │  Tickets    │
    └─────────────┘
           │
           ▼
      Ready for Ralph 🚀
      (with primed compound)
```

## Round Summary

| Round | Focus | Type |
|-------|-------|------|
| 1 | Vision, users, success | Open BLOCKING |
| 2 | Project type, scope | Batch + N/A |
| 3 | Framework, frontend, router, bundler | Batch + N/A |
| 3.5 | Styling, components | Batch + N/A |
| 4 | Database, real-time | Batch + N/A |
| 5 | Auth, roles, payments | Batch + N/A |
| 6 | **User flow** (first visit, core loop, screens, end state) | Batch + N/A (adapts to type) |
| 6.5 | Feature-specific (conditional) | Batch + N/A |
| 7 | Linting, testing | Batch + N/A |
| 8 | Design, theme, personality | Batch + N/A |
| 9 | Structure, types, docs, CI | Batch + N/A |
| 10 | Libraries, concerns | Open-ended |
