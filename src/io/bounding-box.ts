import {Entity} from '../core/types';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function calculateBoundingBox(
  entities: Entity[],
  padding = 1.0,
): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const expandBBox = (pt: {x: number; y: number}) => {
    minX = Math.min(minX, pt.x);
    minY = Math.min(minY, pt.y);
    maxX = Math.max(maxX, pt.x);
    maxY = Math.max(maxY, pt.y);
  };

  for (const ent of entities) {
    if (ent.type === 'wall' || ent.type === 'line' || ent.type === 'stairs') {
      const e = ent as any;
      expandBBox(e.start);
      expandBBox(e.end);
    } else if (ent.type === 'rect') {
      const r = ent as any;
      expandBBox(r.p1);
      expandBBox(r.p2);
    } else if (ent.type === 'circle') {
      const c = ent as any;
      expandBBox({x: c.center.x - c.radius, y: c.center.y - c.radius});
      expandBBox({x: c.center.x + c.radius, y: c.center.y + c.radius});
    } else if (ent.type === 'arc') {
      const a = ent as any;
      expandBBox({x: a.center.x - a.radius, y: a.center.y - a.radius});
      expandBBox({x: a.center.x + a.radius, y: a.center.y + a.radius});
    } else if (ent.type === 'dimension') {
      const d = ent as any;
      expandBBox(d.p1);
      expandBBox(d.p2);
    } else if (ent.type === 'text') {
      const t = ent as any;
      expandBBox(t.position);
    }
  }

  // If empty, default viewBox
  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 10;
    maxY = 10;
  }

  // Add padding around viewBox (e.g., 1 meter)
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = maxX - minX;
  const height = maxY - minY;

  return {minX, minY, maxX, maxY, width, height};
}
