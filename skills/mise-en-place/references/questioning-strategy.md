# Questioning Strategy: Maximum Information, Minimum Questions

## Core Principles

### 1. Compound Questions
Combine related dimensions into single questions to extract multiple data points:

**Instead of:**
```
Q1: What problem does this solve?
Q2: Who has this problem?
Q3: How bad is this problem for them?
```

**Use:**
```
Q1: What problem does this solve and WHO struggles with it most?
```

### 2. Funnel Technique
Start broad, narrow based on responses:

```
Broad:   "What are you building?"
         ↓
Focused: "You mentioned invoicing — is this for freelancers or agencies?"
         ↓
Specific:"For freelancers tracking hourly work, do they need time tracking built-in?"
```

### 3. The 80/20 Question Rule
Prioritize questions that eliminate the most uncertainty:

**High-value questions (ask first):**
- Platform (eliminates entire tech stacks)
- Auth requirements (affects every feature)
- Data model complexity (drives architecture)

**Low-value questions (derive or default):**
- Font choices
- Exact color palette
- Animation preferences

### 4. Progressive Disclosure with Defaults
Use non-blocking questions with smart defaults for secondary decisions:

```typescript
// High priority → blocking
const platform = await chef.choice("🖥️ Platform?", [...], { blocking: true });

// Lower priority → non-blocking with defaults
await chef.mark();
await chef.choice("🎨 Theme?", ["Dark", "Light", "System"], { blocking: false, recommended: 2 });
await chef.choice("📱 Responsive?", ["Mobile-first", "Desktop-first"], { blocking: false, recommended: 0 });
// User can respond or let defaults apply
```

### 5. The SPIN Framework (Adapted)

| Type | Purpose | Example |
|------|---------|---------|
| **Situation** | Establish context | "Is this for personal use or a business?" |
| **Problem** | Identify pain points | "What's frustrating about current solutions?" |
| **Implication** | Uncover stakes | "What happens if this doesn't get solved?" |
| **Need-payoff** | Confirm value | "If you had X, what would change?" |

Use sparingly — one SPIN cycle per major feature area.

### 6. Multiple Choice > Open-Ended

Open-ended questions require more cognitive effort and yield less structured data.

**Instead of:**
```
"What tech stack do you prefer?"
```

**Use:**
```
"🔧 Stack preference?
A) React + Node (recommended ⭐)
B) Vue + Python
C) Svelte + Go
D) You decide"
```

### 7. The "Five Whys" (Selectively)

Use when answers seem superficial:

```
User: "I want a dashboard"
You:  "Why a dashboard specifically?"
User: "To see my data"
You:  "Why is seeing this data important?"
User: "To know when to reorder inventory"
You:  "Ah! So you need low-stock alerts more than a dashboard?"
User: "...yes, actually"
```

Stop at 2-3 whys in async chat — more gets annoying.

## Question Batching Strategy

### Batch 1: Foundation (Blocking)
Essential questions — can't proceed without answers.
- What + Who + Why (the core)
- Scope/ambition level

### Batch 2: Technical (Non-blocking)
Important but defaultable:
- Platform
- Auth
- Data complexity
- UI complexity

### Batch 3: Conditional (Selective)
Only ask if triggered by Batch 2:
- If auth > basic → roles, permissions
- If data = real-time → sync strategy
- If UI = complex → component library preference

### Batch 4: Open Catch-All
One final sweep for anything missed:
- Concerns
- Constraints
- Non-negotiables
- Timeline

## Anti-Patterns

❌ **Asking obvious questions**
```
"Do you want it to work well?"
```

❌ **Question walls** (more than 5 at once)
```
Q1: Platform?
Q2: Auth?
Q3: Database?
Q4: Caching?
Q5: CDN?
Q6: Testing?
Q7: CI/CD?
Q8: Monitoring?
...
```

❌ **Vague open-ended**
```
"Tell me about your requirements"
```

❌ **Leading questions**
```
"You probably want React, right?"
```

❌ **Redundant questions**
```
"What platform?" (already said "mobile app" in description)
```

## Time Budget

| Phase | Questions | Expected Time |
|-------|-----------|---------------|
| Round 1 | 3-4 blocking | 5-10 min |
| Round 2 | 4-5 non-blocking | 2-5 min (can skip) |
| Round 3 | 1-3 conditional | 1-3 min |
| Round 4 | 1 open collection | 2-5 min |

**Total: ~10-20 minutes** for a complete spec interview.

## Telegram-Specific Tips

1. **Keep messages short** — long messages get skimmed
2. **Use emojis as anchors** — they're scannable
3. **One question per message** for blocking questions
4. **Batch non-blocking questions** — send all at once
5. **Acknowledge answers** — brief confirmation before next question
