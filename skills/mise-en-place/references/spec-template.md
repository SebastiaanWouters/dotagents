# SPEC.md Template

Use this structure when generating the specification from discovery answers.

```markdown
# [Project Name] Specification

> Generated via mise-en-place discovery on [DATE]

## 1. Problem Statement

**The Problem:**
[Extracted from Round 1 — what pain point exists]

**Who Has It:**
[Primary user persona with context]

**Current Solutions & Why They Fail:**
[What exists, why it's inadequate]

## 2. Solution Overview

**One-Liner:**
[Tweet-sized description of what this is]

**Core Value:**
[The main benefit — what changes for the user]

**Differentiation:**
[Why this vs alternatives]

## 3. Scope

**Release Target:** [MVP / V1 / Full]

**In Scope:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Explicitly Out of Scope:**
- [Feature X — why]
- [Feature Y — for later]

## 4. Target Users

### Primary Persona: [Name]
- **Who:** [Description]
- **Goal:** [What they want to achieve]
- **Pain:** [Current frustration]
- **Context:** [When/where they'd use this]

### Secondary Persona: [Name] (if applicable)
- ...

## 5. Core Features

### Feature 1: [Name]
**User Story:** As a [persona], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] [Specific, testable criterion]
- [ ] [Another criterion]
- [ ] [Edge case handling]

**UI Notes:** [Any visual requirements]

### Feature 2: [Name]
...

## 6. Technical Decisions

| Decision | Choice | Source | Rationale |
|----------|--------|--------|-----------|
| Platform | [Web/Mobile/etc] | User/Default | [Why] |
| Frontend | [Framework] | User/Default | [Why] |
| Backend | [Framework] | User/Default | [Why] |
| Database | [Type] | User/Default | [Why] |
| Auth | [Strategy] | User/Default | [Why] |
| Hosting | [Provider] | User/Default | [Why] |

### Data Model (High-Level)

```
[Entity 1]
├── id
├── field_a
└── field_b

[Entity 2]
├── id
├── entity_1_id (FK)
└── field_c
```

### Key Integrations
- [External service 1]: [Purpose]
- [External service 2]: [Purpose]

## 7. Non-Functional Requirements

| Requirement | Target | Priority |
|-------------|--------|----------|
| Performance | [e.g., < 2s page load] | [P0/P1/P2] |
| Availability | [e.g., 99.9%] | [P0/P1/P2] |
| Security | [e.g., SOC2, GDPR] | [P0/P1/P2] |
| Accessibility | [e.g., WCAG 2.1 AA] | [P0/P1/P2] |

## 8. Constraints

**Technical:**
- [Must use X technology because...]
- [Cannot use Y because...]

**Business:**
- [Budget: $X]
- [Timeline: X weeks]
- [Team: X people]

**Regulatory:**
- [Compliance requirements]

## 9. Risks & Concerns

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | H/M/L | H/M/L | [Strategy] |
| [Risk 2] | H/M/L | H/M/L | [Strategy] |

## 10. Open Questions

> Questions that arose during discovery but weren't resolved

- [ ] [Question 1]
- [ ] [Question 2]

## 11. Success Metrics

**Launch Criteria:**
- [ ] [What must be true to ship]

**Success Indicators (30 days post-launch):**
- [Metric 1]: [Target]
- [Metric 2]: [Target]

---

## Appendix: Discovery Log

### Round 1 Answers
- Q1 (Problem/Users): [Answer]
- Q2 (Core Action): [Answer]
- Q3 (Success/Differentiation): [Answer]
- Q4 (Scope): [Answer]

### Round 2 Answers
| Question | Answer | Source |
|----------|--------|--------|
| Platform | [X] | User/Default |
| Auth | [X] | User/Default |
| Data | [X] | User/Default |
| UI | [X] | User/Default |

### Round 3 Answers
[Conditional questions and answers]

### Round 4: Concerns
[User-provided concerns list]

### Free-Form Messages
[Any additional context provided]
```

## Generation Notes

When filling this template:

1. **Don't invent** — only include what was explicitly stated or reasonably derived
2. **Mark assumptions** — if you're filling a gap, note it as "[Assumed: ...]"
3. **Keep it scannable** — bullets and tables over paragraphs
4. **Link decisions to sources** — track what came from user vs defaults
5. **Flag open questions** — don't pretend to have answers you don't have
