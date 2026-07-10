import {add, dist, len, lerp, normalize, scale, sub} from '../geometry';
import type {ConstraintHandlerContext} from './types';

export function solveFixedLength({
  constraint,
  entities,
  isPointLocked,
  getPointValue,
  setPointValue,
}: ConstraintHandlerContext): number {
  if (
    !constraint.pointRefs ||
    constraint.pointRefs.length < 2 ||
    constraint.value === undefined
  ) {
    return 0;
  }

  const refA = constraint.pointRefs[0];
  const refB = constraint.pointRefs[1];
  const pA = getPointValue(entities, refA);
  const pB = getPointValue(entities, refB);

  if (!pA || !pB) return 0;

  const targetL = constraint.value;
  const currentL = dist(pA, pB);
  const error = Math.abs(currentL - targetL);

  if (error > 0.0001) {
    const lockedA = isPointLocked(refA);
    const lockedB = isPointLocked(refB);

    if (lockedA && lockedB) return error;

    let dir = normalize(sub(pB, pA));
    if (len(dir) === 0) {
      dir = {x: 1, y: 0}; // fallback if overlapping
    }

    if (lockedA) {
      // Move B
      const newB = add(pA, scale(dir, targetL));
      setPointValue(entities, refB, newB);
    } else if (lockedB) {
      // Move A
      const newA = sub(pB, scale(dir, targetL));
      setPointValue(entities, refA, newA);
    } else {
      // Move both equally
      const mid = lerp(pA, pB, 0.5);
      const halfL = targetL / 2;
      setPointValue(entities, refA, sub(mid, scale(dir, halfL)));
      setPointValue(entities, refB, add(mid, scale(dir, halfL)));
    }
  }

  return error;
}
