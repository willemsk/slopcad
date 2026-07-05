import {describe, it, expect, vi, beforeEach} from 'vitest';
import {drawEntity} from './render-helpers';
import {RendererRegistry} from './renderers/registry';
import {LineEntity} from '../core/types';

describe('render-helpers', () => {
  describe('drawEntity()', () => {
    let mockCtx: any;

    beforeEach(() => {
      mockCtx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
      };
    });

    it('should dispatch to the correct renderer via the registry', () => {
      // Mock the registry for 'line'
      const originalRenderLine = RendererRegistry['line'];
      const mockRenderLine = vi.fn();
      RendererRegistry['line'] = mockRenderLine;

      const mockLine: LineEntity = {
        id: '1',
        type: 'line',
        layerId: 'layer1',
        start: {x: 0, y: 0},
        end: {x: 10, y: 10},
      };

      drawEntity(
        mockCtx as CanvasRenderingContext2D,
        mockLine,
        [mockLine],
        true,
        '#fff',
        'metric',
        1,
        [],
      );

      expect(mockRenderLine).toHaveBeenCalledTimes(1);
      const callArgs = mockRenderLine.mock.calls[0][0];
      expect(callArgs.ctx).toBe(mockCtx);
      expect(callArgs.entity).toBe(mockLine);
      expect(callArgs.isSelected).toBe(true);

      // Restore
      RendererRegistry['line'] = originalRenderLine;
    });
  });
});
