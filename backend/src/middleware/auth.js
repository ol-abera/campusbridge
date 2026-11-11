import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { pool } from '../db/index.js';
import { parseId } from '../utils/validate.js';

export function createToken(user) {
  return jwt.sign({ id: String(user.id) }, config.jwtSecret, { algorithm: 'HS256', expiresIn: config.jwtExpiresIn });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      return res.status(401).json({ message: 'Your session is invalid or has expired. Please log in again.' });
    }

    const id = parseId(payload.id);
    if (!id) return res.status(401).json({ message: 'Your session is invalid. Please log in again.' });

    // Note: we never SELECT password_hash here, so it cannot leak by accident.
    const result = await pool.query(
      `SELECT id, full_name, email, university, year_of_study, field, phone, bio, role, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return res.status(401).json({ message: 'Your account no longer exists. Please log in again.' });
    req.user = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

// Use after requireAuth. Example: router.post('/', requireRole('coordinator'), handler)
// 403 = you are logged in, but your role is not allowed to do this.
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Your account does not have permission to do this.' });
