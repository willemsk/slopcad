import {dist, lerp} from '../geometry';
import type {ConstraintHandlerContext} from './types';

export function solveCoincident({
  constraint,
  entities,
  isPointLocked,
  getPointValue,
  setPointValue,
}: ConstraintHandlerContext): number {
  if (!constraint.pointRefs || constraint.pointRefs.length < 2) return 0;

  const refA = constraint.pointRefs[0];
  const refB = constraint.pointRefs[1];
  const pA = getPointValue(entities, refA);
  const pB = getPointValue(entities, refB);

  if (!pA || !pB) return 0;

  const errorDist = dist(pA, pB);

  if (errorDist > 0.0001) {
    const lockedA = isPointLocked(refA);
    const lockedB = isPointLocked(refB);

    if (lockedA && lockedB) return errorDist;

    if (lockedA) {
      setPointValue(entities, refB, pA);
    } else if (lockedB) {
      setPointValue(entities, refA, pB);
    } else {
      const mid = lerp(pA, pB, 0.5);
      setPointValue(entities, refA, mid);
      setPointValue(entities, refB, mid);
    }
  }

  return errorDist;
}
