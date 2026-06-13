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
  UnitSystem,
} from '../core/types';
import { dist, sub, add, scale, normalize, rotate, lerp, angle } from '../core/geometry';
import { formatLength } from '../core/units';

// Simple check to find wall by ID
function findWall(entities: Entity[], wallId: string): WallEntity | null {
  const ent = entities.find((e) => e.id === wallId);
  return ent && ent.type === 'wall' ? (ent as WallEntity) : null;
}

export function drawWall(ctx: CanvasRenderingContext2D, wall: WallEntity, isSelected: boolean, zoom: number) {
  const { start, end, thickness } = wall;
  const d = dist(start, end);
  if (d === 0) return;

  const u = normalize(sub(end, start));
  const n = { x: -u.y, y: u.x }; // Perpendicular

  const halfThickness = thickness / 2;

  // Compute 4 corners
  const c1 = add(start, scale(n, halfThickness));
  const c2 = add(end, scale(n, halfThickness));
  const c3 = sub(end, scale(n, halfThickness));
  const c4 = sub(start, scale(n, halfThickness));

  ctx.beginPath();
  ctx.moveTo(c1.x, c1.y);
  ctx.lineTo(c2.x, c2.y);
  ctx.lineTo(c3.x, c3.y);
  ctx.lineTo(c4.x, c4.y);
  ctx.closePath();

  // Styling
  ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.2)' : 'rgba(200, 202, 212, 0.15)';
  ctx.fill();

  ctx.strokeStyle = isSelected ? '#22d3ee' : '#c8cad4';
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  // Draw end caps/lines
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = 'rgba(200, 202, 212, 0.25)';
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([0.05, 0.05]); // Dotted center line
  ctx.stroke();
  ctx.setLineDash([]); // Reset
}

export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: DoorEntity,
  entities: Entity[],
  isSelected: boolean,
  zoom: number
) {
  const wall = findWall(entities, door.wallId);
  if (!wall) return;

  const { start, end, thickness } = wall;
  const u = normalize(sub(end, start));
  const n = { x: -u.y, y: u.x };

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
  ctx.strokeStyle = isSelected ? '#22d3ee' : '#c8cad4';
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
  ctx.strokeStyle = isSelected ? '#22d3ee' : '#cbd5e1';
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  // Draw arc
  const startAng = angle(hingeToLatch);
  const endAng = angle(leafVector);
  const radius = w;

  ctx.beginPath();
  // Ensure arc goes in correct direction
  const counterClockwise = (swingDir * hingeSign) < 0;
  ctx.arc(hinge.x, hinge.y, radius, startAng, endAng, counterClockwise);
  ctx.strokeStyle = isSelected ? 'rgba(34, 211, 238, 0.5)' : 'rgba(148, 163, 184, 0.4)';
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
  zoom: number
) {
  const wall = findWall(entities, windowEnt.wallId);
  if (!wall) return;

  const { start, end, thickness } = wall;
  const u = normalize(sub(end, start));
  const n = { x: -u.y, y: u.x };

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
  const strokeColor = isSelected ? '#22d3ee' : '#94a3b8';
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
  zoom: number
) {
  const { start, end, width, treadCount, direction } = stairs;
  const d = dist(start, end);
  if (d === 0) return;

  const u = normalize(sub(end, start));
  const n = { x: -u.y, y: u.x };

  const halfWidth = width / 2;

  // Compute corners
  const s1 = add(start, scale(n, halfWidth));
  const s2 = add(end, scale(n, halfWidth));
  const s3 = sub(end, scale(n, halfWidth));
  const s4 = sub(start, scale(n, halfWidth));

  // Outline
  ctx.strokeStyle = isSelected ? '#22d3ee' : '#94a3b8';
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
  ctx.strokeStyle = isSelected ? 'rgba(34, 211, 238, 0.7)' : 'rgba(148, 163, 184, 0.6)';
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
  ctx.strokeStyle = '#38bdf8'; // Blue direction line
  ctx.fillStyle = '#38bdf8';

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
  const textAngle = (ang > Math.PI / 2 || ang < -Math.PI / 2) ? ang + Math.PI : ang;
  ctx.rotate(textAngle);
  ctx.fillText(direction === 'up' ? 'UP' : 'DN', 0, 0);
  ctx.restore();
}

export function drawLine(ctx: CanvasRenderingContext2D, line: LineEntity, isSelected: boolean, zoom: number) {
  ctx.beginPath();
  ctx.moveTo(line.start.x, line.start.y);
  ctx.lineTo(line.end.x, line.end.y);

  ctx.strokeStyle = isSelected ? '#22d3ee' : '#e2e8f0';
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();
}

export function drawRect(ctx: CanvasRenderingContext2D, rect: RectEntity, isSelected: boolean, zoom: number) {
  const { p1, p2 } = rect;
  ctx.beginPath();
  ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

  ctx.strokeStyle = isSelected ? '#22d3ee' : '#e2e8f0';
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  ctx.fill();
}

export function drawCircle(ctx: CanvasRenderingContext2D, circle: CircleEntity, isSelected: boolean, zoom: number) {
  ctx.beginPath();
  ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);

  ctx.strokeStyle = isSelected ? '#22d3ee' : '#e2e8f0';
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  ctx.fill();
}

export function drawArc(ctx: CanvasRenderingContext2D, arc: ArcEntity, isSelected: boolean, zoom: number) {
  ctx.beginPath();
  ctx.arc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle);

  ctx.strokeStyle = isSelected ? '#22d3ee' : '#e2e8f0';
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();
}

export function drawDimension(
  ctx: CanvasRenderingContext2D,
  dim: DimensionEntity,
  isSelected: boolean,
  unitSystem: UnitSystem,
  zoom: number
) {
  const { p1, p2, offset, label, valueOverride } = dim;
  const d = dist(p1, p2);
  if (d === 0) return;

  const u = normalize(sub(p2, p1));
  const n = { x: -u.y, y: u.x }; // Perpendicular

  // Dimension line endpoints (offset from actual points)
  const d1 = add(p1, scale(n, offset));
  const d2 = add(p2, scale(n, offset));

  const dimColor = isSelected ? '#22d3ee' : '#60a5fa'; // nice blue
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
  const slashDir = normalize({ x: u.x + n.x, y: u.y + n.y }); // 45 deg

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
  const textAngle = (ang > Math.PI / 2 || ang < -Math.PI / 2) ? ang + Math.PI : ang;
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

export function drawText(ctx: CanvasRenderingContext2D, textEnt: TextEntity, isSelected: boolean, zoom: number) {
  ctx.save();
  ctx.font = `${textEnt.fontSize}px Inter, sans-serif`;
  ctx.fillStyle = isSelected ? '#22d3ee' : '#f8fafc';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(textEnt.text, textEnt.position.x, textEnt.position.y);

  // If selected, draw simple boundary box
  if (isSelected) {
    const textWidth = ctx.measureText(textEnt.text).width;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.rect(textEnt.position.x - 0.05, textEnt.position.y - 0.05, textWidth + 0.1, textEnt.fontSize + 0.1);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  zoom: number
) {
  const pts: Vec2[] = [];
  if (entity.type === 'wall' || entity.type === 'line' || entity.type === 'stairs' || entity.type === 'dimension') {
    pts.push((entity as any).start || (entity as any).p1, (entity as any).end || (entity as any).p2);
  } else if (entity.type === 'rect') {
    const r = entity;
    pts.push(r.p1, r.p2, { x: r.p1.x, y: r.p2.y }, { x: r.p2.x, y: r.p1.y });
  } else if (entity.type === 'circle' || entity.type === 'arc') {
    pts.push((entity as any).center);
    if (entity.type === 'circle') {
      const c = entity;
      pts.push({ x: c.center.x + c.radius, y: c.center.y });
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
    ctx.rect(pt.x - handleSize / 2, pt.y - handleSize / 2, handleSize, handleSize);
    ctx.fill();
    ctx.stroke();
  }
}

export function drawSnapIndicator(
  ctx: CanvasRenderingContext2D,
  pt: Vec2,
  type: string,
  zoom: number
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
