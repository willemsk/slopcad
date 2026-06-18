import {Tool} from './tool';
import {Vec2, SnapResult, DimensionEntity} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {createDimension} from '../core/entity';
import {dist, sub, dot, normalize} from '../core/geometry';
import {
  activePageSignal,
  updateActivePage,
  previewEntitySignal,
  snapshotState,
  projectSignal,
} from '../state/app-state';

export class DimensionTool implements Tool {
  name = 'dimension';

  private p1: Vec2 | null = null;
  private p2: Vec2 | null = null;

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    this.p1 = null;
    this.p2 = null;
    previewEntitySignal.value = null;
  }

  onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    const targetPt = snapResult ? snapResult.point : worldPos;

    if (this.p1 === null) {
      this.p1 = {...targetPt};
    } else if (this.p2 === null) {
      if (dist(this.p1, targetPt) < 0.01) {
        this.reset();
        return;
      }
      this.p2 = {...targetPt};
    } else {
      // Third click: place the dimension
      snapshotState();

      const offset = this.calculateOffset(worldPos);
      const page = activePageSignal.value;
      const layerId = projectSignal.value.activeLayerId;
      const newDim = createDimension(
        this.p1,
        this.p2,
        offset,
        undefined,
        undefined,
        layerId,
      );

      const newEntities = [...page.entities, newDim];
      updateActivePage(newEntities, page.constraints);

      this.reset();
    }
  }

  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    const targetPt = snapResult ? snapResult.point : worldPos;

    if (this.p1 && !this.p2) {
      // Ghost line showing selection progress
      const layerId = projectSignal.value.activeLayerId;
      const ghost = createDimension(
        this.p1,
        targetPt,
        0.3,
        undefined,
        undefined,
        layerId,
      );
      ghost.id = 'dim-preview';
      previewEntitySignal.value = ghost;
    } else if (this.p1 && this.p2) {
      // Adjusting offset
      const offset = this.calculateOffset(worldPos);
      const layerId = projectSignal.value.activeLayerId;
      const ghost = createDimension(
        this.p1,
        this.p2,
        offset,
        undefined,
        undefined,
        layerId,
      );
      ghost.id = 'dim-preview';
      previewEntitySignal.value = ghost;
    }
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.reset();
    }
  }

  private calculateOffset(mousePos: Vec2): number {
    if (!this.p1 || !this.p2) return 0.3;

    const u = normalize(sub(this.p2, this.p1));
    const n = {x: -u.y, y: u.x}; // Perpendicular vector
    const v = sub(mousePos, this.p1);

    const offsetVal = dot(v, n);
    // Don't let offset be exactly zero to avoid drawing overlay issues
    if (Math.abs(offsetVal) < 0.05) {
      return Math.sign(offsetVal) * 0.05 || 0.05;
    }
    return offsetVal;
  }
}
