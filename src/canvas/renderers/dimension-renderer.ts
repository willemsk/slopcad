import {DimensionEntity} from '../../core/types';
import {
  dist,
  sub,
  add,
  scale,
  normalize,
  lerp,
  angle,
} from '../../core/geometry';
import {formatLength} from '../../core/units';
import {EntityRenderContext} from '../types';

export function renderDimension(context: EntityRenderContext<DimensionEntity>) {
  const {ctx, entity: dim, isSelected, color, unitSystem, zoom} = context;
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
