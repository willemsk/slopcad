import {Entity, Vec2, WallEntity} from './types';
import {
  dist,
  distSq,
  distToSegmentSq,
  normalize,
  sub,
  add,
  scale,
  lerp,
} from './geometry';

/**
 * Checks if a point hits a given entity within a radius.
 * Returns the squared distance to the entity if it hit, or null if it didn't.
 */
export function getDistanceSqToEntity(
  pt: Vec2,
  ent: Entity,
  entitiesOrMap: Entity[] | Map<string, Entity>,
): number | null {
  const entityMap =
    entitiesOrMap instanceof Map
      ? entitiesOrMap
      : new Map(entitiesOrMap.map((e) => [e.id, e]));

  switch (ent.type) {
    case 'wall':
    case 'line':
    case 'stairs': {
      return distToSegmentSq(pt, ent.start, ent.end);
    }
    case 'rect': {
      const d1 = distToSegmentSq(pt, ent.p1, {x: ent.p2.x, y: ent.p1.y});
      const d2 = distToSegmentSq(pt, {x: ent.p2.x, y: ent.p1.y}, ent.p2);
      const d3 = distToSegmentSq(pt, ent.p2, {x: ent.p1.x, y: ent.p2.y});
      const d4 = distToSegmentSq(pt, {x: ent.p1.x, y: ent.p2.y}, ent.p1);
      return Math.min(d1, d2, d3, d4);
    }
    case 'circle':
    case 'arc': {
      const d = dist(pt, ent.center) - ent.radius;
      return d * d;
    }
    case 'dimension': {
      const u = normalize(sub(ent.p2, ent.p1));
      const n = {x: -u.y, y: u.x};
      const d1 = add(ent.p1, scale(n, ent.offset));
      const d2 = add(ent.p2, scale(n, ent.offset));
      return distToSegmentSq(pt, d1, d2);
    }
    case 'text': {
      return distSq(pt, ent.position);
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
        return Math.max(0, distToSegmentSq(pt, d1, d2) - 1e-6);
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Compatibility wrapper returning linear distance (non-squared)
 */
export function getDistanceToEntity(
  pt: Vec2,
  ent: Entity,
  entitiesOrMap: Entity[] | Map<string, Entity>,
): number | null {
  const dSq = getDistanceSqToEntity(pt, ent, entitiesOrMap);
  return dSq !== null ? Math.sqrt(dSq) : null;
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
  const hitRadiusSq = hitRadius * hitRadius;
  let bestDistSq = hitRadiusSq;

  const map = entityMap || new Map(entities.map((e) => [e.id, e]));

  for (const ent of entities) {
    const dSq = getDistanceSqToEntity(pt, ent, map);
    if (dSq !== null && dSq < bestDistSq) {
      bestDistSq = dSq;
      bestEnt = ent;
    }
  }

  return bestEnt;
}
