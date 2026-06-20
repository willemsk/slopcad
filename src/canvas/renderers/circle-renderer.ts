import {CircleEntity} from '../../core/types';
import {EntityRenderContext} from '../types';

export function renderCircle(context: EntityRenderContext<CircleEntity>) {
  const {ctx, entity: circle, isSelected, color, zoom} = context;

  ctx.beginPath();
  ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  ctx.fill();
}
