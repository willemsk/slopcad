import {describe, it, expect} from 'vitest';
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Documentation Build', () => {
  it('should successfully build the MkDocs site without errors or broken links', () => {
    // 1. Generate API docs
    try {
      execSync('npm run docs:api', {stdio: 'pipe'});
    } catch (e: unknown) {
      const err = e as {message?: string; stdout?: Buffer; stderr?: Buffer};
      throw new Error(
        `Failed to generate API docs: ${err.message || ''}\n${err.stdout?.toString() || ''}\n${err.stderr?.toString() || ''}`,
      );
    }

    // 2. Determine mkdocs executable path
    // Check for local venv first (Windows then Unix)
    const winVenvPath = path.join(
      process.cwd(),
      'venv',
      'Scripts',
      'mkdocs.exe',
    );
    const unixVenvPath = path.join(process.cwd(), 'venv', 'bin', 'mkdocs');

    let mkdocsCmd = 'mkdocs'; // fallback to global

    if (fs.existsSync(winVenvPath)) {
      mkdocsCmd = winVenvPath;
    } else if (fs.existsSync(unixVenvPath)) {
      mkdocsCmd = unixVenvPath;
    }

    // 3. Run mkdocs strict build
    try {
      // Use standard execution; if spaces exist in path, wrapping in quotes is needed
      execSync(`"${mkdocsCmd}" build --strict`, {stdio: 'pipe'});
    } catch (e: unknown) {
      const err = e as {message?: string; stdout?: Buffer; stderr?: Buffer};
      throw new Error(
        `MkDocs build failed or has broken links: ${err.message || ''}\n${err.stdout?.toString() || ''}\n${err.stderr?.toString() || ''}`,
      );
    }

    // If we reach here, it succeeded.
    expect(true).toBe(true);
  }, 60000); // 60 second timeout for docs build
});
