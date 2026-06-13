---
trigger: always_on
glob: "*.test.ts, *.test.tsx, src/core/**/*"
description: "Testing best practices using Vitest."
---

# Testing Standards

## Testing Framework
- We use **Vitest** for all automated testing. It integrates seamlessly with our Vite + Preact setup.

## Testing Strategy

### 1. Unit Tests (Core Logic)
- **Target**: `src/core/` contains pure functions (geometry math, solver, serialization, snapping). These must be heavily unit-tested.
- **Location**: Co-locate test files next to the source file they are testing (e.g., `src/core/geometry.test.ts` next to `src/core/geometry.ts`).
- **Structure**: Use standard BDD block structure:
  ```typescript
  import { describe, it, expect } from 'vitest';
  
  describe('dist()', () => {
    it('should calculate the Euclidean distance between two points', () => {
      // arrange, act, assert
    });
  });
  ```

### 2. Integration Tests (Tools & State)
- **Target**: `src/tools/` (Tool state machines).
- **Approach**: Mock the canvas context and browser `MouseEvent`s, and verify that sending a sequence of `onMouseDown` / `onMouseMove` / `onMouseUp` events results in the correct mutations to `app-state.ts`.

### 3. Visual & Component Testing constraints
- **No Canvas Snapshot Tests**: Do not use image snapshotting for canvas output. Canvas pixel rendering is highly environment-dependent and leads to flaky tests.
- **UI Components**: Keep UI tests lightweight. Focus on testing whether clicking a ribbon button properly dispatches the correct command or updates a signal, rather than deep-rendering the entire canvas.
