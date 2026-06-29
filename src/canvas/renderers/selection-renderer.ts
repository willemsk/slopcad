import {Entity, Vec2} from '../../core/types';
import {lerp} from '../../core/geometry';

export function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  entity: Entity,
  zoom: number,
  entityMap?: Map<string, Entity>,
) {
  const pts: Vec2[] = [];
  if (
    entity.type === 'wall' ||
    entity.type === 'line' ||
    entity.type === 'stairs'
  ) {
    pts.push(entity.start, entity.end);
  } else if (entity.type === 'dimension') {
    pts.push(entity.p1, entity.p2);
  } else if (entity.type === 'rect') {
    pts.push(
      entity.p1,
      entity.p2,
      {x: entity.p1.x, y: entity.p2.y},
      {x: entity.p2.x, y: entity.p1.y},
    );
  } else if (entity.type === 'circle' || entity.type === 'arc') {
    pts.push(entity.center);
    if (entity.type === 'circle') {
      pts.push({x: entity.center.x + entity.radius, y: entity.center.y});
    }
  } else if (entity.type === 'text') {
    pts.push(entity.position);
  } else if (entity.type === 'door' || entity.type === 'window') {
    const wall = entityMap?.get(entity.wallId);
    if (wall && wall.type === 'wall') {
      pts.push(lerp(wall.start, wall.end, entity.position));
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
