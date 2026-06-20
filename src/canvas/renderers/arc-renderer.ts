import {ArcEntity} from '../../core/types';
import {EntityRenderContext} from '../types';

export function renderArc(context: EntityRenderContext<ArcEntity>) {
  const {ctx, entity: arc, isSelected, color, zoom} = context;

  ctx.beginPath();
  ctx.arc(arc.center.x, arc.center.y, arc.radius, arc.startAngle, arc.endAngle);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();
}
