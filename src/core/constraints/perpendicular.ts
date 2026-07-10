import {add, angle, lerp, rotate, sub} from '../geometry';
import type {ConstraintHandlerContext} from './types';

export function solvePerpendicular({
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
  const angleAB = angle(vecAB);
  const angleCD = angle(vecCD);

  let diff = angleCD - angleAB - Math.PI / 2;
  while (diff > Math.PI / 2) diff -= Math.PI;
  while (diff < -Math.PI / 2) diff += Math.PI;

  const error = Math.abs(diff);

  if (error > 0.0001) {
    const lockedA = isPointLocked(refA);
    const lockedB = isPointLocked(refB);
    const lockedC = isPointLocked(refC);
    const lockedD = isPointLocked(refD);

    const lineABLocked = lockedA && lockedB;
    const lineCDLocked = lockedC && lockedD;

    if (lineABLocked && lineCDLocked) return error;

    if (lineABLocked) {
      const midCD = lerp(pC, pD, 0.5);
      const rotC = add(midCD, rotate(sub(pC, midCD), -diff));
      const rotD = add(midCD, rotate(sub(pD, midCD), -diff));
      setPointValue(entities, refC, rotC);
      setPointValue(entities, refD, rotD);
    } else if (lineCDLocked) {
      const midAB = lerp(pA, pB, 0.5);
      const rotA = add(midAB, rotate(sub(pA, midAB), diff));
      const rotB = add(midAB, rotate(sub(pB, midAB), diff));
      setPointValue(entities, refA, rotA);
      setPointValue(entities, refB, rotB);
    } else {
      const midAB = lerp(pA, pB, 0.5);
      const midCD = lerp(pC, pD, 0.5);
      const rotA = add(midAB, rotate(sub(pA, midAB), diff / 2));
      const rotB = add(midAB, rotate(sub(pB, midAB), diff / 2));
      const rotC = add(midCD, rotate(sub(pC, midCD), -diff / 2));
      const rotD = add(midCD, rotate(sub(pD, midCD), -diff / 2));
      setPointValue(entities, refA, rotA);
      setPointValue(entities, refB, rotB);
      setPointValue(entities, refC, rotC);
      setPointValue(entities, refD, rotD);
    }
  }

  return error;
}
