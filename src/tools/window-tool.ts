import {Tool} from './tool';
import {Vec2, SnapResult} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {createWindow} from '../core/entity';
import {
  activePageSignal,
  updateActivePage,
  snapshotState,
  projectSignal,
} from '../state/project-state';
import {previewEntitySignal} from '../state/ui-state';

export class WindowTool implements Tool {
  name = 'window';

  private width = 1.2; // 1.2m default width

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    previewEntitySignal.value = null;
  }

  onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    if (snapResult && snapResult.type === 'wall-align' && snapResult.entityId) {
      snapshotState();

      const page = activePageSignal.value;
      let t = snapResult.extra?.t ?? 0.5;
      const wall = page.entities.find(e => e.id === snapResult.entityId) as any;
      if (wall) {
        const length = Math.hypot(
          wall.end.x - wall.start.x,
          wall.end.y - wall.start.y,
        );
        if (length > 0) {
          const minT = this.width / 2 / length;
          const maxT = 1 - minT;
          t = Math.max(minT, Math.min(maxT, t));
        }
      }

      const layerId = projectSignal.value.activeLayerId;
      const newWindow = createWindow(
        snapResult.entityId,
        t,
        this.width,
        layerId,
      );

      const newEntities = [...page.entities, newWindow];
      updateActivePage(newEntities, page.constraints);

      // Re-init preview
      this.updatePreview(snapResult);
    }
  }

  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    this.updatePreview(snapResult);
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  private updatePreview(snapResult: SnapResult | null) {
    if (snapResult && snapResult.type === 'wall-align' && snapResult.entityId) {
      let t = snapResult.extra?.t ?? 0.5;
      const page = activePageSignal.value;
      const wall = page.entities.find(e => e.id === snapResult.entityId) as any;
      if (wall) {
        const length = Math.hypot(
          wall.end.x - wall.start.x,
          wall.end.y - wall.start.y,
        );
        if (length > 0) {
          const minT = this.width / 2 / length;
          const maxT = 1 - minT;
          t = Math.max(minT, Math.min(maxT, t));
        }
      }

      const layerId = projectSignal.value.activeLayerId;
      const ghost = createWindow(snapResult.entityId, t, this.width, layerId);
      ghost.id = 'window-preview';
      previewEntitySignal.value = ghost;
    } else {
      previewEntitySignal.value = null;
    }
  }
}
