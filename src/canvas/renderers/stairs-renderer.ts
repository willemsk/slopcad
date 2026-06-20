import {StairsEntity} from '../../core/types';
import {
  dist,
  sub,
  add,
  scale,
  normalize,
  lerp,
  rotate,
  angle,
} from '../../core/geometry';
import {EntityRenderContext} from '../types';

export function renderStairs(context: EntityRenderContext<StairsEntity>) {
  const {ctx, entity: stairs, isSelected, color, zoom} = context;

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
  ctx.strokeStyle = isSelected ? 'rgba(34, 211, 238, 0.7)' : color + '99';
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
