# Stage 1 — Context & Tech Stack Discovery

## Goal

Build a complete, project-agnostic model of the codebase's tech stack, module
structure, and architectural layers. This is purely a *read* stage — no project
source files are created or modified. The only write is the discovery artifact.

All instructions below are generic. Do NOT assume any specific language,
framework, or directory structure. Discover everything dynamically.

---

## Step 1.1 — Package Manifest & Configuration Discovery

Search the project root for package manifests and configuration files. Common
examples (adapt to whatever you actually find):

| Ecosystem | Manifests | Config Files |
|-----------|-----------|-------------|
| Node.js / TypeScript | `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` | `tsconfig*.json`, `vite.config.*`, `webpack.config.*`, `next.config.*`, `.babelrc`, `rollup.config.*` |
| Python | `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements*.txt`, `Pipfile`, `poetry.lock` | `tox.ini`, `pytest.ini`, `.flake8`, `mypy.ini`, `ruff.toml` |
| Rust | `Cargo.toml`, `Cargo.lock` | `.cargo/config.toml` |
| Go | `go.mod`, `go.sum` | `Makefile`, `.golangci.yml` |
| Java / Kotlin | `build.gradle`, `pom.xml`, `build.gradle.kts` | `settings.gradle`, `gradle.properties` |
| C# / .NET | `*.csproj`, `*.sln`, `Directory.Build.props` | `global.json`, `nuget.config` |

**For each manifest found**, extract:
- All runtime dependencies and their versions.
- All dev/build dependencies and their versions.
- Categorise each dependency: `runtime-framework`, `state-management`,
  `database/ORM`, `API-framework`, `bundler`, `test-runner`,
  `linter/formatter`, `types`, or `other`.

**For each config file found**, extract:
- Compiler/interpreter options (strict mode, target, module system).
- Build tool plugins, presets, and aliases.
- Any module path aliases or custom resolution rules.

Produce an internal **Tech Stack Record**:
- `language`: Language name and version constraint
- `framework`: Primary framework (if any) and version
- `stateLibrary`: State management library (if any)
- `database`: Database or ORM (if any)
- `apiFramework`: API/routing framework (if any)
- `bundler`: Build tool / bundler (if any)
- `testRunner`: Test framework (if any)
- `linter`: Linter / formatter (if any)
- `runtimeEnvironment`: Browser-only / Node.js / SSR / CLI / Desktop / Mobile
- `packageManager`: npm / pnpm / yarn / pip / cargo / etc.

---

## Step 1.2 — Source Directory Walk

Identify the primary source root (e.g., `src/`, `app/`, `lib/`, `pkg/`, or
project root for some Python/Go projects). List its top-level subdirectories.

For each subdirectory (these are your **modules** / **architectural layers**):

1. List all files and note the largest files by size (as a complexity proxy).
2. Read the 3–5 most important files to understand the module's purpose:
   - Entry points, index/barrel files, or `__init__.py` files.
   - Type/model definitions.
   - The largest file (often the core logic).
3. Determine the module's **responsibility** in one sentence.
4. Note what the module **owns** (data types, state, routes, etc.).
5. Note what the module must **never** contain (based on its responsibility).

**File size hotspots**: Note all files exceeding 300 lines of code. These are
SRP candidates for Stage 2.

**Test file inventory**: For each module, note which source files have co-located
or parallel test files, and which do not. Note the testing convention used
(co-located `*.test.ts`, parallel `tests/` directory, `*_test.go`, etc.).

---

## Step 1.3 — Dependency Direction Mapping

Construct a directed dependency graph between all discovered modules. For each
module pair A→B, verify whether module A imports from module B.

**Method**: Use `grep_search` to scan import/require/use statements in each
module directory. Adapt the patterns to the project's language:

| Language | Import Patterns to Search |
|----------|--------------------------|
| TypeScript / JavaScript | `from '../moduleB'`, `require('../moduleB')`, `import('../moduleB')` |
| Python | `from moduleB import`, `import moduleB` |
| Rust | `use crate::module_b`, `mod module_b` |
| Go | `import "project/moduleB"` |

Classify each edge as:
- **Expected**: Follows a clean layering (e.g., UI → state → core).
- **Acceptable**: A pragmatic shortcut with a documented reason.
- **Violation**: Breaks the intended layering (e.g., core → UI).

To determine "intended layering," look for clues:
1. Existing `.agents/rules/` files that document module boundaries.
2. Naming conventions (e.g., `core/`, `domain/`, `models/` suggest a pure layer).
3. Common architectural patterns for the discovered framework.
4. README or docs files describing the architecture.

If no explicit layering is documented, infer it from the dependency structure
and flag modules with bidirectional dependencies as potential violations.

---

## Step 1.4 — Cross-Cutting Concerns

Identify:
- **Shared Types / Models**: Where are the canonical type definitions? Are they
  centralised or duplicated across modules?
- **Error Handling**: Is there a consistent pattern (exceptions, Result types,
  error codes, HTTP status returns)? Or is it ad-hoc?
- **Configuration**: How is config managed (env vars, config files, hardcoded)?
- **Logging**: Is there a logging abstraction or are console/print calls scattered?
- **Test Coverage Patterns**: Which modules are well-tested vs. untested?
- **Existing Documentation**: Are there existing docs in `docs/`, `README.md`,
  or inline JSDoc / docstrings?

---

## Step 1.5 — Framework-Specific Patterns

Based on the discovered framework, identify the project's key patterns:

**For UI frameworks** (React, Preact, Vue, Svelte, Angular):
- State management approach (signals, hooks, stores, services).
- Component hierarchy and composition patterns.
- Rendering pipeline (Canvas, SVG, DOM, WebGL).
- Styling approach (CSS modules, CSS-in-JS, Tailwind, vanilla).

**For backend frameworks** (Django, Flask, Express, FastAPI, Rails, Spring):
- Request/response pipeline (middleware, decorators, filters).
- Data access layer (ORM, raw SQL, repository pattern).
- Business logic location (fat models, services, use-cases).
- API structure (REST, GraphQL, RPC).

**For CLI / library projects**:
- Public API surface.
- Plugin / extension architecture.
- Entry point(s) and command structure.

Record these patterns — they inform the framework-specific checks in Stage 2
and the document selection in Stage 3.

---

## Output — Discovery Artifact

Write the file `docs/.arch-review/discovery.md` with this structure:

```markdown
---
generated_by: /arch-review
generated_at: [CURRENT_ISO_TIMESTAMP]
project_name: [INFERRED_PROJECT_NAME]
language: [LANGUAGE]
framework: [FRAMEWORK]
runtime: [RUNTIME_ENVIRONMENT]
---

# Architecture Discovery

## Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
[One row per tech stack item]

## Module Map

| Module | Path | Responsibility | Key Files | Owns | Must Not Contain |
|--------|------|---------------|-----------|------|-----------------|
[One row per discovered module]

## Dependency Graph

### Edges
[List all directed edges: `module_a -> module_b (expected|acceptable|violation)`]

### Intended Layering
[Describe the inferred or documented clean layering for this project]

## Cross-Cutting Concerns

### Shared Types
[Location and approach]

### Error Handling
[Pattern description]

### Test Coverage
| Module | Source Files | Test Files | Coverage Assessment |
|--------|-------------|------------|-------------------|
[One row per module]

### File Size Hotspots
| File | Lines | Flag |
|------|-------|------|
[All files exceeding 300 LOC]

## Framework-Specific Patterns
[Discovered patterns relevant to the detected framework]

## Document Archetypes Selected

Based on the discovered architecture, the following documentation files are
recommended for Stage 3:

- `ARCHITECTURE.md` (always)
- [List additional archetypes selected from the catalogue in Stage 3, e.g.:]
- `STATE_MANAGEMENT.md` (if state management library detected)
- `DATA_MODELS.md` (if ORM / entity types detected)
- `RENDERING_PIPELINE.md` (if canvas / rendering layer detected)
- `API_LAYER.md` (if API routing detected)
- `DATABASE_SCHEMA.md` (if database / ORM detected)

## Rule Archetypes Selected

Based on the discovered architecture, the following rule files are recommended
for Stage 4:

- `arch-layer-boundaries.md` (always)
- [List additional archetypes, e.g.:]
- `arch-state-patterns.md` (if state management library detected)
- `arch-naming-invariants.md` (if consistent naming patterns detected)
- `arch-api-contracts.md` (if API layer detected)
- `arch-data-access.md` (if database layer detected)
```

### Console Output

Print to the console:
- Tech stack summary (5–10 bullet points).
- Module map with one-line responsibility per module.
- Any immediately obvious anomalies (circular imports, missing tests, etc.).
- The selected document and rule archetypes for Stages 3 and 4.
