# SlopCAD Developer Guide

Welcome to the **SlopCAD** Developer Guide! This section is aimed at developers looking to understand the codebase, extend the tool, or build and run the documentation site.

---

## 🛠️ Codebase Overview

SlopCAD is built as a single-page application using Preact, Vite, and TypeScript. All CAD modeling math, viewport matrix coordinate translation, and drawing logic are built from scratch without massive heavy frameworks.

### Section Directories:
*   [**Architecture**](architecture.md): High-level system design, module responsibilities, and architectural boundaries.
*   [**State Management**](state-management.md): Details on `@preact/signals` flow, signal inventory, and mutator actions.
*   [**Rendering Pipeline**](rendering-pipeline.md): Canvas 2D render loop, coordinate system projection, and export handling.
*   [**Data Models**](data-models.md): Discriminated unions representing points, walls, dimensions, and pages.
*   [**Contributing & Setup**](contributing.md): Local development requirements, code styling (`gts`), and building documentation.
*   [**Changelog**](changelog.md): History of optimization passes, audits, and features.
