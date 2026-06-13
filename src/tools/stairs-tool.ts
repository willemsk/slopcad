import { Tool } from './tool';
import { Vec2, SnapResult } from '../core/types';
import { Viewport } from '../canvas/viewport';
import { createStairs } from '../core/entity';
import { dist } from '../core/geometry';
import {
  activePageSignal,
  updateActivePage,
  previewEntitySignal,
  snapshotState,
} from '../state/app-state';

export class StairsTool implements Tool {
  name = 'stairs';

  private startPt: Vec2 | null = null;
  private width = 1.0; // 1m default width
  private treadCount = 12; // 12 steps default

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

  onMouseDown(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {
    const targetPt = snapResult ? snapResult.point : worldPos;

    if (this.startPt === null) {
      snapshotState();
      this.startPt = { ...targetPt };
    } else {
      if (dist(this.startPt, targetPt) < 0.05) {
        this.reset();
        return;
      }

      const page = activePageSignal.value;
      const newStairs = createStairs(
        this.startPt,
        targetPt,
        this.width,
        this.treadCount,
        'up'
      );

      const newEntities = [...page.entities, newStairs];
      updateActivePage(newEntities, page.constraints);

      this.reset();
    }
  }

  onMouseMove(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {
    if (this.startPt) {
      const targetPt = snapResult ? snapResult.point : worldPos;
      // Constraint to horizontal/vertical if Shift key is held
      let finalPt = { ...targetPt };
      if (event.shiftKey) {
        const dx = Math.abs(finalPt.x - this.startPt.x);
        const dy = Math.abs(finalPt.y - this.startPt.y);
        if (dx > dy) {
          finalPt.y = this.startPt.y; // Horizontal
        } else {
          finalPt.x = this.startPt.x; // Vertical
        }
      }

      previewEntitySignal.value = createStairs(
        this.startPt,
        finalPt,
        this.width,
        this.treadCount,
        'up'
      );
    }
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.reset();
    }
  }
}
