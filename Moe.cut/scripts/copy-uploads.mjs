import { cp, mkdir } from 'node:fs/promises';
const source = new URL('../uploads/', import.meta.url);
const destination = new URL('../dist/uploads/', import.meta.url);
await mkdir(destination, { recursive: true });
try { await cp(source, destination, { recursive: true }); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
