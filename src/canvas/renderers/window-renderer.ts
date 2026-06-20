import {WindowEntity} from '../../core/types';
import {sub, add, scale, normalize, lerp} from '../../core/geometry';
import {EntityRenderContext} from '../types';
import {findWall} from './shared';

export function renderWindow(context: EntityRenderContext<WindowEntity>) {
  const {ctx, entity: windowEnt, entities, isSelected, color, zoom} = context;

  const wall = findWall(entities, windowEnt.wallId);
  if (!wall) return;

  const {start, end, thickness} = wall;
  const u = normalize(sub(end, start));
  const n = {x: -u.y, y: u.x};

  const c = lerp(start, end, windowEnt.position);
  const w = windowEnt.width;

  const w1 = sub(c, scale(u, w / 2));
  const w2 = add(c, scale(u, w / 2));

  // Mask wall
  const halfThick = thickness / 2 + 0.01;
  const m1 = add(w1, scale(n, halfThick));
  const m2 = add(w2, scale(n, halfThick));
  const m3 = sub(w2, scale(n, halfThick));
  const m4 = sub(w1, scale(n, halfThick));

  ctx.fillStyle = '#1e2028';
  ctx.beginPath();
  ctx.moveTo(m1.x, m1.y);
  ctx.lineTo(m2.x, m2.y);
  ctx.lineTo(m3.x, m3.y);
  ctx.lineTo(m4.x, m4.y);
  ctx.closePath();
  ctx.fill();

  // Draw Window glass lines (three parallel lines)
  const strokeColor = isSelected ? '#22d3ee' : color;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = (isSelected ? 2.5 : 1.5) / zoom;

  // Window frame ends
  ctx.beginPath();
  ctx.moveTo(m1.x, m1.y);
  ctx.lineTo(m4.x, m4.y);
  ctx.moveTo(m2.x, m2.y);
  ctx.lineTo(m3.x, m3.y);
  ctx.stroke();

  // Glass lines
  const centerLineStart = w1;
  const centerLineEnd = w2;

  const innerLine1Start = add(w1, scale(n, thickness / 4));
  const innerLine1End = add(w2, scale(n, thickness / 4));

  const innerLine2Start = sub(w1, scale(n, thickness / 4));
  const innerLine2End = sub(w2, scale(n, thickness / 4));

  ctx.beginPath();
  ctx.moveTo(centerLineStart.x, centerLineStart.y);
  ctx.lineTo(centerLineEnd.x, centerLineEnd.y);
  ctx.moveTo(innerLine1Start.x, innerLine1Start.y);
  ctx.lineTo(innerLine1End.x, innerLine1End.y);
  ctx.moveTo(innerLine2Start.x, innerLine2Start.y);
  ctx.lineTo(innerLine2End.x, innerLine2End.y);
  ctx.stroke();
}
