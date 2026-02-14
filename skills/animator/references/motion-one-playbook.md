# Motion One Playbook

## Table Of Contents
- Installation
- Core API Pattern
- Recommended Defaults
- Best Practices
- Anti-Patterns To Avoid
- Implementation Patterns
- Advanced Techniques
- Performance Checklist
- Accessibility Checklist
- References

## Installation

```bash
npm install motion
```

```js
import { animate, stagger } from "motion"
```

CDN (vanilla JS):

```html
<script src="https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js"></script>
```

## Core API Pattern

```js
animate(target, keyframes, {
  duration: 0.35,
  easing: "ease-in-out",
})
```

Use arrays in keyframes for explicit from/to control.

## Recommended Defaults

- Duration: 200ms-500ms for most UI interactions.
- Entrance: 100ms-200ms where possible.
- Exit: slightly longer than entrance when it improves clarity.
- Easing: `ease-in-out` for neutral motion, `spring` for playful motion.
- Stagger: `stagger(0.06)` to `stagger(0.12)` for list reveals.

Tune these values per brand voice and interaction density.

## Best Practices

### Purpose First

Every animation should do at least one of:
- Guide attention.
- Provide feedback.
- Improve spatial continuity.
- Communicate hierarchy.

Remove motion that is decorative-only in high-frequency workflows.

### Natural Motion

- Prefer acceleration and deceleration over linear starts/stops.
- Use spring parameters for physical feel where appropriate.
- Avoid `scale(0)` starts; use `scale(0.95)` + opacity.
- Set `transform-origin` intentionally.

Example spring-style transition:

```js
animate(el, { scale: 1.03 }, { easing: "spring", stiffness: 200, damping: 20 })
```

### Performance Discipline

- Prefer `transform` and `opacity`.
- Avoid frequent layout-triggering animation properties.
- Test on low/mid-range mobile devices.
- Verify smoothness in real interaction flows, not isolated demos.

### Consistency And Hierarchy

- Create a small motion token set (durations, easings, scales).
- Keep primary UX transitions more prominent than decorative ones.
- Limit competing motion in the same viewport.

### Accessibility

Respect reduced-motion preferences:

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

animate(el, { opacity: [0, 1], y: reduceMotion ? [0, 0] : [12, 0] }, {
  duration: reduceMotion ? 0.12 : 0.28,
  easing: "ease-out",
})
```

Use non-motion cues for important state changes.

## Anti-Patterns To Avoid

- Animating `width`/`height` when `transform` can solve it.
- Long durations for frequent interactions.
- Large delays on repeated UI elements (tooltips/menus).
- Mixing too many easing styles in one surface.
- Running multiple decorative animations against key workflows.

## Implementation Patterns

### Fade + Lift Entrance

```js
animate(".card", { opacity: [0, 1], y: [16, 0] }, { duration: 0.24, easing: "ease-out" })
```

### Hover Feedback

```js
const el = document.querySelector(".tile")
el.addEventListener("mouseenter", () => animate(el, { scale: 1.02 }, { duration: 0.16, easing: "ease-out" }))
el.addEventListener("mouseleave", () => animate(el, { scale: 1.0 }, { duration: 0.16, easing: "ease-out" }))
```

### Press Feedback

```js
const button = document.querySelector("button")
button.addEventListener("pointerdown", () => animate(button, { scale: 0.96 }, { duration: 0.08, easing: "ease-out" }))
button.addEventListener("pointerup", () => animate(button, { scale: 1.0 }, { duration: 0.18, easing: "spring" }))
```

### Staggered Reveal

```js
animate(".item", { opacity: [0, 1], y: [10, 0] }, { delay: stagger(0.08), duration: 0.28, easing: "ease-out" })
```

### Scroll-Linked Motion

```js
animate(".background", { y: [0, 180] }, {
  duration: 1,
  easing: "linear",
  scroll: { target: document.body },
})
```

## Advanced Techniques

- Use clip-path reveals for high-impact section intros.
- Combine small opacity and transform changes for clean, low-jank transitions.
- Gate complex effects by device capability when performance is inconsistent.

## Performance Checklist

- Animate only compositor-friendly properties whenever possible.
- Confirm no sustained jank during real user flows.
- Verify no heavy repaint/reflow hotspots in dev tools.
- Avoid overusing `will-change`; apply only on key animated elements.

## Accessibility Checklist

- `prefers-reduced-motion` handled.
- Motion is not the sole communication channel.
- Interaction remains understandable with motion reduced/disabled.
- Timing remains readable and does not cause distraction.

## References

- Motion One docs: https://motion.dev/docs
- Emil Kowalski tips: https://emilkowal.ski/ui/7-practical-animation-tips
- Sam Who (performance-minded visual explanations): https://samwho.dev/
- Rachel Nabors on animation performance and accessibility: https://alistapart.com/article/ui-animation-and-ux-a-not-so-secret-friendship/
- Additional practice resources: Codrops, Kirupa, and related UI animation communities.
