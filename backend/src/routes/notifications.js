import { Router } from 'express';
import { pool } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';
import { parseId } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);
const toJson = (n) => ({ id: String(n.id), type: n.type, message: n.message, link: n.link, isRead: n.is_read, createdAt: n.created_at });

router.get('/', asyncHandler(async (req, res) => {
  const [list, unread] = await Promise.all([
    pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 50', [req.user.id]),
    pool.query('SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND NOT is_read', [req.user.id])
  ]);
  res.json({ data: list.rows.map(toJson), unread: unread.rows[0].n });
}));

router.post('/read-all', asyncHandler(async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND NOT is_read', [req.user.id]);
  res.json({ success: true });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const r = id ? await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]) : { rowCount: 0 };
  if (!r.rowCount) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ success: true });
}));

export default router;
