import {computeViewportAABB} from '../core/bounding-box-cache';
import type {
  Constraint,
  Entity,
  EntityType,
  Layer,
  SnapResult,
  UnitSystem,
} from '../core/types';
import type {ViewportMath} from '../core/viewport-math';
import {
  clearCanvas,
  drawAllConstraints,
  drawAllEntities,
  drawAllSelectionHandles,
  drawGrid,
  drawOverlayFloor,
  drawPreviewEntity,
  drawUCS,
} from './render-helpers';
import {drawSnapIndicator} from './renderers/snap-renderer';

export interface RenderState {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  viewport: ViewportMath;
  entitiesByType: Map<EntityType, Entity[]>;
  entityMap: Map<string, Entity>;
  constraints: Constraint[];
  layers: Layer[];
  layerMap: Map<string, Layer>;
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
    entitiesByType,
    entityMap,
    constraints,
    layers,
    layerMap,
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

  const viewportAABB = computeViewportAABB(viewport, width, height);

  // 1. Clear canvas
  clearCanvas(ctx, width, height);

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
    drawOverlayFloor(
      ctx,
      overlayEntities,
      layers,
      layerMap,
      unitSystem,
      viewport.zoom,
    );
  }

  // 4. Draw Entities
  drawAllEntities(
    ctx,
    entitiesByType,
    entityMap,
    selection,
    hoveredEntityId,
    layers,
    layerMap,
    unitSystem,
    viewport.zoom,
    viewportAABB,
  );

  // 5. Draw Active Tool Preview (Ghost/Helper)
  if (previewEntity) {
    drawPreviewEntity(
      ctx,
      previewEntity,
      entityMap,
      layers,
      layerMap,
      unitSystem,
      viewport.zoom,
    );
  }

  // 6. Draw Constraints (if visible)
  if (showConstraints) {
    drawAllConstraints(
      ctx,
      constraints,
      entityMap,
      selection,
      unitSystem,
      viewport.zoom,
      viewportAABB,
    );
  }

  // 7. Draw Selection Handles on Top
  drawAllSelectionHandles(
    ctx,
    entitiesByType,
    selection,
    viewport.zoom,
    entityMap,
  );

  // 8. Draw Snap Indicator
  if (snapResult) {
    drawSnapIndicator(ctx, snapResult.point, snapResult.type, viewport.zoom);
  }

  // Restore camera transform
  ctx.restore();

  // 9. Draw Screen-Space UCS Indicator (Bottom-Left)
  drawUCS(ctx, height);
}
export {drawEntity} from './render-helpers';
