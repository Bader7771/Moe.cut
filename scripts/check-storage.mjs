import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const directory = mkdtempSync(join(tmpdir(), 'agency-storage-test-'));
const setup = `
import assert from 'node:assert/strict';
import { store } from './Moe.cut/services/store.js';
import Project from './Moe.cut/models/Project.js';
const projects = store(Project, 'projects');
`;
try {
  const run = code => execFileSync(process.execPath, ['--input-type=module', '-e', setup + code], { cwd: new URL('..', import.meta.url), env: { ...process.env, DATA_STORE: 'file', DATA_DIR: directory }, stdio: 'inherit' });
  run(`assert.equal((await projects.list()).length, 6); await projects.save({ title: 'Persisted edit' }, '01'); await projects.remove('02');`);
  run(`assert.equal((await projects.get('01')).title, 'Persisted edit'); assert.equal(await projects.get('02'), undefined); for (const p of await projects.list()) await projects.remove(p._id);`);
  run(`assert.deepEqual(await projects.list(), []);`);
  console.log('PASS: edits and deletions survive process restarts; deleting all projects does not restore samples.');
} finally { rmSync(directory, { recursive: true, force: true }); }
