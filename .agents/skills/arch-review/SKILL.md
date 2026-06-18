---
name: arch-review
description: >-
  Executes a multi-stage architectural analysis, critique, and documentation
  workflow for any codebase. Dynamically discovers the project's language,
  framework, and domain, then produces living documentation in docs/ and
  enforceable agent rules in .agents/rules/. Trigger when the user asks for an
  architectural review, architecture analysis, arch-review, or /arch-review.
---

# `/arch-review` — Architectural Analysis Pipeline

## Overview

This skill runs a sequential 4-stage pipeline that dynamically adapts to the
project's language, framework, and domain. It:

1. **Discovers** the tech stack, module structure, and architectural boundaries.
2. **Critiques** the architecture against universal and framework-specific
   design principles.
3. **Generates or updates** living documentation in `docs/`.
4. **Distils** structural invariants into enforceable agent rules in
   `.agents/rules/`.

The skill is **project-agnostic** — it works on any codebase (TypeScript,
Python, Rust, Go, etc.) by deriving all analysis from what it actually finds
in the repository.

**Scope of critique**: Flag only *significant* architectural concerns — layer
boundary violations, tight coupling, leaky abstractions, framework-specific
anti-patterns, circular dependencies, and SOLID/SoC violations. Do not flag
minor style nits already handled by project linters.

**Rule 0 — do NOT skip stages.** Execute every stage in order. Report progress
to the user with a clearly formatted header before starting each stage.

---

## Execution Workflow

### Before Starting

Print the following banner:

```
╔══════════════════════════════════════════════════╗
║         /arch-review  —  Architecture Pipeline   ║
║   Adaptive Multi-Stage Codebase Analysis         ║
╚══════════════════════════════════════════════════╝
```

Then perform these setup checks:

1. **`IS_FIRST_RUN`**: Check whether a `docs/` directory exists at the project
   root. If not, set `IS_FIRST_RUN = true`.
2. **`HAS_PREVIOUS_RUN`**: Check whether `docs/.arch-review/discovery.md` and
   `docs/.arch-review/findings.md` exist. If both exist, set
   `HAS_PREVIOUS_RUN = true`. This is used for regression detection in Stages
   2–3.

---

### Stage 1 — Context & Tech Stack Discovery

> **Console output**: `[Stage 1/4] 🔍 Context & Tech Stack Discovery...`

Read the full instructions from:
`.agents/skills/arch-review/references/stage1-discovery.md`

Execute every instruction in that file. At the end of Stage 1 you must have:

- Written `docs/.arch-review/discovery.md` — a structured Markdown file with
  YAML frontmatter containing the tech stack record, module map, dependency
  graph, and cross-cutting concerns.
- Printed a brief human-readable tech stack summary to the console.

**Optional parallelism**: If the project has many modules (>5 top-level
directories under the source root), you MAY dispatch read-only subagents to
scan different module directories concurrently, then merge their results into
the discovery artifact. This is optional — sequential execution is fine for
smaller projects.

---

### Stage 2 — Rigorous Architectural Critique

> **Console output**: `[Stage 2/4] 🏗️  Rigorous Architectural Critique...`

Read the full instructions from:
`.agents/skills/arch-review/references/stage2-critique.md`

This stage reads `docs/.arch-review/discovery.md` as its input. If
`HAS_PREVIOUS_RUN = true`, it also reads the previous
`docs/.arch-review/findings.md` to enable regression detection.

Execute every instruction. At the end of Stage 2 you must have:

- Written `docs/.arch-review/findings.md` — a structured Markdown file with
  YAML frontmatter containing all findings with IDs, severities, and details.
- Printed the count of Critical and Warning findings to the console.
- If `HAS_PREVIOUS_RUN = true`, printed the count of new findings,
  resolved findings, and regressions.

---

### Stage 3 — Living Documentation

> **Console output**: `[Stage 3/4] 📄 Managing Living Documentation (docs/)...`

Read the full instructions from:
`.agents/skills/arch-review/references/stage3-docs.md`

This stage reads both `docs/.arch-review/discovery.md` and
`docs/.arch-review/findings.md` as its inputs. It uses `IS_FIRST_RUN` to
decide whether to create or update documents.

Execute every instruction. When complete, report which files were created or
updated and whether any regressions were detected.

---

### Stage 4 — Agent Rule Generation

> **Console output**: `[Stage 4/4] 📐 Generating Agent Rules (.agents/rules/)...`

Read the full instructions from:
`.agents/skills/arch-review/references/stage4-rules.md`

This stage reads `docs/.arch-review/discovery.md` and
`docs/.arch-review/findings.md` as inputs, and also reads ALL existing
`.agents/rules/*.md` files for the non-contradiction check.

Execute every instruction. When complete, report which rule files were created
or updated, and flag any rules that were blocked due to contradiction.

---

### Final Report

After all 4 stages, print a summary:

```
╔══════════════════════════════════════════════════╗
║             /arch-review  COMPLETE               ║
╠══════════════════════════════════════════════════╣
║  Stage 1: Tech stack discovered ✓                ║
║  Stage 2: N Critical, M Warning findings         ║
║  Stage 3: X doc(s) written/updated               ║
║  Stage 4: Y rule(s) written/updated              ║
╚══════════════════════════════════════════════════╝
```

Fill in N, M, X, Y with the actual counts from each stage.

---

## Intermediate Artifacts

The pipeline persists structured data between stages (and across runs) in
`docs/.arch-review/`:

| File | Written By | Read By | Purpose |
|------|-----------|---------|---------|
| `discovery.md` | Stage 1 | Stages 2, 3, 4 | Tech stack, modules, dependency graph |
| `findings.md` | Stage 2 | Stages 3, 4 | Structured critique findings |

These files use Markdown with YAML frontmatter. They are human-readable, git-
diffable, and designed to be committed to version control for regression
tracking across runs.

---

## Common Mistakes

- **Skipping the reference files**: Each stage's reference file contains
  mandatory instructions. You MUST read and follow them. Do not improvise.
- **Fabricating findings**: Only report findings you can substantiate by
  reading actual source files. Do not invent issues.
- **Aspirational documentation**: Stage 3 documents *current reality*, never
  future intentions. If a pattern is aspirational, mark it explicitly.
- **Overwriting existing rules**: Stage 4 generates only `arch-`-prefixed
  files. Never modify or delete existing rule files not prefixed with `arch-`.
- **Contradicting existing rules**: Stage 4 must read all existing rules and
  verify no auto-generated rule contradicts them. Block contradicting rules.
- **Hardcoding project specifics**: All analysis must derive from what Stage 1
  actually discovers. Never assume a specific framework, language, or structure.
