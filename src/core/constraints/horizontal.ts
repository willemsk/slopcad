import {ConstraintHandlerContext} from './types';

export function solveHorizontal({
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

  const error = Math.abs(pB.y - pA.y);

  if (error > 0.0001) {
    const lockedA = isPointLocked(refA);
    const lockedB = isPointLocked(refB);

    if (lockedA && lockedB) return error;

    if (lockedA) {
      setPointValue(entities, refB, {x: pB.x, y: pA.y});
    } else if (lockedB) {
      setPointValue(entities, refA, {x: pA.x, y: pB.y});
    } else {
      const avgY = (pA.y + pB.y) / 2;
      setPointValue(entities, refA, {x: pA.x, y: avgY});
      setPointValue(entities, refB, {x: pB.x, y: avgY});
    }
  }

  return error;
}
