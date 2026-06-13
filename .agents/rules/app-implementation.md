---
trigger: glob
description: "Architecture, directory structure, and implementation rules."
globs: src/**/*
---

# App Implementation Rules

## Directory Structure & Ownership
- `src/core/` — Pure domain logic (geometry math, solver, types, units, snapping). **Zero UI or DOM imports.**
- `src/state/` — Global state management (`app-state.ts`). This is the single source of truth for the application.
- `src/canvas/` — The rendering pipeline:
  - `renderer.ts`: The main orchestrator/render loop.
  - `draw-helpers.ts`: Pure functions for drawing individual entity types.
  - `viewport.ts`: Pan and zoom transform matrix management.
  - `canvas-component.tsx`: The Preact component bridge handling mouse/keyboard DOM events.
- `src/tools/` — Interactive state machines. Each drawing/editing tool (e.g., `wall-tool.ts`, `select-tool.ts`) implements the `Tool` interface.
- `src/ui/` — Preact components building the app shell (Ribbon, Properties Panel, Command Line, Status Bar, Page Tabs).
- `src/io/` — Serialization, file I/O operations (JSON), and exports (SVG).

## Tool Pattern
- Tools are classes implementing the `Tool` interface (`src/tools/tool.ts`), defining handlers like `onMouseDown`, `onMouseMove`, `onMouseUp`, `onKeyDown`.
- Tools are registered in `src/tools/tool-registry.ts`.
- **State Mutation**: Tools must mutate state via functions exported from `app-state.ts` (e.g., `updateActivePage`, `snapshotState`). Tools must **never** directly mutate arrays.

## Rendering Rules (Hard-Won Lessons)
- **Zoom-Independent Widths**: When drawing entities in `draw-helpers.ts`, stroke widths must be divided by `viewport.zoom` to remain visually consistent (1–3px thick) on the screen.
- **Screen-Space Overlays**: Elements like the UCS indicator (origin axes) or selection tool handles are drawn in screen-space. This means they must be drawn **after** `ctx.restore()` in `renderer.ts`.
- **Hit-Testing**: When detecting mouse clicks on handles in a tool (e.g., `select-tool`), the hit radius must account for zoom (e.g., calculate `handleRadius` using `8 / viewportSignal.value.zoom`).

## Constraints & Solver
- The constraint solver (`src/core/solver.ts`) must run after positional mutations of constrained entities.
- Always call `runSolverOnActivePage()` from `app-state.ts` after a tool modifies an entity that participates in constraints.