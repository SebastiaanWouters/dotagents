# Josh W. Comeau Style Analysis (Sampling-Based)

This file captures reusable writing and teaching patterns observed on https://www.joshwcomeau.com/. Use these as constraints, not copy targets.

## Research Scope

- Source site: https://www.joshwcomeau.com/
- Feed checked: https://www.joshwcomeau.com/rss.xml
- Recency verified from feed build date: 2026-02-14.
- Sampled long-form posts:
  - https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/
  - https://www.joshwcomeau.com/blog/the-post-developer-era/
  - https://www.joshwcomeau.com/css/container-queries-introduction/
  - https://www.joshwcomeau.com/css/browser-support/
  - https://www.joshwcomeau.com/svg/friendly-introduction-to-svg/
  - https://www.joshwcomeau.com/svg/interactive-guide-to-paths/
  - https://www.joshwcomeau.com/animation/linear-timing-function/
  - https://www.joshwcomeau.com/css/height-enigma/

Sample metrics across the 8 sampled posts:
- 26 "Code Playground" mentions.
- 38 custom interactive demo units (`data-demo-unit="true"`).
- Repeated table-of-contents/roadmap usage in tutorial-style posts.

## Recurring Patterns

### 1. Friendly framing before depth

Open by reducing intimidation and setting clear stakes.

Pattern:
1. Name the confusing thing.
2. Reassure the reader it can make sense.
3. Promise a concrete outcome by the end.

### 2. Concrete pain before theory

Start with a specific bug, behavior, or design tension, then build the model that explains it.

Pattern:
1. Show failure/surprise.
2. Ask why it happens.
3. Build minimal mechanism.
4. Re-test with the mechanism.

### 3. Explicit reader contract

Long posts often include a roadmap or "table of contents" feel early, so readers know the arc and can navigate.

### 4. Demo-heavy teaching

Interactivity is central, not decorative.

Observed in sampled posts:
- Frequent "Code Playground" blocks.
- Custom interactive demo units for parameter tweaking and visual feedback.
- Side-by-side comparisons and guided controls.

### 5. "What to notice" guidance

Interactions are framed with interpretation, not just controls.

Pattern:
1. Prompt what to try.
2. Ask what changed.
3. Explain why that change matters.

### 6. Practical constraints are first-class

Production caveats are integrated into the main narrative:
- browser support,
- fallback behavior,
- performance trade-offs,
- accessibility implications.

### 7. Warm, candid, technically precise voice

Voice characteristics:
- conversational and direct,
- short paragraphs,
- occasional humor and personality,
- calibrated confidence and explicit uncertainty where needed.

### 8. Progressive complexity

Concepts are layered in small increments. Each section depends on previous understanding, with periodic recaps.

### 9. Actionable endings

Conclusions focus on:
- when to apply the technique,
- when not to,
- what to experiment with next.

## Interaction Design Cues

When emulating this style, prioritize:
- visualized state changes over static prose,
- controls with meaningful defaults,
- reversible and replayable interactions,
- compare-mode interactions for trade-off education.

## Anti-Patterns To Avoid

- Definition-first intros with no motivating scenario.
- Massive code dumps before the reader has a model.
- Interactions without interpretation or expected observations.
- Ignoring support/fallback realities in production-facing advice.
- Overconfident claims that hide trade-offs.
