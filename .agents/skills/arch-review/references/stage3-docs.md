# Stage 3 — Living Documentation (`docs/`)

## Goal

Produce or update a set of living Markdown documents in `docs/` that accurately
reflect the *current state* of the codebase — not aspirational goals. Every
document must include a **Technical Debt** section populated with relevant
findings from Stage 2.

**Inputs**:
- `docs/.arch-review/discovery.md` (Stage 1 artifact)
- `docs/.arch-review/findings.md` (Stage 2 artifact)
- `IS_FIRST_RUN` flag from the orchestrator

**Living Document Rule**: Never remove information that was accurate in a prior
run unless the code it describes no longer exists. Instead, annotate the change.
If a prior finding was resolved, mark it `~~strikethrough~~ — Resolved [date]`.

---

## Step 3.0 — Document Set Selection

Read the `Document Archetypes Selected` section from the discovery artifact.
This determines which documents to create or update.

`ARCHITECTURE.md` is **always** created. The remaining documents are selected
from the archetype catalogue below based on what Stage 1 discovered.

### Document Archetype Catalogue

| Archetype | Created When | Covers |
|-----------|-------------|--------|
| `ARCHITECTURE.md` | Always | Layer diagram, module responsibilities, tech stack, all debt |
| `STATE_MANAGEMENT.md` | State management library detected (Redux, signals, MobX, Vuex, Pinia, stores, ngrx, etc.) | Signal/store inventory, mutation protocol, reactivity model |
| `DATA_MODELS.md` | Entity/model types or ORM detected | Type hierarchy, schemas, relationships, serialisation |
| `RENDERING_PIPELINE.md` | Canvas, WebGL, or rendering engine layer detected | Render loop, viewport, draw pipeline |
| `API_LAYER.md` | API routing framework detected (Express, FastAPI, Django REST, etc.) | Endpoints, middleware, request/response flow |
| `DATABASE_SCHEMA.md` | Database or ORM detected (Prisma, SQLAlchemy, TypeORM, Django ORM, etc.) | Schema, migrations, query patterns |
| `PLUGIN_SYSTEM.md` | Plugin/extension architecture detected | Plugin interface, lifecycle, registration |
| `BUILD_DEPLOY.md` | Complex build pipeline or CI/CD config detected | Build steps, deployment targets, environments |

---

## Step 3.1 — First-Run vs. Update Decision

- **If `IS_FIRST_RUN = true`**: Create all selected documents from scratch
  using the templates in Steps 3.2–3.3.
- **If `IS_FIRST_RUN = false`**: For each selected document:
  - If the file exists: read it, compare to current analysis, update in-place.
  - If the file does not exist (new archetype selected): create it from scratch.

---

## Step 3.2 — `ARCHITECTURE.md` (Always Created)

### Template

```markdown
# [PROJECT_NAME] — Architecture

> Last reviewed: [CURRENT_DATE] | Reviewer: /arch-review

## Overview
[2–3 paragraphs describing what this project is, its runtime environment,
and its core purpose. Derive this from the discovery artifact — project name,
framework, runtime environment.]

## Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
[Copy from the discovery artifact's Tech Stack table]

## Architectural Layers

### Layer Diagram
[Render a Mermaid flowchart showing all discovered modules and their
dependency arrows. Use the ACTUAL dependency graph from the discovery artifact.
If any violation edges exist, show them with a dashed red style:
  style linkStyle N stroke:#f00,stroke-dasharray:5
and add a note explaining the violation.]

### Module Responsibilities
[For each module from the discovery artifact, a subsection:]

#### [Module Name] (`[path]`)
- **Purpose**: [One sentence from discovery artifact]
- **Key Files**: [3–5 most important files]
- **Owns**: [What this module is the authoritative source for]
- **Must NOT contain**: [What it should never contain]

## Cross-Cutting Concerns
[From the discovery artifact: shared types location, error handling approach,
configuration management, test co-location policy, and any notable patterns.]

## Technical Debt

[Render EVERY finding from Stage 2 as a summary table:]

| ID | Severity | File(s) | Principle | Summary |
|----|----------|---------|-----------|---------|
[One row per finding. Prefix Critical rows with ⚠️, Warning rows with 🔶.]

### Debt Detail

[For each finding, a subsection:]

#### [ID] — [Summary]
- **Severity**: Critical | Warning
- **File(s)**: [link to file]
- **Principle Violated**: [principle]
- **Check**: [check ID that found it]
- **Detail**: [2-4 sentence explanation]
- **Suggested Remedy**: [1–2 sentence actionable suggestion]

## Revision History

| Date | Change | Run |
|------|--------|-----|
| [CURRENT_DATE] | Initial generation | /arch-review |
```

### When Updating (Subsequent Runs)

1. Update the `Last reviewed` date.
2. Diff the Tech Stack table — update versions, add/remove dependencies.
3. Diff the Layer Diagram — add/remove edges, update violation annotations.
4. Diff Module Responsibilities — update if modules were added, removed, or
   changed purpose.
5. Diff Technical Debt:
   - Add new findings.
   - Mark resolved findings with `~~strikethrough~~ — Resolved [CURRENT_DATE]`.
   - If any **new Critical findings** exist (regressions), add at the top of
     the Technical Debt section:
     ```markdown
     > [!WARNING]
     > **Architectural Regression — [CURRENT_DATE]**: [N] new Critical
     > finding(s) introduced since last review. See findings: [IDs].
     ```
6. Append a row to the Revision History table.

---

## Step 3.3 — Additional Archetype Documents

For each additional archetype selected in the discovery artifact, create a
document following the generic template structure below. Adapt the sections
to the specific archetype.

### Generic Archetype Template

```markdown
# [PROJECT_NAME] — [Archetype Title]

> Last reviewed: [CURRENT_DATE]

## Overview
[2–3 paragraphs specific to this archetype's domain. Describe the current
implementation, not aspirational goals.]

## [Primary Section — varies by archetype]
[Main content. Use tables, Mermaid diagrams, and code examples as appropriate.
Derive ALL content from what you actually read in the source code during
Stage 1.]

## [Secondary Sections — varies by archetype]
[Additional sections as needed. See the archetype-specific guidance below.]

## Technical Debt
[Only include findings from Stage 2 that are relevant to this archetype's
domain. Do not duplicate the full debt table — that lives in ARCHITECTURE.md.]

## Revision History
| Date | Change |
|------|--------|
| [CURRENT_DATE] | Initial generation |
```

### Archetype-Specific Section Guidance

**STATE_MANAGEMENT.md**:
- Signal/Store/Atom Inventory (table: name, type, description, mutated by)
- Derived/Computed State (dependencies)
- Mutator Functions (table: name, params, description, side effects)
- State Mutation Protocol (step-by-step correct sequence)
- Persistence (what is stored in localStorage/cookies/etc.)

**DATA_MODELS.md**:
- Type/Model Hierarchy (Mermaid class diagram)
- Entity/Model Reference (per-type subsection with fields table)
- Coordinate System or Data Conventions (if applicable)
- Relationships (foreign keys, associations, graph edges)
- Serialization/Deserialization Format (example JSON/payload)

**RENDERING_PIPELINE.md**:
- Render Loop Architecture (Mermaid sequence diagram)
- Viewport/Camera/Transform (coordinate transformations)
- Draw/Render Functions (inventory table)
- Export Pipeline (if separate from display rendering)
- Screen-Space Overlays / HUD Elements

**API_LAYER.md**:
- Endpoint Inventory (table: method, path, handler, description)
- Middleware Stack (ordered list with purpose)
- Request/Response Flow (Mermaid sequence diagram)
- Authentication/Authorization (approach and location)
- Error Response Format

**DATABASE_SCHEMA.md**:
- Schema Diagram (Mermaid ER diagram)
- Table/Collection Reference (per-table subsection)
- Migration Strategy
- Query Patterns (common queries and their locations)
- Indexing Strategy

**PLUGIN_SYSTEM.md**:
- Plugin Interface/Contract
- Plugin Lifecycle (registration, init, teardown)
- Discovery Mechanism
- Available Plugins inventory

**BUILD_DEPLOY.md**:
- Build Pipeline (steps, tools, outputs)
- Environment Configuration
- Deployment Targets
- CI/CD Integration

---

## Step 3.4 — Regression Notices (Update Runs Only)

When `IS_FIRST_RUN = false`, after updating all documents:

1. Read the regression data from the Stage 2 findings artifact (the
   `new_findings`, `resolved_findings`, and `regressions` counts, plus the
   `Resolved Findings` section).
2. For each regression (new Critical finding), add a `> [!WARNING]` block at
   the top of the affected document's Technical Debt section:

```markdown
> [!WARNING]
> **Architectural Regression — [CURRENT_DATE]**: [Finding ID] was introduced
> or escalated. [One-sentence description.]
```

3. For each resolved finding, mark it with strikethrough in the debt table
   and detail section.

---

## Step 3.5 — Final Verification

After writing all documents, verify:
- Every document has `Last reviewed` set to today's date.
- Every Stage 2 finding appears in at least one document's Technical Debt
  section (ARCHITECTURE.md has all; archetypes have relevant subsets).
- No document contains aspirational language ("should be", "will eventually",
  "planned") unless explicitly marked:
  `> **Note**: This is aspirational — [explanation].`
- All Mermaid diagrams reflect the ACTUAL dependency graph and type hierarchy,
  not an idealised version.

### Console Output

Report:
- How many documents were created vs. updated.
- Whether any regressions were flagged.
