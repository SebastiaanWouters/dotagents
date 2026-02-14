---
name: blogger
description: Write SamWho-inspired interactive technical blog posts and tutorials for any technology concept. Use when asked to create deep but approachable educational content with first-principles buildup, narrative storytelling, and meaningful interactivity, while staying implementation-agnostic.
---

# Samwho Interactive Tech Post

## Overview

Create long-form technical posts that teach hard ideas with progressive buildup, strong narrative pacing, and hands-on interactivity. Deliver content and interaction specifications that remain portable across tooling stacks.

Read `references/samwho-style-analysis.md` before drafting. Use `references/post-blueprint.md` for structure. Use `references/interaction-design.md` for implementation-agnostic interactivity patterns.

## Workflow

1. Lock the brief in one pass.
2. Build a first-principles arc.
3. Attach interactivity to each core concept.
4. Draft the post in SamWho-inspired voice.
5. Add implementation-agnostic interaction specs.
6. Run a quality pass against the checklist.

### 1. Lock The Brief

Capture or infer:
- Target concept and boundary of the topic.
- Reader level and assumed prerequisites.
- Desired output depth (outline, partial draft, full post, full post + code).
- Delivery context: markdown article, static site page, or docs portal.
- Constraints: length, tone, production-readiness, accessibility.

If key info is missing, ask up to 3 concise questions. If questions are not possible, state assumptions explicitly and continue.

### 2. Build A First-Principles Arc

Use this section order unless the user asks otherwise:
1. Hook with a real problem.
2. Minimal mental model.
3. First interactive toy model.
4. Controlled complexity increase.
5. Trade-offs and failure modes.
6. Practical use in production.
7. Recap and "what to explore next."

Keep the buildup strict: each section depends only on concepts already introduced.

### 3. Attach Interactivity To Concepts

For each major section, add at least one of:
- Slider-driven parameter exploration.
- Step-through simulation with play/pause.
- Click-to-toggle state transitions.
- "Predict then reveal" checkpoint.
- Small sandbox input/output experiment.

For every interactive element include:
- Learning goal.
- Control(s) available to the reader.
- State model.
- Success criteria (what the reader should notice).

### 4. Draft In SamWho-Inspired Voice

Write with these constraints:
- Teach with concrete examples before abstraction.
- Use short paragraphs and direct language.
- Use a conversational teaching voice without filler.
- Add short rhetorical questions where they reduce confusion.
- Explain trade-offs instead of declaring absolutes.
- Include caution notes when simplifications diverge from reality.

Do not copy sentences, branding, or character assets from SamWho. Emulate structure and pedagogy only.

### 5. Add Interaction Specs (No Framework Lock-In)

When user requests build-ready guidance, produce:
1. Interaction spec (controls, states, transitions, render behavior).
2. Pseudocode or state-machine notation for the interaction loop.
3. Data contract for input/output and reset semantics.

Do not provide framework-specific instructions unless the user explicitly asks to expand scope.

### 6. Run Quality Checklist

Ship only when all checks pass:
- Concept is introduced bottom-up.
- Every section has a clear learning objective.
- Interactivity reinforces the concept, not decoration.
- Terminology is defined before use.
- Trade-offs and limitations are explicit.
- Conclusion summarizes and suggests next experiments.
- Output remains implementation-agnostic and portable.

## Output Modes

### Outline Mode
Return:
- Working title options.
- Section-by-section teaching arc.
- Interactive ideas per section.
- Prerequisites and estimated reading time.

### Draft Mode
Return:
- Full post draft.
- Inline callouts for interactive components.
- Notes for diagrams or animations.

### Build Mode
Return:
- Full post draft.
- Interaction spec with pseudocode/state model.
- Brief test checklist for interaction behavior.

## References

- `references/samwho-style-analysis.md`: Patterns extracted from representative SamWho essays.
- `references/post-blueprint.md`: Reusable section templates and storytelling beats.
- `references/interaction-design.md`: Implementation-agnostic interactivity patterns and QA checks.
