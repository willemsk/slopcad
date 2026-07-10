---
trigger: glob
description: "General language-agnostic coding best practices."
globs: **/*.ts, **/*.tsx, **/*.js, **/*.css
---

# General Coding Standards

## Formatting & Linting
- **Formatter & Linter**: Use Biome.
- Always run `npm run fix` before committing or finalizing code changes.

## TypeScript Rules
- **Strict Mode**: TypeScript strict mode is enabled.
- **No `any`**: Avoid `any`. If absolutely necessary, add an inline comment (e.g., `// biome-ignore lint/suspicious/noExplicitAny: explanation`) explaining *why*.
- **Exports**: Use **named exports** exclusively. Avoid `default` exports to ensure easier refactoring and predictable imports.

## Architecture & Code Design
- **Pure Functions**: Prefer pure functions where possible, especially in `src/core/` and `src/canvas/draw-helpers.ts`. Confine side effects to boundaries (event handlers in tools, UI interaction, or specific state-mutation functions).
- **File Size limit**: Keep files under ~300 lines of code. Extract logic into smaller, focused modules if a file grows too large.
- **Function Signatures**: If a function takes more than 2 parameters (especially booleans or optional values), use an options object interface.

## Naming Conventions
- Variables, functions, methods: `camelCase`.
- Types, Interfaces, Classes, Preact Components: `PascalCase`.
- Global constants: `UPPER_SNAKE_CASE`.