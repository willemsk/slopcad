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
      expandBBox(ent.start);
      expandBBox(ent.end);
    } else if (ent.type === 'rect') {
      expandBBox(ent.p1);
      expandBBox(ent.p2);
    } else if (ent.type === 'circle') {
      expandBBox({x: ent.center.x - ent.radius, y: ent.center.y - ent.radius});
      expandBBox({x: ent.center.x + ent.radius, y: ent.center.y + ent.radius});
    } else if (ent.type === 'arc') {
      expandBBox({x: ent.center.x - ent.radius, y: ent.center.y - ent.radius});
      expandBBox({x: ent.center.x + ent.radius, y: ent.center.y + ent.radius});
    } else if (ent.type === 'dimension') {
      expandBBox(ent.p1);
      expandBBox(ent.p2);
    } else if (ent.type === 'text') {
      expandBBox(ent.position);
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
