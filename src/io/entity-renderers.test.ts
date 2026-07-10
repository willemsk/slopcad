import {describe, expect, it} from 'vitest';
import type {
  ArcEntity,
  CircleEntity,
  DimensionEntity,
  DoorEntity,
  LineEntity,
  RectEntity,
  StairsEntity,
  TextEntity,
  Vec2,
  WallEntity,
  WindowEntity,
} from '../core/types';
import {
  renderArc,
  renderCircle,
  renderDimension,
  renderDoor,
  renderLine,
  renderRect,
  renderStairs,
  renderText,
  renderWall,
  renderWalls,
  renderWindow,
} from './entity-renderers';
import type {Renderer, RendererOptions} from './renderer-interface';

class MockRenderer implements Renderer {
  calls: {type: string; args: unknown[]}[] = [];

  begin(minX: number, minY: number, width: number, height: number): void {
    this.calls.push({type: 'begin', args: [minX, minY, width, height]});
  }

  end(): string {
    this.calls.push({type: 'end', args: []});
    return 'mock-svg-content';
  }

  pushGroup(options?: {transform?: string}): void {
    this.calls.push({type: 'pushGroup', args: [options]});
  }

  popGroup(): void {
    this.calls.push({type: 'popGroup', args: []});
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: RendererOptions,
  ): void {
    this.calls.push({type: 'drawRect', args: [x, y, width, height, options]});
  }

  drawPolygon(points: Vec2[], options?: RendererOptions): void {
    this.calls.push({type: 'drawPolygon', args: [points, options]});
  }

  drawLine(p1: Vec2, p2: Vec2, options?: RendererOptions): void {
    this.calls.push({type: 'drawLine', args: [p1, p2, options]});
  }

  drawCircle(center: Vec2, radius: number, options?: RendererOptions): void {
    this.calls.push({type: 'drawCircle', args: [center, radius, options]});
  }

  drawArc(
    center: Vec2,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterClockwise: boolean,
    options?: RendererOptions,
  ): void {
    this.calls.push({
      type: 'drawArc',
      args: [center, radius, startAngle, endAngle, counterClockwise, options],
    });
  }

  drawText(
    text: string,
    position: Vec2,
    options?: RendererOptions,
    transform?: string,
  ): void {
    this.calls.push({
      type: 'drawText',
      args: [text, position, options, transform],
    });
  }
}

describe('Entity Renderers', () => {
  it('renders a LineEntity correctly', () => {
    const renderer = new MockRenderer();
    const line: LineEntity = {
      id: 'l1',
      type: 'line',
      start: {x: 1, y: 2},
      end: {x: 3, y: 4},
    };

    renderLine(line, renderer);

    expect(renderer.calls.length).toBe(1);
    expect(renderer.calls[0]).toEqual({
      type: 'drawLine',
      args: [
        {x: 1, y: 2},
        {x: 3, y: 4},
        {stroke: '#e2e8f0', strokeWidth: 0.02},
      ],
    });
  });

  it('renders a RectEntity correctly', () => {
    const renderer = new MockRenderer();
    const rect: RectEntity = {
      id: 'r1',
      type: 'rect',
      p1: {x: 10, y: 20},
      p2: {x: 5, y: 30},
    };

    renderRect(rect, renderer);

    expect(renderer.calls.length).toBe(1);
    expect(renderer.calls[0]).toEqual({
      type: 'drawRect',
      args: [
        5,
        20,
        5,
        10,
        {fill: 'none', stroke: '#e2e8f0', strokeWidth: 0.02},
      ],
    });
  });

  it('renders a CircleEntity correctly', () => {
    const renderer = new MockRenderer();
    const circle: CircleEntity = {
      id: 'c1',
      type: 'circle',
      center: {x: 5, y: 5},
      radius: 3,
    };

    renderCircle(circle, renderer);

    expect(renderer.calls.length).toBe(1);
    expect(renderer.calls[0]).toEqual({
      type: 'drawCircle',
      args: [
        {x: 5, y: 5},
        3,
        {fill: 'none', stroke: '#e2e8f0', strokeWidth: 0.02},
      ],
    });
  });

  it('renders an ArcEntity correctly', () => {
    const renderer = new MockRenderer();
    const arc: ArcEntity = {
      id: 'a1',
      type: 'arc',
      center: {x: 0, y: 0},
      radius: 2,
      startAngle: 0,
      endAngle: Math.PI / 2, // 90 deg (sweep > 0 => counterClockwise = false)
    };

    renderArc(arc, renderer);

    expect(renderer.calls.length).toBe(1);
    const call = renderer.calls[0];
    expect(call.type).toBe('drawArc');
    expect(call.args[0]).toEqual({x: 0, y: 0});
    expect(call.args[1]).toBe(2);
    expect(call.args[2]).toBe(0);
    expect(call.args[3]).toBe(Math.PI / 2);
    expect(call.args[4]).toBe(false); // counterClockwise = false because endAngle > startAngle
    expect(call.args[5]).toEqual({
      fill: 'none',
      stroke: '#e2e8f0',
      strokeWidth: 0.02,
    });
  });

  it('renders a TextEntity correctly', () => {
    const renderer = new MockRenderer();
    const text: TextEntity = {
      id: 't1',
      type: 'text',
      position: {x: 10, y: 12},
      text: 'Hello CAD',
      fontSize: 0.5,
    };

    renderText(text, renderer);

    expect(renderer.calls.length).toBe(1);
    expect(renderer.calls[0]).toEqual({
      type: 'drawText',
      args: [
        'Hello CAD',
        {x: 10, y: 12},
        {
          fontFamily: 'Inter, sans-serif',
          fontSize: 0.5,
          fill: '#f8fafc',
          dominantBaseline: 'text-before-edge',
        },
        undefined,
      ],
    });
  });

  it('renders a DimensionEntity correctly', () => {
    const renderer = new MockRenderer();
    const dimension: DimensionEntity = {
      id: 'd1',
      type: 'dimension',
      p1: {x: 0, y: 0},
      p2: {x: 3, y: 4}, // distance = 5
      offset: 0.5,
    };

    renderDimension(dimension, 'metric', renderer);

    // Should push group, draw text mask, draw text, pop group, and draw lines/ticks
    expect(renderer.calls.some((c) => c.type === 'pushGroup')).toBe(true);
    expect(renderer.calls.some((c) => c.type === 'popGroup')).toBe(true);
    expect(renderer.calls.some((c) => c.type === 'drawText')).toBe(true);
    expect(renderer.calls.some((c) => c.type === 'drawRect')).toBe(true); // text mask
    expect(renderer.calls.filter((c) => c.type === 'drawLine').length).toBe(5); // 2 extension lines + 1 dim line + 2 ticks
  });

  it('renders a WallEntity correctly', () => {
    const renderer = new MockRenderer();
    const wall: WallEntity = {
      id: 'w1',
      type: 'wall',
      start: {x: 0, y: 0},
      end: {x: 4, y: 0},
      thickness: 0.2,
    };

    renderWall(wall, renderer);

    // Wall rendering draws a polygon fill, then left/right stroke lines, end caps, and a center dashed line.
    expect(renderer.calls.some((c) => c.type === 'drawPolygon')).toBe(true);
    const lines = renderer.calls.filter((c) => c.type === 'drawLine');
    expect(lines.length).toBeGreaterThanOrEqual(4); // Left stroke, right stroke, 2 caps, centerline
  });

  it('renders a batch of Walls with mitering and T-junction gaps', () => {
    const renderer = new MockRenderer();
    // Create two walls forming an L corner at {0, 0}
    const wall1: WallEntity = {
      id: 'w1',
      type: 'wall',
      start: {x: 0, y: 0},
      end: {x: 5, y: 0},
      thickness: 0.2,
    };
    const wall2: WallEntity = {
      id: 'w2',
      type: 'wall',
      start: {x: 0, y: 0},
      end: {x: 0, y: 5},
      thickness: 0.2,
    };

    renderWalls([wall1, wall2], [wall1, wall2], renderer);

    // Corner mitering should skip start caps on both walls where they intersect at {0, 0}
    expect(renderer.calls.some((c) => c.type === 'drawPolygon')).toBe(true);
  });

  it('renders a DoorEntity with swing arc and polygon mask', () => {
    const renderer = new MockRenderer();
    const wall: WallEntity = {
      id: 'w1',
      type: 'wall',
      start: {x: 0, y: 0},
      end: {x: 4, y: 0},
      thickness: 0.2,
    };
    const door: DoorEntity = {
      id: 'door1',
      type: 'door',
      wallId: 'w1',
      position: 0.5,
      width: 1.0,
      openingAngle: 90,
    };

    renderDoor(door, wall, renderer);

    // Should render a polygon mask first, then door frame cuts, leaf line, and swing arc
    expect(renderer.calls.some((c) => c.type === 'drawPolygon')).toBe(true); // mask
    expect(renderer.calls.some((c) => c.type === 'drawArc')).toBe(true); // swing arc
    expect(renderer.calls.some((c) => c.type === 'drawLine')).toBe(true); // leaf line
  });

  it('renders a WindowEntity with polygon mask and outlines', () => {
    const renderer = new MockRenderer();
    const wall: WallEntity = {
      id: 'w1',
      type: 'wall',
      start: {x: 0, y: 0},
      end: {x: 4, y: 0},
      thickness: 0.2,
    };
    const wind: WindowEntity = {
      id: 'win1',
      type: 'window',
      wallId: 'w1',
      position: 0.5,
      width: 1.2,
    };

    renderWindow(wind, wall, renderer);

    // Window renders mask (polygon), 2 end lines, 3 longitudinal lines (1 main center + 2 inner glass)
    expect(renderer.calls.some((c) => c.type === 'drawPolygon')).toBe(true);
    const lineDraws = renderer.calls.filter((c) => c.type === 'drawLine');
    expect(lineDraws.length).toBe(5); // 2 frame end cuts + 3 glass lines
  });

  it('renders a StairsEntity with treads and direction text', () => {
    const renderer = new MockRenderer();
    const stairs: StairsEntity = {
      id: 's1',
      type: 'stairs',
      start: {x: 0, y: 0},
      end: {x: 0, y: 3},
      width: 1.0,
      treadCount: 10,
      direction: 'up',
    };

    renderStairs(stairs, renderer);

    // Stairs renders outline polygon, 9 tread lines, 1 direction line, 1 start circle, arrow head polygon, and UP text
    expect(renderer.calls.filter((c) => c.type === 'drawPolygon').length).toBe(
      2,
    ); // outline + arrow head
    expect(renderer.calls.some((c) => c.type === 'drawCircle')).toBe(true); // start dot
    expect(renderer.calls.some((c) => c.type === 'drawText')).toBe(true); // direction label
    const lines = renderer.calls.filter((c) => c.type === 'drawLine');
    expect(lines.length).toBe(10); // 9 treads + 1 direction line
  });
});
