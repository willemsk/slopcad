import {Layer, WallEntity, Vec2} from '../../core/types';
import {
  dist,
  sub,
  add,
  scale,
  normalize,
  lerp,
  distToSegment,
  projectPointT,
  infiniteLineIntersection,
  dot,
} from '../../core/geometry';
import {EntityRenderContext} from '../types';
import {WallRenderData, mergeIntervals} from './shared';

/**
 * Batch renderer for multiple walls to compute intersection gaps and miters correctly.
 */
export function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: WallEntity[],
  selectedIds: Set<string>,
  layers: Layer[],
  zoom: number,
) {
  const renderData: WallRenderData[] = [];

  // Phase 1: Compute polygons
  for (const wall of walls) {
    const {start, end, thickness} = wall;
    const d = dist(start, end);
    if (d === 0) continue;

    const u = normalize(sub(end, start));
    const n = {x: -u.y, y: u.x};
    const halfThick = thickness / 2;

    let pStartL = add(start, scale(n, halfThick));
    let pStartR = sub(start, scale(n, halfThick));
    let pEndL = add(end, scale(n, halfThick));
    let pEndR = sub(end, scale(n, halfThick));

    let skipStartCap = false;
    let skipEndCap = false;

    // Helper to process an endpoint
    const processEndpoint = (isStart: boolean) => {
      const pt = isStart ? start : end;
      const uOut = isStart ? scale(u, -1) : u;

      const ptL = isStart ? pStartL : pEndL;
      const ptR = isStart ? pStartR : pEndR;

      const touchingWalls = walls.filter(w => {
        if (w.id === wall.id) return false;
        if (dist(w.start, pt) < 1e-4 || dist(w.end, pt) < 1e-4) return true;
        if (distToSegment(pt, w.start, w.end) < 1e-4) return true;
        return false;
      });

      if (touchingWalls.length === 1) {
        const w2 = touchingWalls[0];
        const isCorner = dist(w2.start, pt) < 1e-4 || dist(w2.end, pt) < 1e-4;

        if (isCorner) {
          if (isStart) skipStartCap = true;
          else skipEndCap = true;

          const isW2Start = dist(w2.start, pt) < 1e-4;
          const u2 = normalize(sub(w2.end, w2.start));
          const n2 = {x: -u2.y, y: u2.x};
          const halfThick2 = w2.thickness / 2;
          const w2_L_start = add(w2.start, scale(n2, halfThick2));
          const w2_R_start = sub(w2.start, scale(n2, halfThick2));

          const p1L = isStart ? pStartL : pEndL;
          const p1R = isStart ? pStartR : pEndR;

          let newL: Vec2 | null;
          let newR: Vec2 | null;

          if (isStart !== isW2Start) {
            newL = infiniteLineIntersection(p1L, u, w2_L_start, u2);
            newR = infiniteLineIntersection(p1R, u, w2_R_start, u2);
          } else {
            newL = infiniteLineIntersection(p1L, u, w2_R_start, u2);
            newR = infiniteLineIntersection(p1R, u, w2_L_start, u2);
          }

          if (isStart) {
            pStartL = newL || pStartL;
            pStartR = newR || pStartR;
          } else {
            pEndL = newL || pEndL;
            pEndR = newR || pEndR;
          }
        } else {
          // T-Junction
          if (isStart) skipStartCap = true;
          else skipEndCap = true;

          const u2 = normalize(sub(w2.end, w2.start));
          const n2 = {x: -u2.y, y: u2.x};
          const L2 = add(w2.start, scale(n2, w2.thickness / 2));
          const R2 = sub(w2.start, scale(n2, w2.thickness / 2));

          const iL_L2 = infiniteLineIntersection(ptL, uOut, L2, u2);
          const iL_R2 = infiniteLineIntersection(ptL, uOut, R2, u2);
          const iR_L2 = infiniteLineIntersection(ptR, uOut, L2, u2);
          const iR_R2 = infiniteLineIntersection(ptR, uOut, R2, u2);

          const tL_L2 = iL_L2 ? dot(sub(iL_L2, ptL), uOut) : Infinity;
          const tL_R2 = iL_R2 ? dot(sub(iL_R2, ptL), uOut) : Infinity;
          const iL = tL_L2 < tL_R2 ? iL_L2 : iL_R2;

          const tR_L2 = iR_L2 ? dot(sub(iR_L2, ptR), uOut) : Infinity;
          const tR_R2 = iR_R2 ? dot(sub(iR_R2, ptR), uOut) : Infinity;
          const iR = tR_L2 < tR_R2 ? iR_L2 : iR_R2;

          if (isStart) {
            pStartL = iL || ptL;
            pStartR = iR || ptR;
          } else {
            pEndL = iL || ptL;
            pEndR = iR || ptR;
          }
        }
      }
    };

    processEndpoint(true);
    processEndpoint(false);

    renderData.push({
      wall,
      pStartL,
      pStartR,
      pEndL,
      pEndR,
      skipStartCap,
      skipEndCap,
      leftGaps: [],
      rightGaps: [],
    });
  }

  // Phase 2: Compute T-Junction gaps on main walls
  for (const data of renderData) {
    const w = data.wall;

    const tWalls = renderData.filter(other => {
      if (other.wall.id === w.id) return false;
      return (
        distToSegment(other.wall.start, w.start, w.end) < 1e-4 ||
        distToSegment(other.wall.end, w.start, w.end) < 1e-4
      );
    });

    for (const tData of tWalls) {
      const pt =
        distToSegment(tData.wall.start, w.start, w.end) < 1e-4
          ? tData.wall.start
          : tData.wall.end;

      const isCornerStart =
        dist(w.start, tData.wall.start) < 1e-4 ||
        dist(w.start, tData.wall.end) < 1e-4;
      const isCornerEnd =
        dist(w.end, tData.wall.start) < 1e-4 ||
        dist(w.end, tData.wall.end) < 1e-4;

      if (isCornerStart || isCornerEnd) continue;

      const isStart = dist(pt, tData.wall.start) < 1e-4;

      const p1 = isStart ? tData.pStartL : tData.pEndL;
      const p2 = isStart ? tData.pStartR : tData.pEndR;

      const t1 = projectPointT(p1, w.start, w.end);
      const t2 = projectPointT(p2, w.start, w.end);

      const gapInterval: [number, number] = [
        Math.min(t1, t2),
        Math.max(t1, t2),
      ];

      const inU = normalize(sub(tData.wall.end, tData.wall.start));
      const uOut = isStart ? scale(inU, -1) : inU;

      const mainU = normalize(sub(w.end, w.start));
      const mainN = {x: -mainU.y, y: mainU.x};

      if (dot(uOut, mainN) > 0) {
        data.leftGaps.push(gapInterval);
      } else {
        data.rightGaps.push(gapInterval);
      }
    }

    data.leftGaps = mergeIntervals(data.leftGaps);
    data.rightGaps = mergeIntervals(data.rightGaps);
  }

  // Phase 3: Draw Fills
  for (const data of renderData) {
    const isSelected = selectedIds.has(data.wall.id);
    ctx.beginPath();
    ctx.moveTo(data.pStartL.x, data.pStartL.y);
    ctx.lineTo(data.pEndL.x, data.pEndL.y);
    ctx.lineTo(data.pEndR.x, data.pEndR.y);
    ctx.lineTo(data.pStartR.x, data.pStartR.y);
    ctx.closePath();
    ctx.fillStyle = isSelected
      ? 'rgba(34, 211, 238, 0.2)'
      : 'rgba(200, 202, 212, 0.15)';
    ctx.fill();
  }

  // Phase 4: Draw Strokes
  for (const data of renderData) {
    const isSelected = selectedIds.has(data.wall.id);
    const layer = layers.find(l => l.id === data.wall.layerId) || layers[0];
    const color = layer?.color || '#c8cad4';

    ctx.strokeStyle = isSelected ? '#22d3ee' : color;
    ctx.lineWidth = (isSelected ? 3 : 2) / zoom;

    // Draw left boundary
    let currT = 0;
    for (const gap of data.leftGaps) {
      if (gap[0] > currT) {
        ctx.beginPath();
        const startP = lerp(data.pStartL, data.pEndL, currT);
        const endP = lerp(data.pStartL, data.pEndL, gap[0]);
        ctx.moveTo(startP.x, startP.y);
        ctx.lineTo(endP.x, endP.y);
        ctx.stroke();
      }
      currT = Math.max(currT, gap[1]);
    }
    if (currT < 1) {
      ctx.beginPath();
      const startP = lerp(data.pStartL, data.pEndL, currT);
      ctx.moveTo(startP.x, startP.y);
      ctx.lineTo(data.pEndL.x, data.pEndL.y);
      ctx.stroke();
    }

    // Draw right boundary
    currT = 0;
    for (const gap of data.rightGaps) {
      if (gap[0] > currT) {
        ctx.beginPath();
        const startP = lerp(data.pStartR, data.pEndR, currT);
        const endP = lerp(data.pStartR, data.pEndR, gap[0]);
        ctx.moveTo(startP.x, startP.y);
        ctx.lineTo(endP.x, endP.y);
        ctx.stroke();
      }
      currT = Math.max(currT, gap[1]);
    }
    if (currT < 1) {
      ctx.beginPath();
      const startP = lerp(data.pStartR, data.pEndR, currT);
      ctx.moveTo(startP.x, startP.y);
      ctx.lineTo(data.pEndR.x, data.pEndR.y);
      ctx.stroke();
    }

    // Draw caps
    if (!data.skipStartCap) {
      ctx.beginPath();
      ctx.moveTo(data.pStartL.x, data.pStartL.y);
      ctx.lineTo(data.pStartR.x, data.pStartR.y);
      ctx.stroke();
    }
    if (!data.skipEndCap) {
      ctx.beginPath();
      ctx.moveTo(data.pEndL.x, data.pEndL.y);
      ctx.lineTo(data.pEndR.x, data.pEndR.y);
      ctx.stroke();
    }

    // Draw center line
    ctx.beginPath();
    ctx.moveTo(data.wall.start.x, data.wall.start.y);
    ctx.lineTo(data.wall.end.x, data.wall.end.y);
    ctx.strokeStyle = 'rgba(200, 202, 212, 0.25)';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([0.05, 0.05]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/** Single entity renderer for the registry wrapper */
export function renderWall(context: EntityRenderContext<WallEntity>) {
  const {ctx, entity, isSelected, layers, zoom} = context;
  const selectedIds = new Set(isSelected ? [entity.id] : []);
  drawWalls(ctx, [entity], selectedIds, layers, zoom);
}
