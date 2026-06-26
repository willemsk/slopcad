# Changelog

All notable changes to the Antigravity CAD project will be documented in this file.

---

### [CRIT-007] & [CRIT-008] — Decompose monolithic Canvas component and extract Selection hit-testing
- **Date**: 2026-06-26
- **Commit**: `e8c5fb9`
- **Files Changed**: 7 files, +481 insertions, -424 deletions
- **Tests**: ✅ 112 passed, 0 failed (Added new test suite `src/core/hit-test.test.ts`)
- **Details**: Refactored the monolithic `src/canvas/canvas-component.tsx` (which exceeded 550 lines) by decomposing it and separating concerns. Extracted mouse-based drag-to-pan/zoom viewport interactions into the `useViewportInteraction` hook, and keyboard listener interactions into the `useKeyboardShortcuts` hook. Deduplicated snapping logic using a central `computeEventSnap` helper function. Extracted selection hit-testing into a reusable core utility `src/core/hit-test.ts` (resolving CRIT-008) and integrated it into both the canvas component (hover detection) and `src/tools/select-tool.ts` (entity selection), keeping the canvas component under 290 lines.

<details>
<summary>Files</summary>

| Status | File |
|--------|------|
| Modified | `src/canvas/canvas-component.tsx` |
| Modified | `src/tools/select-tool.ts` |
| Added | `src/core/hit-test.ts` |
| Added | `src/core/hit-test.test.ts` |
| Added | `src/canvas/snap-helper.ts` |
| Added | `src/canvas/use-viewport-interaction.ts` |
| Added | `src/canvas/use-keyboard-shortcuts.ts` |

</details>

---

### [CRIT-006] — Decompose monolithic toolbar component into sub-components
- **Date**: 2026-06-26
- **Commit**: `da10f7b00d18dbe99f0b5c72c78329f77b35b183`
- **Files Changed**: 7 files, +661 insertions, -531 deletions
- **Tests**: ✅ Tests passed successfully
- **Details**: Refactored the monolithic `src/ui/toolbar.tsx` component (which exceeded 500 lines) by extracting individual tabs and tool groups into modular, standalone sub-components. Created dedicated sub-panels under `src/ui/toolbar/` and co-located an integration test file to ensure command dispatching and selection state synchronization works seamlessly.

<details>
<summary>Files</summary>

| Status | File |
|--------|------|
| Modified | `src/ui/toolbar.tsx` |
| Added | `src/ui/toolbar.test.tsx` |
| Added | `src/ui/toolbar/annotate-panel.tsx` |
| Added | `src/ui/toolbar/constraints-panel.tsx` |
| Added | `src/ui/toolbar/helpers.ts` |
| Added | `src/ui/toolbar/home-panel.tsx` |
| Added | `src/ui/toolbar/view-panel.tsx` |

</details>

---

### [CRIT-005] — Extract constraint solver into registry pattern with isolated handlers
- **Date**: 2026-06-20 to 2026-06-26
- **Commits**: 
  - `f2d3e8442e0c89629c1a12717b9e01b4013f3f96` (Improve type safety and zero-length fallback handling)
  - `189f136f7813cf061f15ab7681baf9deebef8246` (Extract solver into registry pattern with handlers and tests)
- **Files Changed**: 24 files, +1177 insertions, -544 deletions
- **Tests**: ✅ Core constraint solvers covered by comprehensive test suites
- **Details**: Extracted the solver logic from `src/core/solver.ts` which contained a massive `switch` statement for resolving every constraint type. Extracted each constraint resolver into a dedicated handler class/function under `src/core/constraints/` and registered them using a `ConstraintRegistry` pattern. Implemented strict type safety, resolved a zero-length fallback edge-case, and co-located unit tests for each individual constraint solver.

<details>
<summary>Files</summary>

| Status | File |
|--------|------|
| Modified | `src/core/solver.ts` |
| Added | `src/core/constraints/registry.ts` |
| Added | `src/core/constraints/types.ts` |
| Added | `src/core/constraints/coincident.ts` |
| Added | `src/core/constraints/coincident.test.ts` |
| Added | `src/core/constraints/collinear.ts` |
| Added | `src/core/constraints/collinear.test.ts` |
| Added | `src/core/constraints/equal-length.ts` |
| Added | `src/core/constraints/equal-length.test.ts` |
| Added | `src/core/constraints/fixed-angle.ts` |
| Added | `src/core/constraints/fixed-angle.test.ts` |
| Added | `src/core/constraints/fixed-length.ts` |
| Added | `src/core/constraints/fixed-length.test.ts` |
| Added | `src/core/constraints/horizontal.ts` |
| Added | `src/core/constraints/horizontal.test.ts` |
| Added | `src/core/constraints/parallel.ts` |
| Added | `src/core/constraints/parallel.test.ts` |
| Added | `src/core/constraints/perpendicular.ts` |
| Added | `src/core/constraints/perpendicular.test.ts` |
| Added | `src/core/constraints/vertical.ts` |
| Added | `src/core/constraints/vertical.test.ts` |

</details>

---

### [CRIT-004] — Decompose god-object global state store into focused slices
- **Date**: 2026-06-18 to 2026-06-20
- **Commits**:
  - `8f6916f86c2e8c2579df646d9f9640954b8344e6` (Fix state machine and add tests for state slices)
  - `7846803b7b58da97b4b59ab96e0d50c66c0d3ea7` (Refactor app-state.ts into smaller chunks)
- **Files Changed**: 53 files, +1252 insertions, -1026 deletions
- **Tests**: ✅ Added unit tests for each state slice to verify state mutations and transitions
- **Details**: Decomposed the monolithic `src/state/app-state.ts` (which had grown to over 800 lines handling all state management) into domain-focused sub-state slices under `src/state/` (e.g., selection, layers, project, viewport, ui). Created co-located tests for each state slice to ensure robust coverage, and updated consumer files to utilize the modular state structure.

<details>
<summary>Files</summary>

| Status | File |
|--------|------|
| Modified | `src/app.tsx` |
| Modified | `src/canvas/canvas-component.tsx` |
| Modified | `src/io/file-io.ts` |
| Modified | `src/state/app-state.ts` |
| Added | `src/state/constraint-actions.ts` |
| Added | `src/state/constraint-actions.test.ts` |
| Added | `src/state/layer-actions.ts` |
| Added | `src/state/layer-actions.test.ts` |
| Added | `src/state/project-state.ts` |
| Modified | `src/state/project-state.test.ts` |
| Added | `src/state/selection-state.ts` |
| Added | `src/state/selection-state.test.ts` |
| Added | `src/state/ui-state.ts` |
| Added | `src/state/ui-state.test.ts` |
| Added | `src/state/viewport-state.ts` |
| Modified | *Numerous other tool and UI files* |

</details>

---

### [CRIT-003] — Extract monolithic canvas renderer into individual modules
- **Date**: 2026-06-20
- **Commit**: `d7bb3e075cda74c54205ede16aa9d74cd005b851`
- **Files Changed**: 23 files, +1268 insertions, -1083 deletions
- **Tests**: ✅ Renderers unit tested and benchmarked
- **Details**: Extracted the massive monolithic drawing logic in `src/canvas/draw-helpers.ts` (exceeding 1000 lines) into individual, type-safe entity rendering modules under `src/canvas/renderers/`. Organized the rendering pipeline around a centralized `EntityRendererRegistry` matching the design principles. Introduced unit tests for renderers to establish coverage in the canvas module.

<details>
<summary>Files</summary>

| Status | File |
|--------|------|
| Modified | `.gitignore` |
| Deleted | `src/canvas/draw-helpers.ts` |
| Modified | `src/canvas/render-helpers.ts` |
| Added | `src/canvas/render-helpers.test.ts` |
| Modified | `src/canvas/renderer.ts` |
| Added | `src/canvas/types.ts` |
| Added | `src/canvas/renderers/registry.ts` |
| Added | `src/canvas/renderers/registry.test.ts` |
| Added | `src/canvas/renderers/shared.ts` |
| Added | `src/canvas/renderers/shared.test.ts` |
| Added | `src/canvas/renderers/arc-renderer.ts` |
| Added | `src/canvas/renderers/circle-renderer.ts` |
| Added | `src/canvas/renderers/constraint-renderer.ts` |
| Added | `src/canvas/renderers/dimension-renderer.ts` |
| Added | `src/canvas/renderers/door-renderer.ts` |
| Added | `src/canvas/renderers/line-renderer.ts` |
| Added | `src/canvas/renderers/rect-renderer.ts` |
| Added | `src/canvas/renderers/selection-renderer.ts` |
| Added | `src/canvas/renderers/snap-renderer.ts` |
| Added | `src/canvas/renderers/stairs-renderer.ts` |
| Added | `src/canvas/renderers/text-renderer.ts` |
| Added | `src/canvas/renderers/wall-renderer.ts` |
| Added | `src/canvas/renderers/window-renderer.ts` |

</details>

---

### [CRIT-001] & [CRIT-002] — Fix layer boundary violations
- **Date**: 2026-06-18
- **Commit**: `29aefac8fa75b1bf62ea54ab1f96b1063dc2519f`
- **Files Changed**: 21 files, +73 insertions, -58 deletions
- **Tests**: ✅ Build and existing unit tests verified
- **Details**: Cleaned up architectural layering boundary violations identified by the analysis tool.
  1. Resolved **CRIT-001**: Moved `commands.ts` from `src/core/` to `src/tools/` to eliminate upward dependency violations (core importing from tools and state layers).
  2. Resolved **CRIT-002**: Extracted browser/viewport-independent math functions from `src/canvas/viewport.ts` into a pure, domain-level utility `src/core/viewport-math.ts` so that state management remains decoupled from canvas rendering details.

<details>
<summary>Files</summary>

| Status | File |
|--------|------|
| Modified | `src/canvas/canvas-component.tsx` |
| Modified | `src/canvas/render-helpers.ts` |
| Modified | `src/canvas/renderer.ts` |
| Renamed | `src/canvas/viewport.ts` → `src/core/viewport-math.ts` |
| Modified | `src/state/app-state.ts` |
| Renamed | `src/core/commands.ts` → `src/tools/commands.ts` |
| Modified | `src/tools/tool-registry.ts` |
| Modified | `src/tools/tool.ts` |
| Modified | `src/ui/quick-access-toolbar.tsx` |
| Modified | `src/ui/toolbar.tsx` |
| Modified | *Various tool implementations to update imports* |

</details>
