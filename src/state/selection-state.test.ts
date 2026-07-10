// @vitest-environment jsdom
import {beforeEach, describe, expect, it} from 'vitest';
import {clearSelection, selectEntity, selectionSignal} from './selection-state';

describe('Selection State', () => {
  beforeEach(() => {
    selectionSignal.value = new Set();
  });

  it('selects a single entity and replaces previous selection', () => {
    selectEntity('ent-1');
    expect(selectionSignal.value.size).toBe(1);
    expect(selectionSignal.value.has('ent-1')).toBe(true);

    selectEntity('ent-2');
    expect(selectionSignal.value.size).toBe(1);
    expect(selectionSignal.value.has('ent-2')).toBe(true);
  });

  it('toggles selection when multi-select is enabled', () => {
    selectEntity('ent-1');
    selectEntity('ent-2', true); // Add
    expect(selectionSignal.value.size).toBe(2);
    expect(selectionSignal.value.has('ent-1')).toBe(true);
    expect(selectionSignal.value.has('ent-2')).toBe(true);

    selectEntity('ent-1', true); // Toggle off
    expect(selectionSignal.value.size).toBe(1);
    expect(selectionSignal.value.has('ent-1')).toBe(false);
    expect(selectionSignal.value.has('ent-2')).toBe(true);
  });

  it('clears selection', () => {
    selectEntity('ent-1');
    selectEntity('ent-2', true);
    expect(selectionSignal.value.size).toBe(2);

    clearSelection();
    expect(selectionSignal.value.size).toBe(0);
  });
});
