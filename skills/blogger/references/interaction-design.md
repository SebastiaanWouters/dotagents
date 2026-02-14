# Interaction Design Patterns (Framework-Agnostic)

Use this file after the concept and narrative arc are defined.

## Interaction Spec Template

Write this first and keep it implementation-neutral:

- Goal: what concept the interaction should teach.
- Inputs: controls (sliders, toggles, buttons, text fields).
- State: variables and their meaning.
- Transition rules: how state changes over time or events.
- Render rules: what readers should see after each transition.
- Success signal: what the reader should notice or conclude.
- Reset behavior: how to restart and reproduce outcomes.

## Interaction Pattern Library

### Parameter Sweep

Let readers vary one parameter continuously and observe output shifts.

- Best for: complexity, scale, probability, latency.
- Controls: one or two sliders.
- Key risk: too many parameters at once.

### Step-Through Simulation

Advance an algorithm/system one tick at a time.

- Best for: stateful processes and queues.
- Controls: step, play/pause, reset.
- Key risk: hidden state transitions.

### Side-by-Side Strategy Compare

Show two strategies under identical inputs.

- Best for: trade-off teaching.
- Controls: shared input, strategy toggle.
- Key risk: unfair comparison conditions.

### Predict Then Reveal

Ask the reader to guess before revealing outcome.

- Best for: correcting intuition.
- Controls: prediction input + reveal button.
- Key risk: reveal without interpretation.

## Narrative Pairing Rules

For each interactive block, include:
- one sentence explaining why this interaction exists now,
- one prompt for what to try,
- one interpretation sentence after the result.

Do not include interactions that are purely decorative.

## Quality Checks

- Control labels describe meaning, not internal variable names.
- State transitions are externally visible.
- Reader can replay and reset without page reload assumptions.
- Default values produce informative behavior.
- Edge cases are documented (invalid input, saturation, overflow).
