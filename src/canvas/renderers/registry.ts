import {EntityType, WallEntity} from '../../core/types';
import {RenderFunction} from '../types';
import {Canvas2DRenderer} from '../canvas-renderer';
import * as entityRenderers from '../../io/entity-renderers';

/**
 * Registry mapping each entity type to its canvas drawing delegation.
 * Translates standard Preact canvas render context to generic Renderer calls.
 */
export const RendererRegistry: Record<EntityType, RenderFunction> = {
  wall: context => {
    const {ctx, entity, entities, isSelected, color, zoom} = context;
    if (entity.type === 'wall') {
      const allWalls = entities.filter(e => e.type === 'wall') as WallEntity[];
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderWalls([entity], allWalls, canvasRenderer);
    }
  },
  door: context => {
    const {ctx, entity, entities, isSelected, color, zoom} = context;
    if (entity.type === 'door') {
      const wall = entities.find(e => e.id === entity.wallId) as
        | WallEntity
        | undefined;
      if (wall) {
        const canvasRenderer = new Canvas2DRenderer(
          ctx,
          zoom,
          isSelected,
          color,
        );
        entityRenderers.renderDoor(entity, wall, canvasRenderer);
      }
    }
  },
  window: context => {
    const {ctx, entity, entities, isSelected, color, zoom} = context;
    if (entity.type === 'window') {
      const wall = entities.find(e => e.id === entity.wallId) as
        | WallEntity
        | undefined;
      if (wall) {
        const canvasRenderer = new Canvas2DRenderer(
          ctx,
          zoom,
          isSelected,
          color,
        );
        entityRenderers.renderWindow(entity, wall, canvasRenderer);
      }
    }
  },
  stairs: context => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'stairs') {
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderStairs(entity, canvasRenderer);
    }
  },
  line: context => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'line') {
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderLine(entity, canvasRenderer);
    }
  },
  rect: context => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'rect') {
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderRect(entity, canvasRenderer);
    }
  },
  circle: context => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'circle') {
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderCircle(entity, canvasRenderer);
    }
  },
  arc: context => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'arc') {
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderArc(entity, canvasRenderer);
    }
  },
  dimension: context => {
    const {ctx, entity, isSelected, color, zoom, unitSystem} = context;
    if (entity.type === 'dimension') {
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderDimension(entity, unitSystem, canvasRenderer);
    }
  },
  text: context => {
    const {ctx, entity, isSelected, color, zoom} = context;
    if (entity.type === 'text') {
      const canvasRenderer = new Canvas2DRenderer(ctx, zoom, isSelected, color);
      entityRenderers.renderText(entity, canvasRenderer);
    }
  },
};
