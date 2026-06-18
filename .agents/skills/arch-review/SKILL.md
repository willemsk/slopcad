---
name: arch-review
description: >-
  Executes a multi-stage architectural analysis, critique, and documentation
  workflow for the Antigravity CAD codebase. Produces living documentation in
  docs/ and enforcing agent rules in .agents/rules/. Trigger when the user asks
  for an architectural review, architecture analysis, arch-review, or /arch-review.
---

# `/arch-review` — Architectural Analysis Pipeline

## Overview

This skill runs a sequential 4-stage pipeline that analyses the current state of the
codebase, critiques its architecture against established design principles, generates
or updates living documentation in `docs/`, and distils structural invariants into
enforceable agent rules in `.agents/rules/`.

**Scope of critique**: Flag only *significant* architectural concerns — layer boundary
violations, tight coupling between distinct domains, leaky abstractions, framework
anti-patterns, circular dependencies, and violations of SOLID/SoC. Do not flag minor
style nits that are already handled by `gts` or existing rules.

**Rule 0 — do NOT skip stages.** Execute every stage in order. Report progress to the
user with a clearly formatted header before starting each stage.

---

## Execution Workflow

### Before Starting

Print the following banner to orient the user:

```
╔══════════════════════════════════════════════════╗
║         /arch-review  —  Antigravity CAD         ║
║   Multi-Stage Architectural Analysis Pipeline    ║
╚══════════════════════════════════════════════════╝
```

Then check whether a `docs/` directory already exists at the project root.
Store this as a boolean (`IS_FIRST_RUN`) — you will use it in Stage 3.

---

### Stage 1 — Context & Tech Stack Discovery

> **Console output**: `[Stage 1/4] 🔍 Context & Tech Stack Discovery...`

Read the full instructions from:
`C:\Users\kheri\Documents\antigravity\quirky-lavoisier\.agents\skills\arch-review\references\stage1-discovery.md`

Execute every instruction in that file. At the end of Stage 1, you must hold an
internal summary (your working memory) that covers:

- The full tech stack (runtime, framework, state library, bundler, test runner, linter).
- A map of all `src/` modules with their responsibilities and dependency directions.
- A list of all architectural layers and the entities they own.
- Any cross-cutting concerns (e.g., shared types, utilities) and where they live.

Print a brief human-readable summary of the discovered stack when Stage 1 is complete.

---

### Stage 2 — Rigorous Architectural Critique

> **Console output**: `[Stage 2/4] 🏗️  Rigorous Architectural Critique...`

Read the full instructions from:
`C:\Users\kheri\Documents\antigravity\quirky-lavoisier\.agents\skills\arch-review\references\stage2-critique.md`

Execute every instruction in that file. At the end of Stage 2, you must hold an
internal structured critique — a list of findings, each with:

- **ID**: Short identifier (e.g., `CRIT-001`)
- **Severity**: `Critical` | `Warning` (no lower severities)
- **Layer / File**: Where the issue originates
- **Description**: Concise explanation of the violation
- **Principle Violated**: (e.g., "SoC", "SRP", "DIP", "DRY", "Open/Closed")

Print the total number of Critical and Warning findings to the console when Stage 2
is complete.

---

### Stage 3 — Living Documentation

> **Console output**: `[Stage 3/4] 📄 Managing Living Documentation (docs/)...`

Read the full instructions from:
`C:\Users\kheri\Documents\antigravity\quirky-lavoisier\.agents\skills\arch-review\references\stage3-docs.md`

Pass `IS_FIRST_RUN` and the full Stage 1 + Stage 2 results to this stage.

Execute every instruction in that file. When complete, report to the user which files
were created or updated and whether any architectural regressions were detected.

---

### Stage 4 — Agent Rule Generation

> **Console output**: `[Stage 4/4] 📐 Generating Agent Rules (.agents/rules/)...`

Read the full instructions from:
`C:\Users\kheri\Documents\antigravity\quirky-lavoisier\.agents\skills\arch-review\references\stage4-rules.md`

Execute every instruction in that file. When complete, report which rule files were
created or updated.

---

### Final Report

After all 4 stages, print a summary to the user:

```
╔══════════════════════════════════════════════════╗
║               /arch-review  COMPLETE             ║
╠══════════════════════════════════════════════════╣
║  Stage 1: Tech stack mapped ✓                    ║
║  Stage 2: N Critical, M Warning findings         ║
║  Stage 3: X docs file(s) written/updated         ║
║  Stage 4: Y rule file(s) written/updated         ║
╚══════════════════════════════════════════════════╝
```

Fill in N, M, X, Y with the actual counts from each stage.

---

## Common Mistakes

- **Skipping reading the reference files**: Each stage's reference file contains
  mandatory instructions. You MUST read and follow them. Do not improvise the pipeline
  from memory.
- **Fabricating findings**: Only report architectural findings you can substantiate by
  reading actual source files. Do not invent issues.
- **Aspirational documentation**: Stage 3 documents *current reality*, never future
  intentions or ideals. If a pattern is aspirational, mark it as such explicitly.
- **Overwriting existing rules**: Stage 4 generates only `arch-`-prefixed files.
  Never modify or delete existing rule files not prefixed with `arch-`.
