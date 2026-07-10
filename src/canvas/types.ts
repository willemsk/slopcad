import type {Entity, EntityType, Layer, UnitSystem} from '../core/types';

/** Shared rendering context passed to all renderers. */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  entityMap: Map<string, Entity>;
  entitiesByType?: Map<EntityType, Entity[]>;
  layers: Layer[];
  unitSystem: UnitSystem;
  zoom: number;
}

/** Per-entity rendering context, extending the shared context. */
export interface EntityRenderContext<T extends Entity = Entity>
  extends RenderContext {
  entity: T;
  isSelected: boolean;
  color: string;
}

/** Signature for a single-entity renderer. */
export type RenderFunction<T extends Entity = Entity> = (
  context: EntityRenderContext<T>,
) => void;
