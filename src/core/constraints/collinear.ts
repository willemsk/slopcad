import {ConstraintHandlerContext} from './types';
import {dist, sub, add, scale, angle, normalize, len, lerp} from '../geometry';

export function solveCollinear({
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

  const vecAB = sub(pB, pA);
  const vecCD = sub(pD, pC);
  const dirAB = normalize(vecAB);

  const vecAC = sub(pC, pA);
  const dotAC = vecAC.x * dirAB.x + vecAC.y * dirAB.y;
  const projC = add(pA, scale(dirAB, dotAC));
  const errC = dist(pC, projC);

  const vecAD = sub(pD, pA);
  const dotAD = vecAD.x * dirAB.x + vecAD.y * dirAB.y;
  const projD = add(pA, scale(dirAB, dotAD));
  const errD = dist(pD, projD);

  const angleAB = angle(vecAB);
  const angleCD = angle(vecCD);
  let diff = angleCD - angleAB;
  while (diff > Math.PI / 2) diff -= Math.PI;
  while (diff < -Math.PI / 2) diff += Math.PI;

  const error = Math.abs(diff) + errC + errD;

  if (error > 0.0001) {
    const lockedAB = isPointLocked(refA) && isPointLocked(refB);
    const lockedCD = isPointLocked(refC) && isPointLocked(refD);

    if (lockedAB && lockedCD) return error;

    const currentDot = vecAB.x * vecCD.x + vecAB.y * vecCD.y;

    if (lockedAB) {
      const lenCD = len(vecCD);
      const centerCD = lerp(pC, pD, 0.5);
      const vecA_CenterCD = sub(centerCD, pA);
      const dotCenter = vecA_CenterCD.x * dirAB.x + vecA_CenterCD.y * dirAB.y;
      const newCenterCD = add(pA, scale(dirAB, dotCenter));
      const newDirCD = currentDot > 0 ? dirAB : {x: -dirAB.x, y: -dirAB.y};

      setPointValue(
        entities,
        refC,
        sub(newCenterCD, scale(newDirCD, lenCD / 2)),
      );
      setPointValue(
        entities,
        refD,
        add(newCenterCD, scale(newDirCD, lenCD / 2)),
      );
    } else if (lockedCD) {
      const dirCD = normalize(vecCD);
      const lenAB = len(vecAB);
      const centerAB = lerp(pA, pB, 0.5);
      const vecC_CenterAB = sub(centerAB, pC);
      const dotCenter = vecC_CenterAB.x * dirCD.x + vecC_CenterAB.y * dirCD.y;
      const newCenterAB = add(pC, scale(dirCD, dotCenter));
      const newDirAB = currentDot > 0 ? dirCD : {x: -dirCD.x, y: -dirCD.y};

      setPointValue(
        entities,
        refA,
        sub(newCenterAB, scale(newDirAB, lenAB / 2)),
      );
      setPointValue(
        entities,
        refB,
        add(newCenterAB, scale(newDirAB, lenAB / 2)),
      );
    } else {
      const dirCD = normalize(vecCD);
      const dirAvg = normalize(
        add(dirAB, currentDot > 0 ? dirCD : {x: -dirCD.x, y: -dirCD.y}),
      );
      const centerAB = lerp(pA, pB, 0.5);
      const centerCD = lerp(pC, pD, 0.5);
      const centerAll = lerp(centerAB, centerCD, 0.5);

      const dotA =
        sub(pA, centerAll).x * dirAvg.x + sub(pA, centerAll).y * dirAvg.y;
      const dotB =
        sub(pB, centerAll).x * dirAvg.x + sub(pB, centerAll).y * dirAvg.y;
      const dotC =
        sub(pC, centerAll).x * dirAvg.x + sub(pC, centerAll).y * dirAvg.y;
      const dotD =
        sub(pD, centerAll).x * dirAvg.x + sub(pD, centerAll).y * dirAvg.y;

      setPointValue(entities, refA, add(centerAll, scale(dirAvg, dotA)));
      setPointValue(entities, refB, add(centerAll, scale(dirAvg, dotB)));
      setPointValue(entities, refC, add(centerAll, scale(dirAvg, dotC)));
      setPointValue(entities, refD, add(centerAll, scale(dirAvg, dotD)));
    }
  }

  return error;
}
