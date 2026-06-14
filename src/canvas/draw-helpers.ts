import {
  Vec2,
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
  Constraint,
  UnitSystem,
  Layer,
} from '../core/types';
import {
  dist,
  sub,
  add,
  scale,
  normalize,
  rotate,
  lerp,
  angle,
} from '../core/geometry';
import {formatLength} from '../core/units';

import {
  distToSegment,
  projectPointT,
  infiniteLineIntersection,
  dot,
} from '../core/geometry';

interface WallRenderData {
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

function mergeIntervals(intervals: [number, number][]): [number, number][] {
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

function findWall(entities: Entity[], id: string): WallEntity | undefined {
  return entities.find(e => e.id === id && e.type === 'wall') as WallEntity | undefined;
}

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
      const uOut = isStart ? scale(u, -1) : u; // vector pointing AWAY from the wall center

      const ptL = isStart ? pStartL : pEndL;
      const ptR = isStart ? pStartR : pEndR;

      const touchingWalls = walls.filter(w => {
        if (w.id === wall.id) return false;
        // Corner touch
        if (dist(w.start, pt) < 1e-4 || dist(w.end, pt) < 1e-4) return true;
        // T-junction touch
        if (distToSegment(pt, w.start, w.end) < 1e-4) return true;
        return false;
      });

      if (touchingWalls.length === 1) {
        const w2 = touchingWalls[0];
        const isCorner = dist(w2.start, pt) < 1e-4 || dist(w2.end, pt) < 1e-4;

        if (isCorner) {
          if (isStart) skipStartCap = true;
          else skipEndCap = true;

          const pt2 = dist(w2.start, pt) < 1e-4 ? w2.start : w2.end;
          const w2Other = dist(w2.start, pt) < 1e-4 ? w2.end : w2.start;

          const u2Out = normalize(sub(w2Other, pt2));
          const n2Out = {x: -u2Out.y, y: u2Out.x};
          const halfThick2 = w2.thickness / 2;

          const L2 = add(pt2, scale(n2Out, halfThick2));
          const R2 = sub(pt2, scale(n2Out, halfThick2));

          const leftOfOut = isStart ? ptR : ptL;
          const rightOfOut = isStart ? ptL : ptR;

          const newLeftOfOut =
            infiniteLineIntersection(leftOfOut, uOut, L2, u2Out) || leftOfOut;
          const newRightOfOut =
            infiniteLineIntersection(rightOfOut, uOut, R2, u2Out) || rightOfOut;

          if (isStart) {
            pStartR = newLeftOfOut;
            pStartL = newRightOfOut;
          } else {
            pEndL = newLeftOfOut;
            pEndR = newRightOfOut;
          }
        } else {
          // T-Junction (wall ends on w2)
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
    const u = normalize(sub(w.end, w.start));

    // Find walls that T-junction into w
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
      // The corners of the T-wall intersecting us are:
      const p1 =
        dist(pt, tData.wall.start) < 1e-4 ? tData.pStartL : tData.pEndL;
      const p2 =
        dist(pt, tData.wall.start) < 1e-4 ? tData.pStartR : tData.pEndR;

      // Check which side of w they fall on
      const t1L = projectPointT(p1, data.pStartL, data.pEndL);
      const t2L = projectPointT(p2, data.pStartL, data.pEndL);
      if (
        t1L >= -0.01 &&
        t1L <= 1.01 &&
        distToSegment(p1, data.pStartL, data.pEndL) < 1e-4
      ) {
        data.leftGaps.push([Math.min(t1L, t2L), Math.max(t1L, t2L)]);
      }

      const t1R = projectPointT(p1, data.pStartR, data.pEndR);
      const t2R = projectPointT(p2, data.pStartR, data.pEndR);
      if (
        t1R >= -0.01 &&
        t1R <= 1.01 &&
        distToSegment(p1, data.pStartR, data.pEndR) < 1e-4
      ) {
        data.rightGaps.push([Math.min(t1R, t2R), Math.max(t1R, t2R)]);
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

export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: DoorEntity,
  entities: Entity[],
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  const wall = findWall(entities, door.wallId);
  if (!wall) return;

  const {start, end, thickness} = wall;
  const u = normalize(sub(end, start));
  const n = {x: -u.y, y: u.x};

  // Door center point on wall
  const c = lerp(start, end, door.position);
  const w = door.width;

  // Door endpoints on wall
  const d1 = sub(c, scale(u, w / 2)); // hinge/start
  const d2 = add(c, scale(u, w / 2)); // end

  // 1. Draw mask to clear the wall
  const halfThick = thickness / 2 + 0.02; // slightly wider than wall
  const m1 = add(d1, scale(n, halfThick));
  const m2 = add(d2, scale(n, halfThick));
  const m3 = sub(d2, scale(n, halfThick));
  const m4 = sub(d1, scale(n, halfThick));

  ctx.fillStyle = '#1e2028'; // Canvas background color
  ctx.beginPath();
  ctx.moveTo(m1.x, m1.y);
  ctx.lineTo(m2.x, m2.y);
  ctx.lineTo(m3.x, m3.y);
  ctx.lineTo(m4.x, m4.y);
  ctx.closePath();
  ctx.fill();

  // Draw wall cut outlines (the two ends of the wall)
  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 2 : 1.5) / zoom;
  ctx.beginPath();
  ctx.moveTo(m1.x, m1.y);
  ctx.lineTo(m4.x, m4.y);
  ctx.moveTo(m2.x, m2.y);
  ctx.lineTo(m3.x, m3.y);
  ctx.stroke();

  // 2. Draw Door swing
  // Calculate hinge point based on hingeSide
  const hinge = door.hingeSide === 'left' ? d1 : d2;
  const latch = door.hingeSide === 'left' ? d2 : d1;
  const swingDir = door.openSide === 'in' ? 1 : -1;
  const hingeToLatch = sub(latch, hinge);

  // Rotation angle for door leaf (90 deg open)
  // Left hinge opens clockwise, right hinge opens counter-clockwise
  const hingeSign = door.hingeSide === 'left' ? 1 : -1;
  const openAngle = swingDir * hingeSign * (Math.PI / 2);
  const leafVector = rotate(hingeToLatch, openAngle);
  const leafEnd = add(hinge, leafVector);

  // Draw door leaf
  ctx.beginPath();
  ctx.moveTo(hinge.x, hinge.y);
  ctx.lineTo(leafEnd.x, leafEnd.y);
  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  // Draw arc
  const startAng = angle(hingeToLatch);
  const endAng = angle(leafVector);
  const radius = w;

  ctx.beginPath();
  // Ensure arc goes in correct direction
  const counterClockwise = swingDir * hingeSign < 0;
  ctx.arc(hinge.x, hinge.y, radius, startAng, endAng, counterClockwise);
  ctx.strokeStyle = isSelected
    ? 'rgba(34, 211, 238, 0.5)'
    : 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([0.05, 0.05]);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawWindow(
  ctx: CanvasRenderingContext2D,
  windowEnt: WindowEntity,
  entities: Entity[],
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  const wall = findWall(entities, windowEnt.wallId);
  if (!wall) return;

  const {start, end, thickness} = wall;
  const u = normalize(sub(end, start));
  const n = {x: -u.y, y: u.x};

  const c = lerp(start, end, windowEnt.position);
  const w = windowEnt.width;

  const w1 = sub(c, scale(u, w / 2));
  const w2 = add(c, scale(u, w / 2));

  // Mask wall
  const halfThick = thickness / 2 + 0.01;
  const m1 = add(w1, scale(n, halfThick));
  const m2 = add(w2, scale(n, halfThick));
  const m3 = sub(w2, scale(n, halfThick));
  const m4 = sub(w1, scale(n, halfThick));

  ctx.fillStyle = '#1e2028';
  ctx.beginPath();
  ctx.moveTo(m1.x, m1.y);
  ctx.lineTo(m2.x, m2.y);
  ctx.lineTo(m3.x, m3.y);
  ctx.lineTo(m4.x, m4.y);
  ctx.closePath();
  ctx.fill();

  // Draw Window glass lines (three parallel lines)
  const strokeColor = isSelected ? '#22d3ee' : color;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = (isSelected ? 2.5 : 1.5) / zoom;

  // Window frame ends
  ctx.beginPath();
  ctx.moveTo(m1.x, m1.y);
  ctx.lineTo(m4.x, m4.y);
  ctx.moveTo(m2.x, m2.y);
  ctx.lineTo(m3.x, m3.y);
  ctx.stroke();

  // Glass lines
  const centerLineStart = w1;
  const centerLineEnd = w2;

  const innerLine1Start = add(w1, scale(n, thickness / 4));
  const innerLine1End = add(w2, scale(n, thickness / 4));

  const innerLine2Start = sub(w1, scale(n, thickness / 4));
  const innerLine2End = sub(w2, scale(n, thickness / 4));

  ctx.beginPath();
  ctx.moveTo(centerLineStart.x, centerLineStart.y);
  ctx.lineTo(centerLineEnd.x, centerLineEnd.y);
  ctx.moveTo(innerLine1Start.x, innerLine1Start.y);
  ctx.lineTo(innerLine1End.x, innerLine1End.y);
  ctx.moveTo(innerLine2Start.x, innerLine2Start.y);
  ctx.lineTo(innerLine2End.x, innerLine2End.y);
  ctx.stroke();
}

export function drawStairs(
  ctx: CanvasRenderingContext2D,
  stairs: StairsEntity,
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  const {start, end, width, treadCount, direction} = stairs;
  const d = dist(start, end);
  if (d === 0) return;

  const u = normalize(sub(end, start));
  const n = {x: -u.y, y: u.x};

  const halfWidth = width / 2;

  // Compute corners
  const s1 = add(start, scale(n, halfWidth));
  const s2 = add(end, scale(n, halfWidth));
  const s3 = sub(end, scale(n, halfWidth));
  const s4 = sub(start, scale(n, halfWidth));

  // Outline
  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.beginPath();
  ctx.moveTo(s1.x, s1.y);
  ctx.lineTo(s2.x, s2.y);
  ctx.lineTo(s3.x, s3.y);
  ctx.lineTo(s4.x, s4.y);
  ctx.closePath();
  ctx.stroke();

  // Treads
  ctx.lineWidth = 1 / zoom;
  ctx.strokeStyle = isSelected ? 'rgba(34, 211, 238, 0.7)' : color + '99'; // 60% opacity of layer color
  for (let i = 1; i < treadCount; i++) {
    const t = i / treadCount;
    const pt = lerp(start, end, t);
    const pLeft = add(pt, scale(n, halfWidth));
    const pRight = sub(pt, scale(n, halfWidth));

    ctx.beginPath();
    ctx.moveTo(pLeft.x, pLeft.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.stroke();
  }

  // Draw direction arrow
  ctx.lineWidth = 1.5 / zoom;
  ctx.strokeStyle = color; // Direction line
  ctx.fillStyle = color;

  // Draw start circle at 'start'
  ctx.beginPath();
  ctx.arc(start.x, start.y, 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Draw line to end
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  const arrowEnd = sub(end, scale(u, 0.15)); // Shorten line slightly before arrow head
  ctx.lineTo(arrowEnd.x, arrowEnd.y);
  ctx.stroke();

  // Draw arrow head at end
  const arrowWidth = 0.08;
  const arrowLength = 0.12;
  const aLeft = add(arrowEnd, rotate(scale(u, -arrowLength), Math.PI / 6));
  const aRight = add(arrowEnd, rotate(scale(u, -arrowLength), -Math.PI / 6));

  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(aLeft.x, aLeft.y);
  ctx.lineTo(aRight.x, aRight.y);
  ctx.closePath();
  ctx.fill();

  // Draw Label Text "UP" or "DN" near center
  const center = lerp(start, end, 0.5);
  const fontSize = 0.18;
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(center.x + n.x * 0.3, center.y + n.y * 0.3); // offset to side
  const ang = angle(u);
  // Keep text right-side up
  const textAngle =
    ang > Math.PI / 2 || ang < -Math.PI / 2 ? ang + Math.PI : ang;
  ctx.rotate(textAngle);
  ctx.fillText(direction === 'up' ? 'UP' : 'DN', 0, 0);
  ctx.restore();
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  line: LineEntity,
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  ctx.beginPath();
  ctx.moveTo(line.start.x, line.start.y);
  ctx.lineTo(line.end.x, line.end.y);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  rect: RectEntity,
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  const {p1, p2} = rect;
  ctx.beginPath();
  ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  ctx.fill();
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  circle: CircleEntity,
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  ctx.beginPath();
  ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  ctx.fill();
}

export function drawArc(
  ctx: CanvasRenderingContext2D,
  arc: ArcEntity,
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  ctx.beginPath();
  ctx.arc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();
}

export function drawDimension(
  ctx: CanvasRenderingContext2D,
  dim: DimensionEntity,
  isSelected: boolean,
  color: string,
  unitSystem: UnitSystem,
  zoom: number,
) {
  const {p1, p2, offset, label, valueOverride} = dim;
  const d = dist(p1, p2);
  if (d === 0) return;

  const u = normalize(sub(p2, p1));
  const n = {x: -u.y, y: u.x}; // Perpendicular

  // Dimension line endpoints (offset from actual points)
  const d1 = add(p1, scale(n, offset));
  const d2 = add(p2, scale(n, offset));

  const dimColor = isSelected ? '#22d3ee' : color;
  ctx.strokeStyle = dimColor;
  ctx.fillStyle = dimColor;
  ctx.lineWidth = (isSelected ? 2 : 1.2) / zoom;

  // 1. Draw extension lines from points to dimension line
  ctx.beginPath();
  // Add a tiny gap (e.g. 0.05m) and extend slightly past dimension line (0.05m)
  const extGap = scale(n, Math.sign(offset) * 0.05);
  const extPast = scale(n, Math.sign(offset) * 0.08);

  ctx.moveTo(p1.x + extGap.x, p1.y + extGap.y);
  ctx.lineTo(d1.x + extPast.x, d1.y + extPast.y);

  ctx.moveTo(p2.x + extGap.x, p2.y + extGap.y);
  ctx.lineTo(d2.x + extPast.x, d2.y + extPast.y);
  ctx.stroke();

  // 2. Draw dimension line
  ctx.beginPath();
  ctx.moveTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.stroke();

  // 3. Draw ticks/slashes or arrows at ends (standard architectural tick: 45 degree slash)
  const tickLength = 0.1;
  const slashDir = normalize({x: u.x + n.x, y: u.y + n.y}); // 45 deg

  ctx.beginPath();
  ctx.moveTo(d1.x - slashDir.x * tickLength, d1.y - slashDir.y * tickLength);
  ctx.lineTo(d1.x + slashDir.x * tickLength, d1.y + slashDir.y * tickLength);

  ctx.moveTo(d2.x - slashDir.x * tickLength, d2.y - slashDir.y * tickLength);
  ctx.lineTo(d2.x + slashDir.x * tickLength, d2.y + slashDir.y * tickLength);
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  // 4. Draw dimension text
  const lengthVal = valueOverride !== undefined ? valueOverride : d;
  const textVal = label || formatLength(lengthVal, unitSystem, 2);

  ctx.save();
  const center = lerp(d1, d2, 0.5);
  ctx.translate(center.x, center.y);

  // Rotate text to match line angle
  const ang = angle(u);
  // Keep text right-side up
  const textAngle =
    ang > Math.PI / 2 || ang < -Math.PI / 2 ? ang + Math.PI : ang;
  ctx.rotate(textAngle);

  // Draw background mask for text so dimension line doesn't cross it
  ctx.font = 'bold 0.18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(textVal).width;
  ctx.fillStyle = '#1e2028'; // Canvas background
  ctx.fillRect(-textWidth / 2 - 0.05, -0.1, textWidth + 0.1, 0.2);

  // Draw text
  ctx.fillStyle = dimColor;
  ctx.fillText(textVal, 0, 0);
  ctx.restore();
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  textEnt: TextEntity,
  isSelected: boolean,
  color: string,
  zoom: number,
) {
  ctx.save();
  ctx.font = `${textEnt.fontSize}px Inter, sans-serif`;
  ctx.fillStyle = isSelected ? '#22d3ee' : color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(textEnt.text, textEnt.position.x, textEnt.position.y);

  // If selected, draw simple boundary box
  if (isSelected) {
    const textWidth = ctx.measureText(textEnt.text).width;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.rect(
      textEnt.position.x - 0.05,
      textEnt.position.y - 0.05,
      textWidth + 0.1,
      textEnt.fontSize + 0.1,
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  zoom: number,
) {
  const pts: Vec2[] = [];
  if (
    entity.type === 'wall' ||
    entity.type === 'line' ||
    entity.type === 'stairs' ||
    entity.type === 'dimension'
  ) {
    pts.push(
      (entity as any).start || (entity as any).p1,
      (entity as any).end || (entity as any).p2,
    );
  } else if (entity.type === 'rect') {
    const r = entity;
    pts.push(r.p1, r.p2, {x: r.p1.x, y: r.p2.y}, {x: r.p2.x, y: r.p1.y});
  } else if (entity.type === 'circle' || entity.type === 'arc') {
    pts.push((entity as any).center);
    if (entity.type === 'circle') {
      const c = entity;
      pts.push({x: c.center.x + c.radius, y: c.center.y});
    }
  } else if (entity.type === 'text') {
    pts.push(entity.position);
  }

  // Draw handles as squares
  const handleSize = 6 / zoom; // 6 pixels converted to world size
  ctx.fillStyle = '#22d3ee';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5 / zoom;

  for (const pt of pts) {
    ctx.beginPath();
    ctx.rect(
      pt.x - handleSize / 2,
      pt.y - handleSize / 2,
      handleSize,
      handleSize,
    );
    ctx.fill();
    ctx.stroke();
  }
}

export function drawSnapIndicator(
  ctx: CanvasRenderingContext2D,
  pt: Vec2,
  type: string,
  zoom: number,
) {
  ctx.save();
  ctx.strokeStyle = '#f59e0b'; // Amber
  ctx.fillStyle = '#f59e0b';
  ctx.lineWidth = 1.5 / zoom;

  const size = 6 / zoom; // size of shape

  if (type === 'endpoint') {
    // Square
    ctx.beginPath();
    ctx.rect(pt.x - size / 2, pt.y - size / 2, size, size);
    ctx.stroke();
  } else if (type === 'midpoint') {
    // Triangle
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y - size / 2);
    ctx.lineTo(pt.x + size / 2, pt.y + size / 2);
    ctx.lineTo(pt.x - size / 2, pt.y + size / 2);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'grid') {
    // Small crosshair or dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2 / zoom, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'wall-align') {
    // Circle with dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1 / zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawConstraint(
  ctx: CanvasRenderingContext2D,
  constraint: Constraint,
  entities: Entity[],
  isSelected: boolean,
  unitSystem: UnitSystem,
  zoom: number,
) {
  const points: Vec2[] = [];
  for (const ref of constraint.pointRefs || []) {
    const ent = entities.find(e => e.id === ref.entityId);
    if (!ent) continue;
    if (ref.pointKey === 'start') points.push((ent as any).start);
    else if (ref.pointKey === 'end') points.push((ent as any).end);
    else if (ref.pointKey === 'center') points.push((ent as any).center);
    else if (ref.pointKey === 'p1') points.push((ent as any).p1);
    else if (ref.pointKey === 'p2') points.push((ent as any).p2);
  }

  if (points.length === 0) return;

  const centerPt = points.reduce((acc, p) => add(acc, p), {x: 0, y: 0});
  centerPt.x /= points.length;
  centerPt.y /= points.length;

  const cColor = isSelected ? '#e879f9' : '#c084fc'; // Purple

  if (constraint.type === 'fixed_length' && points.length >= 2) {
    const p1 = points[0];
    const p2 = points[1];
    const d = dist(p1, p2);
    if (d === 0) return;

    const u = normalize(sub(p2, p1));
    const n = {x: -u.y, y: u.x};
    const offset = 0.4;

    const d1 = add(p1, scale(n, offset));
    const d2 = add(p2, scale(n, offset));

    ctx.strokeStyle = cColor;
    ctx.fillStyle = cColor;
    ctx.lineWidth = (isSelected ? 2 : 1.2) / zoom;

    ctx.beginPath();
    ctx.moveTo(d1.x, d1.y);
    ctx.lineTo(d2.x, d2.y);
    ctx.stroke();

    const textVal = formatLength(constraint.value || d, unitSystem, 2);
    ctx.save();
    const center = lerp(d1, d2, 0.5);
    ctx.translate(center.x, center.y);
    const ang = angle(u);
    const textAngle =
      ang > Math.PI / 2 || ang < -Math.PI / 2 ? ang + Math.PI : ang;
    ctx.rotate(textAngle);

    ctx.font = 'bold 0.14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(textVal).width;
    ctx.fillStyle = '#1e2028';
    ctx.fillRect(-textWidth / 2 - 0.05, -0.1, textWidth + 0.1, 0.2);

    ctx.fillStyle = cColor;
    ctx.fillText(textVal, 0, 0);
    ctx.restore();
    return;
  }

  let text = '';
  switch (constraint.type) {
    case 'horizontal':
      text = 'H';
      break;
    case 'vertical':
      text = 'V';
      break;
    case 'parallel':
      text = '//';
      break;
    case 'perpendicular':
      text = '⟂';
      break;
    case 'coincident':
      text = '•';
      break;
    case 'collinear':
      text = '—';
      break;
    case 'concentric':
      text = '◎';
      break;
    case 'equal_length':
      text = '=';
      break;
    case 'fixed_angle':
      text = '∠';
      break;
  }

  if (!text) return;

  ctx.save();

  const offsetX = 0.2;
  const offsetY = -0.2;

  // Draw faint connecting line
  ctx.strokeStyle = isSelected
    ? 'rgba(232, 121, 249, 0.6)'
    : 'rgba(192, 132, 252, 0.4)';
  ctx.lineWidth = 1 / zoom;
  ctx.beginPath();
  ctx.moveTo(centerPt.x, centerPt.y);
  ctx.lineTo(centerPt.x + offsetX, centerPt.y + offsetY);
  ctx.stroke();

  ctx.translate(centerPt.x + offsetX, centerPt.y + offsetY);

  ctx.fillStyle = '#1e2028';
  ctx.strokeStyle = cColor;
  ctx.lineWidth = 1.0 / zoom;

  const badgeSize = 0.16;
  ctx.beginPath();
  ctx.rect(-badgeSize / 2, -badgeSize / 2, badgeSize, badgeSize);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = cColor;
  ctx.font = 'bold 0.11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
