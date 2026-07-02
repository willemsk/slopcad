import {Constraint, Entity, PointRef, Vec2} from '../types';

export interface ConstraintHandlerContext {
  constraint: Constraint;
  entities: Entity[];
  isPointLocked: (ref: PointRef) => boolean;
  getPointValue: (entities: Entity[], ref: PointRef) => Vec2 | null;
  setPointValue: (entities: Entity[], ref: PointRef, val: Vec2) => boolean;
}

export type ConstraintHandler = (context: ConstraintHandlerContext) => number;
