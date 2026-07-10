import {describe, expect, it} from 'vitest';
import type {LineEntity, WallEntity} from '../../core/types';
import {findWall, mergeIntervals} from './shared';

describe('shared renderer utilities', () => {
  describe('mergeIntervals()', () => {
    it('should handle empty input', () => {
      expect(mergeIntervals([])).toEqual([]);
    });

    it('should merge overlapping intervals', () => {
      const input: [number, number][] = [
        [0, 0.5],
        [0.2, 0.7],
        [0.8, 1.0],
      ];
      expect(mergeIntervals(input)).toEqual([
        [0, 0.7],
        [0.8, 1.0],
      ]);
    });

    it('should merge adjacent intervals', () => {
      const input: [number, number][] = [
        [0, 0.5],
        [0.5, 1.0],
      ];
      expect(mergeIntervals(input)).toEqual([[0, 1.0]]);
    });

    it('should handle out of order intervals', () => {
      const input: [number, number][] = [
        [0.8, 1.0],
        [0, 0.3],
        [0.2, 0.5],
      ];
      expect(mergeIntervals(input)).toEqual([
        [0, 0.5],
        [0.8, 1.0],
      ]);
    });
  });

  describe('findWall()', () => {
    const wall: WallEntity = {
      id: 'w1',
      type: 'wall',
      layerId: 'L',
      start: {x: 0, y: 0},
      end: {x: 1, y: 1},
      thickness: 0.1,
    };
    const line: LineEntity = {
      id: 'l1',
      type: 'line',
      layerId: 'L',
      start: {x: 0, y: 0},
      end: {x: 1, y: 1},
    };
    const entities = [line, wall];

    it('should find a wall by id', () => {
      expect(findWall(entities, 'w1')).toBe(wall);
    });

    it('should return undefined if id does not match', () => {
      expect(findWall(entities, 'w2')).toBeUndefined();
    });

    it('should return undefined if id matches but entity is not a wall', () => {
      expect(findWall(entities, 'l1')).toBeUndefined();
    });
  });
});
