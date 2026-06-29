import {Constraint, Entity, UnitSystem, Vec2} from '../../core/types';
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
import {getEntityPoint} from '../../core/entity';

export function drawConstraint(
  ctx: CanvasRenderingContext2D,
  constraint: Constraint,
  entityMap: Map<string, Entity>,
  isSelected: boolean,
  unitSystem: UnitSystem,
  zoom: number,
) {
  const points: Vec2[] = [];
  for (const ref of constraint.pointRefs || []) {
    const ent = entityMap.get(ref.entityId);
    if (!ent) continue;
    const pt = getEntityPoint(ent, ref.pointKey);
    if (pt) points.push(pt);
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
