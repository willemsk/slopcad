import {LineEntity} from '../../core/types';
import {EntityRenderContext} from '../types';

export function renderLine(context: EntityRenderContext<LineEntity>) {
  const {ctx, entity: line, isSelected, color, zoom} = context;

  ctx.beginPath();
  ctx.moveTo(line.start.x, line.start.y);
  ctx.lineTo(line.end.x, line.end.y);

  ctx.strokeStyle = isSelected ? '#22d3ee' : color;
  ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
  ctx.stroke();
}
