import {Entity, type EntityType, type WallEntity} from '../../core/types';
import * as entityRenderers from '../../io/entity-renderers';
import {Canvas2DRenderer} from '../canvas-renderer';
import type {RenderFunction} from '../types';

let cachedRenderer: Canvas2DRenderer | null = null;

function getRenderer(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  isSelected: boolean,
  color: string,
): Canvas2DRenderer {
  if (!cachedRenderer) {
    cachedRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
  } else {
    cachedRenderer.configure(zoom, isSelected, color);
  }
  return cachedRenderer;
}

export const RendererRegistry: Record<EntityType, RenderFunction> = {
  wall: (context) => {
    const {ctx, entity, entityMap, entitiesByType, isSelected, color, zoom} =
      context;
    if (entity.type === 'wall') {
      let allWalls = entitiesByType?.get('wall') as WallEntity[] | undefined;
      if (!allWalls) {
        allWalls = [];
        for (const ent of entityMap.values()) {
          if (ent.type === 'wall') {
            allWalls.push(ent as WallEntity);
          }
        }
      }
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderWalls([entity], allWalls, canvasRenderer);
    }
  },
  door: (context) => {
    const {ctx, entity, entityMap, isSelected, color, zoom} = context;
    if (entity.type === 'door') {
      const wall = entityMap.get(entity.wallId) as WallEntity | undefined;
      if (wall) {
        const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
        entityRenderers.renderDoor(entity, wall, canvasRenderer);
      }
    }
  },
  window: (context) => {
    const {ctx, entity, entityMap, isSelected, color, zoom} = context;
    if (entity.type === 'window') {
      const wall = entityMap.get(entity.wallId) as WallEntity | undefined;
      if (wall) {
        const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
        entityRenderers.renderWindow(entity, wall, canvasRenderer);
      }
    }
  },
  stairs: (context) => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'stairs') {
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderStairs(entity, canvasRenderer);
    }
  },
  line: (context) => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'line') {
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderLine(entity, canvasRenderer);
    }
  },
  rect: (context) => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'rect') {
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderRect(entity, canvasRenderer);
    }
  },
  circle: (context) => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'circle') {
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderCircle(entity, canvasRenderer);
    }
  },
  arc: (context) => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'arc') {
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderArc(entity, canvasRenderer);
    }
  },
  dimension: (context) => {
    const {ctx, entity, isSelected, color, zoom, unitSystem} = context;
    if (entity.type === 'dimension') {
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderDimension(entity, unitSystem, canvasRenderer);
    }
  },
  text: (context) => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'text') {
      const canvasRenderer = getRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderText(entity, canvasRenderer);
    }
  },
};
