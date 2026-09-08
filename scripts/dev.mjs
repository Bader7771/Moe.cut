import { spawn } from 'node:child_process';
const children = [
  spawn('npm', ['--prefix', 'Moe.cut', 'start'], { stdio: 'inherit', env: { ...process.env, DATA_STORE: 'file', PORT: '5001' } }),
  spawn('npm', ['--prefix', 'Moe.cut', 'run', 'dev', '--', '--host', '127.0.0.1'], { stdio: 'inherit' })
];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; children.forEach(child => child.kill()); process.exitCode = code; }
children.forEach(child => { child.on('exit', code => stop(code || 0)); child.on('error', () => stop(1)); });
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
