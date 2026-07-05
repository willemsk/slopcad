import {Renderer, RendererOptions} from '../io/renderer-interface';
import {Vec2} from '../core/types';

/**
 * Implementation of the generic Renderer interface for drawing to HTML5 Canvas2D context.
 * Automatically translates physical coordinates and dimensions, and applies selection
 * and hover highlights.
 */
export class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private zoom: number;
  private isSelected: boolean;
  private colorOverride: string;

  constructor(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    isSelected: boolean,
    colorOverride: string,
  ) {
    this.ctx = ctx;
    this.zoom = zoom;
    this.isSelected = isSelected;
    this.colorOverride = colorOverride;
  }

  begin(): void {}
  end(): void {}

  pushGroup(options?: {transform?: string}): void {
    this.ctx.save();
    if (options?.transform) {
      // Simple transform parser for rotation
      const rotateMatch = options.transform.match(
        /rotate\(([^,]+),\s*([^,]+),\s*([^)]+)\)/,
      );
      if (rotateMatch) {
        const deg = parseFloat(rotateMatch[1]);
        const cx = parseFloat(rotateMatch[2]);
        const cy = parseFloat(rotateMatch[3]);
        this.ctx.translate(cx, cy);
        this.ctx.rotate((deg * Math.PI) / 180);
        this.ctx.translate(-cx, -cy);
      }
    }
  }

  popGroup(): void {
    this.ctx.restore();
  }

  private applyStyles(options?: RendererOptions) {
    // 1. Resolve Stroke Color
    let strokeColor = options?.stroke || this.colorOverride;
    if (
      strokeColor === '#e2e8f0' ||
      strokeColor === '#cbd5e1' ||
      strokeColor === '#c8cad4'
    ) {
      strokeColor = this.colorOverride;
    }

    if (this.isSelected) {
      this.ctx.strokeStyle = '#22d3ee';
    } else {
      this.ctx.strokeStyle = strokeColor;
    }

    // 2. Resolve Stroke Width (convert physical to constant screen pixels)
    let width = 2;
    if (options?.strokeWidth !== undefined) {
      const sw = options.strokeWidth;
      if (sw <= 0.01) {
        width = 1;
      } else if (sw <= 0.015) {
        width = 1.2;
      } else if (sw <= 0.02) {
        width = 2;
      } else {
        width = 2.5;
      }
    }

    let finalWidth = width;
    if (this.isSelected) {
      finalWidth = width >= 2 ? 3 : 2;
    }
    this.ctx.lineWidth = finalWidth / this.zoom;

    // 3. Resolve Stroke Dasharray
    if (options?.strokeDasharray) {
      const dashes = options.strokeDasharray
        .split(',')
        .map(s => parseFloat(s.trim()));
      this.ctx.setLineDash(dashes);
    } else {
      this.ctx.setLineDash([]);
    }

    // 4. Resolve Fill Color
    let fill = options?.fill || 'transparent';
    if (fill === '#1e2028') {
      fill = '#1e2028'; // Keep cuts dark background
    } else if (this.isSelected && fill !== 'transparent' && fill !== 'none') {
      fill = 'rgba(34, 211, 238, 0.05)';
    }

    if (fill === 'none' || fill === 'transparent') {
      this.ctx.fillStyle = 'transparent';
    } else {
      this.ctx.fillStyle = fill;
    }
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: RendererOptions,
  ): void {
    this.applyStyles(options);
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);

    if (this.ctx.fillStyle !== 'transparent') {
      this.ctx.fill();
    }
    if (options?.stroke !== 'none') {
      this.ctx.stroke();
    }
  }

  drawPolygon(points: Vec2[], options?: RendererOptions): void {
    if (points.length < 2) return;
    this.applyStyles(options);
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();

    if (this.ctx.fillStyle !== 'transparent') {
      this.ctx.fill();
    }
    if (options?.stroke !== 'none') {
      this.ctx.stroke();
    }
  }

  drawLine(p1: Vec2, p2: Vec2, options?: RendererOptions): void {
    this.applyStyles(options);
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
  }

  drawCircle(center: Vec2, radius: number, options?: RendererOptions): void {
    this.applyStyles(options);
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);

    if (this.ctx.fillStyle !== 'transparent') {
      this.ctx.fill();
    }
    if (options?.stroke !== 'none') {
      this.ctx.stroke();
    }
  }

  drawArc(
    center: Vec2,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterClockwise: boolean,
    options?: RendererOptions,
  ): void {
    this.applyStyles(options);
    this.ctx.beginPath();
    this.ctx.arc(
      center.x,
      center.y,
      radius,
      startAngle,
      endAngle,
      counterClockwise,
    );

    if (this.ctx.fillStyle !== 'transparent') {
      this.ctx.fill();
    }
    if (options?.stroke !== 'none') {
      this.ctx.stroke();
    }
  }

  drawText(
    text: string,
    position: Vec2,
    options?: RendererOptions,
    transform?: string,
  ): void {
    this.applyStyles(options);
    this.ctx.save();

    // Text alignment mapping
    if (options?.textAnchor === 'middle') {
      this.ctx.textAlign = 'center';
    } else if (options?.textAnchor === 'end') {
      this.ctx.textAlign = 'right';
    } else {
      this.ctx.textAlign = 'left';
    }

    if (options?.dominantBaseline === 'middle') {
      this.ctx.textBaseline = 'middle';
    } else if (options?.dominantBaseline === 'top') {
      this.ctx.textBaseline = 'top';
    } else {
      this.ctx.textBaseline = 'alphabetic';
    }

    // Font resolution
    const fontFam = options?.fontFamily || 'Inter, sans-serif';
    const fontW = options?.fontWeight || '';
    const fontSz = options?.fontSize || 0.12;
    this.ctx.font = `${fontW} ${fontSz}px ${fontFam}`;

    if (this.isSelected) {
      this.ctx.fillStyle = '#22d3ee';
    } else {
      let fill = options?.fill || this.colorOverride;
      if (fill === '#e2e8f0' || fill === '#cbd5e1' || fill === '#c8cad4') {
        fill = this.colorOverride;
      }
      this.ctx.fillStyle = fill;
    }

    if (transform) {
      const rotateMatch = transform.match(
        /rotate\(([^,]+),\s*([^,]+),\s*([^)]+)\)/,
      );
      if (rotateMatch) {
        const deg = parseFloat(rotateMatch[1]);
        const cx = parseFloat(rotateMatch[2]);
        const cy = parseFloat(rotateMatch[3]);
        this.ctx.translate(cx, cy);
        this.ctx.rotate((deg * Math.PI) / 180);
        this.ctx.translate(-cx, -cy);
      }
    }

    this.ctx.fillText(text, position.x, position.y);
    this.ctx.restore();
  }
}
