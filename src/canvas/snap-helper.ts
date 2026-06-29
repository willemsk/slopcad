import {Vec2, Entity, SnapResult} from '../core/types';
import {ViewportMath, getAdaptiveGridSpacing} from '../core/viewport-math';
import {getSnapPoint, SnapSettings} from '../core/snap';
import {dist} from '../core/geometry';

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
