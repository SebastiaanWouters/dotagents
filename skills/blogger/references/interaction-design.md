# Interaction Design Patterns (Framework-Agnostic)

Use this file after the concept and narrative arc are defined.

## Interaction Spec Template

Write this first and keep it implementation-neutral:

- Goal: what concept the interaction should teach.
- Misconception target: what confusion this interaction resolves.
- Inputs: controls (sliders, toggles, buttons, text fields).
- State: variables and their meaning.
- Transition rules: how state changes over time or events.
- Render rules: what readers should see after each transition.
- Success signal: what the reader should notice or conclude.
- Mental-model delta: what the reader should understand after using it that they likely did not before.
- Reset behavior: how to restart and reproduce outcomes.
- Fallback behavior: what happens in unsupported/limited environments.
- Checkpoint behavior: how prediction/hint/reveal states progress.
- Aesthetic intent: how visual treatment supports comprehension.

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

## Interaction Utility Gate

Ship an interaction only if all pass:
- It teaches something text alone would likely fail to teach quickly.
- It targets one primary misconception or decision point.
- It produces immediate, interpretable feedback.
- It has a clear "what to notice" outcome.
- It can be simplified without losing the core concept.

If not, remove or replace with a simpler format.

## Visual Polish Principles (Tech-Independent)

- Prioritize visual hierarchy: the concept signal should be the strongest visual element.
- Keep controls calm and staged: reveal advanced controls progressively.
- Use motion to explain change, not decorate static states.
- Ensure contrast and spacing make state changes easy to scan.
- Favor informative defaults that immediately demonstrate behavior.
- Preserve delight, but never at the expense of legibility or speed of understanding.

## Narrative Pairing Rules

For each interactive block, include:
- one sentence explaining why this interaction exists now,
- one prompt for what to try,
- one interpretation sentence after the result.
- one "what to notice" sentence tied to the learning objective.
- for exercises: one hint and one concise solution explanation.
- one sentence describing why this interaction is better than static prose for this concept.

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
- Interaction passes utility gate and identifies a misconception target.
- Visual treatment supports comprehension (hierarchy, readability, and purposeful motion).
