import {
  Entity,
  WallEntity,
  DoorEntity,
  WindowEntity,
  StairsEntity,
  LineEntity,
  RectEntity,
  CircleEntity,
  ArcEntity,
  DimensionEntity,
  TextEntity,
  Vec2,
} from './types';

// Helper to generate a simple unique ID
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function createWall(start: Vec2, end: Vec2, thickness = 0.20): WallEntity {
  return {
    id: generateId(),
    type: 'wall',
    start: { ...start },
    end: { ...end },
    thickness,
    locked: false,
  };
}

export function createDoor(
  wallId: string,
  position = 0.5,
  width = 0.9,
  hingeSide: 'left' | 'right' = 'left',
  openSide: 'in' | 'out' = 'in'
): DoorEntity {
  return {
    id: generateId(),
    type: 'door',
    wallId,
    position,
    width,
    hingeSide,
    openSide,
    swingAngle: 90,
    locked: false,
  };
}

export function createWindow(wallId: string, position = 0.5, width = 1.2): WindowEntity {
  return {
    id: generateId(),
    type: 'window',
    wallId,
    position,
    width,
    locked: false,
  };
}

export function createStairs(
  start: Vec2,
  end: Vec2,
  width = 1.0,
  treadCount = 12,
  direction: 'up' | 'down' = 'up'
): StairsEntity {
  return {
    id: generateId(),
    type: 'stairs',
    start: { ...start },
    end: { ...end },
    width,
    treadCount,
    direction,
    locked: false,
  };
}

export function createLine(start: Vec2, end: Vec2): LineEntity {
  return {
    id: generateId(),
    type: 'line',
    start: { ...start },
    end: { ...end },
    locked: false,
  };
}

export function createRect(p1: Vec2, p2: Vec2): RectEntity {
  return {
    id: generateId(),
    type: 'rect',
    p1: { ...p1 },
    p2: { ...p2 },
    locked: false,
  };
}

export function createCircle(center: Vec2, radius: number): CircleEntity {
  return {
    id: generateId(),
    type: 'circle',
    center: { ...center },
    radius,
    locked: false,
  };
}

export function createArc(
  center: Vec2,
  radius: number,
  startAngle = 0,
  endAngle = Math.PI
): ArcEntity {
  return {
    id: generateId(),
    type: 'arc',
    center: { ...center },
    radius,
    startAngle,
    endAngle,
    locked: false,
  };
}

export function createDimension(
  p1: Vec2,
  p2: Vec2,
  offset = 0.5,
  label?: string,
  valueOverride?: number
): DimensionEntity {
  return {
    id: generateId(),
    type: 'dimension',
    p1: { ...p1 },
    p2: { ...p2 },
    offset,
    label,
    valueOverride,
    locked: false,
  };
}

export function createText(position: Vec2, text = 'Text', fontSize = 0.25): TextEntity {
  return {
    id: generateId(),
    type: 'text',
    position: { ...position },
    text,
    fontSize,
    locked: false,
  };
}

// Clone an entity
export function cloneEntity(entity: Entity): Entity {
  return JSON.parse(JSON.stringify(entity));
}
