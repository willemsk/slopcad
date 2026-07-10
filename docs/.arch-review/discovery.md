---
generated_by: /arch-review
generated_at: 2026-06-18T20:39:47Z
project_name: quirky-lavoisier
language: TypeScript
framework: Preact
runtime: Browser
---

# Architecture Discovery

## Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| runtime-framework | Preact | ^10.29.3 | UI rendering (no React) |
| state-management | @preact/signals | ^2.9.1 | Global state management |
| bundler | Vite | ^8.1.4 | Build tool with @preact/preset-vite |
| test-runner | Vitest | ^4.1.10 | Unit and integration testing |
| linter/formatter | Biome | ^1.9.4 | Formatter and Linter |
| types | TypeScript | ^5.6.3 | Strict mode enabled |
| packageManager | npm | - | - |

## Module Map

| Module | Path | Responsibility | Key Files | Owns | Must Not Contain |
|--------|------|---------------|-----------|------|-----------------|
| Core | `src/core/` | Framework-agnostic domain kernel | `types.ts`, `solver.ts`, `geometry.ts` | Entity types, 2D math, constraints, history, snapping | UI imports, DOM manipulation, framework code |
| State | `src/state/` | Single source of truth for app state | `app-state.ts`, `preferences.ts` | Global signals, entity/page/layer CRUD actions | Canvas rendering logic, UI components |
| Canvas | `src/canvas/` | 2D rendering pipeline and viewport | `canvas-component.tsx`, `draw-helpers.ts` | Canvas drawing, pan/zoom, event capture | Business logic, state mutations (directly) |
| Tools | `src/tools/` | Interactive state machines for user input | `select-tool.ts`, `wall-tool.ts`, `tool.ts` | Tool interface, mouse event handling | Rendering routines |
| UI | `src/ui/` | Non-canvas user interface | `toolbar.tsx`, `properties-panel.tsx` | Ribbon, command line, status bar, properties | Canvas drawing logic |
| IO | `src/io/` | File operations and export | `entity-renderers.ts`, `svg-renderer.ts` | Save/load JSON, SVG/PNG export | Global state management |

## Dependency Graph

### Edges
- `ui` -> `state` (expected)
- `canvas` -> `state` (expected)
- `tools` -> `state` (expected)
- `canvas` -> `core` (expected)
- `tools` -> `core` (expected)
- `state` -> `core` (expected)
- `io` -> `core` (expected)
- `core/commands.ts` -> `state` (violation)
- `core/commands.ts` -> `tools` (violation)
- `state` -> `canvas/viewport` (violation)
- `state` -> `io/*` (violation)

### Intended Layering
The intended clean layering follows: `UI / Canvas / Tools / IO` -> `State` -> `Core`. The `core` module should be a pure domain layer with no dependencies on higher layers. `state` should orchestrate application state without depending on rendering (`canvas`) or export details (`io`).

## Cross-Cutting Concerns

### Shared Types
Canonical type definitions (`Entity`, `Constraint`, `Page`, `Project`, etc.) are centralized in `src/core/types.ts`. However, there's pervasive use of `as any` casts when accessing discriminated union properties throughout the codebase, bypassing the type safety of this centralized model.

### Error Handling
Errors are mostly unhandled or implicit. `JSON.parse` is used for file I/O, and `window.alert`/`window.confirm` are used for user prompts (which is synchronous and blocks the thread).

### Test Coverage
| Module | Source Files | Test Files | Coverage Assessment |
|--------|-------------|------------|-------------------|
| Core | 9 | 4 | Partial. Missing tests for `entity.ts`, `snap.ts`, `commands.ts`, `symbols.ts`. `solver.ts` test only covers 5/10 constraints. |
| State | 2 | 1 | Very thin. Only 4 tests for an 870-line God object (`app-state.ts`). |
| Canvas | 5 | 1 | Missing. The only test is a benchmark. No functional rendering tests. |
| Tools | 12 | 7 | Good for drawing tools. Missing tests for registry, dimension, text, and stairs tools. |
| UI | 16 | 0 | None. Zero test files in the entire UI module. |
| IO | 9 | 0 | None. Zero test files in the IO module. |

### File Size Hotspots
| File | Lines | Flag |
|------|-------|------|
| `src/canvas/draw-helpers.ts` | 1033 | Major Violation |
| `src/state/app-state.ts` | 870 | Major Violation |
| `src/core/solver.ts` | 655 | Violation |
| `src/ui/toolbar.tsx` | 646 | Violation |
| `src/canvas/canvas-component.tsx` | 550 | Violation |
| `src/tools/select-tool.ts` | 455 | Violation |
| `src/ui/icons.tsx` | 333 | Minor Violation |

## Framework-Specific Patterns
- **State Management**: Uses `@preact/signals` for all global state. Avoids Context API and `useReducer`. Uses `signal` for mutable state and `computed` for derived state.
- **Component Hierarchy**: Follows a structured layout (`App` -> `Toolbar`, `CanvasComponent`, `StatusBar`, etc.). `CanvasComponent` is a monolithic adapter between Preact signals and the HTML5 Canvas 2D API.
- **Rendering**: Directly uses `CanvasRenderingContext2D` without abstraction layers like WebGL or PixiJS. `requestAnimationFrame` is used for the render loop. Screen-space overlays are drawn after `ctx.restore()`.

## Document Archetypes Selected
Based on the discovered architecture, the following documentation files are recommended for Stage 3:
- `ARCHITECTURE.md` (always)
- `STATE_MANAGEMENT.md` (for @preact/signals global state)
- `RENDERING_PIPELINE.md` (for the custom Canvas2D pipeline)
- `DATA_MODELS.md` (for the Entity/Constraint hierarchy)

## Rule Archetypes Selected
Based on the discovered architecture, the following rule files are recommended for Stage 4:
- `arch-layer-boundaries.md` (always)
- `arch-state-patterns.md` (for signals and decoupling the God object)
- `arch-rendering-invariants.md` (for canvas rendering rules and zoom independence)
- `arch-type-safety.md` (for enforcing strict union narrowing instead of `as any`)
