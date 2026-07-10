import {dist} from '../core/geometry';
import {type SnapSettings, getSnapPoint} from '../core/snap';
import type {Entity, SnapResult, Vec2} from '../core/types';
import {type ViewportMath, getAdaptiveGridSpacing} from '../core/viewport-math';

/**
 * Interface representing the result of snap computation.
 */
interface SnapComputationResult {
  targetPos: Vec2;
  activeSnap: SnapResult | null;
}

/**
 * Computes the snap point and snap result for canvas events (mouse move, mouse down, mouse up).
 */
export function computeEventSnap(
  worldPos: Vec2,
  viewport: ViewportMath,
  entities: Entity[],
  snapEnabled: boolean,
  gridSpacing: number | null,
  gridEnabled: boolean,
  activeToolType?: string,
  entityMap?: Map<string, Entity>,
): SnapComputationResult {
  let targetPos = worldPos;
  let activeSnap: SnapResult | null = null;

  if (snapEnabled) {
    const snapRadiusWorld = 12 / viewport.zoom;
    const snapSettings: SnapSettings = {
      grid: gridEnabled,
      endpoints: true,
      midpoints: true,
      intersections: true,
      wallAlign: true,
    };

    const effectiveGridSpacing =
      gridSpacing !== null
        ? getAdaptiveGridSpacing(gridSpacing, viewport.zoom)
        : null;

    const snap = getSnapPoint(
      worldPos,
      entities,
      effectiveGridSpacing,
      snapSettings,
      snapRadiusWorld,
      activeToolType,
    );

    targetPos = snap.point;
    if (snap.type !== 'grid' || dist(worldPos, snap.point) < snapRadiusWorld) {
      activeSnap = snap;
    }
  }

  return {targetPos, activeSnap};
}
