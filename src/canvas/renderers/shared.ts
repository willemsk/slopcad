import {Entity, WallEntity, Vec2} from '../../core/types';

export interface WallRenderData {
  wall: WallEntity;
  pStartL: Vec2;
  pStartR: Vec2;
  pEndL: Vec2;
  pEndR: Vec2;
  skipStartCap: boolean;
  skipEndCap: boolean;
  leftGaps: [number, number][];
  rightGaps: [number, number][];
}

export function mergeIntervals(
  intervals: [number, number][],
): [number, number][] {
  if (intervals.length === 0) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [[...intervals[0]] as [number, number]];
  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    const curr = intervals[i];
    if (curr[0] <= last[1] + 1e-6) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      res.push([...curr] as [number, number]);
    }
  }
  return res;
}

export function findWall(
  entities: Entity[],
  id: string,
): WallEntity | undefined {
  return entities.find(e => e.id === id && e.type === 'wall') as
    | WallEntity
    | undefined;
}
