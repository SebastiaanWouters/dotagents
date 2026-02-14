# Interactive Tech Post Blueprint

Use this template to produce deep, readable, interactive posts with SamWho + Josh + Grokking teaching patterns.

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

### 2) Reader roadmap

Add a short map of the journey for long posts.

Deliverables:
- 3-7 bullet roadmap or table of contents
- one sentence defining scope boundaries
- one sentence on assumptions/prereqs

### 3) Minimal mental model

Introduce the smallest possible model that can explain the core behavior.

Deliverables:
- one-sentence section learning objective
- plain-language explanation
- tiny pseudocode or state diagram
- one simple worked example
- one analogy when it reduces cognitive load

### 4) First interaction checkpoint

Add a small interactive component that validates the minimal model.

Deliverables:
- control list (what reader can change)
- expected observation
- short "why this matters" note
- explicit "what to notice" prompt
- misconception this interaction resolves

### 5) Complexity ramp

Add constraints one at a time (scale, fairness, latency, memory, failures).

Deliverables:
- one subsection per constraint
- describe what breaks
- update model to handle that constraint

### 6) Active-learning checkpoint

Add a short reader challenge before the next jump in complexity.

Deliverables:
- one prediction or tracing prompt
- optional hint
- concise reveal/solution
- explicit "why this answer matters" sentence

### 7) Second interaction checkpoint

Expose trade-offs by allowing readers to compare strategies.

Deliverables:
- side-by-side output or toggles
- at least one surprising result
- explicit interpretation
- one sentence on why this interaction beats static explanation

### 8) Production perspective

Translate theory into real systems decisions.

Deliverables:
- where this applies
- where this fails
- operational metrics to watch
- fallback/support considerations
- runtime/platform compatibility considerations (not web-only)

### 9) Recap and next steps

Summarize what changed in the reader's mental model and suggest follow-up explorations.

Deliverables:
- concise recap bullets
- 2-4 concrete next experiments
- optional "practice set" (1 easy, 1 medium)

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
- Add practical caveats where support/performance/accessibility risks exist.
- Add mini recaps after major concept transitions.
- Keep interaction cadence intentional: alternate explanation and interaction so readers are not overloaded.
