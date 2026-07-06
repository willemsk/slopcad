import {Tool} from './tool';
import {Vec2, SnapResult, DoorEntity, WallEntity} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {createDoor} from '../core/entity';
import {
  activePageSignal,
  updateActivePage,
  projectSignal,
} from '../state/project-state';
import {snapshotState} from '../state/history-actions';
import {previewEntitySignal} from '../state/ui-state';

export class DoorTool implements Tool {
  name = 'door';

  private flipX = false;
  private flipY = false;
  private width = 0.9; // 90cm default width

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
      const wall = page.entities.find((e) => e.id === snapResult.entityId) as
        | WallEntity
        | undefined;
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
      const newDoor = createDoor(snapResult.entityId, t, this.width, layerId);
      newDoor.flipX = this.flipX;
      newDoor.flipY = this.flipY;
      newDoor.openingAngle = 90;

      const newEntities = [...page.entities, newDoor];
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

  onKeyDown(event: KeyboardEvent) {
    // Tab flips X
    if (event.key === 'Tab') {
      event.preventDefault();
      this.flipX = !this.flipX;
      this.updatePreview(null); // Force refresh
    }
    // 'F' or 'f' flips Y
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.flipY = !this.flipY;
      this.updatePreview(null); // Force refresh
    }
  }

  private updatePreview(snapResult: SnapResult | null) {
    // If no snapResult is provided, we try to use the last active preview wallId and position
    if (snapResult && snapResult.type === 'wall-align' && snapResult.entityId) {
      let t = snapResult.extra?.t ?? 0.5;
      const page = activePageSignal.value;
      const wall = page.entities.find((e) => e.id === snapResult.entityId) as
        | WallEntity
        | undefined;
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
      const ghost = createDoor(snapResult.entityId, t, this.width, layerId);
      ghost.flipX = this.flipX;
      ghost.flipY = this.flipY;
      ghost.openingAngle = 90;
      // Give ghost a temporary ID
      ghost.id = 'door-preview';
      previewEntitySignal.value = ghost;
    } else if (
      previewEntitySignal.value &&
      previewEntitySignal.value.type === 'door'
    ) {
      // Update existing preview properties
      const copy = {...(previewEntitySignal.value as DoorEntity)};
      copy.flipX = this.flipX;
      copy.flipY = this.flipY;
      previewEntitySignal.value = copy;
    } else {
      previewEntitySignal.value = null;
    }
  }
}
