import {signal} from '@preact/signals';

export const selectionSignal = signal<Set<string>>(new Set());

export function selectEntity(id: string, isMulti = false) {
  const current = selectionSignal.value;
  if (isMulti) {
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectionSignal.value = next;
  } else {
    selectionSignal.value = new Set([id]);
  }
}

export function clearSelection() {
  if (selectionSignal.value.size > 0) {
    selectionSignal.value = new Set();
  }
}
