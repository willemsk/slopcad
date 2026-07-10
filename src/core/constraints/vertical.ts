import type {ConstraintHandlerContext} from './types';

export function solveVertical({
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

  const error = Math.abs(pB.x - pA.x);

  if (error > 0.0001) {
    const lockedA = isPointLocked(refA);
    const lockedB = isPointLocked(refB);

    if (lockedA && lockedB) return error;

    if (lockedA) {
      setPointValue(entities, refB, {x: pA.x, y: pB.y});
    } else if (lockedB) {
      setPointValue(entities, refA, {x: pB.x, y: pA.y});
    } else {
      const avgX = (pA.x + pB.x) / 2;
      setPointValue(entities, refA, {x: avgX, y: pA.y});
      setPointValue(entities, refB, {x: avgX, y: pB.y});
    }
  }

  return error;
}
