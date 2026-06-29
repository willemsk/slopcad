import {Entity, Constraint} from './types';
import {cloneEntity, cloneConstraints} from './entity';

export interface PageSnapshot {
  entities: Entity[];
  constraints: Constraint[];
}

function areSnapshotsShallowEqual(s1: PageSnapshot, s2: PageSnapshot): boolean {
  if (s1.entities.length !== s2.entities.length) return false;
  if (s1.constraints.length !== s2.constraints.length) return false;

  // Compare entity properties and geometry values directly
  for (let i = 0; i < s1.entities.length; i++) {
    const e1 = s1.entities[i];
    const e2 = s2.entities[i];
    if (
      e1.id !== e2.id ||
      e1.type !== e2.type ||
      e1.locked !== e2.locked ||
      e1.layerId !== e2.layerId
    ) {
      return false;
    }
    // Compare basic geometry coordinates
    if (e1.type === 'wall' || e1.type === 'line' || e1.type === 'stairs') {
      const g1 = e1 as any;
      const g2 = e2 as any;
      if (
        g1.start.x !== g2.start.x ||
        g1.start.y !== g2.start.y ||
        g1.end.x !== g2.end.x ||
        g1.end.y !== g2.end.y
      ) {
        return false;
      }
    }
  }

  // Compare constraints
  for (let i = 0; i < s1.constraints.length; i++) {
    const c1 = s1.constraints[i];
    const c2 = s2.constraints[i];
    if (c1.id !== c2.id || c1.type !== c2.type || c1.value !== c2.value) {
      return false;
    }
  }

  return true;
}

export class HistoryManager {
  private past: PageSnapshot[] = [];
  private future: PageSnapshot[] = [];
  private maxStates = 100;

  constructor() {}

  // Pushes a new state onto the history stack.
  // We clone the entities and constraints to ensure immutability.
  pushState(entities: Entity[], constraints: Constraint[]) {
    const snapshot: PageSnapshot = {
      entities: entities.map(cloneEntity),
      constraints: cloneConstraints(constraints),
    };

    // Prevent pushing identical states back-to-back
    if (this.past.length > 0) {
      const last = this.past[this.past.length - 1];
      if (areSnapshotsShallowEqual(last, snapshot)) {
        return;
      }
    }

    this.past.push(snapshot);
    this.future = []; // Clear redo stack on new action

    if (this.past.length > this.maxStates) {
      this.past.shift(); // Remove oldest
    }
  }

  // Returns the previous state, or null if cannot undo
  undo(
    currentEntities: Entity[],
    currentConstraints: Constraint[],
  ): PageSnapshot | null {
    if (this.past.length === 0) return null;

    const currentSnapshot: PageSnapshot = {
      entities: currentEntities.map(cloneEntity),
      constraints: cloneConstraints(currentConstraints),
    };

    this.future.push(currentSnapshot);
    const previous = this.past.pop()!;
    return previous;
  }

  // Returns the next state, or null if cannot redo
  redo(
    currentEntities: Entity[],
    currentConstraints: Constraint[],
  ): PageSnapshot | null {
    if (this.future.length === 0) return null;

    const currentSnapshot: PageSnapshot = {
      entities: currentEntities.map(cloneEntity),
      constraints: cloneConstraints(currentConstraints),
    };

    this.past.push(currentSnapshot);
    const next = this.future.pop()!;
    return next;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  clear() {
    this.past = [];
    this.future = [];
  }
}
