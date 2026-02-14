# SamWho Style Analysis (Sampling-Based)

This file captures reusable writing and teaching patterns from SamWho posts. Use these as stylistic constraints, not copy targets.

## Sampled Posts

- https://samwho.dev/big-o/
- https://samwho.dev/load-balancing/
- https://samwho.dev/memory-allocation/
- https://samwho.dev/reservoir-sampling/
- https://samwho.dev/bloom-filters/
- https://samwho.dev/how-does-turn-to-crab-work/

## Recurring Patterns

### 1. Open with a concrete tension

Start with a specific practical question, not a definition dump.

Examples observed:
- "How can a tiny post use fixed-size memory while reading unknown-size input?"
- "How does a game mechanic feel random but fair?"
- "How do you spread traffic without burning one server?"

### 2. Teach bottom-up with explicit simplification

Introduce a tiny model first, then evolve it. Mark simplifications clearly so advanced readers keep trust.

Pattern:
1. Toy model.
2. Test with small examples.
3. Add one real-world constraint.
4. Revise model.
5. Repeat.

### 3. Use interactivity as the teaching engine

Interactivity is not decorative. It is the way readers test hypotheses.

Common interaction types:
- Slider to change scale or probability.
- Stepper to move through algorithm states.
- Toggle between strategies to compare outcomes.
- Predict-then-reveal checkpoints.

### 4. Ask guiding questions throughout

Use short rhetorical questions before key transitions:
- "What breaks if we keep this rule?"
- "Can we do better without extra memory?"
- "Why does this still work when input is huge?"

This keeps momentum and primes the reader for the next section.

### 5. Mix intuition and rigor

Alternate between:
- intuition ("what this feels like"),
- mechanism ("what the state machine does"),
- constraints ("time, space, failure mode"),
- and trade-offs ("what we gain vs lose").

### 6. Close with practical edges

End by showing limits, caveats, and production implications. Avoid "silver bullet" framing.

## Voice Guidelines

- Keep a conversational tone, but precise.
- Prefer short paragraphs and clear transitions.
- Avoid unexplained jargon.
- Use concrete nouns and observable behavior.
- Keep confidence calibrated; say when a model is approximate.

## Anti-Patterns To Avoid

- Dense theorem-first intros without motivation.
- Long unbroken text with no checkpoints.
- Interactivity that does not change understanding.
- Framework-specific code before conceptual model.
- Overstated certainty where trade-offs exist.
