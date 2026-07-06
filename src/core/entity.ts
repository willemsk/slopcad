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
  Layer,
  Constraint,
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
  layerId = '0',
): DoorEntity {
  return {
    id: generateId(),
    type: 'door',
    wallId,
    position,
    width,
    layerId,
    flipX: false,
    flipY: false,
    openingAngle: 90,
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

/**
 * Gets the point (Vec2) from an entity for a given key, if applicable.
 */
export function getEntityPoint(entity: Entity, key: string): Vec2 | undefined {
  switch (entity.type) {
    case 'wall':
    case 'line':
    case 'stairs':
      if (key === 'start') return entity.start;
      if (key === 'end') return entity.end;
      break;
    case 'rect':
      if (key === 'p1') return entity.p1;
      if (key === 'p2') return entity.p2;
      break;
    case 'circle':
    case 'arc':
      if (key === 'center') return entity.center;
      break;
    case 'dimension':
      if (key === 'p1') return entity.p1;
      if (key === 'p2') return entity.p2;
      break;
    case 'text':
      if (key === 'position') return entity.position;
      break;
  }
  return undefined;
}

// Clone an entity
export function cloneEntity(entity: Entity): Entity {
  switch (entity.type) {
    case 'wall':
      return {
        ...entity,
        start: {...entity.start},
        end: {...entity.end},
      };
    case 'door':
      return {
        ...entity,
      };
    case 'window':
      return {
        ...entity,
      };
    case 'stairs':
      return {
        ...entity,
        start: {...entity.start},
        end: {...entity.end},
      };
    case 'line':
      return {
        ...entity,
        start: {...entity.start},
        end: {...entity.end},
      };
    case 'rect':
      return {
        ...entity,
        p1: {...entity.p1},
        p2: {...entity.p2},
      };
    case 'circle':
      return {
        ...entity,
        center: {...entity.center},
      };
    case 'arc':
      return {
        ...entity,
        center: {...entity.center},
      };
    case 'dimension':
      return {
        ...entity,
        p1: {...entity.p1},
        p2: {...entity.p2},
      };
    case 'text':
      return {
        ...entity,
        position: {...entity.position},
      };
  }
}

/**
 * Filters entities to return only those that belong to a visible layer.
 */
export function getVisibleEntities(
  entities: Entity[],
  layers: Layer[],
): Entity[] {
  const layerVisibilityMap = new Map(layers.map((l) => [l.id, l.visible]));
  const defaultVisibility = layers[0]?.visible ?? true;
  return entities.filter((ent) => {
    if (ent.layerId && layerVisibilityMap.has(ent.layerId)) {
      return layerVisibilityMap.get(ent.layerId);
    }
    return defaultVisibility;
  });
}

export function cloneConstraint(c: Constraint): Constraint {
  return {
    ...c,
    entityIds: [...c.entityIds],
    pointRefs: c.pointRefs ? c.pointRefs.map((pr) => ({...pr})) : undefined,
  };
}

export function cloneConstraints(cs: Constraint[]): Constraint[] {
  return cs.map(cloneConstraint);
}
