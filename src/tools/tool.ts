import { Vec2, SnapResult } from '../core/types';
import { Viewport } from '../canvas/viewport';

export interface Tool {
  name: string;
  onMouseDown(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null): void;
  onMouseMove(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null): void;
  onMouseUp(worldPos: Vec2, event: MouseEvent, snapResult: SnapResult | null): void;
  onKeyDown?(event: KeyboardEvent): void;
  renderPreview?(ctx: CanvasRenderingContext2D, viewport: Viewport, currentWorldPos: Vec2): void;
  activate(): void;
  deactivate(): void;
}
