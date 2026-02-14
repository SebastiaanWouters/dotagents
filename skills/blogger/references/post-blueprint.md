# Interactive Tech Post Blueprint

Use this template to produce deep, readable, SamWho-inspired posts.

## Metadata Block

- Topic:
- Reader level:
- Prerequisites:
- Delivery context:
- Output mode (`outline`, `draft`, `build`):
- Constraints (length/accessibility/perf):

## Canonical Structure

### 1) Hook: real problem

Start with a practical tension that a real engineer would care about.

Deliverables:
- 1-2 paragraph setup
- concrete stakes
- promise of what the reader will understand by the end

### 2) Minimal mental model

Introduce the smallest possible model that can explain the core behavior.

Deliverables:
- plain-language explanation
- tiny pseudocode or state diagram
- one simple worked example

### 3) First interaction checkpoint

Add a small interactive component that validates the minimal model.

Deliverables:
- control list (what reader can change)
- expected observation
- short "why this matters" note

### 4) Complexity ramp

Add constraints one at a time (scale, fairness, latency, memory, failures).

Deliverables:
- one subsection per constraint
- describe what breaks
- update model to handle that constraint

### 5) Second interaction checkpoint

Expose trade-offs by allowing readers to compare strategies.

Deliverables:
- side-by-side output or toggles
- at least one surprising result
- explicit interpretation

### 6) Production perspective

Translate theory into real systems decisions.

Deliverables:
- where this applies
- where this fails
- operational metrics to watch

### 7) Recap and next steps

Summarize what changed in the reader's mental model and suggest follow-up explorations.

Deliverables:
- concise recap bullets
- 2-4 concrete next experiments

## Storytelling Beats

Use these beats repeatedly:
1. Pose a question.
2. Make a testable claim.
3. Show evidence (example/simulation).
4. Reconcile with intuition.
5. Transition to next question.

## Readability Constraints

- Keep paragraphs short.
- Define terms before using abbreviations.
- Insert short checkpoints every few paragraphs.
- Prefer one idea per subsection.
- Keep examples concrete before generalization.
