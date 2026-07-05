# Drawing Tools Reference

SlopCAD provides tools for both architectural primitives and basic geometry drafting.

---

## 🧱 Architectural Elements

### Wall Tool
Creates thick walls that form the core structure of your plan.
- **Properties**: Thickness (m/in), material color, layer.
- **Behavior**: Clicking sequential points links walls together. Press `Esc` or right-click to finish.

### Door Tool
Places doors onto existing walls.
- **Properties**: Width, swing direction, wall attachment point (`t` parameter).
- **Behavior**: Can only be placed on a wall. It cuts the wall geometry automatically when rendered.

### Window Tool
Places windows onto existing walls.
- **Properties**: Width, inset, wall attachment.
- **Behavior**: Similar to doors, handles wall cutout and displays frame lines.

### Stairs Tool
Creates straight or L-shaped staircases.
- **Properties**: Step width, step depth, number of steps, rise height.

---

## ✏️ Basic Geometry

### Line Tool
Draws single or continuous line segments.

### Rect Tool
Draws rectangles defined by two opposite corners.

### Circle Tool
Draws circles defined by a center point and radius.

### Arc Tool
Draws arcs defined by three points (start, middle, end) or center-radius-angles.

---

## 🏷️ Annotations

### Dimension Tool
Draws associative dimension lines to measure and display distances between two points.

### Text Tool
Places rich text labels on the drawing sheet.
