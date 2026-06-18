# Stage 3 — Living Documentation (`docs/`)

## Goal
Produce or update a set of living Markdown documents in `docs/` that accurately reflect
the *current state* of the codebase — not aspirational goals. Every document must
include a **Technical Debt** section populated with relevant findings from Stage 2.

**Living Document Rule**: Never remove information that was accurate in a prior run
unless the code it describes no longer exists. Instead, annotate the change.
If a prior finding was resolved, mark it `~~strikethrough~~ — Resolved [date]`.

---

## Step 3.0 — First-Run vs. Update Decision

Check the `IS_FIRST_RUN` flag passed from the main workflow (set by checking if `docs/`
exists at the project root).

- **If `IS_FIRST_RUN = true`**: Create all 4 documents from scratch using the templates
  in Steps 3.1–3.4.
- **If `IS_FIRST_RUN = false`**: Read each existing doc, compare its content to the
  current Stage 1 + Stage 2 findings. Update each doc in-place using `multi_replace_file_content`
  or `replace_file_content` as appropriate. Append regression notices (see Step 3.5)
  for any finding that is *new* or *worsened* since the last run.

---

## Step 3.1 — `docs/ARCHITECTURE.md`

### When Creating (First Run)

Create `docs/ARCHITECTURE.md` with the following structure:

```markdown
# Antigravity CAD — Architecture

> Last reviewed: [CURRENT_DATE] | Reviewer: /arch-review skill

## Overview
[2–3 paragraph description of what Antigravity CAD is, its runtime environment
(browser-only), and its core user-facing purpose.]

## Tech Stack
[Render the Tech Stack Record from Stage 1 as a table with columns:
Category | Technology | Version | Notes]

## Architectural Layers

### Layer Diagram
[Render a Mermaid flowchart showing the 6 modules and their dependency arrows.
Use the actual dependency graph built in Stage 1, not the idealised one.
If any violations exist, show them with a dashed red edge (style linkStyle N stroke:#f00)
and a note.]

### Module Responsibilities
[For each of the 6 src/ modules, a subsection with:
- **Purpose**: One sentence.
- **Key Files**: Bullet list of the 3–5 most important files.
- **Owns**: What data/logic it is the authoritative source for.
- **Does NOT own**: Explicit statement of what it must never contain.]

## Cross-Cutting Concerns
[Document: shared types location, error handling approach, coordinate system
convention (world vs screen space), test file co-location policy.]

## Technical Debt
[Render every finding from Stage 2 as a formatted table:]

| ID | Severity | File(s) | Principle | Summary |
|----|----------|---------|-----------|---------|
[One row per finding. Critical rows should use ⚠️ emoji, Warning rows 🔶.]

### Debt Detail
[For each finding, a subsection:
#### [ID] — [Summary]
**Severity**: Critical | Warning
**File(s)**: link to file
**Principle Violated**: ...
**Detail**: [paste the Detail field from the finding]
**Suggested Remedy**: [1–2 sentence suggestion for how to address it]
]

## Revision History
| Date | Change | Stage |
|------|--------|-------|
| [CURRENT_DATE] | Initial generation | /arch-review v1 |
```

### When Updating (Subsequent Run)

1. Read the existing `docs/ARCHITECTURE.md`.
2. Update the `Last reviewed` date.
3. Diff the Tech Stack table — update any version numbers or added/removed dependencies.
4. Diff the Layer Diagram — if new import edges exist or old ones were removed, update
   the Mermaid diagram.
5. Diff the Module Responsibilities — if a module gained new key files or changed
   purpose, update its section.
6. Diff the Technical Debt table — add new findings, mark resolved findings with
   strikethrough and a resolved date.
7. Append a row to the Revision History table.
8. If any *new Critical findings* were introduced since the last run, add a
   `> [!WARNING]` block at the top of the Technical Debt section reading:
   `⚠️ Architectural Regression Detected: N new Critical finding(s) introduced.`

---

## Step 3.2 — `docs/STATE_MANAGEMENT.md`

Create `docs/STATE_MANAGEMENT.md` with the following structure:

```markdown
# Antigravity CAD — State Management

> Last reviewed: [CURRENT_DATE]

## Overview
[Describe the signals-based state model: @preact/signals, the philosophy of reactive
signals vs. React useState, and why this project mandates signals for global state.]

## State Architecture

### Signal Inventory
[Table of every exported signal from app-state.ts:]
| Signal Name | Type | Description | Mutated By |
|-------------|------|-------------|------------|

### Derived / Computed Signals
[List any signals that are derived (computed()) from other signals and what they
depend on.]

### Mutator Functions
[Table of every exported mutator function from app-state.ts:]
| Function | Parameters | Description | Triggers Solver? |
|----------|------------|-------------|-----------------|

## State Mutation Protocol
[Step-by-step description of the correct sequence for a tool to mutate state:
1. Call snapshotState() for undoable operations
2. Call the appropriate named mutator from app-state.ts
3. If entities have constraints, call runSolverOnActivePage()
4. Signal subscribers (canvas renderer, UI panels) react automatically]

## Preferences & Persistence
[Document what is persisted in localStorage (from preferences.ts) and the shape of
the stored data.]

## Technical Debt
[Only include findings from Stage 2 that are relevant to state management
(Framework anti-patterns, state coupling, SRP violations in app-state.ts).]

## Revision History
| Date | Change |
|------|--------|
| [CURRENT_DATE] | Initial generation |
```

When updating: apply the same diff-and-update procedure as Step 3.1.

---

## Step 3.3 — `docs/DATA_MODELS.md`

Create `docs/DATA_MODELS.md` with the following structure:

```markdown
# Antigravity CAD — Data Models

> Last reviewed: [CURRENT_DATE]

## Overview
[Describe the Project → Page → Entity hierarchy and the Constraint model.]

## Core Types Hierarchy
[Render a Mermaid class diagram showing the entity type hierarchy from core/types.ts:
- Project contains Pages
- Page contains Entities and Constraints
- Entity union type with all subtypes (Wall, Door, Window, Line, Rect, Circle, Arc,
  Stairs, Text, Dimension)
- Show key fields on each type]

## Entity Type Reference
[For each entity type, a subsection:]
### [EntityType] — e.g., `WallEntity`
**Fields**: [table of field name, type, description]
**Constraints Supported**: [which constraint types can apply to it]
**Render By**: [which draw-helper function renders it]
**Serialized As**: [what the JSON key/structure looks like, if notable]

## Coordinate System
[Clearly document:
- World Space: physical coordinates in the project's unit system
- Screen Space: pixel coordinates on the monitor
- The viewport transform (from viewport.ts) that converts between them
- Where each coordinate system is used (entities in world space; mouse events
  in screen space; snapping operates in world space)]

## Constraint Model
[Document the constraint types available and how the solver (core/solver.ts)
resolves them. Reference the solver's public API.]

## Serialization Format
[Document the JSON serialization format produced by src/io/serialize.ts and
consumed by src/io/file-io.ts. Show a minimal example JSON snippet of a
Project with one Page and one entity.]

## Technical Debt
[Only include Stage 2 findings relevant to data models, types, serialization.]

## Revision History
| Date | Change |
|------|--------|
| [CURRENT_DATE] | Initial generation |
```

When updating: apply the same diff-and-update procedure.

---

## Step 3.4 — `docs/RENDERING_PIPELINE.md`

Create `docs/RENDERING_PIPELINE.md` with the following structure:

```markdown
# Antigravity CAD — Rendering Pipeline

> Last reviewed: [CURRENT_DATE]

## Overview
[Describe the HTML5 Canvas 2D rendering approach. Emphasise: no WebGL, no SVG for
the main drawing surface, purely browser-native Canvas 2D API.]

## Render Loop Architecture
[Describe how renderer.ts is the orchestrator. Include a Mermaid sequence diagram
showing the render loop:
1. Signal change triggers requestAnimationFrame
2. renderer.ts reads active page entities from state
3. renderer.ts calls draw-helpers for each entity
4. Screen-space overlays (UCS indicator, selection handles) drawn after ctx.restore()]

## Viewport & Transform
[Document the viewport.ts module:
- The pan/zoom transform matrix
- worldToScreen() and screenToWorld() functions
- How zoom affects stroke widths (zoom-independent widths rule: strokeWidth / zoom)]

## Draw Helpers
[Summarise what src/canvas/draw-helpers.ts provides:
- List the draw functions and what entity type each handles
- Note the function signature pattern (ctx, entity, viewport, options)]

## Export Rendering Pipeline
[Describe the parallel rendering pipeline used for exports (svg, png, dxf):
- renderer-interface.ts abstraction
- svg-renderer.ts and entity-renderers.ts
- How they differ from the canvas pipeline (e.g., coordinate systems, units)]

## Screen-Space Overlays
[Document what is drawn in screen space (after ctx.restore()):
- UCS indicator (origin axes)
- Selection handles and bounding boxes from select-tool
- Hit-testing math (handle radius = 8 / viewport.zoom)]

## Technical Debt
[Only include Stage 2 findings relevant to rendering, canvas, draw-helpers.]

## Revision History
| Date | Change |
|------|--------|
| [CURRENT_DATE] | Initial generation |
```

When updating: apply the same diff-and-update procedure.

---

## Step 3.5 — Regression Detection (Update Runs Only)

When `IS_FIRST_RUN = false`, after updating all 4 documents:

1. Compare the new Stage 2 findings against a mental model of what was in the old docs.
2. A **regression** is a finding that is:
   - New (did not exist in the previous run), OR
   - Escalated in severity (was Warning, now Critical)
3. For each regression, add a `> [!WARNING]` block at the top of the affected document's
   Technical Debt section:

```markdown
> [!WARNING]
> **Architectural Regression — [CURRENT_DATE]**: [Finding ID] was introduced or
> escalated. [One-sentence description of what changed.]
```

---

## Step 3.6 — Final Check

After writing all documents, verify:
- Every document has the `Last reviewed` date updated to today.
- Every Stage 2 finding appears in at least one document's Technical Debt section.
- No document contains aspirational language ("should be", "will eventually", "planned")
  unless explicitly marked with `> **Note**: This is aspirational — [explanation].`
