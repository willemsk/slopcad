import {Entity, Constraint, PointRef, Vec2} from './types';
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

// Get coordinate reference from entity list
export function getPointValue(entities: Entity[], ref: PointRef): Vec2 | null {
  const entity = entities.find(e => e.id === ref.entityId);
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
    return (entity as any)[key];
  }
  if (
    (key === 'p1' || key === 'p2') &&
    (entity.type === 'rect' || entity.type === 'dimension')
  ) {
    return (entity as any)[key];
  }
  if (key === 'center' && (entity.type === 'circle' || entity.type === 'arc')) {
    return (entity as any).center;
  }
  return null;
}

// Set coordinate reference in entity list
export function setPointValue(
  entities: Entity[],
  ref: PointRef,
  val: Vec2,
): boolean {
  const entity = entities.find(e => e.id === ref.entityId);
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
    (entity as any)[key] = {...val};
    return true;
  }
  if (
    (key === 'p1' || key === 'p2') &&
    (entity.type === 'rect' || entity.type === 'dimension')
  ) {
    (entity as any)[key] = {...val};
    return true;
  }
  if (key === 'center' && (entity.type === 'circle' || entity.type === 'arc')) {
    (entity as any).center = {...val};
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

  // Keep track of locked points. Entity locked flag or pinnedRefs
  const isPointLocked = (ref: PointRef): boolean => {
    // Check if pinned by user drag
    if (pinnedRefs.some(p => isRefEqual(p, ref))) return true;

    // Check if parent entity is locked
    const ent = solvedEntities.find(e => e.id === ref.entityId);
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
          getPointValue,
          setPointValue,
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
