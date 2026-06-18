import {Tool} from './tool';
import {Vec2, SnapResult} from '../core/types';
import {ViewportMath} from '../core/viewport-math';
import {createCircle} from '../core/entity';
import {dist} from '../core/geometry';
import {
  activePageSignal,
  updateActivePage,
  snapshotState,
  projectSignal,
} from '../state/project-state';
import {previewEntitySignal} from '../state/ui-state';

export class CircleTool implements Tool {
  name = 'circle';

  private centerPt: Vec2 | null = null;

  activate() {
    this.reset();
  }

  deactivate() {
    this.reset();
  }

  private reset() {
    this.centerPt = null;
    previewEntitySignal.value = null;
  }

  onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    const targetPt = snapResult ? snapResult.point : worldPos;

    if (this.centerPt === null) {
      snapshotState();
      this.centerPt = {...targetPt};
    } else {
      const radius = dist(this.centerPt, targetPt);
      if (radius < 0.01) {
        this.reset();
        return;
      }

      const page = activePageSignal.value;
      const layerId = projectSignal.value.activeLayerId;
      const newCircle = createCircle(this.centerPt, radius, layerId);

      const newEntities = [...page.entities, newCircle];
      updateActivePage(newEntities, page.constraints);

      this.reset();
    }
  }

  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ) {
    if (this.centerPt) {
      const targetPt = snapResult ? snapResult.point : worldPos;
      const radius = dist(this.centerPt, targetPt);
      const layerId = projectSignal.value.activeLayerId;
      previewEntitySignal.value = createCircle(this.centerPt, radius, layerId);
    }
  }

  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.reset();
    }
  }
}
