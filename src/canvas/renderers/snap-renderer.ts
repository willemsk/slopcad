import type {Vec2} from '../../core/types';

export function drawSnapIndicator(
  ctx: CanvasRenderingContext2D,
  pt: Vec2,
  type: string,
  zoom: number,
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
