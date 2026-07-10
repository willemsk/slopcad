import type {SnapResult, Vec2} from '../core/types';
import type {ViewportMath} from '../core/viewport-math';

export interface Tool {
  name: string;
  onMouseDown(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ): void;
  onMouseMove(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ): void;
  onMouseUp(
    worldPos: Vec2,
    event: MouseEvent,
    snapResult: SnapResult | null,
  ): void;
  onKeyDown?(event: KeyboardEvent): void;
  renderPreview?(
    ctx: CanvasRenderingContext2D,
    viewport: ViewportMath,
    currentWorldPos: Vec2,
  ): void;
  activate(): void;
  deactivate(): void;
}
