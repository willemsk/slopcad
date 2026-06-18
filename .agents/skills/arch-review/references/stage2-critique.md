# Stage 2 — Rigorous Architectural Critique

## Goal

Act as a strict architectural critic. Using the discovery artifact from Stage 1
as your map, evaluate the implementation against universal design principles
and framework-specific best practices. Produce a structured list of findings.

**Input**: Read `docs/.arch-review/discovery.md` (written by Stage 1).
If `HAS_PREVIOUS_RUN = true`, also read the previous
`docs/.arch-review/findings.md` to enable regression detection.

**Severity levels** (only two — no minor nits):
- **Critical**: A violation that actively undermines correctness,
  maintainability, or the core architectural contract. Must be addressed.
- **Warning**: A notable smell that increases technical debt or makes future
  changes harder. Should be addressed but is not urgent.

---

## Universal Checks

These checks apply to **every project** regardless of language or framework.
Work through each one using the discovery artifact as your guide.

---

### Check U1 — Layer Boundary Violations (SoC / DIP)

Using the dependency graph from the discovery artifact:

**U1a — Pure-layer purity**
Identify any module classified as a "pure" or "core" layer (domain logic,
models, types, utilities). This layer must have zero imports from higher
layers (UI, controllers, tools, state, I/O). Any such import: **Critical**.

Verify by running `grep_search` on the pure-layer directory for imports
pointing to higher-layer directories.

**U1b — Upward dependency violations**
For every edge in the dependency graph marked as `violation`, verify by
reading the actual import statements. If confirmed: severity depends on the
nature of the violation:
- Core/domain importing from UI/presentation: **Critical**
- Sibling modules with unexpected coupling: **Warning**

**U1c — Direct state mutation from consumers**
If the project uses a state management layer, check whether consuming modules
(tools, controllers, UI components) bypass the state layer's public API to
mutate state directly. Search for patterns like direct property assignment on
state objects, in-place array mutation (`.push()`, `.splice()` on state),
or direct signal/store writes from outside the state module. Any bypass:
**Warning**.

---

### Check U2 — Single Responsibility Principle (SRP)

**U2a — Oversized files**
Using the "File Size Hotspots" table from the discovery artifact, classify:
- Files exceeding 500 LOC: **Critical** (almost certainly doing too much)
- Files 300–499 LOC: **Warning** (approaching the threshold)

For each flagged file, skim it to confirm whether it genuinely mixes concerns
(not just long due to verbose but cohesive content like test fixtures).

**U2b — God-file smell**
If the discovery artifact identifies a central state/config file that exports
more than 15 distinct public functions or types covering multiple unrelated
domains, flag as **Warning**. It may benefit from decomposition.

**U2c — Mixed concerns in large files**
For the largest files flagged in U2a, check whether they mix distinct
responsibilities (e.g., data transformation + rendering, business logic +
I/O, model definition + validation + serialization). If geometry or business
logic is reimplemented in a presentation layer file (duplicating a core
module), flag as **Warning** (DRY violation).

---

### Check U3 — Circular Dependencies

**U3a — Module-level cycles**
For each pair of modules in the dependency graph, check for mutual imports
(A imports B AND B imports A). Use `grep_search` to verify.

Any confirmed circular dependency between modules: **Critical**.

**U3b — File-level cycles within a module**
If a module is large (>10 files), spot-check for circular imports between
files within the module. If found: **Warning**.

---

### Check U4 — Test Coverage Gaps

**U4a — Untested critical modules**
Using the test coverage table from the discovery artifact, identify modules
containing complex logic (domain rules, algorithms, data transformations)
that have zero test files. Flag as **Warning**.

**U4b — Sparse coverage**
If test files exist but appear sparse relative to the module's complexity
(e.g., a 500-line solver module with a 30-line test file), note as **Warning**.

---

### Check U5 — DRY Violations

**U5a — Duplicated logic across layers**
Check if business logic, validation rules, or data transformation code is
duplicated between modules (e.g., the same geometric calculation in both a
core module and a rendering module, or the same validation in both client
and server). Flag confirmed duplication as **Warning**.

---

### Check U6 — Abstraction Leakage

**U6a — Internal details leaked to consumers**
Check if high-level modules (UI, controllers, tools) import internal helpers
or private utilities from lower-level modules instead of going through the
module's public API. Flag as **Warning**.

**U6b — Unused abstractions**
If the discovery artifact notes an abstraction layer (interface, abstract
class, protocol) that exists but is not actually used by any implementation
or consumer, flag as **Warning** — it may be dead code or premature
abstraction.

---

## Framework-Specific Checks

Based on the `framework` field in the discovery artifact, select and execute
the appropriate check set from the catalogue below. If the project's framework
is not listed, skip this section (the universal checks are sufficient).

---

### React / Preact / Solid / Svelte (Component-Based UI)

**F-UI-1 — Prohibited state patterns**
If the project documents preferred state management (e.g., signals, stores,
context, Redux), search for prohibited alternatives:
- `useState` / `useReducer` used for global or cross-component state when
  the project mandates a different approach.
- React Context used for high-frequency state when the project prefers
  signals or external stores.

Search the state and tools/controller directories for these patterns. If
found where prohibited: **Critical**.

**F-UI-2 — State mutation protocol violations**
If the project documents a mutation protocol (e.g., "snapshot before mutate",
"dispatch actions", "use named mutators"), check whether tools/controllers
follow it. If a mutation occurs without the required protocol step: **Warning**.

**F-UI-3 — Framework namespace leakage**
If the project uses Preact, search for `React.` namespace references or
React-specific imports (`react-dom`, `react/jsx-runtime`). If found: **Warning**.

---

### Django / Flask / FastAPI (Python Web)

**F-PY-1 — Fat views / thin models anti-pattern**
Check if view/route handler files contain business logic that should live in
models, services, or domain modules. Views exceeding 50 LOC per handler:
**Warning**.

**F-PY-2 — Business logic in serializers**
Check if serializer/schema files contain non-trivial data transformation or
business rules. Flag as **Warning**.

**F-PY-3 — Raw SQL in views**
Search for raw SQL queries (`cursor.execute`, `raw()`, `execute()`) outside
dedicated data access modules. Flag as **Warning**.

**F-PY-4 — Missing migrations**
If Django, check if model changes have corresponding migration files. Note
as **Warning** if unclear.

---

### Express / Fastify / NestJS (Node.js Backend)

**F-NODE-1 — Business logic in route handlers**
Check if route/controller files contain business logic that should be in
service or domain modules. Flag as **Warning**.

**F-NODE-2 — Error handling consistency**
Check if error handling uses a consistent middleware pattern or is scattered
with ad-hoc try/catch blocks in handlers. Flag inconsistency as **Warning**.

**F-NODE-3 — Database calls in controllers**
Search for direct database/ORM calls in route handlers instead of going
through a service or repository layer. Flag as **Warning**.

---

### Spring / Spring Boot (Java / Kotlin)

**F-SPRING-1 — Service layer bypass**
Check if controllers directly access repositories without going through a
service layer. Flag as **Warning**.

**F-SPRING-2 — Circular bean dependencies**
Search for `@Lazy` annotations or constructor cycles. Flag as **Warning**.

---

### Rust (Actix-web / Axum / Library)

**F-RUST-1 — Unsafe usage audit**
Search for `unsafe` blocks outside dedicated FFI or performance-critical
modules. Flag as **Warning**.

**F-RUST-2 — Error type proliferation**
Check if custom error types are scattered across modules instead of using a
centralised error enum/type. Flag as **Warning**.

---

## Regression Detection

If `HAS_PREVIOUS_RUN = true`, read the previous `docs/.arch-review/findings.md`:

1. **New findings**: Any finding in the current run whose ID does not match
   a finding in the previous run (compare by file + principle + summary).
2. **Resolved findings**: Any finding in the previous run not present in the
   current run.
3. **Regressions**: New findings with severity `Critical`, OR any finding
   that escalated from `Warning` to `Critical`.

Record these counts for the console output and for Stage 3 regression notices.

---

## Finding Format

Each finding must be recorded as a structured entry:

```
ID: CRIT-NNN  (or WARN-NNN)
Severity: Critical | Warning
File(s): path/to/file (line range if applicable)
Principle: SoC | SRP | DIP | DRY | OCP | LSP | Framework-Contract | Testability
Check: [The check ID that triggered this, e.g. U1a, F-UI-1]
Summary: One-sentence description of the violation.
Detail: 2–4 sentences explaining *why* this is a problem and what the risk is
        if left unaddressed.
```

Number findings sequentially: CRIT-001, CRIT-002, ..., WARN-001, WARN-002, ...

---

## Output — Findings Artifact

Write the file `docs/.arch-review/findings.md`:

```markdown
---
generated_by: /arch-review
generated_at: [CURRENT_ISO_TIMESTAMP]
project_name: [FROM_DISCOVERY_ARTIFACT]
total_critical: [N]
total_warning: [M]
new_findings: [COUNT_OR_NA]
resolved_findings: [COUNT_OR_NA]
regressions: [COUNT_OR_NA]
---

# Architectural Findings

## Summary

- **Critical**: N finding(s)
- **Warning**: M finding(s)
- **New since last run**: [count or "N/A — first run"]
- **Resolved since last run**: [count or "N/A — first run"]
- **Regressions**: [count or "N/A — first run"]

## Critical Findings

### CRIT-001 — [Summary]
- **Severity**: Critical
- **File(s)**: [path]
- **Principle**: [principle]
- **Check**: [check ID]
- **Detail**: [2-4 sentences]

[Repeat for each Critical finding]

## Warning Findings

### WARN-001 — [Summary]
- **Severity**: Warning
- **File(s)**: [path]
- **Principle**: [principle]
- **Check**: [check ID]
- **Detail**: [2-4 sentences]

[Repeat for each Warning finding]

## Resolved Findings (since previous run)

[List finding IDs and summaries that were present in the previous run but are
no longer found. If first run, write "N/A — first run."]
```

### Console Output

Print:
- `Stage 2 complete: N Critical, M Warning findings.`
- If `HAS_PREVIOUS_RUN`: `New: X | Resolved: Y | Regressions: Z`
