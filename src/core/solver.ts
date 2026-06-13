import {Entity, Constraint, PointRef, Vec2} from './types';
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
  const solvedEntities = JSON.parse(JSON.stringify(entities)) as Entity[];

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

      switch (c.type) {
        case 'coincident': {
          if (c.pointRefs.length < 2) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          if (!pA || !pB) continue;

          const errorDist = dist(pA, pB);
          maxError = Math.max(maxError, errorDist);

          if (errorDist > 0.0001) {
            const lockedA = isPointLocked(refA);
            const lockedB = isPointLocked(refB);

            if (lockedA && lockedB) continue; // Both locked, can't solve

            if (lockedA) {
              setPointValue(solvedEntities, refB, pA);
            } else if (lockedB) {
              setPointValue(solvedEntities, refA, pB);
            } else {
              const mid = lerp(pA, pB, 0.5);
              setPointValue(solvedEntities, refA, mid);
              setPointValue(solvedEntities, refB, mid);
            }
          }
          break;
        }

        case 'fixed_length': {
          if (c.pointRefs.length < 2 || c.value === undefined) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          if (!pA || !pB) continue;

          const targetL = c.value;
          const currentL = dist(pA, pB);
          const error = Math.abs(currentL - targetL);
          maxError = Math.max(maxError, error);

          if (error > 0.0001) {
            const lockedA = isPointLocked(refA);
            const lockedB = isPointLocked(refB);
            if (lockedA && lockedB) continue;

            let dir = normalize(sub(pB, pA));
            if (len(dir) === 0) {
              dir = {x: 1, y: 0}; // fallback if overlapping
            }

            if (lockedA) {
              // Move B
              const newB = add(pA, scale(dir, targetL));
              setPointValue(solvedEntities, refB, newB);
            } else if (lockedB) {
              // Move A
              const newA = sub(pB, scale(dir, targetL));
              setPointValue(solvedEntities, refA, newA);
            } else {
              // Move both equally
              const mid = lerp(pA, pB, 0.5);
              const halfL = targetL / 2;
              setPointValue(solvedEntities, refA, sub(mid, scale(dir, halfL)));
              setPointValue(solvedEntities, refB, add(mid, scale(dir, halfL)));
            }
          }
          break;
        }

        case 'horizontal': {
          if (c.pointRefs.length < 2) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          if (!pA || !pB) continue;

          const error = Math.abs(pB.y - pA.y);
          maxError = Math.max(maxError, error);

          if (error > 0.0001) {
            const lockedA = isPointLocked(refA);
            const lockedB = isPointLocked(refB);
            if (lockedA && lockedB) continue;

            if (lockedA) {
              setPointValue(solvedEntities, refB, {x: pB.x, y: pA.y});
            } else if (lockedB) {
              setPointValue(solvedEntities, refA, {x: pA.x, y: pB.y});
            } else {
              const avgY = (pA.y + pB.y) / 2;
              setPointValue(solvedEntities, refA, {x: pA.x, y: avgY});
              setPointValue(solvedEntities, refB, {x: pB.x, y: avgY});
            }
          }
          break;
        }

        case 'vertical': {
          if (c.pointRefs.length < 2) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          if (!pA || !pB) continue;

          const error = Math.abs(pB.x - pA.x);
          maxError = Math.max(maxError, error);

          if (error > 0.0001) {
            const lockedA = isPointLocked(refA);
            const lockedB = isPointLocked(refB);
            if (lockedA && lockedB) continue;

            if (lockedA) {
              setPointValue(solvedEntities, refB, {x: pA.x, y: pB.y});
            } else if (lockedB) {
              setPointValue(solvedEntities, refA, {x: pB.x, y: pA.y});
            } else {
              const avgX = (pA.x + pB.x) / 2;
              setPointValue(solvedEntities, refA, {x: avgX, y: pA.y});
              setPointValue(solvedEntities, refB, {x: avgX, y: pB.y});
            }
          }
          break;
        }

        case 'fixed_angle': {
          if (c.pointRefs.length < 2 || c.value === undefined) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          if (!pA || !pB) continue;

          const targetAngleRad = c.value * (Math.PI / 180); // value in degrees
          const currentVec = sub(pB, pA);
          const currentAngleRad = angle(currentVec);
          const currentL = len(currentVec);

          const error = Math.abs(currentAngleRad - targetAngleRad);
          maxError = Math.max(maxError, error);

          if (error > 0.0001) {
            const lockedA = isPointLocked(refA);
            const lockedB = isPointLocked(refB);
            if (lockedA && lockedB) continue;

            const dir = {
              x: Math.cos(targetAngleRad),
              y: Math.sin(targetAngleRad),
            };

            if (lockedA) {
              setPointValue(
                solvedEntities,
                refB,
                add(pA, scale(dir, currentL)),
              );
            } else if (lockedB) {
              setPointValue(
                solvedEntities,
                refA,
                sub(pB, scale(dir, currentL)),
              );
            } else {
              const mid = lerp(pA, pB, 0.5);
              const halfL = currentL / 2;
              setPointValue(solvedEntities, refA, sub(mid, scale(dir, halfL)));
              setPointValue(solvedEntities, refB, add(mid, scale(dir, halfL)));
            }
          }
          break;
        }

        case 'parallel': {
          if (c.pointRefs.length < 4) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const refC = c.pointRefs[2];
          const refD = c.pointRefs[3];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          const pC = getPointValue(solvedEntities, refC);
          const pD = getPointValue(solvedEntities, refD);
          if (!pA || !pB || !pC || !pD) continue;

          const vecAB = sub(pB, pA);
          const vecCD = sub(pD, pC);
          const angleAB = angle(vecAB);
          const angleCD = angle(vecCD);

          let diff = angleCD - angleAB;
          // Normalize diff to [-PI/2, PI/2]
          while (diff > Math.PI / 2) diff -= Math.PI;
          while (diff < -Math.PI / 2) diff += Math.PI;

          const error = Math.abs(diff);
          maxError = Math.max(maxError, error);

          if (error > 0.0001) {
            const lockedA = isPointLocked(refA);
            const lockedB = isPointLocked(refB);
            const lockedC = isPointLocked(refC);
            const lockedD = isPointLocked(refD);

            const lineABLocked = lockedA && lockedB;
            const lineCDLocked = lockedC && lockedD;

            if (lineABLocked && lineCDLocked) continue;

            if (lineABLocked) {
              // Rotate CD to match AB's angle
              const midCD = lerp(pC, pD, 0.5);
              const rotC = add(midCD, rotate(sub(pC, midCD), -diff));
              const rotD = add(midCD, rotate(sub(pD, midCD), -diff));
              setPointValue(solvedEntities, refC, rotC);
              setPointValue(solvedEntities, refD, rotD);
            } else if (lineCDLocked) {
              // Rotate AB to match CD's angle
              const midAB = lerp(pA, pB, 0.5);
              const rotA = add(midAB, rotate(sub(pA, midAB), diff));
              const rotB = add(midAB, rotate(sub(pB, midAB), diff));
              setPointValue(solvedEntities, refA, rotA);
              setPointValue(solvedEntities, refB, rotB);
            } else {
              // Rotate both slightly
              const midAB = lerp(pA, pB, 0.5);
              const midCD = lerp(pC, pD, 0.5);
              const rotA = add(midAB, rotate(sub(pA, midAB), diff / 2));
              const rotB = add(midAB, rotate(sub(pB, midAB), diff / 2));
              const rotC = add(midCD, rotate(sub(pC, midCD), -diff / 2));
              const rotD = add(midCD, rotate(sub(pD, midCD), -diff / 2));
              setPointValue(solvedEntities, refA, rotA);
              setPointValue(solvedEntities, refB, rotB);
              setPointValue(solvedEntities, refC, rotC);
              setPointValue(solvedEntities, refD, rotD);
            }
          }
          break;
        }

        case 'perpendicular': {
          if (c.pointRefs.length < 4) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const refC = c.pointRefs[2];
          const refD = c.pointRefs[3];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          const pC = getPointValue(solvedEntities, refC);
          const pD = getPointValue(solvedEntities, refD);
          if (!pA || !pB || !pC || !pD) continue;

          const vecAB = sub(pB, pA);
          const vecCD = sub(pD, pC);
          const angleAB = angle(vecAB);
          const angleCD = angle(vecCD);

          let diff = angleCD - angleAB - Math.PI / 2;
          while (diff > Math.PI / 2) diff -= Math.PI;
          while (diff < -Math.PI / 2) diff += Math.PI;

          const error = Math.abs(diff);
          maxError = Math.max(maxError, error);

          if (error > 0.0001) {
            const lockedA = isPointLocked(refA);
            const lockedB = isPointLocked(refB);
            const lockedC = isPointLocked(refC);
            const lockedD = isPointLocked(refD);

            const lineABLocked = lockedA && lockedB;
            const lineCDLocked = lockedC && lockedD;

            if (lineABLocked && lineCDLocked) continue;

            if (lineABLocked) {
              const midCD = lerp(pC, pD, 0.5);
              const rotC = add(midCD, rotate(sub(pC, midCD), -diff));
              const rotD = add(midCD, rotate(sub(pD, midCD), -diff));
              setPointValue(solvedEntities, refC, rotC);
              setPointValue(solvedEntities, refD, rotD);
            } else if (lineCDLocked) {
              const midAB = lerp(pA, pB, 0.5);
              const rotA = add(midAB, rotate(sub(pA, midAB), diff));
              const rotB = add(midAB, rotate(sub(pB, midAB), diff));
              setPointValue(solvedEntities, refA, rotA);
              setPointValue(solvedEntities, refB, rotB);
            } else {
              const midAB = lerp(pA, pB, 0.5);
              const midCD = lerp(pC, pD, 0.5);
              const rotA = add(midAB, rotate(sub(pA, midAB), diff / 2));
              const rotB = add(midAB, rotate(sub(pB, midAB), diff / 2));
              const rotC = add(midCD, rotate(sub(pC, midCD), -diff / 2));
              const rotD = add(midCD, rotate(sub(pD, midCD), -diff / 2));
              setPointValue(solvedEntities, refA, rotA);
              setPointValue(solvedEntities, refB, rotB);
              setPointValue(solvedEntities, refC, rotC);
              setPointValue(solvedEntities, refD, rotD);
            }
          }
          break;
        }

        case 'equal_length': {
          if (c.pointRefs.length < 4) continue;
          const refA = c.pointRefs[0];
          const refB = c.pointRefs[1];
          const refC = c.pointRefs[2];
          const refD = c.pointRefs[3];
          const pA = getPointValue(solvedEntities, refA);
          const pB = getPointValue(solvedEntities, refB);
          const pC = getPointValue(solvedEntities, refC);
          const pD = getPointValue(solvedEntities, refD);
          if (!pA || !pB || !pC || !pD) continue;

          const lenAB = dist(pA, pB);
          const lenCD = dist(pC, pD);
          const error = Math.abs(lenAB - lenCD);
          maxError = Math.max(maxError, error);

          if (error > 0.0001) {
            const lockedAB = isPointLocked(refA) && isPointLocked(refB);
            const lockedCD = isPointLocked(refC) && isPointLocked(refD);

            if (lockedAB && lockedCD) continue;

            let targetL = (lenAB + lenCD) / 2;
            if (lockedAB) targetL = lenAB;
            else if (lockedCD) targetL = lenCD;

            const dirAB = normalize(sub(pB, pA));
            const dirCD = normalize(sub(pD, pC));

            // Adjust AB
            if (!lockedAB) {
              const lockedA = isPointLocked(refA);
              const lockedB = isPointLocked(refB);
              if (lockedA) {
                setPointValue(
                  solvedEntities,
                  refB,
                  add(pA, scale(dirAB, targetL)),
                );
              } else if (lockedB) {
                setPointValue(
                  solvedEntities,
                  refA,
                  sub(pB, scale(dirAB, targetL)),
                );
              } else {
                const midAB = lerp(pA, pB, 0.5);
                setPointValue(
                  solvedEntities,
                  refA,
                  sub(midAB, scale(dirAB, targetL / 2)),
                );
                setPointValue(
                  solvedEntities,
                  refB,
                  add(midAB, scale(dirAB, targetL / 2)),
                );
              }
            }

            // Adjust CD
            if (!lockedCD) {
              const lockedC = isPointLocked(refC);
              const lockedD = isPointLocked(refD);
              if (lockedC) {
                setPointValue(
                  solvedEntities,
                  refD,
                  add(pC, scale(dirCD, targetL)),
                );
              } else if (lockedD) {
                setPointValue(
                  solvedEntities,
                  refC,
                  sub(pD, scale(dirCD, targetL)),
                );
              } else {
                const midCD = lerp(pC, pD, 0.5);
                setPointValue(
                  solvedEntities,
                  refC,
                  sub(midCD, scale(dirCD, targetL / 2)),
                );
                setPointValue(
                  solvedEntities,
                  refD,
                  add(midCD, scale(dirCD, targetL / 2)),
                );
              }
            }
          }
          break;
        }
      }
    }

    if (maxError < 0.0001) {
      break; // Converged early
    }
  }

  return solvedEntities;
}
