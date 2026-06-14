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

export function createWall(
  start: Vec2,
  end: Vec2,
  thickness = 0.2,
  layerId = '0',
): WallEntity {
  return {
    id: generateId(),
    type: 'wall',
    layerId,
    start: {...start},
    end: {...end},
    thickness,
    locked: false,
  };
}

export function createDoor(
  wallId: string,
  position = 0.5,
  width = 0.9,
  hingeSide: 'left' | 'right' = 'left',
  openSide: 'in' | 'out' = 'in',
  layerId = '0',
): DoorEntity {
  return {
    id: generateId(),
    type: 'door',
    layerId,
    wallId,
    position,
    width,
    hingeSide,
    openSide,
    swingAngle: 90,
    locked: false,
  };
}

export function createWindow(
  wallId: string,
  position = 0.5,
  width = 1.2,
  layerId = '0',
): WindowEntity {
  return {
    id: generateId(),
    type: 'window',
    layerId,
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
  direction: 'up' | 'down' = 'up',
  layerId = '0',
): StairsEntity {
  return {
    id: generateId(),
    type: 'stairs',
    layerId,
    start: {...start},
    end: {...end},
    width,
    treadCount,
    direction,
    locked: false,
  };
}

export function createLine(start: Vec2, end: Vec2, layerId = '0'): LineEntity {
  return {
    id: generateId(),
    type: 'line',
    layerId,
    start: {...start},
    end: {...end},
    locked: false,
  };
}

export function createRect(p1: Vec2, p2: Vec2, layerId = '0'): RectEntity {
  return {
    id: generateId(),
    type: 'rect',
    layerId,
    p1: {...p1},
    p2: {...p2},
    locked: false,
  };
}

export function createCircle(
  center: Vec2,
  radius: number,
  layerId = '0',
): CircleEntity {
  return {
    id: generateId(),
    type: 'circle',
    layerId,
    center: {...center},
    radius,
    locked: false,
  };
}

export function createArc(
  center: Vec2,
  radius: number,
  startAngle = 0,
  endAngle = Math.PI,
  layerId = '0',
): ArcEntity {
  return {
    id: generateId(),
    type: 'arc',
    layerId,
    center: {...center},
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
  valueOverride?: number,
  layerId = '0',
): DimensionEntity {
  return {
    id: generateId(),
    type: 'dimension',
    layerId,
    p1: {...p1},
    p2: {...p2},
    offset,
    label,
    valueOverride,
    locked: false,
  };
}

export function createText(
  position: Vec2,
  text = 'Text',
  fontSize = 0.25,
  layerId = '0',
): TextEntity {
  return {
    id: generateId(),
    type: 'text',
    layerId,
    position: {...position},
    text,
    fontSize,
    locked: false,
  };
}

// Clone an entity
export function cloneEntity(entity: Entity): Entity {
  return JSON.parse(JSON.stringify(entity));
}
