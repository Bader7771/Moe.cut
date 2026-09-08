import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

process.env.VERCEL = '1';
process.env.MONGO_URI = 'mongodb://test-only/database';
process.env.JWT_SECRET = 'test-only-persistent-secret';
process.env.ADMIN_USERNAME = 'aflaton-skimo';
process.env.ADMIN_PASSWORD = 'skimo7777';
delete process.env.DATA_STORE;

test('serverless handler, database recovery, authentication and Mongo-backed CRUD', async t => {
  let importsListen = false;
  const originalListen = http.Server.prototype.listen;
  http.Server.prototype.listen = function () { importsListen = true; throw new Error('Import must not listen'); };
  let app;
  try { app = (await import('../api/index.js')).default; }
  finally { http.Server.prototype.listen = originalListen; }
  assert.equal(importsListen, false);
  assert.equal(mongoose.connection.readyState, 0, 'Import must not start MongoDB');

  const connectDB = (await import('../config/db.js')).default;
  let attempts = 0;
  t.mock.method(mongoose, 'connect', async () => {
    attempts++;
    await Promise.resolve();
    if (attempts === 1) throw new Error('Simulated transient outage');
    mongoose.connection.readyState = 1;
    return mongoose;
  });
  await assert.rejects(connectDB());
  await Promise.all([connectDB(), connectDB(), connectDB()]);
  assert.equal(attempts, 2, 'Retry once and share the pending connection');
  await connectDB();
  assert.equal(attempts, 2, 'Reuse connected instance');

  // Database doubles isolate HTTP behavior from any real customer database.
  const images = new Map();
  const UploadedImage = (await import('../models/UploadedImage.js')).default;
  t.mock.method(UploadedImage, 'create', async data => {
    const doc = new UploadedImage(data); await doc.validate(); images.set(String(doc._id), doc); return doc;
  });
  t.mock.method(UploadedImage, 'findById', async id => images.get(id));
  for (const name of ['Project', 'Testimonial']) {
    const Model = (await import(`../models/${name}.js`)).default;
    const records = new Map();
    t.mock.method(Model.prototype, 'save', async function () { await this.validate(); records.set(String(this._id), this); return this; });
    t.mock.method(Model, 'find', () => ({ sort: async () => [...records.values()] }));
    t.mock.method(Model, 'findOne', async query => [...records.values()].find(doc => Object.entries(query).every(([key, value]) => String(doc[key]) === String(value))));
    t.mock.method(Model, 'findOneAndDelete', async query => { const doc = await Model.findOne(query); if (doc) records.delete(String(doc._id)); return doc; });
  }
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  t.after(() => { mongoose.connection.readyState = 0; });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (url, options) => fetch(base + url, options);
  const json = data => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const login = async password => request('/api/auth/login', { method: 'POST', ...json({ username: 'aflaton-skimo', password }) });
  assert.equal((await login('wrong')).status, 401);
  const result = await login('skimo7777');
  assert.equal(result.status, 200);
  const { token } = await result.json();
  const headers = { Authorization: `Bearer ${token}` };
  assert.equal((await request('/api/auth/me', { headers })).status, 200);
  assert.equal((await request('/api/auth/me', { headers: { Authorization: 'Bearer invalid' } })).status, 401);
  assert.equal((await request('/api/health')).status, 200);
  assert.equal((await request('/api/missing')).status, 404);
  assert.match((await request('/api/missing')).headers.get('content-type'), /json/);
  assert.equal((await request('/login')).status, 404, 'SPA is served by Vercel, not by Express');
  const photo = readFileSync(new URL('../public/projects/project-01.webp', import.meta.url));
  for (const resource of ['projects', 'testimonials']) {
    const endpoint = `/api/${resource}`;
    for (const method of ['POST', 'PUT', 'DELETE']) assert.equal((await request(endpoint + (method === 'POST' ? '' : '/missing'), { method })).status, 401);
    const form = new FormData();
    const fields = resource === 'projects' ? { title: 'Test', category: 'Film', client: 'Test', year: '2026', alt: 'Test image' } : { clientName: 'Test', review: 'Review' };
    Object.entries(fields).forEach(([k, v]) => form.set(k, v));
    form.set('image', new Blob([photo], { type: 'image/webp' }), 'test.webp');
    const response = await request(endpoint, { method: 'POST', headers, body: form });
    assert.equal(response.status, 201, await response.clone().text());
    const record = await response.json();
    assert.match(record.image, /^\/api\/uploads\/[a-f0-9]{24}$/);
    const image = await request(record.image);
    assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/webp');
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), photo);
    const key = resource === 'projects' ? 'title' : 'review';
    const edit = await request(`${endpoint}/${record._id}`, { method: 'PUT', ...json({ [key]: 'Updated' }), headers: { ...headers, 'Content-Type': 'application/json' } });
    assert.equal(edit.status, 200);
    const edited = await edit.json();
    assert.equal(edited[key], 'Updated');
    assert.equal(edited.image, record.image);
    assert.equal((await request(`${endpoint}/${record._id}`, { method: 'DELETE', headers })).status, 200);
    assert.deepEqual(await (await request(endpoint)).json(), []);
    assert.equal((await request(`${endpoint}/${record._id}`)).status, 404);
  }
  const oversized = new FormData();
  oversized.set('image', new Blob([Buffer.alloc(4 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
  assert.equal((await request('/api/projects', { method: 'POST', headers, body: oversized })).status, 413);
  assert.equal((await request('/api/uploads/not-an-id')).status, 404);
  process.env.DATA_STORE = 'file';
  assert.equal((await request('/api/health')).status, 503);
  delete process.env.DATA_STORE;
  delete process.env.JWT_SECRET;
  assert.equal((await login('skimo7777')).status, 503);
});
