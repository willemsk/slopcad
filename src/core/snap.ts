import {Vec2, Entity, SnapResult} from './types';
import {
  dist,
  closestPointOnSegment,
  projectPointOnLine,
  sub,
  len,
  normalize,
} from './geometry';

export interface SnapSettings {
  grid: boolean;
  endpoints: boolean;
  midpoints: boolean;
  intersections: boolean;
  wallAlign: boolean; // Snap door/window to walls
}

export function getSnapPoint(
  mousePos: Vec2,
  entities: Entity[],
  gridSpacing: number | null,
  settings: SnapSettings,
  snapRadiusWorld: number, // Snap radius in world coordinate units
  activeToolType?: string,
): SnapResult {
  let bestSnap: SnapResult = {point: {...mousePos}, type: 'grid'}; // default fallback
  let bestDist = snapRadiusWorld;

  // 1. Special wall-align snap for Door and Window tools
  // These MUST snap to walls, so wall-align takes priority
  if (
    settings.wallAlign &&
    (activeToolType === 'door' || activeToolType === 'window')
  ) {
    let bestWallDist = Infinity;
    let bestWallProj: Vec2 | null = null;
    let bestWallId: string | null = null;
    let bestT = 0.5;

    for (const ent of entities) {
      if (ent.type === 'wall') {
        const wall = ent;
        const proj = closestPointOnSegment(mousePos, wall.start, wall.end);
        const d = dist(mousePos, proj);
        if (d < bestWallDist) {
          bestWallDist = d;
          bestWallProj = proj;
          bestWallId = wall.id;

          // Compute T coordinate (0 to 1)
          const wallLength = dist(wall.start, wall.end);
          if (wallLength > 0) {
            bestT = dist(wall.start, proj) / wallLength;
          } else {
            bestT = 0;
          }
        }
      }
    }

    // If we found a wall and it's within snap radius or if we are forced to place on walls
    if (bestWallProj && bestWallId && bestWallDist < snapRadiusWorld * 2.0) {
      return {
        point: bestWallProj,
        type: 'wall-align',
        entityId: bestWallId,
        extra: {t: bestT},
      };
    }
  }

  // 2. Object Snapping (Endpoints, Midpoints, Centers)
  for (const ent of entities) {
    // Endpoints
    if (settings.endpoints) {
      const endpoints: Vec2[] = [];
      if (ent.type === 'wall' || ent.type === 'line' || ent.type === 'stairs') {
        endpoints.push(ent.start, ent.end);
      } else if (ent.type === 'rect') {
        const r = ent;
        endpoints.push(
          r.p1,
          r.p2,
          {x: r.p1.x, y: r.p2.y},
          {x: r.p2.x, y: r.p1.y},
        );
      } else if (ent.type === 'circle' || ent.type === 'arc') {
        endpoints.push(ent.center);
      }

      for (const pt of endpoints) {
        const d = dist(mousePos, pt);
        if (d < bestDist) {
          bestDist = d;
          bestSnap = {point: {...pt}, type: 'endpoint', entityId: ent.id};
        }
      }
    }

    // Midpoints
    if (settings.midpoints) {
      const midpoints: Vec2[] = [];
      if (ent.type === 'wall' || ent.type === 'line' || ent.type === 'stairs') {
        const start = ent.start;
        const end = ent.end;
        midpoints.push({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2});
      } else if (ent.type === 'rect') {
        const r = ent;
        midpoints.push(
          {x: (r.p1.x + r.p2.x) / 2, y: r.p1.y},
          {x: (r.p1.x + r.p2.x) / 2, y: r.p2.y},
          {x: r.p1.x, y: (r.p1.y + r.p2.y) / 2},
          {x: r.p2.x, y: (r.p1.y + r.p2.y) / 2},
        );
      }

      for (const pt of midpoints) {
        const d = dist(mousePos, pt);
        if (d < bestDist) {
          bestDist = d;
          bestSnap = {point: {...pt}, type: 'midpoint', entityId: ent.id};
        }
      }
    }
  }

  // 3. Grid Snapping
  if (
    settings.grid &&
    gridSpacing !== null &&
    gridSpacing > 0 &&
    bestDist === snapRadiusWorld
  ) {
    const snapX = Math.round(mousePos.x / gridSpacing) * gridSpacing;
    const snapY = Math.round(mousePos.y / gridSpacing) * gridSpacing;
    const gridPt = {x: snapX, y: snapY};
    const d = dist(mousePos, gridPt);
    if (d < snapRadiusWorld) {
      bestDist = d;
      bestSnap = {point: gridPt, type: 'grid'};
    }
  }

  return bestSnap;
}
