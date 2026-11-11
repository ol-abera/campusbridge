import { Router } from 'express';
import { pool } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';
import { parseId, validateOpportunity } from '../utils/validate.js';
import crypto from 'node:crypto';

// Internship coordinators / organisations: post opportunities and review who applied.
const router = Router();
// Per-route guard (not router.use) because this router is mounted on /api: unknown URLs must still be 404.
const guard = [requireAuth, requireRole('coordinator')];

const addisToday = async () => (await pool.query(`SELECT to_char((NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date, 'YYYY-MM-DD') AS d`)).rows[0].d;

router.post('/opportunities', ...guard, asyncHandler(async (req, res) => {
  const { errors, value } = validateOpportunity(req.body, await addisToday());
  if (Object.keys(errors).length) return res.status(400).json({ message: Object.values(errors)[0], errors });
  const id = `p${crypto.randomBytes(6).toString('hex')}`;
  await pool.query(
    `INSERT INTO opportunities (id, title, company, location, type, duration, stipend, deadline, category, description, requirements, tags, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [id, value.title, value.company, value.location, value.type, value.duration, value.stipend, value.deadline, value.category, value.description, value.requirements, value.tags, req.user.id]);
  res.status(201).json({ success: true, data: { id } });
}));

router.get('/coordinator/opportunities', ...guard, asyncHandler(async (req, res) => {
  const r = await pool.query(
    `SELECT o.id, o.title, o.company, o.type, to_char(o.deadline,'YYYY-MM-DD') AS deadline,
       COALESCE(o.deadline < (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date, false) AS is_closed,
       (SELECT COUNT(*) FROM applications a WHERE a.opportunity_id = o.id)::int AS applicants,
       (SELECT COUNT(*) FROM applications a WHERE a.opportunity_id = o.id AND a.status = 'Submitted')::int AS awaiting_review
     FROM opportunities o WHERE o.created_by = $1 ORDER BY is_closed, o.deadline NULLS LAST, o.title`, [req.user.id]);
  res.json({ data: r.rows.map((o) => ({ id: o.id, title: o.title, company: o.company, type: o.type, deadline: o.deadline, isClosed: o.is_closed, applicants: o.applicants, awaitingReview: o.awaiting_review })) });
}));

router.get('/opportunities/:id/applications', ...guard, asyncHandler(async (req, res) => {
  const id = String(req.params.id).slice(0, 100);
  const opp = (await pool.query('SELECT id, title, company, created_by FROM opportunities WHERE id = $1', [id])).rows[0];
  if (!opp) return res.status(404).json({ message: 'Opportunity not found.' });
  if (String(opp.created_by) !== String(req.user.id)) return res.status(403).json({ message: 'You can only review applications for opportunities you posted.' });
  const r = await pool.query(
    `SELECT id, full_name, email, phone, university, year_of_study, cover_letter, portfolio_url, status, submitted_at
     FROM applications WHERE opportunity_id = $1 ORDER BY (status = 'Submitted') DESC, submitted_at`, [id]);
  res.json({
    opportunity: { id: opp.id, title: opp.title, company: opp.company },
    data: r.rows.map((a) => ({ id: String(a.id), fullName: a.full_name, email: a.email, phone: a.phone, university: a.university, yearOfStudy: a.year_of_study, coverLetter: a.cover_letter, portfolioUrl: a.portfolio_url, status: a.status, submittedAt: a.submitted_at }))
  });
}));

export default router;
