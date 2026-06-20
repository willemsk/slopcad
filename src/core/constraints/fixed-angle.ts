import {ConstraintHandlerContext} from './types';
import {sub, add, scale, angle, len, lerp} from '../geometry';

export function solveFixedAngle({
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

  const targetAngleRad = constraint.value * (Math.PI / 180); // value in degrees
  const currentVec = sub(pB, pA);
  const currentAngleRad = angle(currentVec);
  const currentL = len(currentVec);

  const error = Math.abs(currentAngleRad - targetAngleRad);

  if (error > 0.0001) {
    const lockedA = isPointLocked(refA);
    const lockedB = isPointLocked(refB);

    if (lockedA && lockedB) return error;

    const dir = {
      x: Math.cos(targetAngleRad),
      y: Math.sin(targetAngleRad),
    };

    if (lockedA) {
      setPointValue(entities, refB, add(pA, scale(dir, currentL)));
    } else if (lockedB) {
      setPointValue(entities, refA, sub(pB, scale(dir, currentL)));
    } else {
      const mid = lerp(pA, pB, 0.5);
      const halfL = currentL / 2;
      setPointValue(entities, refA, sub(mid, scale(dir, halfL)));
      setPointValue(entities, refB, add(mid, scale(dir, halfL)));
    }
  }

  return error;
}
