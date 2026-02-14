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
- Fallback behavior: what happens in unsupported/limited environments.
- Checkpoint behavior: how prediction/hint/reveal states progress.

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

### Inline Code Playground

Let readers tweak code and observe output immediately.

- Best for: syntax intuition, API behavior, and parameterized behavior tuning.
- Controls: editable snippet + reset + optional preset switch.
- Key risk: readers focus on code edits without understanding the model.

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

### Guided Micro-Exercise

Ask readers to complete a tiny task with optional hint and solution reveal.

- Best for: active recall and confidence-building.
- Controls: prompt + hint toggle + reveal answer + retry/reset.
- Key risk: exercise difficulty exceeds current prerequisites.

### Support/Fallback Checkpoint

Show behavior differences between supported and unsupported runtime/platform states.

- Best for: progressive enhancement and compatibility teaching.
- Controls: capability toggle or explicit fallback panel.
- Key risk: fallback path omitted from explanation.

## Narrative Pairing Rules

For each interactive block, include:
- one sentence explaining why this interaction exists now,
- one prompt for what to try,
- one interpretation sentence after the result.
- one "what to notice" sentence tied to the learning objective.
- for exercises: one hint and one concise solution explanation.

If visual UI is unavailable, represent interactions with:
- step tables,
- state snapshots,
- prompt/answer blocks.

Do not include interactions that are purely decorative.

## Quality Checks

- Control labels describe meaning, not internal variable names.
- State transitions are externally visible.
- Reader can replay and reset without page reload assumptions.
- Default values produce informative behavior.
- Edge cases are documented (invalid input, saturation, overflow).
- Fallback state is understandable and non-breaking.
- Hint/reveal flow can be replayed without page refresh.
