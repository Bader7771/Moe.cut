import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const base = process.env.TEST_URL || 'http://127.0.0.1:5173';
const request = (url, options) => fetch(base + url, options);
const health = await request('/api/health');
assert.equal(health.status, 200);
assert.equal((await health.json()).storage, 'file');
assert.equal((await request('/login')).status, 200);
assert.equal((await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'aflaton-skimo', password: 'wrong' }) })).status, 401);
const login = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'aflaton-skimo', password: 'skimo7777' }) });
assert.equal(login.status, 200);
const { token } = await login.json();
const headers = { Authorization: `Bearer ${token}` };
assert.equal((await request('/api/auth/me', { headers })).status, 200);
assert.equal((await request('/api/auth/me', { headers: { Authorization: 'Bearer expired' } })).status, 401);
const photo = new Blob([await readFile(new URL('../Moe.cut/public/projects/project-01.webp', import.meta.url))], { type: 'image/webp' });
for (const resource of ['projects', 'testimonials']) {
  const endpoint = `/api/${resource}`;
  const initial = await (await request(endpoint)).json();
  for (const method of ['POST', 'PUT', 'DELETE']) assert.equal((await request(endpoint + (method === 'POST' ? '' : '/missing'), { method })).status, 401);
  const form = new FormData();
  const fields = resource === 'projects' ? { title: 'API verification', category: 'Test', client: 'Test', year: '2026', alt: 'Test image' } : { clientName: 'API verification', review: 'Test review' };
  Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  form.set('image', photo, 'test.webp');
  const created = await request(endpoint, { method: 'POST', headers, body: form });
  assert.equal(created.status, 201, await created.clone().text());
  const record = await created.json();
  try {
    assert.equal((await request(record.image)).headers.get('content-type'), 'image/webp');
    const edit = await request(`${endpoint}/${record._id}`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(resource === 'projects' ? { title: 'Updated' } : { review: 'Updated' }) });
    assert.equal(edit.status, 200);
    const updated = await edit.json();
    assert.equal(updated[resource === 'projects' ? 'title' : 'review'], 'Updated');
    assert.equal(updated.image, record.image);
    assert.equal((await (await request(endpoint)).json()).length, initial.length + 1);
  } finally {
    assert.equal((await request(`${endpoint}/${record._id}`, { method: 'DELETE', headers })).status, 200);
  }
  assert.equal((await request(`${endpoint}/${record._id}`)).status, 404);
  assert.equal((await (await request(endpoint)).json()).length, initial.length);
}
console.log('PASS: login, invalid sessions, protected writes, project/testimonial create/edit/delete, upload proxy, and login route.');
