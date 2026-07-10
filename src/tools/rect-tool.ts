import {createRect} from '../core/entity';
import {dist} from '../core/geometry';
import type {SnapResult, Vec2} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {snapshotState} from '../state/history-actions';
import {
  activePageSignal,
  projectSignal,
  updateActivePage,
} from '../state/project-state';
import {previewEntitySignal} from '../state/ui-state';
import type {Tool} from './tool';

export class RectTool implements Tool {
  name = 'rect';

  private startPt: Vec2 | null = null;

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    this.startPt = null;
    previewEntitySignal.value = null;
  }

  onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    const targetPt = snapResult ? snapResult.point : worldPos;

    if (this.startPt === null) {
      snapshotState();
      this.startPt = {...targetPt};
    } else {
      if (dist(this.startPt, targetPt) < 0.01) {
        this.reset();
        return;
      }

      const page = activePageSignal.value;
      const layerId = projectSignal.value.activeLayerId;
      const newRect = createRect(this.startPt, targetPt, layerId);

      const newEntities = [...page.entities, newRect];
      updateActivePage(newEntities, page.constraints);

      this.reset();
    }
  }

  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    if (this.startPt) {
      const targetPt = snapResult ? snapResult.point : worldPos;
      const finalPt = {...targetPt};
      if (event.shiftKey) {
        // Keep rectangle square
        const side = Math.max(
          Math.abs(finalPt.x - this.startPt.x),
          Math.abs(finalPt.y - this.startPt.y),
        );
        finalPt.x =
          this.startPt.x + Math.sign(finalPt.x - this.startPt.x) * side;
        finalPt.y =
          this.startPt.y + Math.sign(finalPt.y - this.startPt.y) * side;
      }
      const layerId = projectSignal.value.activeLayerId;
      previewEntitySignal.value = createRect(this.startPt, finalPt, layerId);
    }
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.reset();
    }
  }
}
