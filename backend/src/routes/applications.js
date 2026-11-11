import { Router } from 'express';
import { pool } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';
import { applicationToJson } from '../utils/mappers.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import { notify } from '../utils/notify.js';
import { REVIEW_STATUSES, parseId, validateApplication } from '../utils/validate.js';

const router = Router();
router.use(requireAuth); // every application route needs a logged-in user

// Stops scripts from flooding the table with submissions. Normal students never get near this.
const submitLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'You are submitting too quickly. Please wait a few minutes and try again.'
});

const DUPLICATE_MESSAGE = 'You have already applied to this opportunity.';

router.post('/', requireRole('student'), submitLimiter, asyncHandler(async (req, res) => {
  const { errors, value } = validateApplication(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: Object.values(errors)[0], errors });
  }

  // The position title and company come from OUR database, never from the browser,
  // so nobody can submit an application for a fake or altered listing.
  const opp = await pool.query(
    `SELECT id, title, company, created_by,
            COALESCE(deadline < (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date, false) AS is_closed
     FROM opportunities WHERE id = $1`,
    [value.opportunityId]
  );
  if (!opp.rows[0]) return res.status(404).json({ message: 'Opportunity not found.' });
  if (opp.rows[0].is_closed) return res.status(400).json({ message: 'The application deadline for this opportunity has passed.' });

  const existing = await pool.query(
    'SELECT id FROM applications WHERE user_id = $1 AND opportunity_id = $2',
    [req.user.id, value.opportunityId]
  );
  if (existing.rowCount) return res.status(409).json({ message: DUPLICATE_MESSAGE, applicationId: String(existing.rows[0].id) });

  try {
    const result = await pool.query(
      `INSERT INTO applications
         (user_id, opportunity_id, position_title, company, full_name, email, phone,
          university, year_of_study, cover_letter, portfolio_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.id, value.opportunityId, opp.rows[0].title, opp.rows[0].company, value.fullName, value.email,
       value.phone, value.university, value.yearOfStudy, value.coverLetter, value.portfolioUrl]
    );
    if (opp.rows[0].created_by) {
      await notify(pool, opp.rows[0].created_by, 'application', `${value.fullName} applied for "${opp.rows[0].title}".`, `/coordinator/opportunities/${value.opportunityId}`);
    }
    res.status(201).json({ success: true, data: applicationToJson(result.rows[0], { full: true }) });
  } catch (err) {
    // Two quick double-clicks can both pass the check above; the database rule is the final guard.
    if (err.code === '23505') return res.status(409).json({ message: DUPLICATE_MESSAGE });
    throw err;
  }
}));

router.get('/', asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, opportunity_id, position_title, company, status, submitted_at
     FROM applications WHERE user_id = $1 ORDER BY submitted_at DESC`,
    [req.user.id]
  );
  res.json({ data: result.rows.map((r) => applicationToJson(r)), total: result.rowCount });
}));

// "AND user_id = $2" is what stops one student reading another student's application.
// A missing OR someone-else's application both return 404, so ids cannot be probed.
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Application not found.' });
  const result = await pool.query('SELECT * FROM applications WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Application not found.' });
  res.json({ data: applicationToJson(result.rows[0], { full: true }) });
}));

// A student can withdraw their own application until a decision has been made.
router.patch('/:id/withdraw', requireRole('student'), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Application not found.' });
  const found = await pool.query(
    `SELECT a.id, a.status, a.position_title, o.created_by FROM applications a JOIN opportunities o ON o.id = a.opportunity_id
     WHERE a.id = $1 AND a.user_id = $2`, [id, req.user.id]);
  const row = found.rows[0];
  if (!row) return res.status(404).json({ message: 'Application not found.' });
  if (!['Submitted', 'Under Review'].includes(row.status)) {
    return res.status(409).json({ message: `This application is already ${row.status.toLowerCase()} and can no longer be withdrawn.` });
  }
  const result = await pool.query(`UPDATE applications SET status = 'Withdrawn', updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
  if (row.created_by) await notify(pool, row.created_by, 'application', `${req.user.full_name} withdrew their application for "${row.position_title}".`, `/coordinator/opportunities`);
  res.json({ success: true, data: applicationToJson(result.rows[0], { full: true }) });
}));

// A coordinator can review applications, but only for opportunities THEY posted.
router.patch('/:id/status', requireRole('coordinator'), asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
  if (!id) return res.status(404).json({ message: 'Application not found.' });
  if (!REVIEW_STATUSES.includes(status)) return res.status(400).json({ message: `Status must be one of: ${REVIEW_STATUSES.join(', ')}.` });
  const found = await pool.query(
    `SELECT a.id, a.user_id, a.status, a.position_title, o.created_by FROM applications a JOIN opportunities o ON o.id = a.opportunity_id WHERE a.id = $1`, [id]);
  const row = found.rows[0];
  if (!row || String(row.created_by) !== String(req.user.id)) return res.status(404).json({ message: 'Application not found.' });
  if (row.status === 'Withdrawn') return res.status(409).json({ message: 'The student withdrew this application.' });
  await pool.query('UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  if (status !== row.status) {
    await notify(pool, row.user_id, 'status', `Your application for "${row.position_title}" is now: ${status}.`, `/applications/${id}`);
  }
  res.json({ success: true, data: { id: String(id), status } });
}));

export default router;
