# SlopCAD Documentation

Welcome to the documentation for **SlopCAD** (formerly Antigravity CAD), a browser-based 2D architectural plan editor. SlopCAD is designed to be a lightweight, highly responsive, fully local CAD tool inspired by the aesthetics and layout of AutoCAD.

It runs entirely in the browser with no backend, database, authentication, or network calls (except for static assets), ensuring your designs remain private, fast, and local.

---

## 🚀 Getting Started

If you are new to SlopCAD, start with our guides to learn the basics:

*   [**User Guide**](user-guide/index.md): Discover how to draw walls, doors, windows, and export your drawings.
*   [**Developer Guide**](developer-guide/index.md): Explore the system architecture, state management, rendering pipeline, and how to contribute.
*   [**API Reference**](api/index.md): Browse auto-generated TypeScript API documentation directly from the source code.

---

## ✨ Key Features

*   **Autodesk-Like Interface**: Command-line integration, dark theme, UCS icon, and status bar.
*   **Architectural Primitives**: Dedicated tools for drawing Walls (with thickness), Doors, Windows, Stairs, and basic geometric entities.
*   **Parametric Constraints**: Align entities with parallel, perpendicular, horizontal, vertical, and fixed length constraints.
*   **Fully Local**: Save files directly to local `.json` project files or export to clean SVG vectors.
