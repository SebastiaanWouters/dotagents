# Ralph Task Format

How to write task descriptions that work with any agent harness.

## PRD Markdown Format (from prd skill)

The preferred format - use the `prd` skill to generate, then ralph will parse it automatically.

### File Location
`/tasks/prd-[feature-name].md`

### Structure

```markdown
# PRD: Feature Name

## Introduction
Brief description of the feature.

## Goals
- Goal 1
- Goal 2

## User Stories

### US-001: Story title
**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Typecheck passes
- [ ] [UI stories] Verify in browser

### US-002: Next story
**Description:** ...

**Acceptance Criteria:**
- [ ] ...

## Functional Requirements
- FR-1: The system must...
- FR-2: When user clicks...

## Non-Goals
What is out of scope.
```

### How Ralph Parses PRD Markdown

1. **Extract User Stories**: Finds `### US-XXX: Title` sections
2. **Create Tasks**: Each user story becomes a task
3. **Sequential Dependencies**: 
   - US-001: no dependencies
   - US-002: depends on US-001
   - US-003: depends on US-002
   - (and so on...)
4. **Track Progress**: Checks acceptance criteria checkboxes
   - `[ ]` = open
   - `[x]` = completed

### Complete Example

```markdown
# PRD: Task Priority System

## Introduction

Add priority levels to tasks so users can focus on what matters most.

## Goals

- Allow assigning priority (high/medium/low) to any task
- Provide clear visual differentiation between priority levels
- Enable filtering and sorting by priority

## User Stories

### US-001: Add priority field to database
**Description:** As a developer, I need to store task priority so it persists across sessions.

**Acceptance Criteria:**
- [ ] Add priority column to tasks table: 'high' | 'medium' | 'low' (default 'medium')
- [ ] Generate and run migration successfully
- [ ] Typecheck passes

### US-002: Display priority indicator on task cards
**Description:** As a user, I want to see task priority at a glance so I know what needs attention first.

**Acceptance Criteria:**
- [ ] Each task card shows colored priority badge (red=high, yellow=medium, gray=low)
- [ ] Badge includes icon: 🔴 high, 🟡 medium, ⚪ low
- [ ] Priority visible without hovering or clicking
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Add priority selector to task edit
**Description:** As a user, I want to change a task's priority when editing it.

**Acceptance Criteria:**
- [ ] Priority dropdown in task edit modal
- [ ] Shows current priority as selected
- [ ] Saves immediately on selection change
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Add `priority` field to tasks table ('high' | 'medium' | 'low', default 'medium')
- FR-2: Display colored priority badge on each task card
- FR-3: Include priority selector in task edit modal

## Non-Goals

- No priority-based notifications or reminders
- No automatic priority assignment based on due date
```

## Task Description Template (for other formats)

```
[One-line summary of what to implement]

**What to do:**
- Specific action 1
- Specific action 2
- Specific action 3

**Files:**
- path/to/file1.ts
- path/to/file2.ts

**Acceptance criteria:**
- Specific verifiable criterion
- Typecheck passes
- [For UI] Verify in browser using available tools

**Notes:**
- Follow pattern from [existing-file.ts]
- [Any other context needed]
```

## PRD JSON Format

For `prd.json` task sources, use this structure:

```json
{
  "feature": "Feature Name",
  "description": "Brief description of the feature",
  "tasks": [
    {
      "id": "task-1",
      "title": "Task title - action oriented",
      "description": "Detailed description following the template above",
      "dependencies": [],
      "status": "open",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "Typecheck passes"
      ]
    },
    {
      "id": "task-2",
      "title": "Second task",
      "description": "Description...",
      "dependencies": ["task-1"],
      "status": "open",
      "acceptanceCriteria": [
        "Criterion 1",
        "Tests pass",
        "Typecheck passes"
      ]
    }
  ]
}
```

### PRD JSON Schema

```typescript
interface PRD {
  feature: string;
  description?: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];  // Task IDs that must complete first
  status: "open" | "in-progress" | "completed" | "blocked";
  acceptanceCriteria?: string[];
}
```

## Example Task Description

```
Implement category name to ID mapping for expenses.

**What to do:**
- Create function mapExpenseCategoryNameToId(name, isChildExpense)
- Query item_category table with category_type filter
- Add alias mapping for common synonyms (rent → Rent or Mortgage)

**Files:**
- workflows/tools/upsert-expense.ts

**Acceptance criteria:**
- Function returns category ID for valid names
- Returns null for unknown categories
- Typecheck passes

**Notes:**
- Follow pattern from upsert-income.ts
- EXPENSE type for family, CHILD_EXPENSE for child
```

## Example PRD JSON

```json
{
  "feature": "Expense Tracking for Legal Agent",
  "description": "Add expense CRUD capabilities to Grace (legal chat agent)",
  "tasks": [
    {
      "id": "exp-1",
      "title": "Create tool skeleton",
      "description": "Set up Zod schema and basic tool structure for expense operations.\n\n**What to do:**\n- Create expenseTool schema with zod\n- Define input types for create/update/delete/list\n- Add basic error handling structure\n\n**Files:**\n- workflows/tools/expense-tool.ts\n\n**Acceptance criteria:**\n- Schema validates expense data\n- Typecheck passes",
      "dependencies": [],
      "status": "open",
      "acceptanceCriteria": [
        "Schema validates expense data",
        "Typecheck passes"
      ]
    },
    {
      "id": "exp-2",
      "title": "Implement category mapping",
      "description": "Map expense category names to database IDs.\n\n**What to do:**\n- Query item_category table\n- Map common names to IDs\n- Handle family vs child expense types\n\n**Files:**\n- workflows/tools/expense-tool.ts\n\n**Acceptance criteria:**\n- Maps 'rent' to correct category ID\n- Handles unknown categories gracefully\n- Typecheck passes",
      "dependencies": ["exp-1"],
      "status": "open",
      "acceptanceCriteria": [
        "Maps 'rent' to correct category ID",
        "Handles unknown categories gracefully",
        "Typecheck passes"
      ]
    },
    {
      "id": "exp-3",
      "title": "Create family expense action",
      "description": "Implement insert/update for family expenses.\n\n**What to do:**\n- Insert into expense table\n- Handle updates by expense ID\n- Validate required fields\n\n**Files:**\n- workflows/tools/expense-tool.ts\n- workflows/tools/__tests__/expense-tool.test.ts\n\n**Acceptance criteria:**\n- Creates new expense in database\n- Updates existing expense\n- Tests pass",
      "dependencies": ["exp-2"],
      "status": "open",
      "acceptanceCriteria": [
        "Creates new expense in database",
        "Updates existing expense",
        "Tests pass",
        "Typecheck passes"
      ]
    }
  ]
}
```

## Acceptance Criteria Guidelines

### Good Criteria (Verifiable)

- "Add `investorType` column to investor table with default 'cold'"
- "Filter dropdown has options: All, Cold, Friend"
- "Typecheck passes"
- "Tests pass"

### Bad Criteria (Vague)

- ❌ "Works correctly"
- ❌ "Good UX"
- ❌ "Handles edge cases"

### Always Include

```
Typecheck passes
```

### For Tasks with Testable Logic

```
Tests pass
```

### For UI/Browser Tasks

**Functional testing** (checking behavior):
```
Use browser tools to verify interactive elements
```

**Visual testing** (checking appearance):
```
Use screenshot to capture and verify visual appearance
```

## Task Sizing Guidelines

**Right-sized (one session):**
- Add a database column + migration
- Create a single UI component
- Implement one API endpoint
- Write tests for one function

**Too big (split these):**
- "Build the entire dashboard"
- "Add authentication system"
- "Refactor the API"

**Rule of thumb:** If you can't describe it in 2-3 sentences, it's too big.

## Dependency Guidelines

Order tasks by dependency:

```
Task 1: Schema (no dependencies)
Task 2: Server action (depends on task-1)
Task 3: UI component (depends on task-2)
Task 4: Tests (depends on task-3)
```

**Good dependencies:**
- Explicit and necessary
- Linear when possible
- Clear why A must come before B

**Bad dependencies:**
- Circular (A depends on B, B depends on A)
- Unnecessary (tasks could be parallel)
- Vague ("after other stuff is done")

## Example Conversation

**User:** set up ralph

**Assistant:** What task source?
1. PRD JSON file
2. task_list (amp tasks)

**User:** PRD JSON

**Assistant:** Path to your PRD file?

**User:** tasks/expense-feature.json

**Assistant:** What agent harness?
1. Generic (/new command)
2. amp

**User:** Generic - using opencode

**Assistant:** [Creates ralph.json configuration]

```json
{
  "version": "1.0",
  "taskSource": {
    "type": "prd-json",
    "path": "tasks/expense-feature.json"
  },
  "prompt": "Implement the next ready task from the PRD. Run typecheck and tests. Commit when passing.",
  "harness": {
    "type": "generic",
    "newSessionCommand": "/new"
  },
  "qualityChecks": {
    "typecheck": "npm run typecheck",
    "test": "npm run test"
  },
  "progressFile": "scripts/ralph/progress.json"
}
```

✅ Ralph configured! Run "ralph" to start execution.

**User:** ralph

**Assistant:** [Executes first task, updates progress, creates new session via /new]

---

**Next Session:**

```
/new === RALPH SESSION CONTEXT ===
Original Prompt: Implement the next ready task from the PRD...
[Context from previous session]
```

**New Agent Instance:** [Receives context, continues with next task]
