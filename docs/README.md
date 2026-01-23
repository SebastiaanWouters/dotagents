# Knowledge Base

Project knowledge that **code comments can't capture**.

## Structure

```
docs/
├── arch/          # Architecture: components, data flow, system design
├── decisions/     # ADRs: why X over Y, tradeoffs, context
├── gotchas/       # Edge cases, debugging tips, non-obvious behavior
├── patterns/      # Reusable patterns, conventions, idioms
└── integrations/  # External APIs, services, connection details
```

## File Format

Each knowledge file should have:

```markdown
---
tags: [relevant, searchable, terms]
updated: 2024-01-23
---

# Topic Title

Content here...
```

## Search

Find relevant knowledge:

```bash
# By tag
grep -r "tags:.*auth" docs/

# By keyword
grep -rl "JWT" docs/

# List all files
find docs -name "*.md" -type f
```

## Guidelines

- **One topic per file** — keep it focused
- **Use descriptive filenames** — `auth-refresh-flow.md` not `auth.md`
- **Link related docs** — `[see also](../arch/auth.md)`
- **Update, don't duplicate** — search before creating new files
- **Grep-friendly** — consistent terminology, clear headers
