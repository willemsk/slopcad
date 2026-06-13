---
trigger: always_on
glob: "package.json, vite.config.ts, src/**/*"
description: "Strict technology stack constraints and rules."
---

# App Tech Stack

This project uses a highly specific and constrained tech stack to maintain simplicity, speed, and local performance.

## Strict Technology Constraints

- **Runtime**: Browser only. No Node.js server, no Server-Side Rendering (SSR).
- **Framework**: Preact 10.x with the `h` pragma. **Do NOT use React**.
- **State Management**: `@preact/signals`.
  - Use signals for *all* shared and global state (e.g., `app-state.ts`).
  - **Do NOT** use `useState`, `useReducer`, or Context API for global state.
  - `useState` or `useSignal` is only acceptable for localized, ephemeral UI state (like an accordion open/close toggle).
- **Styling**: Vanilla CSS with CSS custom properties (variables). 
  - **Do NOT** use CSS-in-JS, TailwindCSS, SCSS, or UI component libraries. Keep it lean.
- **Bundler**: Vite 8.x with `@preact/preset-vite`.
- **Canvas / Rendering**: HTML5 Canvas 2D API (`CanvasRenderingContext2D`).
  - **Do NOT** use WebGL, Three.js, PixiJS, or SVG for the main drawing surface.
- **Formatting**: `gts` (Google TypeScript Style).
- **Testing**: Vitest.
- **Package Management**: npm.
