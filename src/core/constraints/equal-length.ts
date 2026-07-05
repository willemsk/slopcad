import {ConstraintHandlerContext} from './types';
import {dist, sub, add, scale, normalize, lerp} from '../geometry';

export function solveEqualLength({
  constraint,
  entities,
  isPointLocked,
  getPointValue,
  setPointValue,
}: ConstraintHandlerContext): number {
  if (!constraint.pointRefs || constraint.pointRefs.length < 4) return 0;

  const refA = constraint.pointRefs[0];
  const refB = constraint.pointRefs[1];
  const refC = constraint.pointRefs[2];
  const refD = constraint.pointRefs[3];

  const pA = getPointValue(entities, refA);
  const pB = getPointValue(entities, refB);
  const pC = getPointValue(entities, refC);
  const pD = getPointValue(entities, refD);

  if (!pA || !pB || !pC || !pD) return 0;

  const lenAB = dist(pA, pB);
  const lenCD = dist(pC, pD);
  const error = Math.abs(lenAB - lenCD);

  if (error > 0.0001) {
    const lockedAB = isPointLocked(refA) && isPointLocked(refB);
    const lockedCD = isPointLocked(refC) && isPointLocked(refD);

    if (lockedAB && lockedCD) return error;

    let targetL = (lenAB + lenCD) / 2;
    if (lockedAB) targetL = lenAB;
    else if (lockedCD) targetL = lenCD;

    let dirAB = normalize(sub(pB, pA));
    if (dirAB.x === 0 && dirAB.y === 0) {
      dirAB = {x: 1, y: 0};
    }
    let dirCD = normalize(sub(pD, pC));
    if (dirCD.x === 0 && dirCD.y === 0) {
      dirCD = {x: 1, y: 0};
    }

    // Adjust AB
    if (!lockedAB) {
      const lockedA = isPointLocked(refA);
      const lockedB = isPointLocked(refB);
      if (lockedA) {
        setPointValue(entities, refB, add(pA, scale(dirAB, targetL)));
      } else if (lockedB) {
        setPointValue(entities, refA, sub(pB, scale(dirAB, targetL)));
      } else {
        const midAB = lerp(pA, pB, 0.5);
        setPointValue(entities, refA, sub(midAB, scale(dirAB, targetL / 2)));
        setPointValue(entities, refB, add(midAB, scale(dirAB, targetL / 2)));
      }
    }

    // Adjust CD
    if (!lockedCD) {
      const lockedC = isPointLocked(refC);
      const lockedD = isPointLocked(refD);
      if (lockedC) {
        setPointValue(entities, refD, add(pC, scale(dirCD, targetL)));
      } else if (lockedD) {
        setPointValue(entities, refC, sub(pD, scale(dirCD, targetL)));
      } else {
        const midCD = lerp(pC, pD, 0.5);
        setPointValue(entities, refC, sub(midCD, scale(dirCD, targetL / 2)));
        setPointValue(entities, refD, add(midCD, scale(dirCD, targetL / 2)));
      }
    }
  }

  return error;
}
