# Ralph Execution Loop

The recursive execution loop that implements tasks one by one, creating new sessions to continue until all tasks are complete.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Session N                                                  │
│  1. Load config & progress                                  │
│  2. Find next ready task                                    │
│  3. Execute task + quality checks                           │
│  4. Update progress.json                                    │
│  5. Commit changes                                          │
│  6. Generate session summary                                │
│  7. Create Session N+1 with summary                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Session N+1                                                │
│  1. Receive context from Session N                          │
│  2. Load config & progress                                  │
│  3. Find next ready task                                    │
│  4. Execute task + quality checks                           │
│  5. Update progress.json                                    │
│  6. Commit changes                                          │
│  7. Generate session summary                                │
│  8. Create Session N+2 with summary                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                           [...]
                              │
                              ▼
                    All tasks complete!
```

## Loop Workflow

### Step 0: Load Configuration

Read `ralph.json` to get:
- Task source configuration
- Quality check commands
- Harness type
- Progress file path

```bash
# Read config
cat ralph.json
```

### Step 1: Load Progress

Read existing progress or initialize new:

```bash
# Read or create progress
cat scripts/ralph/progress.json 2>/dev/null || echo '{}'
```

**Progress JSON Structure:**

```json
{
  "startedAt": "2026-01-31T10:00:00Z",
  "feature": "User Authentication",
  "completedTasks": ["auth-1"],
  "currentTask": null,
  "patterns": {
    "database": "Use knex for migrations",
    "testing": "Jest tests in __tests__/ folder"
  },
  "learnings": [
    "bcrypt uses 10 rounds for password hashing",
    "JWT tokens expire after 24 hours"
  ]
}
```

### Step 2: Find Next Ready Task

**For PRD Markdown (from prd skill):**

Parse the markdown file to extract user stories:

```markdown
### US-001: Add priority field to database
**Description:** As a developer, I need to store task priority...

**Acceptance Criteria:**
- [ ] Add priority column to tasks table
- [ ] Typecheck passes

### US-002: Display priority indicator
```

Convert to tasks with sequential dependencies:
- US-001: dependencies = []
- US-002: dependencies = ["US-001"]
- US-003: dependencies = ["US-002"]

Check acceptance criteria checkboxes to determine status:
- All criteria checked = "completed"
- Any unchecked = "open"

**For PRD JSON:**

```javascript
// Algorithm
const completed = progress.completedTasks || [];
const ready = prd.tasks.filter(task => 
  task.status === "open" &&
  task.dependencies.every(dep => completed.includes(dep))
);
```

**For task_list:**

```
task_list action: "list", repoURL: "<repo>", ready: true, status: "open", limit: 10
```

Filter to descendants of parent task, pick first ready leaf task.

### Step 3: Check Completion

**If no ready tasks:**

1. Check if all tasks completed
2. Archive progress:
   ```bash
   DATE=$(date +%Y-%m-%d)
   mkdir -p scripts/ralph/archive/$DATE
   mv scripts/ralph/progress.json scripts/ralph/archive/$DATE/
   ```
3. Mark ralph.json as complete or clear parent task
4. Report: "✅ All tasks complete!"

**If blocked tasks exist:**
- Report which tasks are blocked and why
- Suggest resolving dependencies

### Step 4: Execute Task

Implement the selected task following its description.

**Always do:**
- Read relevant files first
- Follow existing patterns from progress.json
- Implement the smallest viable solution
- Run quality checks

### Step 5: Quality Checks

Run all configured checks:

```bash
# Typecheck
npm run typecheck

# Tests
npm run test

# Lint
npm run lint
```

**If any check fails:**
- Fix the issues
- Re-run checks
- Do NOT proceed until all pass

### Step 6: Update Task Status

**For PRD Markdown:**

Update the acceptance criteria checkboxes in the markdown file:

```markdown
### US-001: Add priority field to database
**Description:** As a developer, I need to store task priority...

**Acceptance Criteria:**
- [x] Add priority column to tasks table
- [x] Generate and run migration
- [x] Typecheck passes
```

Change `[ ]` to `[x]` for all criteria when task is complete.

**For PRD JSON:**

```javascript
// Update task status in prd.json
task.status = "completed";
```

Write updated prd.json back to disk.

**For task_list:**

```
task_list action: "update", taskID: "[task-id]", status: "completed"
```

### Step 7: Update Progress

Append session results to progress.json:

```json
{
  "completedTasks": ["auth-1", "auth-2"],
  "currentTask": {
    "id": "auth-2",
    "title": "Implement password hashing",
    "completedAt": "2026-01-31T10:30:00Z",
    "filesChanged": ["src/auth/password.ts", "src/auth/__tests__/password.test.ts"],
    "learnings": [
      "bcrypt uses 10 rounds by default",
      "Tests go in __tests__/ folder next to source"
    ]
  },
  "patterns": {
    "auth": "All auth utilities go in src/auth/",
    "testing": "Jest tests in __tests__/ folder"
  }
}
```

### Step 8: Commit Changes

```bash
# Stage all changes
git add .

# Commit with task title
git commit -m "feat: [Task Title]"
```

### Step 9: Generate Session Summary

Create a summary for the next session:

```markdown
=== RALPH SESSION CONTEXT ===

Original Prompt: [The prompt from ralph.json]

Session Summary:
- Task Completed: [task-id] - [task-title]
- Files Changed: [list of files]
- Quality Checks: ✅ All passed
- Learnings:
  - [Pattern 1]
  - [Pattern 2]

Progress: [N]/[Total] tasks complete
- Completed: [list]
- Ready: [list]
- Blocked: [list]

Next Ready Task: [next-task-id] - [next-task-title]

INSTRUCTIONS FOR NEXT SESSION:
1. Read ralph.json configuration
2. Read scripts/ralph/progress.json for full context
3. Execute the next ready task: [next-task-title]
4. Run all quality checks from ralph.json
5. Update progress.json and task status
6. Commit changes with message: "feat: [Task Title]"
7. Create new session using your harness's method:
   - Generic: /new [updated context]
   - Amp: Use handoff with this context
8. Continue until all tasks complete

Use the ralph skill when ready to continue.
```

### Step 10: Create New Session

**Generic Harness (opencode, claude, etc.):**

```
/new [SESSION_SUMMARY_FROM_STEP_9]
```

**Amp Harness:**

Use amp's built-in handoff mechanism with the session summary as context.

## Session Handoff Examples

### Example 1: Generic Harness (opencode)

**Session 1 completes task auth-1:**

```
/new === RALPH SESSION CONTEXT ===

Original Prompt: Implement the next authentication task from prd.json

Session Summary:
- Task Completed: auth-1 - Create users table migration
- Files Changed: migrations/001_users.sql
- Quality Checks: ✅ All passed
- Learnings:
  - Use knex for migrations
  - Place migrations in migrations/ folder

Progress: 1/3 tasks complete
- Completed: [auth-1]
- Ready: [auth-2]
- Blocked: [auth-3]

Next Ready Task: auth-2 - Implement password hashing

INSTRUCTIONS FOR NEXT SESSION:
1. Read ralph.json configuration
2. Read scripts/ralph/progress.json for full context
3. Execute the next ready task: auth-2
4. Run all quality checks from ralph.json
5. Update progress.json and task status
6. Commit changes with message: "feat: auth-2"
7. Create new session using: /new [updated context]
8. Continue until all tasks complete

Use the ralph skill when ready to continue.
```

**Session 2 receives context and continues...**

### Example 2: Amp Harness

Uses amp's native handoff with the same session summary format.

## Progress File Format

**Location:** `scripts/ralph/progress.json`

```json
{
  "version": "1.0",
  "startedAt": "2026-01-31T10:00:00Z",
  "feature": "User Authentication",
  "taskSource": {
    "type": "prd-json",
    "path": "tasks/auth.json"
  },
  "completedTasks": ["auth-1", "auth-2"],
  "currentTask": {
    "id": "auth-2",
    "title": "Implement password hashing",
    "completedAt": "2026-01-31T10:30:00Z",
    "filesChanged": [
      "src/auth/password.ts",
      "src/auth/__tests__/password.test.ts"
    ],
    "learnings": [
      "bcrypt uses 10 rounds by default",
      "Tests go in __tests__/ folder"
    ]
  },
  "patterns": {
    "database": "Use knex for all migrations",
    "auth": "Auth utilities go in src/auth/",
    "testing": "Jest tests in __tests__/ folder"
  },
  "stats": {
    "total": 3,
    "completed": 2,
    "remaining": 1,
    "blocked": 0
  }
}
```

## Task Discovery

While working, create new tasks when you discover:
- Missing tests
- Code that needs refactoring
- Error handling gaps
- Documentation needs
- TODOs in code

Add to prd.json or task_list immediately with appropriate dependencies.

## Error Handling

**Quality Check Failure:**
- Fix issues in current session
- Re-run checks
- Do NOT create new session until passing

**No Ready Tasks:**
- Verify all dependencies are satisfied
- Check for circular dependencies
- Report blocked tasks to user

**Config Error:**
- Validate ralph.json syntax
- Check task source exists
- Verify quality commands work

## Best Practices

1. **Small Tasks** - Each task completable in one session
2. **Clear Dependencies** - Explicit dependency chains
3. **Pattern Documentation** - Record learnings in progress.json
4. **Frequent Commits** - Commit after every task
5. **Quality First** - Never skip quality checks

## Stopping the Loop

To stop gracefully:
1. Complete current task
2. Archive progress
3. Clear ralph.json or mark complete

Emergency stop: Delete ralph.json or set all tasks to "blocked"
