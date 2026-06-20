import {Entity, Vec2} from '../../core/types';
import {lerp} from '../../core/geometry';

export function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  zoom: number,
  entities: Entity[] = [],
) {
  const pts: Vec2[] = [];
  if (
    entity.type === 'wall' ||
    entity.type === 'line' ||
    entity.type === 'stairs' ||
    entity.type === 'dimension'
  ) {
    pts.push(
      (entity as any).start || (entity as any).p1,
      (entity as any).end || (entity as any).p2,
    );
  } else if (entity.type === 'rect') {
    const r = entity as any;
    pts.push(r.p1, r.p2, {x: r.p1.x, y: r.p2.y}, {x: r.p2.x, y: r.p1.y});
  } else if (entity.type === 'circle' || entity.type === 'arc') {
    pts.push((entity as any).center);
    if (entity.type === 'circle') {
      const c = entity as any;
      pts.push({x: c.center.x + c.radius, y: c.center.y});
    }
  } else if (entity.type === 'text') {
    pts.push((entity as any).position);
  } else if (entity.type === 'door' || entity.type === 'window') {
    const wall = entities.find(e => e.id === (entity as any).wallId) as any;
    if (wall) {
      pts.push(lerp(wall.start, wall.end, (entity as any).position));
    }
  }

  // Draw handles as squares
  const handleSize = 6 / zoom; // 6 pixels converted to world size
  ctx.fillStyle = '#22d3ee';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5 / zoom;

  for (const pt of pts) {
    ctx.beginPath();
    ctx.rect(
      pt.x - handleSize / 2,
      pt.y - handleSize / 2,
      handleSize,
      handleSize,
    );
    ctx.fill();
    ctx.stroke();
  }
}
