import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('../Moe.cut/', import.meta.url));
const children = [
  spawn(process.execPath, ['server.js'], {
    cwd: frontendRoot,
    stdio: 'inherit',
    env: { ...process.env, PORT: '5001' },
  }),
  spawn('npm', ['run', 'dev:client', '--', '--host', '127.0.0.1'], {
    cwd: frontendRoot,
    stdio: 'inherit',
  }),
];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; children.forEach(child => child.kill()); process.exitCode = code; }
children.forEach(child => { child.on('exit', code => stop(code || 0)); child.on('error', () => stop(1)); });
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
