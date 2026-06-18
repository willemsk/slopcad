# Stage 1 — Context & Tech Stack Discovery

## Goal
Build a complete mental model of the project's tech stack, module structure, and
architectural layers. This is purely a *read* stage — no files are created or modified.

---

## Step 1.1 — Package Manifest Analysis

Read the following files in order:

1. `package.json` — extract all `dependencies` and `devDependencies`. Categorise each
   dependency into one of: `runtime-framework`, `state-management`, `bundler`,
   `test-runner`, `linter/formatter`, `types`, or `other`.
2. `tsconfig.app.json` and `tsconfig.json` — extract compiler options, especially
   `strict`, `target`, `paths` (module aliases), and `baseUrl`.
3. `vite.config.ts` — extract the Vite preset, any plugins, and any configured aliases.

Produce an internal **Tech Stack Record** with these fields:
- `language`: TypeScript x.y
- `framework`: e.g. Preact 10.x
- `pragma`: (if JSX pragma is non-standard, note it)
- `stateLibrary`: e.g. @preact/signals vX.y
- `bundler`: e.g. Vite 8.x
- `testRunner`: e.g. Vitest
- `linter`: e.g. gts
- `runtimeEnvironment`: Browser-only / Node.js / SSR

---

## Step 1.2 — Directory Structure Walk

List the contents of each `src/` subdirectory one level deep. For each subdirectory,
enumerate its files and note the size of the largest files (as a proxy for complexity).

Specifically read and analyse:

### `src/core/`
Read the following files completely:
- `types.ts` — understand all entity types (`Wall`, `Door`, `Window`, `Line`, `Rect`,
  `Circle`, `Arc`, `Stairs`, `Text`, `Dimension`) and the `Project`/`Page` hierarchy.
- `entity.ts` — understand entity identity and mutation contracts.
- `geometry.ts` — understand what geometric primitives/operations are provided.
- `commands.ts` — understand the command/action dispatch mechanism.
- `symbols.ts` — understand shared symbols or protocol definitions.
- `history.ts` — understand the undo/redo mechanism.
- `solver.ts` — skim for its public API surface (what it exports, what it consumes).
- `snap.ts` — understand snap point resolution.
- `units.ts` — understand unit conversion and coordinate semantics.

### `src/state/`
Read:
- `app-state.ts` — fully. Document every exported signal and every exported mutator
  function. Note which signals are derived (computed) vs. root signals.
- `preferences.ts` — understand what user preferences are persisted and how.

### `src/canvas/`
Read:
- `renderer.ts` — understand the render loop entry point and orchestration.
- `viewport.ts` — understand the pan/zoom transform and world↔screen conversion.
- `draw-helpers.ts` — skim for the exported draw functions and what entity types they
  handle. Note the total line count (flag if >300 LOC per the existing rule).
- `render-helpers.ts` — understand what rendering utilities it provides.
- `canvas-component.tsx` — understand how it bridges Preact to the Canvas 2D API and
  what DOM events it handles.

### `src/tools/`
Read:
- `tool.ts` — understand the `Tool` interface definition.
- `tool-registry.ts` — understand how tools are registered and activated.
- `select-tool.ts` — skim. Note line count (flag if >300 LOC).
- `wall-tool.ts` — skim.
- At least 2 other tools to understand the pattern.

### `src/ui/`
Skim the following to understand the component hierarchy:
- `app.tsx` (at `src/`), `main.tsx` — understand the Preact component tree root.
- `toolbar.tsx` — note line count (flag if >300 LOC).
- `status-bar.tsx`, `command-line.tsx`, `navigation-bar.tsx` — understand their roles.
- `properties/` subdirectory — list its contents.

### `src/io/`
Read:
- `file-io.ts` — understand load/save operations.
- `serialize.ts` — understand the serialization contract.
- `export-svg.ts`, `export-png.ts`, `export-dxf.ts` — note what each exports.
- `renderer-interface.ts` — understand the abstraction for rendering backends.
- `entity-renderers.ts` — understand how entities are rendered for export.

---

## Step 1.3 — Dependency Direction Mapping

Based on your reading, construct a directed dependency graph between the 6 modules
(`core`, `state`, `canvas`, `tools`, `ui`, `io`). For each module pair A→B, note if
module A imports from module B.

The **intended** (clean) dependency direction for this architecture is:

```
ui  ──►  state  ──►  core
canvas ──►  state  ──►  core
tools  ──►  state  ──►  core
tools  ──►  core
io     ──►  core
io     ──►  state   (acceptable for reading active page)
canvas ──►  core
ui     ──►  core    (acceptable for types only)
```

Any edge **not** in this list is a potential violation. Note all actual edges that
exist and flag any that deviate from the intended graph.

Use targeted `grep_search` calls to spot-check imports. For example:
- Search `src/core/` for imports containing `'../state'`, `'../ui'`, `'../canvas'`,
  `'../tools'` — these would be upward violations.
- Search `src/state/` for imports containing `'../ui'`, `'../canvas'`, `'../tools'`.

---

## Step 1.4 — Cross-Cutting Concerns

Identify:
- **Shared Types**: Are entity types defined in `core/types.ts` and imported everywhere,
  or do duplicates exist?
- **Error Handling**: Is there a consistent pattern for error handling (try/catch, result
  types, thrown exceptions)?
- **Test Coverage**: Which modules have co-located test files (`*.test.ts`)? Which do not?
- **File Size Hotspots**: Which files exceed 300 LOC? (Per existing rule in
  `general-coding-standards.md`.)

---

## Output

Hold all findings from Steps 1.1–1.4 in memory as structured data. You will pass this
to Stages 2, 3, and 4.

Print to console:
- Tech stack summary (5–10 bullet points)
- Module map with a one-line responsibility description per module
- Any immediately obvious anomalies (e.g., circular imports spotted during grep)
