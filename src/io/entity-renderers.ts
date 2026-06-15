import {
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
  UnitSystem,
  Page,
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
import {Renderer} from './renderer-interface';

export function renderWall(wall: WallEntity, renderer: Renderer): void {
  const d = dist(wall.start, wall.end);
  if (d === 0) return;

  const u = normalize(sub(wall.end, wall.start));
  const n = {x: -u.y, y: u.x};
  const halfThickness = wall.thickness / 2;

  const c1 = add(wall.start, scale(n, halfThickness));
  const c2 = add(wall.end, scale(n, halfThickness));
  const c3 = sub(wall.end, scale(n, halfThickness));
  const c4 = sub(wall.start, scale(n, halfThickness));

  renderer.drawPolygon([c1, c2, c3, c4], {
    fill: 'rgba(200, 202, 212, 0.15)',
    stroke: '#c8cad4',
    strokeWidth: 0.02,
  });
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
    `rotate(${textAngleDeg}, ${textX}, ${textY})`,
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

  // Push a group with rotation and position for text drawing
  renderer.pushGroup({
    transform: `translate(${center.x}, ${center.y}) rotate(${textAngleDeg})`,
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
