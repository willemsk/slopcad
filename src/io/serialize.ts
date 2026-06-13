import { Project } from '../core/types';

const SCHEMA_VERSION = '1.0.0';

export function serializeProject(project: Project): string {
  const data = {
    schemaVersion: SCHEMA_VERSION,
    timestamp: Date.now(),
    project,
  };
  return JSON.stringify(data, null, 2);
}

export function deserializeProject(jsonStr: string): Project | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return null;

    // Check schema version (could do migrations in the future)
    if (!parsed.schemaVersion) {
      console.warn('Missing schema version in project file.');
    }

    if (!parsed.project || typeof parsed.project !== 'object') {
      return null;
    }

    const proj = parsed.project as Project;

    // Basic structure validation
    if (!proj.name || !Array.isArray(proj.pages) || typeof proj.activePageIndex !== 'number') {
      return null;
    }

    return proj;
  } catch (err) {
    console.error('Error deserializing project:', err);
    return null;
  }
}
