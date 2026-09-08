import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
const temporarySecret = randomBytes(32).toString('hex');
export const getSecret = () => {
  if (process.env.VERCEL && !process.env.JWT_SECRET) throw new Error('JWT_SECRET is required on Vercel.');
  return process.env.JWT_SECRET || temporarySecret;
};
export const adminUsername = () => process.env.ADMIN_USERNAME || 'aflaton-skimo';
export function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ');
    if (token?.[0] !== 'Bearer') throw new Error('Missing token');
    const payload = jwt.verify(token[1], getSecret());
    if (payload.user?.username !== adminUsername()) throw new Error('Invalid admin');
    req.user = payload.user;
    next();
  } catch {
    res.status(401).json({ message: 'Please log in as admin again.' });
  }
}
