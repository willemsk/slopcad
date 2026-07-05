# Features Overview

SlopCAD comes equipped with essential features for 2D architectural modeling and drafting. Here is an overview of the core capabilities.

---

## 📐 Parametric Architecture
Unlike basic vector editors, SlopCAD understands architectural elements:
- **Walls**: Built with real-world physical thickness. They merge automatically at intersections and maintain their thickness parameter.
- **Parametric Doors & Windows**: These are sub-entities hosted on walls. If you move a wall, hosted doors and windows move with it.
- **Stairs**: Drawn with directions, step counts, and landing areas.

## 🔗 Constraint Solving
Apply geometric constraints to maintain strict structural relationships:
- **Fixed Length**: Set a wall or line to a specific length.
- **Horizontal/Vertical**: Keep elements aligned along major axes.
- **Parallel/Perpendicular**: Ensure walls are aligned relative to each other.

## 🎯 Snapping and Precision
Draft with pixel-perfect precision using:
- **Grid Snapping**: Restrict cursor coordinates to a customizable grid.
- **Object Snapping (OSNAP)**: Snap to endpoints, midpoints, intersections, and centers.
- **UCS (User Coordinate System)**: Adjust the grid origin and angle.

## 💾 Local Storage and Persistence
All changes are saved to browser local storage. You can also export your project as a clean, structured JSON file to import later.
