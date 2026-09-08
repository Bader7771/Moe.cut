import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
// Vercel injects environment variables; local .env files are never loaded there.
if (!process.env.VERCEL) dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
export function validateEnvironment() {
  if (!process.env.VERCEL) return;
  if (process.env.DATA_STORE === 'file') throw new Error('DATA_STORE=file is only supported locally.');
  for (const name of ['MONGO_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD']) {
    if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
  }
}
