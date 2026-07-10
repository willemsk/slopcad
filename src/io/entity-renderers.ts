import {
  add,
  angle,
  dist,
  distToSegment,
  dot,
  infiniteLineIntersection,
  lerp,
  normalize,
  projectPointT,
  rotate,
  scale,
  sub,
} from '../core/geometry';
import {
  type ArcEntity,
  type CircleEntity,
  type DimensionEntity,
  type DoorEntity,
  type LineEntity,
  Page,
  type RectEntity,
  type StairsEntity,
  type TextEntity,
  type UnitSystem,
  type Vec2,
  type WallEntity,
  type WindowEntity,
} from '../core/types';
import {formatLength} from '../core/units';
import type {Renderer} from './renderer-interface';

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

export function renderWalls(
  walls: WallEntity[],
  allWalls: WallEntity[],
  renderer: Renderer,
): void {
  const renderData: WallRenderData[] = [];

  // Phase 1: Compute mitered coordinates
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

    const processEndpoint = (isStart: boolean) => {
      const pt = isStart ? start : end;
      const uOut = isStart ? scale(u, -1) : u;

      const ptL = isStart ? pStartL : pEndL;
      const ptR = isStart ? pStartR : pEndR;

      const touchingWalls = allWalls.filter((w) => {
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

          const tL_L2 = iL_L2
            ? dot(sub(iL_L2, ptL), uOut)
            : Number.POSITIVE_INFINITY;
          const tL_R2 = iL_R2
            ? dot(sub(iL_R2, ptL), uOut)
            : Number.POSITIVE_INFINITY;
          const iL = tL_L2 < tL_R2 ? iL_L2 : iL_R2;

          const tR_L2 = iR_L2
            ? dot(sub(iR_L2, ptR), uOut)
            : Number.POSITIVE_INFINITY;
          const tR_R2 = iR_R2
            ? dot(sub(iR_R2, ptR), uOut)
            : Number.POSITIVE_INFINITY;
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

  // Phase 2: Compute T-Junction gaps
  for (const data of renderData) {
    const w = data.wall;

    const tWalls = allWalls.filter((other) => {
      if (other.id === w.id) return false;
      return (
        distToSegment(other.start, w.start, w.end) < 1e-4 ||
        distToSegment(other.end, w.start, w.end) < 1e-4
      );
    });

    for (const otherWall of tWalls) {
      const pt =
        distToSegment(otherWall.start, w.start, w.end) < 1e-4
          ? otherWall.start
          : otherWall.end;

      const isCornerStart =
        dist(w.start, otherWall.start) < 1e-4 ||
        dist(w.start, otherWall.end) < 1e-4;
      const isCornerEnd =
        dist(w.end, otherWall.start) < 1e-4 ||
        dist(w.end, otherWall.end) < 1e-4;

      if (isCornerStart || isCornerEnd) continue;

      const tData = renderData.find((d) => d.wall.id === otherWall.id);
      if (!tData) continue;

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
    renderer.drawPolygon([data.pStartL, data.pEndL, data.pEndR, data.pStartR], {
      fill: 'rgba(200, 202, 212, 0.15)',
      stroke: 'none',
    });
  }

  // Phase 4: Draw Strokes
  for (const data of renderData) {
    // Left boundary
    let currT = 0;
    for (const gap of data.leftGaps) {
      if (gap[0] > currT) {
        const startP = lerp(data.pStartL, data.pEndL, currT);
        const endP = lerp(data.pStartL, data.pEndL, gap[0]);
        renderer.drawLine(startP, endP, {stroke: '#c8cad4', strokeWidth: 0.02});
      }
      currT = Math.max(currT, gap[1]);
    }
    if (currT < 1) {
      const startP = lerp(data.pStartL, data.pEndL, currT);
      renderer.drawLine(startP, data.pEndL, {
        stroke: '#c8cad4',
        strokeWidth: 0.02,
      });
    }

    // Right boundary
    currT = 0;
    for (const gap of data.rightGaps) {
      if (gap[0] > currT) {
        const startP = lerp(data.pStartR, data.pEndR, currT);
        const endP = lerp(data.pStartR, data.pEndR, gap[0]);
        renderer.drawLine(startP, endP, {stroke: '#c8cad4', strokeWidth: 0.02});
      }
      currT = Math.max(currT, gap[1]);
    }
    if (currT < 1) {
      const startP = lerp(data.pStartR, data.pEndR, currT);
      renderer.drawLine(startP, data.pEndR, {
        stroke: '#c8cad4',
        strokeWidth: 0.02,
      });
    }

    // Caps
    if (!data.skipStartCap) {
      renderer.drawLine(data.pStartL, data.pStartR, {
        stroke: '#c8cad4',
        strokeWidth: 0.02,
      });
    }
    if (!data.skipEndCap) {
      renderer.drawLine(data.pEndL, data.pEndR, {
        stroke: '#c8cad4',
        strokeWidth: 0.02,
      });
    }

    // Center line
    renderer.drawLine(data.wall.start, data.wall.end, {
      stroke: 'rgba(200, 202, 212, 0.25)',
      strokeWidth: 0.01,
      strokeDasharray: '0.05,0.05',
    });
  }
}

export function renderWall(wall: WallEntity, renderer: Renderer): void {
  renderWalls([wall], [wall], renderer);
}

export function renderDoor(
  door: DoorEntity,
  wall: WallEntity,
  renderer: Renderer,
): void {
  const u = normalize(sub(wall.end, wall.start));
  const n = {x: -u.y, y: u.x};
  const c = lerp(wall.start, wall.end, door.position);
  const w = door.width;

  const d1 = sub(c, scale(u, w / 2));
  const d2 = add(c, scale(u, w / 2));

  // Draw mask
  const halfThick = wall.thickness / 2 + 0.02;
  const m1 = add(d1, scale(n, halfThick));
  const m2 = add(d2, scale(n, halfThick));
  const m3 = sub(d2, scale(n, halfThick));
  const m4 = sub(d1, scale(n, halfThick));

  renderer.drawPolygon([m1, m2, m3, m4], {fill: '#1e2028'});

  // Draw wall cuts
  renderer.drawLine(m1, m4, {stroke: '#c8cad4', strokeWidth: 0.015});
  renderer.drawLine(m2, m3, {stroke: '#c8cad4', strokeWidth: 0.015});

  // Swing leaf & arc
  const hinge = door.flipX ? d2 : d1;
  const latch = door.flipX ? d1 : d2;
  const swingDir = door.flipY ? 1 : -1;
  const hingeToLatch = sub(latch, hinge);
  const hingeSign = door.flipX ? -1 : 1;
  const openAngleDeg = door.openingAngle ?? 90;
  const openAngleRad = swingDir * hingeSign * ((openAngleDeg * Math.PI) / 180);
  const leafVector = rotate(hingeToLatch, openAngleRad);
  const leafEnd = add(hinge, leafVector);

  // Leaf line
  renderer.drawLine(hinge, leafEnd, {stroke: '#cbd5e1', strokeWidth: 0.02});

  // Arc
  const radius = w;
  const counterClockwise = swingDir * hingeSign < 0;

  const startAng = angle(hingeToLatch);
  const endAng = startAng + openAngleRad;

  renderer.drawArc(hinge, radius, startAng, endAng, counterClockwise, {
    fill: 'none',
    stroke: 'rgba(148, 163, 184, 0.4)',
    strokeWidth: 0.01,
    strokeDasharray: '0.05,0.05',
  });
}

export function renderWindow(
  wind: WindowEntity,
  wall: WallEntity,
  renderer: Renderer,
): void {
  const u = normalize(sub(wall.end, wall.start));
  const n = {x: -u.y, y: u.x};
  const c = lerp(wall.start, wall.end, wind.position);
  const w = wind.width;

  const w1 = sub(c, scale(u, w / 2));
  const w2 = add(c, scale(u, w / 2));

  const halfThick = wall.thickness / 2 + 0.01;
  const m1 = add(w1, scale(n, halfThick));
  const m2 = add(w2, scale(n, halfThick));
  const m3 = sub(w2, scale(n, halfThick));
  const m4 = sub(w1, scale(n, halfThick));

  // Mask
  renderer.drawPolygon([m1, m2, m3, m4], {fill: '#1e2028'});

  // Outlines
  renderer.drawLine(m1, m4, {stroke: '#94a3b8', strokeWidth: 0.015});
  renderer.drawLine(m2, m3, {stroke: '#94a3b8', strokeWidth: 0.015});

  // Glass lines
  const innerLine1Start = add(w1, scale(n, wall.thickness / 4));
  const innerLine1End = add(w2, scale(n, wall.thickness / 4));
  const innerLine2Start = sub(w1, scale(n, wall.thickness / 4));
  const innerLine2End = sub(w2, scale(n, wall.thickness / 4));

  renderer.drawLine(w1, w2, {stroke: '#94a3b8', strokeWidth: 0.015});
  renderer.drawLine(innerLine1Start, innerLine1End, {
    stroke: '#94a3b8',
    strokeWidth: 0.015,
  });
  renderer.drawLine(innerLine2Start, innerLine2End, {
    stroke: '#94a3b8',
    strokeWidth: 0.015,
  });
}

export function renderStairs(st: StairsEntity, renderer: Renderer): void {
  const {start, end, width, treadCount, direction} = st;
  const u = normalize(sub(end, start));
  const n = {x: -u.y, y: u.x};
  const halfWidth = width / 2;

  const s1 = add(start, scale(n, halfWidth));
  const s2 = add(end, scale(n, halfWidth));
  const s3 = sub(end, scale(n, halfWidth));
  const s4 = sub(start, scale(n, halfWidth));

  // Outline
  renderer.drawPolygon([s1, s2, s3, s4], {
    fill: 'none',
    stroke: '#94a3b8',
    strokeWidth: 0.02,
  });

  // Treads
  for (let i = 1; i < treadCount; i++) {
    const t = i / treadCount;
    const pt = lerp(start, end, t);
    const pLeft = add(pt, scale(n, halfWidth));
    const pRight = sub(pt, scale(n, halfWidth));
    renderer.drawLine(pLeft, pRight, {
      stroke: 'rgba(148, 163, 184, 0.6)',
      strokeWidth: 0.01,
    });
  }

  // Direction line
  const arrowEnd = sub(end, scale(u, 0.15));
  renderer.drawCircle(start, 0.04, {fill: '#38bdf8'});
  renderer.drawLine(start, arrowEnd, {stroke: '#38bdf8', strokeWidth: 0.015});

  // Arrow head
  const arrowLength = 0.12;
  const aLeft = add(arrowEnd, rotate(scale(u, -arrowLength), Math.PI / 6));
  const aRight = add(arrowEnd, rotate(scale(u, -arrowLength), -Math.PI / 6));
  renderer.drawPolygon([end, aLeft, aRight], {fill: '#38bdf8'});

  // UP/DN Text
  const center = lerp(start, end, 0.5);
  const textX = center.x + n.x * 0.3;
  const textY = center.y + n.y * 0.3;
  const angRad = angle(u);
  const textAngleDeg =
    angRad > Math.PI / 2 || angRad < -Math.PI / 2
      ? (angRad + Math.PI) * (180 / Math.PI)
      : angRad * (180 / Math.PI);

  renderer.drawText(
    direction.toUpperCase(),
    {x: textX, y: textY},
    {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontSize: 0.18,
      fill: '#e2e8f0',
      textAnchor: 'middle',
      dominantBaseline: 'middle',
    },
    {
      rotate: {
        angle: textAngleDeg,
        cx: textX,
        cy: textY,
      },
    },
  );
}

export function renderLine(l: LineEntity, renderer: Renderer): void {
  renderer.drawLine(l.start, l.end, {stroke: '#e2e8f0', strokeWidth: 0.02});
}

export function renderRect(r: RectEntity, renderer: Renderer): void {
  const rx = Math.min(r.p1.x, r.p2.x);
  const ry = Math.min(r.p1.y, r.p2.y);
  const rw = Math.abs(r.p2.x - r.p1.x);
  const rh = Math.abs(r.p2.y - r.p1.y);
  renderer.drawRect(rx, ry, rw, rh, {
    fill: 'none',
    stroke: '#e2e8f0',
    strokeWidth: 0.02,
  });
}

export function renderCircle(c: CircleEntity, renderer: Renderer): void {
  renderer.drawCircle(c.center, c.radius, {
    fill: 'none',
    stroke: '#e2e8f0',
    strokeWidth: 0.02,
  });
}

export function renderArc(a: ArcEntity, renderer: Renderer): void {
  // We assume default counter-clockwise direction is false for SVG generic drawing unless specifically calculated.
  // Original exporter assumed a sweep flag based on end > start.
  const sweep = a.endAngle > a.startAngle;
  // Sweep flag 1 means draw arc towards positive angle direction. In our Renderer interface, we pass `counterClockwise`.
  // Wait, sweep=1 in SVG means positive angle. Math.atan2 usually counterClockwise is false (sweep=1).
  renderer.drawArc(
    a.center,
    a.radius,
    a.startAngle,
    a.endAngle,
    !sweep, // counterClockwise = !sweep
    {fill: 'none', stroke: '#e2e8f0', strokeWidth: 0.02},
  );
}

export function renderDimension(
  dEnt: DimensionEntity,
  unitSystem: UnitSystem,
  renderer: Renderer,
): void {
  const u = normalize(sub(dEnt.p2, dEnt.p1));
  const n = {x: -u.y, y: u.x};
  const d1 = add(dEnt.p1, scale(n, dEnt.offset));
  const d2 = add(dEnt.p2, scale(n, dEnt.offset));

  // Extension lines
  const extGap = scale(n, Math.sign(dEnt.offset) * 0.05);
  const extPast = scale(n, Math.sign(dEnt.offset) * 0.08);

  renderer.drawLine(add(dEnt.p1, extGap), add(d1, extPast), {
    stroke: '#60a5fa',
    strokeWidth: 0.012,
  });
  renderer.drawLine(add(dEnt.p2, extGap), add(d2, extPast), {
    stroke: '#60a5fa',
    strokeWidth: 0.012,
  });

  // Dimension line
  renderer.drawLine(d1, d2, {stroke: '#60a5fa', strokeWidth: 0.012});

  // Ticks (45 slashes)
  const slash = normalize({x: u.x + n.x, y: u.y + n.y});
  renderer.drawLine(sub(d1, scale(slash, 0.08)), add(d1, scale(slash, 0.08)), {
    stroke: '#60a5fa',
    strokeWidth: 0.02,
  });
  renderer.drawLine(sub(d2, scale(slash, 0.08)), add(d2, scale(slash, 0.08)), {
    stroke: '#60a5fa',
    strokeWidth: 0.02,
  });

  // Dimension Text
  const d = dist(dEnt.p1, dEnt.p2);
  const lengthVal = dEnt.valueOverride !== undefined ? dEnt.valueOverride : d;
  const textVal = dEnt.label || formatLength(lengthVal, unitSystem, 2);

  const center = lerp(d1, d2, 0.5);
  const angRad = angle(u);
  const textAngleDeg =
    angRad > Math.PI / 2 || angRad < -Math.PI / 2
      ? (angRad + Math.PI) * (180 / Math.PI)
      : angRad * (180 / Math.PI);

  renderer.pushGroup({
    transform: {
      translate: center,
      rotate: {
        angle: textAngleDeg,
      },
    },
  });
  renderer.drawRect(-0.4, -0.08, 0.8, 0.16, {fill: '#1e2028'}); // simple mask box
  renderer.drawText(
    textVal,
    {x: 0, y: 0},
    {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontSize: 0.18,
      fill: '#60a5fa',
      textAnchor: 'middle',
      dominantBaseline: 'middle',
    },
  );
  renderer.popGroup();
}

export function renderText(t: TextEntity, renderer: Renderer): void {
  renderer.drawText(t.text, t.position, {
    fontFamily: 'Inter, sans-serif',
    fontSize: t.fontSize,
    fill: '#f8fafc',
    dominantBaseline: 'text-before-edge',
  });
}
