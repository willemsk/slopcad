import {Entity, Constraint, Layer, UnitSystem} from '../core/types';
import {ViewportMath, getAdaptiveGridSpacing} from '../core/viewport-math';
import {drawSelectionHandles} from './renderers/selection-renderer';
import {drawConstraint} from './renderers/constraint-renderer';
import {RendererRegistry} from './renderers/registry';

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
  const adaptiveSpacing = getAdaptiveGridSpacing(spacing, viewport.zoom);
  const topLeft = viewport.screenToWorld({x: 0, y: 0});
  const bottomRight = viewport.screenToWorld({x: width, y: height});

  const startX = Math.floor(topLeft.x / adaptiveSpacing) * adaptiveSpacing;
  const endX = Math.ceil(bottomRight.x / adaptiveSpacing) * adaptiveSpacing;
  const startY = Math.floor(topLeft.y / adaptiveSpacing) * adaptiveSpacing;
  const endY = Math.ceil(bottomRight.y / adaptiveSpacing) * adaptiveSpacing;

  const cols = Math.floor((endX - startX) / adaptiveSpacing) + 1;
  const rows = Math.floor((endY - startY) / adaptiveSpacing) + 1;

  const MAX_GRID_DOTS = 10000;
  if (cols * rows > MAX_GRID_DOTS) {
    return; // Safety bail-out to prevent browser freeze
  }

  ctx.fillStyle = 'rgba(200, 202, 212, 0.08)'; // extremely subtle grid dots

  const dotSize = 1.5 / viewport.zoom; // keep dot size constant on screen
  const halfDot = dotSize / 2;

  for (let x = startX; x <= endX; x += adaptiveSpacing) {
    for (let y = startY; y <= endY; y += adaptiveSpacing) {
      ctx.fillRect(x - halfDot, y - halfDot, dotSize, dotSize);
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
  const renderer = RendererRegistry[ent.type];
  if (renderer) {
    renderer({
      ctx,
      entity: ent,
      entities,
      layers,
      unitSystem,
      zoom,
      isSelected,
      color,
    });
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

  const walls = entities.filter(e => e.type === 'wall');
  for (const wall of walls) {
    const isSelected = selection.has(wall.id);
    const isHovered = wall.id === hoveredEntityId;

    if (isHovered && !isSelected) {
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10 / zoom;
    }

    const layer = layers.find(l => l.id === wall.layerId) || layers[0];
    let color = layer?.color || '#c8cad4';
    if (wall.color) color = wall.color;
    if (isHovered && !isSelected) {
      color = '#67e8f9';
    }

    drawEntity(
      ctx,
      wall,
      entities,
      isSelected,
      color,
      unitSystem,
      zoom,
      layers,
    );

    if (isHovered && !isSelected) {
      ctx.restore();
    }
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
