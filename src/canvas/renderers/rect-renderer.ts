import {RectEntity} from '../../core/types';
import {EntityRenderContext} from '../types';

export function renderRect(context: EntityRenderContext<RectEntity>) {
  const {ctx, entity: rect, isSelected, color, zoom} = context;
  const {p1, p2} = rect;

  ctx.beginPath();
  ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();

  ctx.fillStyle = isSelected ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  ctx.fill();
}
