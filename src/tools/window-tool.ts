import { Tool } from './tool';
import { Vec2, SnapResult } from '../core/types';
import { Viewport } from '../canvas/viewport';
import { createWindow } from '../core/entity';
import {
  activePageSignal,
  updateActivePage,
  previewEntitySignal,
  snapshotState,
} from '../state/app-state';

export class WindowTool implements Tool {
  name = 'window';

  private width = 1.20; // 1.2m default width

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    previewEntitySignal.value = null;
  }

  onMouseDown(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {
    if (snapResult && snapResult.type === 'wall-align' && snapResult.entityId) {
      snapshotState();

      const page = activePageSignal.value;
      const t = snapResult.extra?.t ?? 0.5;

      const newWindow = createWindow(snapResult.entityId, t, this.width);

      const newEntities = [...page.entities, newWindow];
      updateActivePage(newEntities, page.constraints);

      // Re-init preview
      this.updatePreview(snapResult);
    }
  }

  onMouseMove(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {
    this.updatePreview(snapResult);
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  private updatePreview(snapResult: SnapResult | null) {
    if (snapResult && snapResult.type === 'wall-align' && snapResult.entityId) {
      const t = snapResult.extra?.t ?? 0.5;
      const ghost = createWindow(snapResult.entityId, t, this.width);
      ghost.id = 'window-preview';
      previewEntitySignal.value = ghost;
    } else {
      previewEntitySignal.value = null;
    }
  }
}
