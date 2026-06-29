import {Entity, Vec2, WallEntity} from './types';
import {
  dist,
  distToSegment,
  normalize,
  sub,
  add,
  scale,
  lerp,
} from './geometry';

/**
 * Checks if a point hits a given entity within a radius.
 * Returns the distance to the entity if it hit, or null if it didn't.
 */
export function getDistanceToEntity(
  pt: Vec2,
  ent: Entity,
  entitiesOrMap: Entity[] | Map<string, Entity>,
): number | null {
  const entityMap =
    entitiesOrMap instanceof Map
      ? entitiesOrMap
      : new Map(entitiesOrMap.map(e => [e.id, e]));

  switch (ent.type) {
    case 'wall':
    case 'line':
    case 'stairs': {
      return distToSegment(pt, ent.start, ent.end);
    }
    case 'rect': {
      const d1 = distToSegment(pt, ent.p1, {x: ent.p2.x, y: ent.p1.y});
      const d2 = distToSegment(pt, {x: ent.p2.x, y: ent.p1.y}, ent.p2);
      const d3 = distToSegment(pt, ent.p2, {x: ent.p1.x, y: ent.p2.y});
      const d4 = distToSegment(pt, {x: ent.p1.x, y: ent.p2.y}, ent.p1);
      return Math.min(d1, d2, d3, d4);
    }
    case 'circle':
    case 'arc': {
      return Math.abs(dist(pt, ent.center) - ent.radius);
    }
    case 'dimension': {
      const u = normalize(sub(ent.p2, ent.p1));
      const n = {x: -u.y, y: u.x};
      const d1 = add(ent.p1, scale(n, ent.offset));
      const d2 = add(ent.p2, scale(n, ent.offset));
      return distToSegment(pt, d1, d2);
    }
    case 'text': {
      return dist(pt, ent.position);
    }
    case 'door':
    case 'window': {
      const wall = entityMap.get(ent.wallId) as WallEntity | undefined;
      if (wall && wall.type === 'wall') {
        const u = normalize(sub(wall.end, wall.start));
        const center = lerp(wall.start, wall.end, ent.position);
        const w = ent.width;
        const d1 = sub(center, scale(u, w / 2));
        const d2 = add(center, scale(u, w / 2));
        // Bias distance slightly so doors/windows win over the underlying wall
        return distToSegment(pt, d1, d2) - 0.001;
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Finds the entity closest to the given point within the specified hit radius.
 */
export function findEntityAt(
  pt: Vec2,
  entities: Entity[],
  hitRadius: number,
  entityMap?: Map<string, Entity>,
): Entity | null {
  let bestEnt: Entity | null = null;
  let bestDist = hitRadius;

  const map = entityMap || new Map(entities.map(e => [e.id, e]));

  for (const ent of entities) {
    const d = getDistanceToEntity(pt, ent, map);
    if (d !== null && d < bestDist) {
      bestDist = d;
      bestEnt = ent;
    }
  }

  return bestEnt;
}
