import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vite from '../vite.config.js';

const read = filename => readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8');
const directives = policy => new Map(policy.split(';').map(part => part.trim().split(/\s+/)).filter(parts => parts[0]).map(([name, ...values]) => [name, values]));

test('production and preview CSP permit GLB ImageBitmap blob fetches without allowing external connections', () => {
  const vercel = JSON.parse(read('vercel.json'));
  const deployed = vercel.headers.find(rule => rule.source === '/(.*)').headers.find(header => header.key === 'Content-Security-Policy').value;
  const staticHost = read('public/_headers').match(/Content-Security-Policy: (.+)/)[1];
  const preview = vite.preview.headers['Content-Security-Policy'];
  for (const policy of [deployed, staticHost, preview]) {
    const map = directives(policy);
    // ImageBitmapLoader fetches embedded GLB blob URLs; img-src alone does not authorize fetch().
    assert.deepEqual(map.get('connect-src'), ["'self'", 'blob:']);
    assert.ok(map.get('img-src').includes('blob:'));
    assert.deepEqual(map.get('script-src'), ["'self'"]);
    assert.deepEqual(map.get('object-src'), ["'none'"]);
  }
  assert.deepEqual(directives(deployed), directives(preview));
  assert.deepEqual(directives(staticHost), directives(preview));
});

test('actual optimized portal CSS retains Chromium and WebKit blur with the original transparent atmosphere', () => {
  const assets = readdirSync(new URL('../dist/assets/', import.meta.url));
  const name = assets.find(name => /^GreenLanternPortal-.*\.css$/.test(name));
  assert.ok(name, 'Run npm run build before this test');
  const css = read(`dist/assets/${name}`);
  const rule = css.match(/\.lantern-atmosphere\{([^}]+)\}/)?.[1];
  assert.ok(rule);
  assert.match(rule, /(?:^|;)backdrop-filter:blur\(14px\)\s*saturate\(\.65\)/);
  assert.match(rule, /(?:^|;)-webkit-backdrop-filter:blur\(14px\)\s*saturate\(\.65\)/);
  assert.match(rule, /#03281bc9/);
  assert.match(rule, /#020f0bcc/);
});
