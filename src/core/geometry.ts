import { Vec2 } from './types';

export function add(v1: Vec2, v2: Vec2): Vec2 {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function sub(v1: Vec2, v2: Vec2): Vec2 {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function len(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function dist(v1: Vec2, v2: Vec2): number {
  return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
}

export function normalize(v: Vec2): Vec2 {
  const l = len(v);
  if (l === 0) return { x: 0, y: 0 };
  return { x: v.x / l, y: v.y / l };
}

export function dot(v1: Vec2, v2: Vec2): number {
  return v1.x * v2.x + v1.y * v2.y;
}

export function cross(v1: Vec2, v2: Vec2): number {
  return v1.x * v2.y - v1.y * v2.x;
}

export function angle(v: Vec2): number {
  return Math.atan2(v.y, v.x);
}

export function rotate(v: Vec2, rad: number): Vec2 {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
}

export function projectPointOnLine(p: Vec2, lineStart: Vec2, lineEnd: Vec2): Vec2 {
  const ab = sub(lineEnd, lineStart);
  const ap = sub(p, lineStart);
  const abLen2 = dot(ab, ab);
  if (abLen2 === 0) return lineStart;
  const t = dot(ap, ab) / abLen2;
  return add(lineStart, scale(ab, t));
}

export function closestPointOnSegment(p: Vec2, lineStart: Vec2, lineEnd: Vec2): Vec2 {
  const ab = sub(lineEnd, lineStart);
  const ap = sub(p, lineStart);
  const abLen2 = dot(ab, ab);
  if (abLen2 === 0) return lineStart;
  let t = dot(ap, ab) / abLen2;
  t = Math.max(0, Math.min(1, t));
  return add(lineStart, scale(ab, t));
}

export function distToSegment(p: Vec2, lineStart: Vec2, lineEnd: Vec2): number {
  const cp = closestPointOnSegment(p, lineStart, lineEnd);
  return dist(p, cp);
}

export function lineIntersection(
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  p4: Vec2
): Vec2 | null {
  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denominator === 0) return null; // Parallel

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

  // Check if intersection is on both segments
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y),
    };
  }

  return null;
}

export function lerp(p1: Vec2, p2: Vec2, t: number): Vec2 {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
}

export function angleBetween(v1: Vec2, v2: Vec2): number {
  const d = dot(v1, v2);
  const c = cross(v1, v2);
  return Math.atan2(c, d);
}
