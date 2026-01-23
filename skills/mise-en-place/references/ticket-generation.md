# Ticket Generation Strategy

Transform a SPEC.md into actionable, dependency-ordered tickets.

## Decomposition Principles

### 1. Vertical Slices Over Horizontal Layers

**Wrong (horizontal):**
```
Task 1: Design all database schemas
Task 2: Build all API endpoints
Task 3: Create all UI components
Task 4: Write all tests
```

**Right (vertical):**
```
Task 1: User registration (schema + API + UI + test)
Task 2: User login (schema + API + UI + test)
Task 3: User profile (schema + API + UI + test)
```

Each task delivers a working slice of functionality.

### 2. Task Sizing: The "One Session" Rule

Each ticket should be completable in one focused work session (2-4 hours).

**Signals a task is right-sized:**
- Can describe in 2-3 sentences
- Has clear start and end points
- Tests can be written before starting
- Doesn't require mid-task decisions

**Signals a task is too big:**
- Description has multiple paragraphs
- Contains the word "and" connecting unrelated things
- Requires architectural decisions mid-stream
- Can't estimate confidently

### 3. Dependency Ordering

Tasks should form a directed acyclic graph (DAG):

```
Foundation (no deps)
    │
    ▼
Infrastructure (deps: foundation)
    │
    ▼
Core Features (deps: infrastructure)
    │
    ▼
Integration (deps: multiple features)
    │
    ▼
Polish (deps: integration)
```

## Standard Phases

### Phase 0: Setup (usually 1-2 tasks)
```bash
tk create "Project initialization" -t task \
  --description "Set up monorepo, configure tooling, establish conventions" \
  --acceptance "- [ ] pnpm/npm init
- [ ] TypeScript configured
- [ ] ESLint + Prettier
- [ ] Git hooks (husky)
- [ ] CI pipeline stub"
```

### Phase 1: Data Foundation (2-4 tasks)
```bash
tk create "Database schema: Users" -t task \
  --description "Create user table with auth fields" \
  --acceptance "- [ ] Migration file created
- [ ] User model with: id, email, password_hash, created_at
- [ ] Indexes on email
- [ ] Migration runs successfully"

tk create "Database schema: [Domain Entity]" -t task \
  --parent <phase-id> \
  --description "Create [entity] table" \
  --acceptance "..."
```

### Phase 2: API Layer (1 task per resource)
```bash
tk create "API: User registration endpoint" -t task \
  --description "POST /api/users - create new user" \
  --acceptance "- [ ] Endpoint accepts {email, password}
- [ ] Validates email format
- [ ] Hashes password before storing
- [ ] Returns 201 with user object (no password)
- [ ] Returns 400 for validation errors
- [ ] Returns 409 for duplicate email"
```

### Phase 3: UI Components (1 task per screen/major component)
```bash
tk create "UI: Registration form" -t task \
  --description "Form component for user signup" \
  --acceptance "- [ ] Email input with validation
- [ ] Password input with strength indicator
- [ ] Submit button with loading state
- [ ] Error display
- [ ] Success redirect to login"
```

### Phase 4: Integration (connecting the pieces)
```bash
tk create "Integration: Registration flow" -t task \
  --description "Wire registration form to API" \
  --acceptance "- [ ] Form submits to API
- [ ] Handles success (redirect)
- [ ] Handles errors (display)
- [ ] Loading states work
- [ ] E2E test passes"
```

### Phase 5: Polish (error handling, edge cases)
```bash
tk create "Error handling: Global error boundary" -t task \
  --description "Catch and display unexpected errors gracefully" \
  --acceptance "- [ ] Error boundary component
- [ ] Fallback UI
- [ ] Error logging
- [ ] Recovery action"
```

## Ticket Template

```bash
tk create "[Verb] [noun]: [specificity]" \
  -t [task|feature|bug|chore] \
  -p [0-4] \  # 0=highest priority
  --parent <parent-id> \
  --description "[1-3 sentences: what and why]" \
  --acceptance "[Checklist of done criteria]" \
  --tags [comma,separated,tags]
```

### Good Ticket Titles
- ✅ "Create user table with auth fields"
- ✅ "Implement password reset email sending"
- ✅ "Add loading skeleton to dashboard"
- ❌ "User stuff"
- ❌ "Fix things"
- ❌ "Backend work"

### Acceptance Criteria Format
```markdown
- [ ] [Observable behavior or artifact]
- [ ] [Another specific criterion]
- [ ] [Edge case: what happens when X]
- [ ] [Error case: what happens when Y fails]
```

## Dependency Wiring

After creating tasks, wire dependencies:

```bash
# Task 2 depends on Task 1
tk dep <task-2-id> <task-1-id>

# View the dependency tree
tk dep tree <epic-id>

# Check for cycles
tk dep cycle
```

### Common Dependency Patterns

**Sequential:**
```
Schema → API → UI → Integration → Tests
```

**Parallel with merge:**
```
Feature A ─┐
           ├─→ Integration
Feature B ─┘
```

**Foundation fan-out:**
```
         ┌─→ Feature 1
Setup ───┼─→ Feature 2
         └─→ Feature 3
```

## From Spec to Tickets: Checklist

- [ ] Create parent epic for the project
- [ ] Create phase epics under parent
- [ ] For each feature in spec:
  - [ ] Break into vertical slices
  - [ ] Create task for each slice
  - [ ] Write acceptance criteria (testable)
  - [ ] Identify dependencies
- [ ] Wire all dependencies with `tk dep`
- [ ] Verify no cycles: `tk dep cycle`
- [ ] Verify ready queue: `tk ready`
- [ ] Tag with relevant labels

## Validation Questions

Before creating each ticket, ask:

1. **Clear enough?** Can someone implement without asking questions?
2. **Small enough?** Completable in one session?
3. **Testable?** Can write tests for acceptance criteria?
4. **Independent?** Only depends on explicitly listed tasks?
5. **Valuable?** Delivers user/developer value when done?

## Example: Full Decomposition

**From Spec:** "Users can create and manage projects"

```bash
# Epic
tk create "Project Management" -t epic

# Phase 1: Foundation
tk create "Schema: projects table" -t task --parent proj-xxx \
  --acceptance "- [ ] id, name, user_id, created_at, updated_at
- [ ] Foreign key to users
- [ ] Index on user_id"

# Phase 2: API
tk create "API: CRUD projects" -t task --parent proj-xxx \
  --acceptance "- [ ] GET /projects (list user's projects)
- [ ] POST /projects (create)
- [ ] GET /projects/:id (show)
- [ ] PATCH /projects/:id (update)
- [ ] DELETE /projects/:id (soft delete)"

tk dep <api-task> <schema-task>

# Phase 3: UI
tk create "UI: Projects list page" -t task --parent proj-xxx \
  --acceptance "- [ ] Display user's projects
- [ ] Empty state
- [ ] Loading skeleton
- [ ] Create project button"

tk create "UI: Project create/edit form" -t task --parent proj-xxx \
  --acceptance "- [ ] Name input
- [ ] Validation
- [ ] Submit handling"

tk dep <list-ui> <api-task>
tk dep <form-ui> <api-task>

# Phase 4: Integration
tk create "Integration: Project CRUD flow" -t task --parent proj-xxx \
  --acceptance "- [ ] Create project → appears in list
- [ ] Edit project → updates list
- [ ] Delete project → removes from list
- [ ] E2E test passes"

tk dep <integration> <list-ui>
tk dep <integration> <form-ui>
```

Result: `tk ready` shows schema task first, then API, then UI tasks can run in parallel, finally integration.
