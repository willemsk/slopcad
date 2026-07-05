import {describe, it, expect} from 'vitest';
import {RendererRegistry} from './registry';
import {EntityType} from '../../core/types';

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
