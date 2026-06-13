import {Tool} from './tool';
import {Vec2, SnapResult} from '../core/types';
import {Viewport} from '../canvas/viewport';
import {createLine} from '../core/entity';
import {dist} from '../core/geometry';
import {
  activePageSignal,
  updateActivePage,
  previewEntitySignal,
  snapshotState,
} from '../state/app-state';

export class LineTool implements Tool {
  name = 'line';

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
      const newLine = createLine(this.startPt, targetPt);

      const newEntities = [...page.entities, newLine];
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
        const dx = Math.abs(finalPt.x - this.startPt.x);
        const dy = Math.abs(finalPt.y - this.startPt.y);
        if (dx > dy) {
          finalPt.y = this.startPt.y;
        } else {
          finalPt.x = this.startPt.x;
        }
      }
      previewEntitySignal.value = createLine(this.startPt, finalPt);
    }
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.reset();
    }
  }
}
