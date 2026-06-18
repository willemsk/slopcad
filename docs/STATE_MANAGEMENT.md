# Quirky-Lavoisier — State Management

> Last reviewed: 2026-06-18

## Overview
Quirky-Lavoisier uses `@preact/signals` for all global state management. The state orchestration is centralized within `src/state/app-state.ts`, functioning as the single source of truth for the CAD application. It manages project data, active tools, selection state, UI toggles, and complex mutation operations.

## Signal Inventory

| Name | Type | Description |
|------|------|-------------|
| `projectSignal` | `signal<Project>` | Root project state (pages, layers, metadata). |
| `activeToolSignal` | `signal<Tool \| null>` | Currently active drawing tool. |
| `selectionSignal` | `signal<Set<string>>` | Selected entity IDs. |
| `viewportSignal` | `signal<any>` | Viewport instance (typed as any, technical debt). |
| `snapEnabledSignal` | `signal<boolean>` | Snap toggle. |
| `gridEnabledSignal` | `signal<boolean>` | Grid toggle. |
| `showConstraintsSignal` | `signal<boolean>` | Constraint visibility. |
| `gridSpacingSignal` | `signal<number>` | Grid spacing (m). |
| `previewEntitySignal` | `signal<Entity \| null>` | Preview entity for tool drawing. |
| `hoveredEntityIdSignal` | `signal<string \| null>` | Hover tracking. |
| `triggerRenderSignal` | `signal<{}>` | Manual render trigger (empty object bump). |
| `activePageSignal` | `computed<Page>` | Derives active page from projectSignal. |

## Mutator Functions

Mutations are performed through specific action functions rather than components modifying signals directly. 

| Name | Description | Side Effects |
|------|-------------|--------------|
| `updateActivePage` | Central page-state setter | Triggers history snapshot and render. |
| `snapshotState` | Captures state for undo/redo | Appends to HistoryManager. |
| `runSolverOnActivePage` | Executes constraints | Modifies entity geometries. |
| `deleteSelectedAction` | Handles cascading deletes | Removes entities and dependent constraints. |

## Persistence
State is saved locally using `localStorage`. An effect listens to changes on `projectSignal` and debounces a JSON serialization of the data to persist project state across reloads. Preference state is also synced to `localStorage`.

## Technical Debt

- **CRIT-004**: God-object anti-pattern in global state (`app-state.ts` is 870 lines and manages all domains).
- **CRIT-002**: State management layer imports rendering and IO details (violates SoC).
- **WARN-004**: Sparse test coverage relative to complexity (only 4 tests for 870 LOC).

## Revision History
| Date | Change |
|------|--------|
| 2026-06-18 | Initial generation |
