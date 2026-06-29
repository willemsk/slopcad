import {
  Entity,
  Constraint,
  PointRef,
  Vec2,
  WallEntity,
  LineEntity,
  StairsEntity,
  RectEntity,
  DimensionEntity,
  CircleEntity,
  ArcEntity,
} from './types';
import {cloneEntity} from './entity';
import {
  dist,
  sub,
  add,
  scale,
  normalize,
  angle,
  rotate,
  len,
  lerp,
} from './geometry';
import {ConstraintRegistry} from './constraints/registry';

// Get coordinate reference from entity list or map
export function getPointValue(
  entitiesOrMap: Entity[] | Map<string, Entity>,
  ref: PointRef,
): Vec2 | null {
  const entity =
    entitiesOrMap instanceof Map
      ? entitiesOrMap.get(ref.entityId)
      : entitiesOrMap.find(e => e.id === ref.entityId);
  if (!entity) return null;

  const key = ref.pointKey;
  if (key === 'position' && entity.type === 'text') {
    return entity.position;
  }
  if (
    (key === 'start' || key === 'end') &&
    (entity.type === 'wall' ||
      entity.type === 'line' ||
      entity.type === 'stairs')
  ) {
    const segment = entity as WallEntity | LineEntity | StairsEntity;
    return segment[key as 'start' | 'end'];
  }
  if (
    (key === 'p1' || key === 'p2') &&
    (entity.type === 'rect' || entity.type === 'dimension')
  ) {
    const rectOrDim = entity as RectEntity | DimensionEntity;
    return rectOrDim[key as 'p1' | 'p2'];
  }
  if (key === 'center' && (entity.type === 'circle' || entity.type === 'arc')) {
    const circleOrArc = entity as CircleEntity | ArcEntity;
    return circleOrArc.center;
  }
  return null;
}

// Set coordinate reference in entity list or map
export function setPointValue(
  entitiesOrMap: Entity[] | Map<string, Entity>,
  ref: PointRef,
  val: Vec2,
): boolean {
  const entity =
    entitiesOrMap instanceof Map
      ? entitiesOrMap.get(ref.entityId)
      : entitiesOrMap.find(e => e.id === ref.entityId);
  if (!entity || entity.locked) return false;

  const key = ref.pointKey;
  if (key === 'position' && entity.type === 'text') {
    entity.position = {...val};
    return true;
  }
  if (
    (key === 'start' || key === 'end') &&
    (entity.type === 'wall' ||
      entity.type === 'line' ||
      entity.type === 'stairs')
  ) {
    const segment = entity as WallEntity | LineEntity | StairsEntity;
    segment[key as 'start' | 'end'] = {...val};
    return true;
  }
  if (
    (key === 'p1' || key === 'p2') &&
    (entity.type === 'rect' || entity.type === 'dimension')
  ) {
    const rectOrDim = entity as RectEntity | DimensionEntity;
    rectOrDim[key as 'p1' | 'p2'] = {...val};
    return true;
  }
  if (key === 'center' && (entity.type === 'circle' || entity.type === 'arc')) {
    const circleOrArc = entity as CircleEntity | ArcEntity;
    circleOrArc.center = {...val};
    return true;
  }
  return false;
}

function isRefEqual(r1: PointRef, r2: PointRef): boolean {
  return r1.entityId === r2.entityId && r1.pointKey === r2.pointKey;
}

export function solveConstraints(
  entities: Entity[],
  constraints: Constraint[],
  pinnedRefs: PointRef[] = [],
  maxIterations = 50,
): Entity[] {
  // Deep copy entities so we don't mutate state prematurely
  const solvedEntities = entities.map(cloneEntity);

  const solvedEntityMap = new Map<string, Entity>();
  for (const ent of solvedEntities) {
    solvedEntityMap.set(ent.id, ent);
  }

  // Keep track of locked points. Entity locked flag or pinnedRefs
  const isPointLocked = (ref: PointRef): boolean => {
    // Check if pinned by user drag
    if (pinnedRefs.some(p => isRefEqual(p, ref))) return true;

    // Check if parent entity is locked
    const ent = solvedEntityMap.get(ref.entityId);
    return ent ? !!ent.locked : false;
  };

  for (let iter = 0; iter < maxIterations; iter++) {
    let maxError = 0;

    for (const c of constraints) {
      if (!c.pointRefs || c.pointRefs.length === 0) continue;

      const handler = ConstraintRegistry[c.type];
      if (handler) {
        const error = handler({
          constraint: c,
          entities: solvedEntities,
          isPointLocked,
          getPointValue: (dummy, ref) => getPointValue(solvedEntityMap, ref),
          setPointValue: (dummy, ref, val) =>
            setPointValue(solvedEntityMap, ref, val),
        });
        maxError = Math.max(maxError, error);
      }
    }

    if (maxError < 0.0001) {
      break; // Converged early
    }
  }

  return solvedEntities;
}
