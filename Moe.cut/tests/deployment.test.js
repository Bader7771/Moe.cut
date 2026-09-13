import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('deployment uses one Vite build, relative APIs, and explicit SPA rewrites', () => {
  const read = filename => readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8');
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.framework, 'vite');
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.buildCommand, 'npm run build');
  assert.equal(config.builds, undefined);
  assert.deepEqual(config.rewrites, [
    { source: '/api/:path*', destination: '/api' },
    { source: '/login', destination: '/index.html' },
    { source: '/admin', destination: '/index.html' },
  ]);
  assert.match(read('api/index.js'), /from '..\/app.js'/);
  assert.doesNotMatch(read('app.js'), /\.listen\(/);
  for (const filename of ['src/pages/Login.jsx', 'src/pages/Admin.jsx', 'src/components/projects/ProjectsLayer.jsx', 'src/components/TestimonialGameboy.jsx']) {
    assert.doesNotMatch(read(filename), /fetch\(['"`]https?:/);
  }
  assert.ok(existsSync(new URL('../dist/index.html', import.meta.url)), 'Build must produce the SPA');
  for (const name of ['testimonial-1787864845040.jpg', 'testimonial-1788035327194.jpg']) {
    assert.ok(existsSync(new URL(`../dist/uploads/${name}`, import.meta.url)), 'Legacy uploaded images must be included');
  }
});
