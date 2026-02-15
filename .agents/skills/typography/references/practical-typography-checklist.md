# Practical Typography Checklist

Use this checklist for audits and edits. Apply the smallest set of changes that materially improves readability.

## Core Metrics

- Body text size:
  - Print target: 10-12 pt.
  - Web target: 15-25 px equivalent.
- Line spacing (leading): 120-145% of body text size.
- Line length target: 45-90 characters including spaces.
- Start with body settings first, then tune headings and UI text.
- Adjust values by eye for each typeface. Same nominal size can look very different across fonts.

## Typography Mechanics

- Replace straight quotes with curly quotes.
- Use one space between sentences.
- Avoid underlining except links.
- Prefer either bold or italic for emphasis; avoid stacking both for routine emphasis.
- Use true apostrophes and prime marks instead of straight quotes for feet/inches.
- Use hyphen, en dash, and em dash for their distinct purposes.
- Use proper ellipsis character instead of three separate periods when supported.

## Hierarchy And Paragraph Flow

- Keep heading scales restrained and consistent.
- Avoid all-caps for long text. Reserve for short labels if needed.
- Use centered text only for short lines.
- Use either first-line indents or paragraph spacing, not both.
- Avoid justified text unless hyphenation is enabled.

## Typeface Selection Heuristics

- Favor professionally made text families for long-form reading.
- If a premium family is unavailable, use a high-quality open-source text family.
- Limit family count:
  - One serif + one sans-serif is usually enough.
- Avoid decorative display faces for body copy.
- Ensure language and symbol coverage before committing to a face.

## Web/CSS Application Defaults

- Start body styles with:
  - `font-size`: 16-19px
  - `line-height`: 1.35-1.5
  - `max-width`: sized to keep body lines in the 45-90 character range
- Maintain sufficient contrast for reading text.
- Preserve visible focus states and link affordances while removing unnecessary decoration.

## Audit Severity

- `Critical`: Harms readability at paragraph scale (body size too small, extreme line length, insufficient leading).
- `Major`: Causes repeated friction (wrong quote marks, indiscriminate all-caps, bad paragraph spacing strategy).
- `Minor`: Polish issues (inconsistent dash style, occasional emphasis misuse).

## Suggested Output Shape

1. State medium and constraints.
2. List findings as `Issue | Current | Target | Severity | Reason`.
3. Provide explicit edits (CSS or document-formatting instructions).
4. Note any tradeoffs and unresolved constraints.
