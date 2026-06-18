import {Entity, Constraint, Layer, UnitSystem} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {drawWalls, drawSelectionHandles, drawConstraint} from './draw-helpers';

import {
  drawDoor,
  drawWindow,
  drawStairs,
  drawLine,
  drawRect,
  drawCircle,
  drawArc,
  drawDimension,
  drawText,
} from './draw-helpers';

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.fillStyle = '#212830'; // AutoCAD slate dark blue-gray background
  ctx.fillRect(0, 0, width, height);
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: ViewportMath,
  width: number,
  height: number,
  spacing: number,
) {
  const topLeft = viewport.screenToWorld({x: 0, y: 0});
  const bottomRight = viewport.screenToWorld({x: width, y: height});

  const startX = Math.floor(topLeft.x / spacing) * spacing;
  const endX = Math.ceil(bottomRight.x / spacing) * spacing;
  const startY = Math.floor(topLeft.y / spacing) * spacing;
  const endY = Math.ceil(bottomRight.y / spacing) * spacing;

  ctx.fillStyle = 'rgba(200, 202, 212, 0.08)'; // extremely subtle grid dots

  const dotSize = 1.5 / viewport.zoom; // keep dot size constant on screen

  for (let x = startX; x <= endX; x += spacing) {
    for (let y = startY; y <= endY; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawEntity(
  ctx: CanvasRenderingContext2D,
  ent: Entity,
  entities: Entity[],
  isSelected: boolean,
  color: string,
  unitSystem: UnitSystem,
  zoom: number,
  layers: Layer[],
) {
  switch (ent.type) {
    case 'wall':
      drawWalls(
        ctx,
        [ent as any],
        new Set(isSelected ? [ent.id] : []),
        layers,
        zoom,
      );
      break;
    case 'door':
      drawDoor(ctx, ent, entities, isSelected, color, zoom);
      break;
    case 'window':
      drawWindow(ctx, ent, entities, isSelected, color, zoom);
      break;
    case 'stairs':
      drawStairs(ctx, ent, isSelected, color, zoom);
      break;
    case 'line':
      drawLine(ctx, ent, isSelected, color, zoom);
      break;
    case 'rect':
      drawRect(ctx, ent, isSelected, color, zoom);
      break;
    case 'circle':
      drawCircle(ctx, ent, isSelected, color, zoom);
      break;
    case 'arc':
      drawArc(ctx, ent, isSelected, color, zoom);
      break;
    case 'dimension':
      drawDimension(ctx, ent, isSelected, color, unitSystem, zoom);
      break;
    case 'text':
      drawText(ctx, ent, isSelected, color, zoom);
      break;
  }
}

export function drawOverlayFloor(
  ctx: CanvasRenderingContext2D,
  overlayEntities: Entity[],
  layers: Layer[],
  unitSystem: UnitSystem,
  zoom: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.15; // very faint transparency
  for (const ent of overlayEntities) {
    const layer = layers.find(l => l.id === ent.layerId) || layers[0];
    const color = layer?.color || '#c8cad4';
    drawEntity(
      ctx,
      ent,
      overlayEntities,
      false,
      color,
      unitSystem,
      zoom,
      layers,
    );
  }
  ctx.restore();
}

export function drawAllEntities(
  ctx: CanvasRenderingContext2D,
  entities: Entity[],
  selection: Set<string>,
  hoveredEntityId: string | null,
  layers: Layer[],
  unitSystem: UnitSystem,
  zoom: number,
) {
  const typeOrder = [
    'line',
    'rect',
    'circle',
    'arc',
    'door',
    'window',
    'stairs',
    'dimension',
    'text',
  ];

  const sortedEntities = [...entities].sort((a, b) => {
    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  });

  const walls = entities.filter(e => e.type === 'wall') as any[];
  if (walls.length > 0) {
    drawWalls(ctx, walls, selection, layers, zoom);
  }

  for (const ent of sortedEntities) {
    if (ent.type === 'wall') continue;

    const isSelected = selection.has(ent.id);
    const isHovered = ent.id === hoveredEntityId;

    if (isHovered && !isSelected) {
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10 / zoom;
    }

    const layer = layers.find(l => l.id === ent.layerId) || layers[0];
    const color = layer?.color || '#c8cad4';

    drawEntity(ctx, ent, entities, isSelected, color, unitSystem, zoom, layers);

    if (isHovered && !isSelected) {
      ctx.restore();
    }
  }
}

export function drawPreviewEntity(
  ctx: CanvasRenderingContext2D,
  previewEntity: Entity,
  entities: Entity[],
  layers: Layer[],
  unitSystem: UnitSystem,
  zoom: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  const layer = layers.find(l => l.id === previewEntity.layerId) || layers[0];
  const color = layer?.color || '#c8cad4';
  drawEntity(
    ctx,
    previewEntity,
    entities,
    false,
    color,
    unitSystem,
    zoom,
    layers,
  );
  ctx.restore();
}

export function drawAllConstraints(
  ctx: CanvasRenderingContext2D,
  constraints: Constraint[],
  entities: Entity[],
  selection: Set<string>,
  unitSystem: UnitSystem,
  zoom: number,
) {
  for (const c of constraints) {
    const isSelected = c.entityIds.some(id => selection.has(id));
    drawConstraint(ctx, c, entities, isSelected, unitSystem, zoom);
  }
}

export function drawAllSelectionHandles(
  ctx: CanvasRenderingContext2D,
  entities: Entity[],
  selection: Set<string>,
  zoom: number,
) {
  for (const ent of entities) {
    if (selection.has(ent.id)) {
      drawSelectionHandles(ctx, ent, zoom, entities);
    }
  }
}

export function drawUCS(ctx: CanvasRenderingContext2D, height: number) {
  ctx.save();
  ctx.translate(20, height - 20); // 20px padding from bottom-left
  ctx.lineWidth = 1.5;

  // X axis (red)
  ctx.strokeStyle = '#f44747';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(24, 0);
  ctx.stroke();

  // Y axis (green)
  ctx.strokeStyle = '#6a9955';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -24); // Upwards in screen space is negative Y
  ctx.stroke();

  // Draw label X and Y
  ctx.fillStyle = '#f44747';
  ctx.font = 'bold 10px var(--font-mono)';
  ctx.fillText('X', 28, 4);

  ctx.fillStyle = '#6a9955';
  ctx.fillText('Y', -4, -28);
  ctx.restore();
}
