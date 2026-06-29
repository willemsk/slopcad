import {Entity, Constraint, Layer, UnitSystem, EntityType} from '../core/types';
import {ViewportMath, getAdaptiveGridSpacing} from '../core/viewport-math';
import {
  AABB,
  computeEntityAABB,
  aabbIntersects,
} from '../core/bounding-box-cache';
import {drawSelectionHandles} from './renderers/selection-renderer';
import {drawConstraint} from './renderers/constraint-renderer';
import {RendererRegistry} from './renderers/registry';

const TYPE_ORDER = [
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

  ctx.fillStyle = 'rgba(200, 202, 212, 0.15)'; // subtle grid dots, slightly increased opacity

  const dotSize = 3.0 / viewport.zoom; // keep dot size constant on screen (3px diameter equivalent)
  const halfDot = dotSize / 2;

  ctx.beginPath();
  for (let x = startX; x <= endX; x += adaptiveSpacing) {
    for (let y = startY; y <= endY; y += adaptiveSpacing) {
      ctx.rect(x - halfDot, y - halfDot, dotSize, dotSize);
    }
  }
  ctx.fill();
}

export function drawEntity(
  ctx: CanvasRenderingContext2D,
  ent: Entity,
  entityMap: Map<string, Entity>,
  isSelected: boolean,
  color: string,
  unitSystem: UnitSystem,
  zoom: number,
  layers: Layer[],
  entitiesByType?: Map<EntityType, Entity[]>,
) {
  const renderer = RendererRegistry[ent.type];
  if (renderer) {
    renderer({
      ctx,
      entity: ent,
      entityMap,
      entitiesByType,
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
  layerMap: Map<string, Layer>,
  unitSystem: UnitSystem,
  zoom: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.15; // very faint transparency
  const firstLayer = layers[0];
  const overlayMap = new Map<string, Entity>();
  for (const ent of overlayEntities) {
    overlayMap.set(ent.id, ent);
  }
  for (const ent of overlayEntities) {
    const layer = layerMap.get(ent.layerId ?? '0') || firstLayer;
    const color = layer?.color || '#c8cad4';
    drawEntity(ctx, ent, overlayMap, false, color, unitSystem, zoom, layers);
  }
  ctx.restore();
}

export function drawAllEntities(
  ctx: CanvasRenderingContext2D,
  entitiesByType: Map<EntityType, Entity[]>,
  entityMap: Map<string, Entity>,
  selection: Set<string>,
  hoveredEntityId: string | null,
  layers: Layer[],
  layerMap: Map<string, Layer>,
  unitSystem: UnitSystem,
  zoom: number,
  viewportAABB?: AABB,
) {
  const firstLayer = layers[0];

  // 1. Draw walls first
  const walls = entitiesByType.get('wall') || [];
  for (const wall of walls) {
    if (viewportAABB) {
      const aabb = computeEntityAABB(wall, entityMap);
      if (!aabbIntersects(aabb, viewportAABB)) {
        continue;
      }
    }

    const isSelected = selection.has(wall.id);
    const isHovered = wall.id === hoveredEntityId;

    if (isHovered && !isSelected) {
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10 / zoom;
    }

    const layer = layerMap.get(wall.layerId ?? '0') || firstLayer;
    let color = layer?.color || '#c8cad4';
    if (wall.color) color = wall.color;
    if (isHovered && !isSelected) {
      color = '#67e8f9';
    }

    drawEntity(
      ctx,
      wall,
      entityMap,
      isSelected,
      color,
      unitSystem,
      zoom,
      layers,
      entitiesByType,
    );

    if (isHovered && !isSelected) {
      ctx.restore();
    }
  }

  // 2. Draw all other entities in type order
  for (const type of TYPE_ORDER) {
    const list = entitiesByType.get(type as EntityType) || [];
    for (const ent of list) {
      if (viewportAABB) {
        const aabb = computeEntityAABB(ent, entityMap);
        if (!aabbIntersects(aabb, viewportAABB)) {
          continue;
        }
      }

      const isSelected = selection.has(ent.id);
      const isHovered = ent.id === hoveredEntityId;

      if (isHovered && !isSelected) {
        ctx.save();
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10 / zoom;
      }

      const layer = layerMap.get(ent.layerId ?? '0') || firstLayer;
      const color = layer?.color || '#c8cad4';

      drawEntity(
        ctx,
        ent,
        entityMap,
        isSelected,
        color,
        unitSystem,
        zoom,
        layers,
        entitiesByType,
      );

      if (isHovered && !isSelected) {
        ctx.restore();
      }
    }
  }
}

export function drawPreviewEntity(
  ctx: CanvasRenderingContext2D,
  previewEntity: Entity,
  entityMap: Map<string, Entity>,
  layers: Layer[],
  layerMap: Map<string, Layer>,
  unitSystem: UnitSystem,
  zoom: number,
) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  const firstLayer = layers[0];
  const layer = layerMap.get(previewEntity.layerId ?? '0') || firstLayer;
  const color = layer?.color || '#c8cad4';
  drawEntity(
    ctx,
    previewEntity,
    entityMap,
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
  entityMap: Map<string, Entity>,
  selection: Set<string>,
  unitSystem: UnitSystem,
  zoom: number,
  viewportAABB?: AABB,
) {
  for (const c of constraints) {
    if (viewportAABB) {
      let isVisible = false;
      const pointRefs = c.pointRefs || [];
      const entityIds = c.entityIds || [];

      if (pointRefs.length > 0) {
        for (let i = 0; i < pointRefs.length; i++) {
          const ent = entityMap.get(pointRefs[i].entityId);
          if (ent) {
            const aabb = computeEntityAABB(ent, entityMap);
            if (aabbIntersects(aabb, viewportAABB)) {
              isVisible = true;
              break;
            }
          }
        }
      } else if (entityIds.length > 0) {
        for (let i = 0; i < entityIds.length; i++) {
          const ent = entityMap.get(entityIds[i]);
          if (ent) {
            const aabb = computeEntityAABB(ent, entityMap);
            if (aabbIntersects(aabb, viewportAABB)) {
              isVisible = true;
              break;
            }
          }
        }
      } else {
        isVisible = true;
      }

      if (!isVisible) {
        continue;
      }
    }

    let isSelected = false;
    if (c.entityIds) {
      for (let i = 0; i < c.entityIds.length; i++) {
        if (selection.has(c.entityIds[i])) {
          isSelected = true;
          break;
        }
      }
    }
    drawConstraint(ctx, c, entityMap, isSelected, unitSystem, zoom);
  }
}

export function drawAllSelectionHandles(
  ctx: CanvasRenderingContext2D,
  entitiesByType: Map<EntityType, Entity[]>,
  selection: Set<string>,
  zoom: number,
  entityMap: Map<string, Entity>,
) {
  for (const list of entitiesByType.values()) {
    for (const ent of list) {
      if (selection.has(ent.id)) {
        drawSelectionHandles(ctx, ent, zoom, entityMap);
      }
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
