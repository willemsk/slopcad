import {DoorEntity} from '../../core/types';
import {
  sub,
  add,
  scale,
  normalize,
  lerp,
  rotate,
  angle,
} from '../../core/geometry';
import {EntityRenderContext} from '../types';
import {findWall} from './shared';

export function renderDoor(context: EntityRenderContext<DoorEntity>) {
  const {ctx, entity: door, entities, isSelected, color, zoom} = context;

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
  // Calculate hinge point based on flipX
  const hinge = door.flipX ? d2 : d1;
  const latch = door.flipX ? d1 : d2;
  const swingDir = door.flipY ? 1 : -1;
  const hingeToLatch = sub(latch, hinge);

  // Rotation angle for door leaf
  const hingeSign = door.flipX ? -1 : 1;
  const openAngleDeg = door.openingAngle ?? 90;
  const openAngleRad = swingDir * hingeSign * ((openAngleDeg * Math.PI) / 180);
  const leafVector = rotate(hingeToLatch, openAngleRad);
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
