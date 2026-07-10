import type {ConstraintType} from '../types';
import {solveCoincident} from './coincident';
import {solveCollinear} from './collinear';
import {solveEqualLength} from './equal-length';
import {solveFixedAngle} from './fixed-angle';
import {solveFixedLength} from './fixed-length';
import {solveHorizontal} from './horizontal';
import {solveParallel} from './parallel';
import {solvePerpendicular} from './perpendicular';
import type {ConstraintHandler} from './types';
import {solveVertical} from './vertical';

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
