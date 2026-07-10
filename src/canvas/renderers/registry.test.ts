import {describe, expect, it} from 'vitest';
import type {EntityType} from '../../core/types';
import {RendererRegistry} from './registry';

describe('RendererRegistry', () => {
  it('should have a render function registered for every entity type', () => {
    const requiredTypes: EntityType[] = [
      'wall',
      'door',
      'window',
      'stairs',
      'line',
      'rect',
      'circle',
      'arc',
      'dimension',
      'text',
    ];

    for (const type of requiredTypes) {
      expect(RendererRegistry[type]).toBeDefined();
      expect(typeof RendererRegistry[type]).toBe('function');
    }
  });
});
