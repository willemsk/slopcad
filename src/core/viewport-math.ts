import {Vec2, Entity} from './types';

export class ViewportMath {
  // zoom is screen pixels per world unit (meter)
  // e.g., zoom = 100 means 1 meter = 100 pixels
  zoom = 100;
  panOffset: Vec2 = {x: 0, y: 0}; // in screen pixels

  constructor(zoom = 100, panOffset: Vec2 = {x: 0, y: 0}) {
    this.zoom = zoom;
    this.panOffset = {...panOffset};
  }

  worldToScreen(worldPt: Vec2): Vec2 {
    return {
      x: worldPt.x * this.zoom + this.panOffset.x,
      y: worldPt.y * this.zoom + this.panOffset.y, // Keep y going up or down? Standard canvas y goes down.
      // For architecture, standard drawing coordinates: +x right, +y down is fine for standard canvas mapping.
      // Let's use simple standard +x right, +y down.
    };
  }

  screenToWorld(screenPt: Vec2): Vec2 {
    return {
      x: (screenPt.x - this.panOffset.x) / this.zoom,
      y: (screenPt.y - this.panOffset.y) / this.zoom,
    };
  }

  pan(dx: number, dy: number) {
    this.panOffset.x += dx;
    this.panOffset.y += dy;
  }

  zoomAt(screenPt: Vec2, factor: number) {
    // Keep the point under the cursor stable during zoom
    const worldPt = this.screenToWorld(screenPt);
    this.zoom = Math.max(5, Math.min(10000, this.zoom * factor));
    this.panOffset.x = screenPt.x - worldPt.x * this.zoom;
    this.panOffset.y = screenPt.y - worldPt.y * this.zoom;
  }

  fitToContent(
    entities: Entity[],
    width: number,
    height: number,
    padding = 40,
  ) {
    if (entities.length === 0) {
      // Reset to center
      this.zoom = 100;
      this.panOffset = {x: width / 2, y: height / 2};
      return;
    }

    // Calculate bounding box in world coordinates
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const expandBBox = (pt: Vec2) => {
      minX = Math.min(minX, pt.x);
      minY = Math.min(minY, pt.y);
      maxX = Math.max(maxX, pt.x);
      maxY = Math.max(maxY, pt.y);
    };

    for (const ent of entities) {
      if (ent.type === 'wall' || ent.type === 'line' || ent.type === 'stairs') {
        expandBBox(ent.start);
        expandBBox(ent.end);
      } else if (ent.type === 'rect') {
        const r = ent;
        expandBBox(r.p1);
        expandBBox(r.p2);
      } else if (ent.type === 'circle') {
        const c = ent;
        expandBBox({x: c.center.x - c.radius, y: c.center.y - c.radius});
        expandBBox({x: c.center.x + c.radius, y: c.center.y + c.radius});
      } else if (ent.type === 'arc') {
        const a = ent;
        expandBBox({x: a.center.x - a.radius, y: a.center.y - a.radius});
        expandBBox({x: a.center.x + a.radius, y: a.center.y + a.radius});
      } else if (ent.type === 'dimension') {
        const d = ent;
        expandBBox(d.p1);
        expandBBox(d.p2);
      } else if (ent.type === 'text') {
        const t = ent;
        expandBBox(t.position);
      }
    }

    if (minX === Infinity) return;

    const wWidth = maxX - minX;
    const wHeight = maxY - minY;

    // Avoid zero division for point entities
    const contentWidth = wWidth === 0 ? 1 : wWidth;
    const contentHeight = wHeight === 0 ? 1 : wHeight;

    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const zoomX = availableWidth / contentWidth;
    const zoomY = availableHeight / contentHeight;

    this.zoom = Math.min(zoomX, zoomY, 1000); // Caps zoom at 1000 (10px per cm)
    this.panOffset = {
      x:
        padding -
        minX * this.zoom +
        (availableWidth - contentWidth * this.zoom) / 2,
      y:
        padding -
        minY * this.zoom +
        (availableHeight - contentHeight * this.zoom) / 2,
    };
  }
}
