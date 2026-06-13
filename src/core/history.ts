import { Entity, Constraint } from './types';
import { cloneEntity } from './entity';

export interface PageSnapshot {
  entities: Entity[];
  constraints: Constraint[];
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
      constraints: JSON.parse(JSON.stringify(constraints)),
    };

    // Prevent pushing identical states back-to-back
    if (this.past.length > 0) {
      const last = this.past[this.past.length - 1];
      if (this.areSnapshotsEqual(last, snapshot)) {
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
  undo(currentEntities: Entity[], currentConstraints: Constraint[]): PageSnapshot | null {
    if (this.past.length === 0) return null;

    const currentSnapshot: PageSnapshot = {
      entities: currentEntities.map(cloneEntity),
      constraints: JSON.parse(JSON.stringify(currentConstraints)),
    };

    this.future.push(currentSnapshot);
    const previous = this.past.pop()!;
    return previous;
  }

  // Returns the next state, or null if cannot redo
  redo(currentEntities: Entity[], currentConstraints: Constraint[]): PageSnapshot | null {
    if (this.future.length === 0) return null;

    const currentSnapshot: PageSnapshot = {
      entities: currentEntities.map(cloneEntity),
      constraints: JSON.parse(JSON.stringify(currentConstraints)),
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

  private areSnapshotsEqual(s1: PageSnapshot, s2: PageSnapshot): boolean {
    // Basic comparison by stringifying, simple and works fine for small scale
    return JSON.stringify(s1) === JSON.stringify(s2);
  }
}
