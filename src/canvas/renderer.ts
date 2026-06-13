import {Entity, SnapResult, UnitSystem, Constraint} from '../core/types';
import {Viewport} from './viewport';
import {
  drawWall,
  drawDoor,
  drawWindow,
  drawStairs,
  drawLine,
  drawRect,
  drawCircle,
  drawArc,
  drawDimension,
  drawText,
  drawSelectionHandles,
  drawSnapIndicator,
  drawConstraint,
} from './draw-helpers';

export interface RenderState {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  viewport: Viewport;
  entities: Entity[];
  constraints: Constraint[];
  selection: Set<string>;
  snapResult: SnapResult | null;
  gridEnabled: boolean;
  showConstraints: boolean;
  gridSpacing: number; // in meters, e.g. 0.5
  unitSystem: UnitSystem;
  previewEntity: Entity | null; // Entity currently being drawn (ghost)
  hoveredEntityId: string | null;
  overlayEntities?: Entity[]; // Entities of the background overlay floor
}

export function render(state: RenderState) {
  const {
    ctx,
    width,
    height,
    viewport,
    entities,
    constraints,
    selection,
    snapResult,
    gridEnabled,
    showConstraints,
    gridSpacing,
    unitSystem,
    previewEntity,
    hoveredEntityId,
    overlayEntities,
  } = state;

  // 1. Clear canvas
  ctx.fillStyle = '#212830'; // AutoCAD slate dark blue-gray background
  ctx.fillRect(0, 0, width, height);

  // 2. Save state and apply camera viewport transform
  ctx.save();
  ctx.translate(viewport.panOffset.x, viewport.panOffset.y);
  ctx.scale(viewport.zoom, viewport.zoom);

  // 3. Draw Grid
  if (gridEnabled && gridSpacing > 0) {
    drawGrid(ctx, viewport, width, height, gridSpacing);
  }

  // 3b. Draw Ghost Overlay Floor
  if (overlayEntities && overlayEntities.length > 0) {
    ctx.save();
    ctx.globalAlpha = 0.15; // very faint transparency
    for (const ent of overlayEntities) {
      drawEntity(ctx, ent, overlayEntities, false, unitSystem, viewport.zoom);
    }
    ctx.restore();
  }

  // 4. Draw Entities
  // Draw order: Walls -> Lines/Rects/Circles/Arcs -> Doors/Windows -> Stairs -> Dimensions -> Text
  const typeOrder = [
    'wall',
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

  for (const ent of sortedEntities) {
    const isSelected = selection.has(ent.id);
    const isHovered = ent.id === hoveredEntityId;

    // We pass a hover highlight if applicable
    if (isHovered && !isSelected) {
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10 / viewport.zoom;
    }

    drawEntity(ctx, ent, entities, isSelected, unitSystem, viewport.zoom);

    if (isHovered && !isSelected) {
      ctx.restore();
    }
  }

  // 5. Draw Active Tool Preview (Ghost/Helper)
  if (previewEntity) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    drawEntity(ctx, previewEntity, entities, false, unitSystem, viewport.zoom);
    ctx.restore();
  }

  // 6. Draw Constraints (if visible)
  if (showConstraints) {
    for (const c of constraints) {
      const isSelected = c.entityIds.some(id => selection.has(id));
      drawConstraint(ctx, c, entities, isSelected, unitSystem, viewport.zoom);
    }
  }

  // 7. Draw Selection Handles on Top
  for (const ent of entities) {
    if (selection.has(ent.id)) {
      drawSelectionHandles(ctx, ent, viewport.zoom);
    }
  }

  // 8. Draw Snap Indicator
  if (snapResult) {
    drawSnapIndicator(ctx, snapResult.point, snapResult.type, viewport.zoom);
  }

  // Restore camera transform
  ctx.restore();

  // 9. Draw Screen-Space UCS Indicator (Bottom-Left)
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

function drawEntity(
  ctx: CanvasRenderingContext2D,
  ent: Entity,
  entities: Entity[],
  isSelected: boolean,
  unitSystem: UnitSystem,
  zoom: number,
) {
  switch (ent.type) {
    case 'wall':
      drawWall(ctx, ent, isSelected, zoom);
      break;
    case 'door':
      drawDoor(ctx, ent, entities, isSelected, zoom);
      break;
    case 'window':
      drawWindow(ctx, ent, entities, isSelected, zoom);
      break;
    case 'stairs':
      drawStairs(ctx, ent, isSelected, zoom);
      break;
    case 'line':
      drawLine(ctx, ent, isSelected, zoom);
      break;
    case 'rect':
      drawRect(ctx, ent, isSelected, zoom);
      break;
    case 'circle':
      drawCircle(ctx, ent, isSelected, zoom);
      break;
    case 'arc':
      drawArc(ctx, ent, isSelected, zoom);
      break;
    case 'dimension':
      drawDimension(ctx, ent, isSelected, unitSystem, zoom);
      break;
    case 'text':
      drawText(ctx, ent, isSelected, zoom);
      break;
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
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
