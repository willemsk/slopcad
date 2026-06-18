---
generated_by: /arch-review
generated_at: 2026-06-18T20:41:00Z
project_name: quirky-lavoisier
total_critical: 8
total_warning: 5
new_findings: N/A - first run
resolved_findings: N/A - first run
regressions: N/A - first run
---

# Architectural Findings

## Summary

- **Critical**: 8 finding(s)
- **Warning**: 5 finding(s)
- **New since last run**: N/A - first run
- **Resolved since last run**: N/A - first run
- **Regressions**: N/A - first run

## Critical Findings

### CRIT-001 — Core domain layer imports from higher layers
- **Severity**: Critical
- **File(s)**: `src/core/commands.ts`
- **Principle**: DIP (Dependency Inversion Principle)
- **Check**: U1a
- **Detail**: The core module is the foundation of the architecture and must remain pure. `commands.ts` imports `setActiveToolByName` from `../tools/tool-registry` and state actions from `../state/app-state`. This violates the intended layering and creates tight coupling from the domain to the application UI/tools.

### CRIT-002 — State management layer imports rendering and IO details
- **Severity**: Critical
- **File(s)**: `src/state/app-state.ts`
- **Principle**: SoC (Separation of Concerns)
- **Check**: U1b
- **Detail**: The global state store imports `Viewport` from `../canvas/viewport` and functions from `../io/file-io`. State orchestration should remain ignorant of how rendering is performed or how serialization is implemented. This breaks modularity.

### CRIT-003 — Massive file size and SRP violation in Canvas rendering
- **Severity**: Critical
- **File(s)**: `src/canvas/draw-helpers.ts` (1033 lines)
- **Principle**: SRP (Single Responsibility Principle)
- **Check**: U2a
- **Detail**: At 1033 lines, this is the largest file in the codebase and massively exceeds the 300-line limit. It concentrates all low-level Canvas2D rendering for every entity type. It needs to be split per entity type (e.g., `draw-walls.ts`, `draw-entities.ts`).

### CRIT-004 — God-object anti-pattern in global state
- **Severity**: Critical
- **File(s)**: `src/state/app-state.ts` (870 lines)
- **Principle**: SRP (Single Responsibility Principle)
- **Check**: U2a / U2b
- **Detail**: This file concentrates all application state (signals) and all mutation functions in a single location, growing to 870 lines. It handles entity CRUD, selection, UI toggles, undo/redo, file operations, and more. It should be decomposed into focused state slices.

### CRIT-005 — Oversized constraint solver module
- **Severity**: Critical
- **File(s)**: `src/core/solver.ts` (655 lines)
- **Principle**: SRP (Single Responsibility Principle)
- **Check**: U2a
- **Detail**: Exceeding the 300-line limit by over double, this file contains a monolithic `switch` statement for resolving every constraint type. Constraint logic should be extracted into separate handlers to keep the core solver engine maintainable.

### CRIT-006 — Oversized UI Toolbar component
- **Severity**: Critical
- **File(s)**: `src/ui/toolbar.tsx` (646 lines)
- **Principle**: SRP (Single Responsibility Principle)
- **Check**: U2a
- **Detail**: This React component exceeds the 300-line limit, containing inline definitions for all toolbar tabs, tool groups, and rendering logic. Data definitions should be extracted to a separate configuration or registry.

### CRIT-007 — Monolithic Canvas component
- **Severity**: Critical
- **File(s)**: `src/canvas/canvas-component.tsx` (550 lines)
- **Principle**: SRP (Single Responsibility Principle)
- **Check**: U2a
- **Detail**: The canvas component handles rendering orchestration, input event listening (mouse/keyboard), snapping, and tool dispatch. Snap logic is duplicated four times within it.

### CRIT-008 — Oversized Selection Tool logic
- **Severity**: Critical
- **File(s)**: `src/tools/select-tool.ts` (455 lines)
- **Principle**: SRP (Single Responsibility Principle)
- **Check**: U2a
- **Detail**: Exceeding the size limit, this tool manages an overly complex state machine (idle, dragging, box-select, resize) along with inline hit-testing. Hit-testing should be extracted to a shared core utility.

## Warning Findings

### WARN-001 — Untested critical modules
- **Severity**: Warning
- **File(s)**: `src/canvas/`, `src/io/`, `src/ui/`
- **Principle**: Testability
- **Check**: U4a
- **Detail**: There are zero functional tests for the canvas rendering pipeline, UI components, and IO serialization/export logic. A defect in these areas will only be caught manually.

### WARN-002 — Duplicated rendering logic
- **Severity**: Warning
- **File(s)**: `src/canvas/draw-helpers.ts` and `src/io/entity-renderers.ts`
- **Principle**: DRY (Don't Repeat Yourself)
- **Check**: U5a
- **Detail**: Entity visual representation logic is duplicated between Canvas2D and SVG export. Any visual change to an entity must be updated in both places, risking visual divergence.

### WARN-003 — Pervasive type safety bypasses
- **Severity**: Warning
- **File(s)**: `src/core/solver.ts`, `src/tools/select-tool.ts`, etc.
- **Principle**: Type Safety
- **Check**: None (Type safety)
- **Detail**: Extensive use of `as any` casts to access properties on discriminated unions (e.g., `(entity as any).start`). This bypasses the centralized typing defined in `types.ts` and is a significant bug vector.

### WARN-004 — Sparse test coverage relative to complexity
- **Severity**: Warning
- **File(s)**: `src/state/app-state.ts`, `src/core/solver.ts`
- **Principle**: Testability
- **Check**: U4b
- **Detail**: `app-state.ts` has 870 lines but its test file has only 4 assertions. `solver.ts` is 655 lines but tests only cover 5 out of 10 constraints. Coverage is insufficient for their complexity.

### WARN-005 — Minor oversized file
- **Severity**: Warning
- **File(s)**: `src/ui/icons.tsx` (333 lines)
- **Principle**: SRP (Single Responsibility Principle)
- **Check**: U2a
- **Detail**: Just over the 300-line threshold. Could easily be split into logical icon groups.

## Resolved Findings (since previous run)

N/A - first run
