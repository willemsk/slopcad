export interface Vec2 {
  x: number;
  y: number;
}

export type EntityType =
  | 'wall'
  | 'door'
  | 'window'
  | 'stairs'
  | 'line'
  | 'rect'
  | 'circle'
  | 'arc'
  | 'dimension'
  | 'text';

export interface BaseEntity {
  id: string;
  type: EntityType;
  color?: string;
  lineWidth?: number;
  locked?: boolean;
}

export interface WallEntity extends BaseEntity {
  type: 'wall';
  start: Vec2;
  end: Vec2;
  thickness: number; // in meters
}

export interface DoorEntity extends BaseEntity {
  type: 'door';
  wallId: string; // Refers to the WallEntity it belongs to
  position: number; // 0 to 1 along the wall segment
  width: number; // in meters
  hingeSide: 'left' | 'right';
  openSide: 'in' | 'out';
  swingAngle: number; // degrees, default 90
}

export interface WindowEntity extends BaseEntity {
  type: 'window';
  wallId: string; // Refers to the WallEntity it belongs to
  position: number; // 0 to 1 along the wall segment
  width: number; // in meters
}

export interface StairsEntity extends BaseEntity {
  type: 'stairs';
  start: Vec2; // Start of the staircase (bottom)
  end: Vec2; // End of the staircase (top)
  width: number; // width of stairs in meters
  treadCount: number; // number of steps
  direction: 'up' | 'down'; // direction arrow
}

export interface LineEntity extends BaseEntity {
  type: 'line';
  start: Vec2;
  end: Vec2;
}

export interface RectEntity extends BaseEntity {
  type: 'rect';
  p1: Vec2; // corner 1
  p2: Vec2; // corner 2
}

export interface CircleEntity extends BaseEntity {
  type: 'circle';
  center: Vec2;
  radius: number;
}

export interface ArcEntity extends BaseEntity {
  type: 'arc';
  center: Vec2;
  radius: number;
  startAngle: number; // in radians
  endAngle: number; // in radians
}

export interface DimensionEntity extends BaseEntity {
  type: 'dimension';
  p1: Vec2; // first measured point
  p2: Vec2; // second measured point
  offset: number; // distance from the measured points line (perpendicular offset in world units)
  label?: string; // custom text, if empty it displays the auto-calculated dimension
  valueOverride?: number; // override measured distance in meters
}

export interface TextEntity extends BaseEntity {
  type: 'text';
  position: Vec2;
  text: string;
  fontSize: number; // in world units (meters) or screen pt? Let's use world units so it scales with zoom.
}

export type Entity =
  | WallEntity
  | DoorEntity
  | WindowEntity
  | StairsEntity
  | LineEntity
  | RectEntity
  | CircleEntity
  | ArcEntity
  | DimensionEntity
  | TextEntity;

// Constraint Types
export type ConstraintType =
  | 'coincident' // two points are locked together
  | 'horizontal' // wall/line is horizontal (dy = 0)
  | 'vertical' // wall/line is vertical (dx = 0)
  | 'fixed_length' // distance between two points is locked
  | 'fixed_angle' // angle of line is locked
  | 'parallel' // two lines are parallel
  | 'perpendicular' // two lines are perpendicular
  | 'equal_length' // two lines have equal length
  | 'collinear' // two lines lie on the same infinite line
  | 'concentric'; // two circles/arcs share the same center

export interface PointRef {
  entityId: string;
  pointKey: 'start' | 'end' | 'center' | 'p1' | 'p2' | 'position'; // which point of the entity
}

export interface Constraint {
  id: string;
  type: ConstraintType;
  entityIds: string[]; // entities involved in the constraint
  pointRefs?: PointRef[]; // specific points if applicable
  value?: number; // e.g. fixed length distance, angle
}

export type UnitSystem = 'metric' | 'imperial';

export interface Page {
  id: string;
  name: string;
  entities: Entity[];
  constraints: Constraint[];
}

export interface Project {
  name: string;
  created: number;
  modified: number;
  unitSystem: UnitSystem;
  scale: number; // e.g. 100 for 1:100
  pages: Page[];
  activePageIndex: number;
}

export interface SnapResult {
  point: Vec2;
  type:
    | 'grid'
    | 'endpoint'
    | 'midpoint'
    | 'intersection'
    | 'perpendicular'
    | 'wall-align';
  entityId?: string; // associated entity if snapped to one
  extra?: any; // e.g. snapped wall-angle for door/window alignment
}
