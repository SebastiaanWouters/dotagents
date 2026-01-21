# dotagents

A collection of reusable AI agent skills for coding assistants like [Amp](https://ampcode.com) and [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Quick Start

Point your AI agent at this repository and say:

> "Initialize dotagents in this directory"

The agent will interview you about your setup and install the skills you need.

## Available Skills

| Skill | Description |
|-------|-------------|
| `agent-browser` | Browser automation for web testing, form filling, screenshots |
| `agents-md` | Create/refactor AGENTS.md files with progressive disclosure |
| `code-review` | Deep code review using Grug, Unix, Clean Code principles |
| `commit` | Create logical git commits with conventional messages |
| `documentation-lookup` | Query library/framework docs via Context7 |
| `frontend-design` | Production-grade frontend interfaces with high design quality |
| `interviewer` | Clarify requirements through structured interviews |
| `playwriter` | Chrome browser control via Playwright MCP |
| `prd` | Generate Product Requirements Documents |
| `ralph` | Autonomous feature development loop |
| `recursive-handoff` | Execute tasks repeatedly with clean context |
| `simplifier` | Simplify code for clarity and maintainability |
| `skill-creator` | Guide for creating new skills |
| `teacher` | Learning guidance through Socratic/Feynman methods |
| `ticket` | Manage tickets with tk CLI |
| `tmux` | Spawn and manage background processes |

## Agent Guidelines: Installing Skills

When a user asks to set up this skills repository in their project, follow this workflow:

### 1. Interview the User

Ask these questions:
1. **Which agent/harness are you using?** (e.g., Amp, Claude Code, Cursor, Cline, other)
2. **Which skills do you need?** (show the available skills table above)
3. **Does your project already have an agent config?** (check for existing `.agents/`, `.claude/`, etc.)
4. **Do you want to install the base AGENTS.md / CLAUDE.md file?** (recommended for new projects)
   - For **Amp**: Copy `AGENTS.md` to the project root
   - For **Claude Code**: Copy `AGENTS.md` as `CLAUDE.md` to the project root

### 2. Research the Agent's Skill System

Before copying files, research how the chosen agent handles skills:
- Check the agent's documentation for skill/extension installation
- Look for existing patterns in the target project
- Understand the expected directory structure and configuration format

**Common patterns:**
- **Amp**: Skills go in `.agents/skills/<skill-name>/SKILL.md`
- **Claude Code**: Skills go in `.claude/skills/<skill-name>/SKILL.md` (or similar)

### 3. Install Base Config (if requested)

If the user wants the base config file:
- **Amp**: `cp AGENTS.md <target-project>/AGENTS.md`
- **Claude Code**: `cp AGENTS.md <target-project>/CLAUDE.md`

### 4. Install Skills

For each selected skill:
1. Copy the skill directory from `skills/<skill-name>/` to the agent's skills directory
2. Check if the skill has MCP dependencies (e.g., `playwriter`, `documentation-lookup`)

### 5. Handle MCP Servers

Some skills require MCP server configurations:

| Skill | MCP Server Required |
|-------|---------------------|
| `playwriter` | playwriter |
| `documentation-lookup` | context7 |

**For Amp:**
- MCP config goes in `mcp.json` alongside SKILL.md file

**For Claude Code:**
- MCP config typically goes in `.mcp.json` at project root
- May also support project-level or global config

Reference this repo's `.mcp.json` for example server configurations.

### 6. Verify Installation

After installation:
1. Confirm skill files are in the correct location
2. Verify MCP servers are configured if needed
3. Test that the agent recognizes the installed skills

## Example Installation Prompt

> "I want to set up dotagents skills in my project. I'm using Amp and need the `commit`, `code-review`, and `playwriter` skills."

The agent should:
1. Copy `skills/commit/`, `skills/code-review/`, `skills/playwriter/` to `.agents/skills/`
2. Add the `playwriter` MCP server to `.agent/skills/playwriter/mcp.json`
3. Verify the setup works

## Directory Structure

```
dotagents/
├── skills/              # Source skills (copy from here)
│   ├── commit/
│   ├── code-review/
│   └── ...
├── .agents/skills/      # Example Amp installation
├── .claude/             # Example Claude Code installation
└── .mcp.json            # Example MCP server config
```

## License

MIT
