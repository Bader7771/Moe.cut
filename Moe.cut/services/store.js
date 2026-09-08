import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mongoose from 'mongoose';
import { fallbackProjects } from '../data/projects.js';
const directory = process.env.DATA_DIR || fileURLToPath(new URL('../storage/', import.meta.url));
function read(name) {
  mkdirSync(directory, { recursive: true });
  const filename = path.join(directory, `${name}.json`);
  try { return JSON.parse(readFileSync(filename, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const records = name === 'projects' ? fallbackProjects.map(p => ({ ...p, _id: new mongoose.Types.ObjectId().toString() })) : [];
    write(name, records);
    return records;
  }
}
function write(name, records) {
  const filename = path.join(directory, `${name}.json`);
  writeFileSync(`${filename}.tmp`, JSON.stringify(records, null, 2));
  renameSync(`${filename}.tmp`, filename);
}
export function store(Model, name) {
  const local = () => process.env.DATA_STORE === 'file';
  const query = id => mongoose.isValidObjectId(id) ? { _id: id } : name === 'projects' ? { projectId: id } : { _id: null };
  return {
    async list() { return local() ? read(name) : Model.find().sort(name === 'projects' ? { projectId: 1 } : { createdAt: -1 }); },
    async get(id) { return local() ? read(name).find(p => p._id === id || (name === 'projects' && p.projectId === id)) : Model.findOne(query(id)); },
    async save(data, id) {
      if (!local()) {
        const doc = id ? await Model.findOne(query(id)) : new Model();
        if (!doc) return null;
        Object.assign(doc, data);
        return doc.save();
      }
      const records = read(name);
      const index = id ? records.findIndex(p => p._id === id || (name === 'projects' && p.projectId === id)) : -1;
      if (id && index < 0) return null;
      const doc = new Model({ ...(index >= 0 ? records[index] : {}), ...data });
      await doc.validate();
      const record = JSON.parse(JSON.stringify(doc));
      record.createdAt ||= new Date().toISOString();
      record.updatedAt = new Date().toISOString();
      // Re-read after asynchronous validation to preserve concurrent changes.
      const latest = read(name);
      const currentIndex = latest.findIndex(p => p._id === record._id);
      if (id && currentIndex < 0) return null;
      if (name === 'projects' && latest.some(p => p.projectId === record.projectId && p._id !== record._id)) throw new Error('Project ID already exists');
      if (currentIndex >= 0) latest[currentIndex] = record; else latest.push(record);
      write(name, latest);
      return record;
    },
    async remove(id) {
      if (!local()) return Model.findOneAndDelete(query(id));
      const records = read(name);
      const index = records.findIndex(p => p._id === id || (name === 'projects' && p.projectId === id));
      if (index < 0) return null;
      const [removed] = records.splice(index, 1);
      write(name, records);
      return removed;
    }
  };
}
