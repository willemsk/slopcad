import {describe, it, expect} from 'vitest';
import {serializeProject, deserializeProject} from './serialize';
import {Project} from '../core/types';

describe('Project Serialization', () => {
  const mockProject: Project = {
    name: 'Test Project',
    activePageIndex: 0,
    unitSystem: 'metric',
    layers: [
      {
        id: '0',
        name: 'Default',
        color: '#c8cad4',
        visible: true,
        locked: false,
      },
    ],
    pages: [
      {
        name: 'Page 1',
        entities: [],
        constraints: [],
      },
    ],
  };

  it('serializes a project to a valid JSON string with schemaVersion', () => {
    const jsonStr = serializeProject(mockProject);
    expect(typeof jsonStr).toBe('string');

    const parsed = JSON.parse(jsonStr);
    expect(parsed.schemaVersion).toBe('1.0.0');
    expect(parsed.project.name).toBe('Test Project');
    expect(parsed.project.activePageIndex).toBe(0);
  });

  it('deserializes a valid JSON string back to the project object', () => {
    const jsonStr = serializeProject(mockProject);
    const restored = deserializeProject(jsonStr);
    expect(restored).not.toBeNull();
    expect(restored?.name).toBe('Test Project');
    expect(restored?.pages.length).toBe(1);
    expect(restored?.unitSystem).toBe('metric');
  });

  it('returns null when deserializing invalid JSON', () => {
    const restored = deserializeProject('invalid json string');
    expect(restored).toBeNull();
  });

  it('returns null when project structure is missing required properties', () => {
    const invalidData = JSON.stringify({
      schemaVersion: '1.0.0',
      project: {
        // missing pages and activePageIndex
        name: 'Invalid Project',
      },
    });

    const restored = deserializeProject(invalidData);
    expect(restored).toBeNull();
  });
});
