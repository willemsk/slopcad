import {describe, expect, it} from 'vitest';
import {
  createArc,
  createCircle,
  createDimension,
  createDoor,
  createLine,
  createRect,
  createText,
  createWall,
  createWindow,
} from './entity';
import {findEntityAt} from './hit-test';
import type {Entity} from './types';

describe('Hit Testing', () => {
  it('finds a wall entity when clicking close to it', () => {
    const wall = createWall({x: 0, y: 0}, {x: 10, y: 0});
    const entities: Entity[] = [wall];

    // Close to wall start
    expect(findEntityAt({x: 0.1, y: 0.1}, entities, 0.5)).toBe(wall);
    // Far from wall
    expect(findEntityAt({x: 5, y: 5}, entities, 0.5)).toBeNull();
  });

  it('finds a line entity', () => {
    const line = createLine({x: 1, y: 1}, {x: 5, y: 5});
    const entities: Entity[] = [line];

    expect(findEntityAt({x: 3, y: 3.1}, entities, 0.5)).toBe(line);
    expect(findEntityAt({x: 10, y: 10}, entities, 0.5)).toBeNull();
  });

  it('finds a rect entity by checking its segments', () => {
    const rect = createRect({x: 0, y: 0}, {x: 4, y: 4});
    const entities: Entity[] = [rect];

    // Near top edge
    expect(findEntityAt({x: 2, y: 0.1}, entities, 0.5)).toBe(rect);
    // In center (far from edges)
    expect(findEntityAt({x: 2, y: 2}, entities, 0.5)).toBeNull();
  });

  it('finds a circle by checking its perimeter', () => {
    const circle = createCircle({x: 5, y: 5}, 3);
    const entities: Entity[] = [circle];

    // Near perimeter
    expect(findEntityAt({x: 5, y: 8.1}, entities, 0.5)).toBe(circle);
    // Center (far from perimeter)
    expect(findEntityAt({x: 5, y: 5}, entities, 0.5)).toBeNull();
  });

  it('finds an arc by checking its radius', () => {
    const arc = createArc({x: 0, y: 0}, 5, 0, Math.PI);
    const entities: Entity[] = [arc];

    expect(findEntityAt({x: 0, y: 5.1}, entities, 0.5)).toBe(arc);
  });

  it('finds a dimension entity by checking its projection line', () => {
    // measured points (0,0) to (10,0), offset is 2.0 (perpendicular offset)
    const dim = createDimension({x: 0, y: 0}, {x: 10, y: 0}, 2.0);
    const entities: Entity[] = [dim];

    // Near the offset line (y = 2.0)
    expect(findEntityAt({x: 5, y: 2.1}, entities, 0.5)).toBe(dim);
  });

  it('finds a text entity near its position', () => {
    const text = createText({x: 10, y: 10}, 'Hello');
    const entities: Entity[] = [text];

    expect(findEntityAt({x: 10.1, y: 9.9}, entities, 0.5)).toBe(text);
  });

  it('finds door/window and biases select preference over wall', () => {
    const wall = createWall({x: 0, y: 0}, {x: 10, y: 0});
    const door = createDoor(wall.id, 0.5, 1.0); // center is at x=5
    const entities: Entity[] = [wall, door];

    // Near the door center
    const hit = findEntityAt({x: 5.0, y: 0.05}, entities, 0.5);
    expect(hit).toBe(door); // Door should win due to distance bias (-0.001)
  });
});
