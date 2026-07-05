---
trigger: always_on
description: "Core understanding of the SlopCAD project, domain model, and application scope."
---

# App Foundation

## Project Overview
**SlopCAD** is a browser-based 2D architectural plan editor. It is designed to be a lightweight, highly responsive, fully local CAD tool inspired by the aesthetics and layout of AutoCAD.

## Scope & Constraints
- **Fully Local**: The application runs entirely in the browser. There is no backend, no database, no authentication, and no network calls (except to serve static assets).
- **Single-User**: It is a single-user, single-session environment.
- **Persistence**: Projects are saved to local JSON files (`.json`) or exported to SVG. User preferences (like UI Scale) may use `localStorage`.

## Core Domain Model
The architecture revolves around a simple hierarchical model:
1. **Project**: The root object containing project metadata, units, and multiple Pages.
2. **Page**: A 2D space (like a floor plan or layout) containing Entities and Constraints.
3. **Entity**: A graphical or logical object in the 2D space.
4. **Constraint**: Rules governing relationships between entities (e.g., parallel, fixed length).

### Supported Entities
- `Wall`: Thick lines with a specific physical thickness.
- `Door` / `Window`: Sub-entities attached to Walls, parameterized by position and width.
- `Stairs`: Directional multi-line staircase representations.
- `Line`, `Rect`, `Circle`, `Arc`: Basic geometric primitives.
- `Dimension`: Measurement annotations.
- `Text`: Text labels.

### Coordinate System
- **World Space**: The actual physical coordinates in the project (usually in meters or inches). All entities are stored in world space coordinates.
- **Screen Space**: The pixel coordinates on the user's monitor. The `viewport` object translates World Space to Screen Space via a transform matrix (pan/zoom).
