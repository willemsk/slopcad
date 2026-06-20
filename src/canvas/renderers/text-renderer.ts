import {TextEntity} from '../../core/types';
import {EntityRenderContext} from '../types';

export function renderText(context: EntityRenderContext<TextEntity>) {
  const {ctx, entity: textEnt, isSelected, color, zoom} = context;

  ctx.save();
  ctx.font = `${textEnt.fontSize}px Inter, sans-serif`;
  ctx.fillStyle = isSelected ? '#22d3ee' : color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(textEnt.text, textEnt.position.x, textEnt.position.y);

  // If selected, draw simple boundary box
  if (isSelected) {
    const textWidth = ctx.measureText(textEnt.text).width;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.rect(
      textEnt.position.x - 0.05,
      textEnt.position.y - 0.05,
      textWidth + 0.1,
      textEnt.fontSize + 0.1,
    );
    ctx.stroke();
  }
  ctx.restore();
}
