import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'collaborator-tests-only';
process.env.ADMIN_USERNAME = 'collaborator-test-admin';
process.env.ADMIN_PASSWORD = 'collaborator-test-password';
const testDirectory = await mkdtemp(path.join(os.tmpdir(), 'collaborators-test-'));
process.env.DATA_DIR = testDirectory;
const { default: app } = await import('../app.js');
const { default: Collaborator } = await import('../models/Collaborator.js');
const { default: UploadedImage } = await import('../models/UploadedImage.js');
const { uploadDirectory } = await import('../services/upload.js');
const photo = await readFile(new URL('../public/projects/project-01.webp', import.meta.url));

for (const mode of ['file', 'mongodb']) {
  test(`collaborator authenticated CRUD, persistence and image lifecycle (${mode})`, async t => {
    const directory = testDirectory;
    t.after(() => rm(directory, { recursive: true, force: true }));
    if (mode === 'file') {
      process.env.DATA_STORE = 'file'; process.env.DATA_DIR = directory; delete process.env.VERCEL;
    } else {
      delete process.env.DATA_STORE; process.env.VERCEL = '1'; process.env.MONGO_URI = 'mongodb://test-only/database';
      mongoose.connection.readyState = 1;
      t.after(() => { mongoose.connection.readyState = 0; });
      const documents = new Map();
      const images = new Map();
      t.mock.method(Collaborator.prototype, 'save', async function () {
        await this.validate(); this.createdAt ||= new Date(); this.updatedAt = new Date(); documents.set(String(this._id), this); return this;
      });
      t.mock.method(Collaborator, 'find', () => ({ sort: async () => [...documents.values()] }));
      t.mock.method(Collaborator, 'findOne', async query => { const doc = documents.get(String(query._id)); return doc ? new Collaborator(doc.toObject()) : null; });
      t.mock.method(Collaborator, 'findOneAndDelete', async query => { const doc = documents.get(String(query._id)); documents.delete(String(query._id)); return doc; });
      t.mock.method(UploadedImage, 'create', async data => { const doc = new UploadedImage(data); await doc.validate(); images.set(String(doc._id), doc); return doc; });
      t.mock.method(UploadedImage, 'findById', async id => images.get(String(id)));
      t.mock.method(UploadedImage, 'deleteOne', async query => images.delete(String(query._id)));
    }
    const server = http.createServer(app);
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (url, options) => fetch(base + url, options);
    const headers = { Authorization: `Bearer ${jwt.sign({ user: { username: process.env.ADMIN_USERNAME } }, process.env.JWT_SECRET)}` };
    const form = (fields = {}, image = true) => {
      const body = new FormData();
      Object.entries({ name: ' Jane Doe ', followers: '100K+', ...fields }).forEach(([key, value]) => body.set(key, value));
      if (image) body.set('image', new Blob([photo], { type: 'image/webp' }), 'avatar.webp');
      return body;
    };
    assert.deepEqual(await (await request('/api/collaborators')).json(), []);
    for (const method of ['POST', 'PUT', 'DELETE']) {
      assert.equal((await request('/api/collaborators' + (method === 'POST' ? '' : '/missing'), { method })).status, 401);
    }
    for (const body of [form({ name: ' ' }), form({ followers: '' }), form({}, false), form({ name: 'n'.repeat(201) })]) {
      assert.equal((await request('/api/collaborators', { method: 'POST', headers, body })).status, 400);
    }
    const invalid = form({}, false); invalid.set('image', new Blob(['svg'], { type: 'image/svg+xml' }), 'avatar.svg');
    assert.equal((await request('/api/collaborators', { method: 'POST', headers, body: invalid })).status, 400);
    const oversized = form({}, false); oversized.set('image', new Blob([Buffer.alloc(4 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
    assert.equal((await request('/api/collaborators', { method: 'POST', headers, body: oversized })).status, 413);
    const response = await request('/api/collaborators', { method: 'POST', headers, body: form() });
    assert.equal(response.status, 201, await response.clone().text());
    const record = await response.json();
    t.after(async () => { if (mode === 'file') await rm(path.join(uploadDirectory, record.image.split('/').pop()), { force: true }); });
    assert.match(record._id, /^[a-f0-9]{24}$/); assert.equal(record.id, record._id);
    assert.equal(record.name, 'Jane Doe'); assert.equal(record.followers, '100K+');
    assert.ok(record.createdAt); assert.ok(record.updatedAt);
    assert.deepEqual(Buffer.from(await (await request(record.image)).arrayBuffer()), photo);
    if (mode === 'file') {
      const persisted = JSON.parse(await readFile(path.join(directory, 'collaborators.json'), 'utf8'));
      assert.equal(persisted[0]._id, record._id);
      const { store } = await import('../services/store.js');
      assert.equal((await store(Collaborator, 'collaborators').get(record._id)).name, 'Jane Doe');
    }
    const edit = await request(`/api/collaborators/${record._id}`, { method: 'PUT', headers, body: form({ name: 'Updated', followers: '1.2K' }, false) });
    assert.equal(edit.status, 200);
    assert.equal((await edit.json()).image, record.image);
    const replacement = await request(`/api/collaborators/${record._id}`, { method: 'PUT', headers, body: form({ name: 'Updated', followers: '25.4K' }) });
    assert.equal(replacement.status, 200);
    const updated = await replacement.json(); assert.notEqual(updated.image, record.image);
    const imageGone = async url => {
      if (mode === 'file') await assert.rejects(access(path.join(uploadDirectory, url.split('/').pop())));
      else assert.equal((await request(url)).status, 404);
    };
    await imageGone(record.image);
    assert.equal((await (await request('/api/collaborators')).json())[0].followers, '25.4K');
    assert.equal((await request(`/api/collaborators/${record._id}`, { method: 'DELETE', headers })).status, 200);
    await imageGone(updated.image);
    assert.deepEqual(await (await request('/api/collaborators')).json(), []);
    for (const method of ['GET', 'PUT', 'DELETE']) assert.equal((await request(`/api/collaborators/${record._id}`, { method, headers, ...(method === 'PUT' ? { body: form() } : {}) })).status, 404);
  });
}
