# Stage 2 — Rigorous Architectural Critique

## Goal
Act as a strict architectural critic. Using the Stage 1 findings as your map, evaluate
the implementation against established design principles and the project's own documented
conventions. Produce a structured list of findings.

**Severity levels** (only two — no minor nits):
- **Critical**: A violation that actively undermines correctness, maintainability, or the
  core architectural contract. Needs to be fixed before the codebase scales further.
- **Warning**: A notable smell that increases technical debt or makes future changes
  harder. Should be addressed but is not urgent.

---

## Critique Checklist

Work through each check below. For every violation found, create a finding entry with
the format specified at the end of this file.

---

### Check 2.1 — Layer Boundary Violations (SoC / DIP)

Using the dependency graph you built in Stage 1, verify:

**2.1a — `core/` purity**
`src/core/` must have zero imports from `src/state/`, `src/ui/`, `src/canvas/`,
`src/tools/`, or `src/io/`. If any exist: **Critical**.

Run `grep_search` on `src/core/` for patterns: `from '../state`, `from '../ui`,
`from '../canvas`, `from '../tools`, `from '../io`.

**2.1b — `state/` boundary**
`src/state/` must not import from `src/ui/`, `src/canvas/`, or `src/tools/`. Importing
from `src/core/` is correct and expected. If violation found: **Critical**.

**2.1c — `io/` boundary**
`src/io/` must not import from `src/ui/`, `src/canvas/`, or `src/tools/`. If violation
found: **Warning** (it may legitimately read from state for active-page snapshots —
evaluate in context).

**2.1d — Tool direct state mutation**
Check `src/tools/` files for direct mutation of arrays or signal values that bypass
`app-state.ts` exports. Search for patterns like `.value.push(`, `.value.splice(`,
`.value =` in tool files. Direct `.value` assignment to a complex signal is a
**Warning** unless it is a re-assignment of the entire signal (which should go through
a named mutator in `app-state.ts`).

---

### Check 2.2 — Single Responsibility Principle (SRP)

**2.2a — Oversized files**
The existing `general-coding-standards.md` rule states files must stay under ~300 LOC.
List all files exceeding 300 lines. If a file exceeds 500 lines, it is **Critical**
(highly likely to be doing too much). 300–499 lines is a **Warning**.

Specifically check known large files flagged in Stage 1:
- `src/canvas/draw-helpers.ts`
- `src/tools/select-tool.ts`
- `src/state/app-state.ts`
- `src/ui/toolbar.tsx`

**2.2b — `app-state.ts` god-file smell**
Read `src/state/app-state.ts` fully. Count the number of exported signals vs. the
number of exported mutator functions. If it exports more than 15 distinct mutator
functions covering multiple unrelated concerns (e.g., selection, history, pages,
layers, tools, preferences), flag as **Warning** — it may benefit from domain-scoped
state slices in the future.

**2.2c — `draw-helpers.ts` mixed concerns**
Read `src/canvas/draw-helpers.ts`. Determine if it mixes drawing logic with geometry
computation or entity-interpretation logic. If geometry is reimplemented here that
duplicates `src/core/geometry.ts`, flag as **Warning** (DRY violation).

---

### Check 2.3 — Framework Anti-Patterns (Preact / Signals)

**2.3a — React-specific API usage**
Search for usage of React-specific APIs that are incompatible with Preact or represent
patterns the project rules prohibit:
- `useState` for global or cross-component state (search across `src/state/` and
  `src/tools/` — it should not appear there)
- `useReducer` anywhere (prohibited by `app-tech-stack.md`)
- `createContext` / `useContext` for shared state (prohibited)
- `React.` namespace references (should not appear)

Run `grep_search` with `IsRegex: true` for `useState|useReducer|createContext|useContext`
across `src/state/` and `src/tools/`. Any match: **Critical**.

**2.3b — Signal mutation without snapshot**
The constraint from `app-implementation.md` states that `snapshotState()` must be
called before mutations that tools perform. Search `src/tools/` for mutating calls
(functions that write to signals) without a preceding `snapshotState` call.
Evaluate in context — if a tool method writes to state without first snapshotting,
flag as **Warning**.

**2.3c — Non-signal DOM state in components**
Search `src/ui/` for `useState` used for non-trivially-local state (i.e., state that
is derived from or should be reflected in global signals). Minor accordion toggles are
acceptable. State that shadows a global signal is a **Warning**.

---

### Check 2.4 — Abstraction Leakage

**2.4a — Canvas internals leaked to tools**
Check if `src/tools/` directly imports from `src/canvas/` (other than reading the
viewport signal, which is acceptable). Tools should interact with the world through
`app-state.ts` and `core/` types, not through canvas internals.
Search `src/tools/` for `from '../canvas`. If found: **Warning**.

**2.4b — Renderer interface usage**
`src/io/renderer-interface.ts` defines an abstraction for rendering backends. Verify
that `src/io/entity-renderers.ts` and `src/io/svg-renderer.ts` actually use this
interface rather than duplicating ad-hoc rendering logic. If the interface exists but
is unused or bypassed: **Warning**.

**2.4c — Serialization leakage**
Check if entity types from `src/core/types.ts` are used directly in `src/io/file-io.ts`
without going through `src/io/serialize.ts` as an intermediary. Direct use of raw entity
types in I/O without the serialize layer is acceptable if serialize.ts is thin; flag as
**Warning** only if business logic (non-trivial transformation) is duplicated between
`serialize.ts` and `file-io.ts`.

---

### Check 2.5 — Circular Dependencies

**2.5a — Explicit circular import check**
For each of the 6 module directories, search for mutual imports:
- Does A import from B *and* B import from A?

Check these pairs (most likely to be problematic):
- `state` ↔ `tools`
- `canvas` ↔ `tools`
- `core` ↔ `state`
- `ui` ↔ `state` (signals flow from state to ui; ui should not re-export to state)

Any confirmed circular dependency: **Critical**.

---

### Check 2.6 — Test Coverage Gaps

**2.6a — Untested critical modules**
Cross-reference the test file inventory from Stage 1. Identify modules with zero test
coverage despite containing complex logic. The following are considered "critical" for
testing purposes based on project complexity:
- `src/core/solver.ts` — constraint solving (test file exists: `solver.test.ts` ✓)
- `src/core/geometry.ts` — geometric math (check if `geometry.test.ts` covers the
  exported API adequately)
- `src/state/app-state.ts` — central state (check `app-state.test.ts` coverage)
- `src/tools/select-tool.ts` — complex interactive logic
- `src/canvas/draw-helpers.ts` — pure rendering functions (testable without DOM)

If a critical module has no test file at all: **Warning**.
If test files exist but coverage appears sparse relative to the module's complexity
(qualitatively assessed): note as **Warning**.

---

## Finding Format

Each finding must be recorded as a structured entry:

```
ID: CRIT-NNN  (or WARN-NNN)
Severity: Critical | Warning
File(s): src/path/to/file.ts (line range if applicable)
Principle: SoC | SRP | DIP | DRY | OCP | LSP | Framework-Contract | Testability
Summary: One-sentence description of the violation.
Detail: 2–4 sentences explaining *why* this is a problem and what the risk is
        if left unaddressed.
```

Number findings sequentially across severity groups:
- Criticals: CRIT-001, CRIT-002, ...
- Warnings: WARN-001, WARN-002, ...

---

## Output

- Print the count of findings per severity level to the console.
- Hold the full structured finding list in memory for Stage 3 (it will be embedded in
  the `ARCHITECTURE.md` technical debt section).
