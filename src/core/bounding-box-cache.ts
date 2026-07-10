import type {
  ArcEntity,
  CircleEntity,
  DimensionEntity,
  DoorEntity,
  Entity,
  LineEntity,
  RectEntity,
  StairsEntity,
  TextEntity,
  WallEntity,
  WindowEntity,
} from './types';
import type {ViewportMath} from './viewport-math';

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function computeEntityAABB(
  entity: Entity,
  entityMap: Map<string, Entity>,
): AABB {
  switch (entity.type) {
    case 'wall': {
      const w = entity as WallEntity;
      const pad = w.thickness / 2;
      return {
        minX: Math.min(w.start.x, w.end.x) - pad,
        minY: Math.min(w.start.y, w.end.y) - pad,
        maxX: Math.max(w.start.x, w.end.x) + pad,
        maxY: Math.max(w.start.y, w.end.y) + pad,
      };
    }
    case 'line': {
      const l = entity as LineEntity;
      return {
        minX: Math.min(l.start.x, l.end.x),
        minY: Math.min(l.start.y, l.end.y),
        maxX: Math.max(l.start.x, l.end.x),
        maxY: Math.max(l.start.y, l.end.y),
      };
    }
    case 'stairs': {
      const s = entity as StairsEntity;
      return {
        minX: Math.min(s.start.x, s.end.x),
        minY: Math.min(s.start.y, s.end.y),
        maxX: Math.max(s.start.x, s.end.x),
        maxY: Math.max(s.start.y, s.end.y),
      };
    }
    case 'rect': {
      const r = entity as RectEntity;
      return {
        minX: Math.min(r.p1.x, r.p2.x),
        minY: Math.min(r.p1.y, r.p2.y),
        maxX: Math.max(r.p1.x, r.p2.x),
        maxY: Math.max(r.p1.y, r.p2.y),
      };
    }
    case 'circle': {
      const c = entity as CircleEntity;
      return {
        minX: c.center.x - c.radius,
        minY: c.center.y - c.radius,
        maxX: c.center.x + c.radius,
        maxY: c.center.y + c.radius,
      };
    }
    case 'arc': {
      const a = entity as ArcEntity;
      return {
        minX: a.center.x - a.radius,
        minY: a.center.y - a.radius,
        maxX: a.center.x + a.radius,
        maxY: a.center.y + a.radius,
      };
    }
    case 'door': {
      const d = entity as DoorEntity;
      const wall = entityMap.get(d.wallId);
      if (wall) return computeEntityAABB(wall, entityMap);
      return {minX: 0, minY: 0, maxX: 0, maxY: 0};
    }
    case 'window': {
      const w = entity as WindowEntity;
      const wall = entityMap.get(w.wallId);
      if (wall) return computeEntityAABB(wall, entityMap);
      return {minX: 0, minY: 0, maxX: 0, maxY: 0};
    }
    case 'dimension': {
      const d = entity as DimensionEntity;
      const pad = Math.abs(d.offset) + 0.5;
      return {
        minX: Math.min(d.p1.x, d.p2.x) - pad,
        minY: Math.min(d.p1.y, d.p2.y) - pad,
        maxX: Math.max(d.p1.x, d.p2.x) + pad,
        maxY: Math.max(d.p1.y, d.p2.y) + pad,
      };
    }
    case 'text': {
      const t = entity as TextEntity;
      return {
        minX: t.position.x - 2.0,
        minY: t.position.y - 1.0,
        maxX: t.position.x + 2.0,
        maxY: t.position.y + 1.0,
      };
    }
    default:
      return {minX: 0, minY: 0, maxX: 0, maxY: 0};
  }
}

export function aabbIntersects(a: AABB, b: AABB): boolean {
  return (
    a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
  );
}

export function computeViewportAABB(
  viewport: ViewportMath,
  width: number,
  height: number,
): AABB {
  const tl = viewport.screenToWorld({x: 0, y: 0});
  const br = viewport.screenToWorld({x: width, y: height});
  return {
    minX: Math.min(tl.x, br.x),
    minY: Math.min(tl.y, br.y),
    maxX: Math.max(tl.x, br.x),
    maxY: Math.max(tl.y, br.y),
  };
}
