---
name: code-review
description: Deep code review using Grug, Unix, Pragmatic Programmer, Clean Code, KISS, DRY principles. Triggers on "review code", "code review", "review this", "check my code". Outputs structured, actionable feedback.
---

# Code Review Skill

Reviews code through the lens of battle-tested software engineering wisdom.

## Usage

Tell me what to review:
- "Review `src/auth.ts`"
- "Review the changes in `git diff HEAD~3`"
- "Review this function for complexity"

## Review Process

1. **Read the code** — Understand what it does
2. **Apply philosophy lenses** — Check against each principle
3. **Output structured findings** — Categorized, actionable feedback

## Philosophy Lenses

### 1. Grug Brain Check (Complexity Demon Detection)
- Is this the simplest solution?
- Could a newcomer understand it in 30 seconds?
- Are there unnecessary abstractions, frameworks, or patterns?
- Is code anticipating hypothetical futures?

**Red flags**: "We might need this later", deep inheritance, multiple service layers, decorators/proxies when not needed

### 2. Code Smell Detection

| Smell | Question |
|-------|----------|
| **Long Method** | >50 lines? Can you describe it in one sentence? |
| **Long Params** | >3 parameters? Should be grouped? |
| **Large Class** | Multiple reasons to change? |
| **Feature Envy** | Uses more of another class than its own? |
| **Shotgun Surgery** | One change requires many file edits? |
| **Dead Code** | Unreachable or unused? |
| **Primitive Obsession** | Should primitives be wrapped in types? |
| **Message Chains** | `a.b().c().d()` traversals? |

### 3. Unix Philosophy Check
- Does each function/module do ONE thing well?
- Are interfaces clean and predictable?
- Is output usable as input elsewhere?
- Can components be tested in isolation?
- Are there side effects in "pure" functions?

### 4. Pragmatic Programmer Principles
- **Orthogonality**: Do changes ripple unnecessarily?
- **Reversibility**: Are decisions hardcoded or flexible?
- **Crash Early**: Do errors propagate clearly?
- **Design by Contract**: Are promises clear?
- **Law of Demeter**: Only talk to immediate friends?

### 5. KISS Check
- Is there a simpler solution that meets requirements?
- Could this be explained in <5 minutes?
- Are all moving parts necessary?
- Is boring/well-known preferred over clever/novel?

### 6. DRY Verification
- Is logic duplicated across files?
- Is knowledge in exactly one place?
- Are similar functions that should be unified?
- Do config values repeat?

### 7. Clean Code (Uncle Bob)

**Names**:
- Intention-revealing? (no comment needed to understand)
- Pronounceable and searchable? (no `genymdhms` or magic numbers)
- Consistent vocabulary? (don't mix `fetch`/`retrieve`/`get`)

**Functions**:
- Do one thing at one abstraction level?
- ≤3 arguments? (use object if more)
- No flag/boolean parameters? (split into separate functions)
- No output arguments? (return values, don't mutate params)

**Comments**:
- Code self-documenting? (comments = apology for bad code)
- Only explain *why*, never *what*?
- No commented-out code? (delete it, git remembers)

**Error Handling**:
- Exceptions over error codes?
- Never swallow errors silently?
- Never return/pass null? (throw or use special case objects)

## Output Format

Structure reviews as:

```markdown
## Summary
[One-line verdict: APPROVE / NEEDS WORK / RETHINK]

## Critical Issues
[Must fix before merge]

## Improvements
[Should fix, significant impact]

## Nitpicks
[Minor suggestions, optional]

## What's Good
[Acknowledge solid work]
```

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 Critical | Bugs, security, data loss risk | Block merge |
| 🟠 Important | Design issues, maintainability | Should fix |
| 🟡 Suggestion | Could be better | Consider |
| 🟢 Nitpick | Style, minor preference | Optional |

## Review Heuristics

**Quick Decision Tree**:
```
Does it work? → NO → Fix bugs first
     ↓ YES
Is it simple? → NO → Can simplify? → Suggest
     ↓ YES
Does it repeat? → YES → Consolidate (DRY)
     ↓ NO
Is it testable? → NO → Decouple
     ↓ YES
APPROVE ✓
```

**The Grug Test**: "Would I understand this at 3am debugging production?"

**The Unix Test**: "Could I replace this component without touching others?"

**The Safety Test**: "What happens if this input is wrong/missing/malicious?"

## What NOT to Do

- Don't nitpick formatting (use formatters)
- Don't demand unnecessary abstractions
- Don't suggest patterns for pattern's sake
- Don't block on style preferences
- Don't rewrite working code for elegance alone

## Example Review Output

```markdown
## Summary
🟠 NEEDS WORK — Good functionality, complexity concerns

## Critical Issues
None

## Improvements
🟠 **Long method** `processOrder()` (L45-180, 135 lines)
   - Grug says: "complexity demon lurking"
   - Split into: validateOrder, calculateTotal, applyDiscounts, saveOrder

🟠 **Feature envy** `UserService.formatAddress()` (L89)
   - Uses 5 properties from Address, 0 from User
   - Move to Address class

## Nitpicks
🟢 Consider renaming `data` → `orderDetails` (L52)

## What's Good
- Clean error handling with early returns
- Good test coverage
- Clear naming in helper functions
```
