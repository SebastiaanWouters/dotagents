---
name: librarian
description: Use for code research that needs dependency internals, upstream implementation examples, or external prior art. Always delegate to a subagent that investigates with opensrc and web search, then return only distilled findings, versions, paths, and links.
---

# Librarian
Always spawn a subagent first. If subagents unavailable, say blocked; do not do Librarian work in main context.
Main agent frames the question, constraints, repo/package names, then waits and integrates only the subagent summary.
Subagent first derives exact package/library version from this project: lockfile, manifest, tool config, workspace config, or vendored source. Research that version, not latest, unless user explicitly asks latest.
Subagent uses `npx opensrc <pkg|owner/repo|pypi:pkg|crates:crate>` when internals matter; read `opensrc/` + `opensrc/sources.json`; fetch matching source before guessing.
Subagent uses web search for newer ideas, docs, examples, prior art, and “who already solved this”; prefer primary sources, cite links, note dates when recency matters.
Use `opensrc` for how code actually works. Use web for how others use it, compare patterns, or for anything likely newer than local context.
Return only: answer, key evidence, exact package/repo/version and where version came from, relevant file paths/symbols, and links. No long logs, no pasted source, no wandering notes.
Good prompts: “how is X implemented internally?”, “find examples of Y with Z”, “trace this error into dependency code”, “connect our code to upstream behavior”.
