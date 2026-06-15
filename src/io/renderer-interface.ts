import {Vec2} from '../core/types';

export interface RendererOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: number;
  textAnchor?: string;
  dominantBaseline?: string;
}

export interface Renderer {
  // Setup and structure
  begin(minX: number, minY: number, width: number, height: number): void;
  end(): string | Uint8Array | void;

  // Grouping / Transforms
  pushGroup(options?: {transform?: string}): void;
  popGroup(): void;

  // Drawing primitives
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: RendererOptions,
  ): void;
  drawPolygon(points: Vec2[], options?: RendererOptions): void;
  drawLine(p1: Vec2, p2: Vec2, options?: RendererOptions): void;
  drawCircle(center: Vec2, radius: number, options?: RendererOptions): void;

  /**
   * Draws an arc.
   * @param center The center of the arc.
   * @param radius The radius of the arc.
   * @param startAngle Angle in radians.
   * @param endAngle Angle in radians.
   * @param counterClockwise True if arc is drawn counter-clockwise (SVG sweep-flag 0).
   * @param options Style options.
   */
  drawArc(
    center: Vec2,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterClockwise: boolean,
    options?: RendererOptions,
  ): void;

  /**
   * Draws text.
   * @param text The string to draw.
   * @param position The x/y position.
   * @param options Text styling and anchoring.
   * @param transform Optional transform string for rotation, etc.
   */
  drawText(
    text: string,
    position: Vec2,
    options?: RendererOptions,
    transform?: string,
  ): void;
}
