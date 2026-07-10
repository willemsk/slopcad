import {describe, expect, it} from 'vitest';
import {
  add,
  angle,
  angleBetween,
  closestPointOnSegment,
  cross,
  dist,
  distToSegment,
  dot,
  len,
  lerp,
  lineIntersection,
  normalize,
  projectPointOnLine,
  rotate,
  scale,
  sub,
} from './geometry';

describe('geometry utilities', () => {
  it('adds two vectors', () => {
    expect(add({x: 1, y: 2}, {x: 3, y: 4})).toEqual({x: 4, y: 6});
  });

  it('subtracts two vectors', () => {
    expect(sub({x: 5, y: 6}, {x: 3, y: 2})).toEqual({x: 2, y: 4});
  });

  it('scales a vector', () => {
    expect(scale({x: 2, y: -3}, 3)).toEqual({x: 6, y: -9});
  });

  it('calculates the length of a vector', () => {
    expect(len({x: 3, y: 4})).toBeCloseTo(5);
  });

  it('calculates the distance between two points', () => {
    expect(dist({x: 0, y: 0}, {x: 3, y: 4})).toBeCloseTo(5);
  });

  it('normalizes a vector', () => {
    const v = normalize({x: 3, y: 4});
    expect(v.x).toBeCloseTo(0.6);
    expect(v.y).toBeCloseTo(0.8);
    expect(normalize({x: 0, y: 0})).toEqual({x: 0, y: 0});
  });

  it('calculates the dot product', () => {
    expect(dot({x: 1, y: 2}, {x: 3, y: 4})).toBe(11);
  });

  it('calculates the cross product', () => {
    expect(cross({x: 1, y: 2}, {x: 3, y: 4})).toBe(-2);
  });

  it('calculates the angle of a vector', () => {
    expect(angle({x: 1, y: 1})).toBeCloseTo(Math.PI / 4);
    expect(angle({x: -1, y: 0})).toBeCloseTo(Math.PI);
  });

  it('rotates a vector', () => {
    const v = rotate({x: 1, y: 0}, Math.PI / 2);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(1);
  });

  it('projects a point onto a line (infinite)', () => {
    const p = projectPointOnLine({x: 5, y: 5}, {x: 0, y: 0}, {x: 10, y: 0});
    expect(p.x).toBeCloseTo(5);
    expect(p.y).toBeCloseTo(0);

    const outsideP = projectPointOnLine(
      {x: -5, y: 5},
      {x: 0, y: 0},
      {x: 10, y: 0},
    );
    expect(outsideP.x).toBeCloseTo(-5);
    expect(outsideP.y).toBeCloseTo(0);
  });

  it('finds the closest point on a segment', () => {
    const p1 = closestPointOnSegment({x: 5, y: 5}, {x: 0, y: 0}, {x: 10, y: 0});
    expect(p1.x).toBeCloseTo(5);
    expect(p1.y).toBeCloseTo(0);

    const p2 = closestPointOnSegment(
      {x: -5, y: 5},
      {x: 0, y: 0},
      {x: 10, y: 0},
    );
    expect(p2.x).toBeCloseTo(0);
    expect(p2.y).toBeCloseTo(0);

    const p3 = closestPointOnSegment(
      {x: 15, y: 5},
      {x: 0, y: 0},
      {x: 10, y: 0},
    );
    expect(p3.x).toBeCloseTo(10);
    expect(p3.y).toBeCloseTo(0);
  });

  it('calculates distance to a segment', () => {
    expect(
      distToSegment({x: 5, y: 5}, {x: 0, y: 0}, {x: 10, y: 0}),
    ).toBeCloseTo(5);
    expect(
      distToSegment({x: -5, y: 0}, {x: 0, y: 0}, {x: 10, y: 0}),
    ).toBeCloseTo(5);
  });

  it('finds intersection of two segments', () => {
    const intersect = lineIntersection(
      {x: 0, y: 5},
      {x: 10, y: 5},
      {x: 5, y: 0},
      {x: 5, y: 10},
    );
    expect(intersect?.x).toBeCloseTo(5);
    expect(intersect?.y).toBeCloseTo(5);

    const nonIntersect = lineIntersection(
      {x: 0, y: 5},
      {x: 10, y: 5},
      {x: 15, y: 0},
      {x: 15, y: 10},
    );
    expect(nonIntersect).toBeNull();
  });

  it('interpolates between two points', () => {
    expect(lerp({x: 0, y: 0}, {x: 10, y: 10}, 0.5)).toEqual({x: 5, y: 5});
    expect(lerp({x: 0, y: 0}, {x: 10, y: 10}, 0)).toEqual({x: 0, y: 0});
    expect(lerp({x: 0, y: 0}, {x: 10, y: 10}, 1)).toEqual({x: 10, y: 10});
  });

  it('calculates the angle between two vectors', () => {
    expect(angleBetween({x: 1, y: 0}, {x: 0, y: 1})).toBeCloseTo(Math.PI / 2);
    expect(angleBetween({x: 1, y: 0}, {x: -1, y: 0})).toBeCloseTo(Math.PI);
  });
});
