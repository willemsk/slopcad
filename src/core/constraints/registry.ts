import {ConstraintType} from '../types';
import {ConstraintHandler} from './types';
import {solveCoincident} from './coincident';
import {solveFixedLength} from './fixed-length';
import {solveHorizontal} from './horizontal';
import {solveVertical} from './vertical';
import {solveFixedAngle} from './fixed-angle';
import {solveParallel} from './parallel';
import {solvePerpendicular} from './perpendicular';
import {solveCollinear} from './collinear';
import {solveEqualLength} from './equal-length';

export const ConstraintRegistry: Record<ConstraintType, ConstraintHandler> = {
  coincident: solveCoincident,
  concentric: solveCoincident, // Concentric uses the same logic
  fixed_length: solveFixedLength,
  horizontal: solveHorizontal,
  vertical: solveVertical,
  fixed_angle: solveFixedAngle,
  parallel: solveParallel,
  perpendicular: solvePerpendicular,
  collinear: solveCollinear,
  equal_length: solveEqualLength,
};
