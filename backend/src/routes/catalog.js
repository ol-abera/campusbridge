import { Router } from 'express';
import { pool } from '../db/index.js';
import { asyncHandler } from '../middleware/errors.js';
import { escapeLike } from '../utils/validate.js';

const router = Router();

const COURSE_COLUMNS = 'id, title, instructor, category, level, duration, description, syllabus, tags';
// "Closed" is decided by the database using the Ethiopian calendar day, so a deadline stays open for the whole day.
const OPPORTUNITY_COLUMNS = `id, title, company, location, type, duration, stipend,
  to_char(deadline, 'YYYY-MM-DD') AS deadline,
  COALESCE(deadline < (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date, false) AS is_closed,
  category, description, requirements, tags`;

const toCourse = (r) => r;
const toOpportunity = ({ is_closed, ...rest }) => ({ ...rest, isClosed: is_closed });

// Builds "WHERE ..." plus parameter list from ?search=&category=&level=. Everything is parameterised.
function buildWhere(query, { searchColumns, filters }) {
  const clauses = [];
  const params = [];
  const search = String(query.search || '').trim().slice(0, 100);
  if (search) {
    params.push(`%${escapeLike(search)}%`);
    clauses.push(`(${searchColumns.map((c) => `${c} ILIKE $${params.length}`).join(' OR ')})`);
  }
  for (const [queryKey, column] of Object.entries(filters)) {
    const v = String(query[queryKey] || '').trim();
    if (v && v.toLowerCase() !== 'all') {
      params.push(v);
      clauses.push(`LOWER(${column}) = LOWER($${params.length})`);
    }
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

router.get('/courses', asyncHandler(async (req, res) => {
  const { where, params } = buildWhere(req.query, {
    searchColumns: ['title', 'instructor', 'description', 'category', "array_to_string(tags, ' ')"],
    filters: { category: 'category', level: 'level' }
  });
  const result = await pool.query(`SELECT ${COURSE_COLUMNS} FROM courses ${where} ORDER BY title LIMIT 200`, params);
  res.json({ data: result.rows.map(toCourse), total: result.rowCount });
}));

router.get('/courses/:id', asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT ${COURSE_COLUMNS} FROM courses WHERE id = $1`, [req.params.id.slice(0, 100)]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Course not found.' });
  res.json({ data: toCourse(result.rows[0]) });
}));

router.get('/opportunities', asyncHandler(async (req, res) => {
  const { where, params } = buildWhere(req.query, {
    searchColumns: ['title', 'company', 'description', 'category', 'location', "array_to_string(tags, ' ')"],
    filters: { category: 'category', type: 'type' }
  });
  const result = await pool.query(
    `SELECT ${OPPORTUNITY_COLUMNS} FROM opportunities ${where} ORDER BY is_closed, deadline NULLS LAST, title LIMIT 200`,
    params
  );
  res.json({ data: result.rows.map(toOpportunity), total: result.rowCount });
}));

router.get('/opportunities/:id', asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT ${OPPORTUNITY_COLUMNS} FROM opportunities WHERE id = $1`, [req.params.id.slice(0, 100)]);
  if (!result.rows[0]) return res.status(404).json({ message: 'Opportunity not found.' });
  res.json({ data: toOpportunity(result.rows[0]) });
}));

// Filter options come from the real rows, so the filter chips can never drift out of sync with the data.
router.get('/meta/filters', asyncHandler(async (_req, res) => {
  const distinct = async (table, column) =>
    (await pool.query(`SELECT DISTINCT ${column} AS v FROM ${table} WHERE ${column} <> '' ORDER BY v`)).rows.map((r) => r.v);
  const [courseCategories, courseLevels, opportunityCategories, opportunityTypes] = await Promise.all([
    distinct('courses', 'category'),
    distinct('courses', 'level'),
    distinct('opportunities', 'category'),
    distinct('opportunities', 'type')
  ]);
  res.json({ courseCategories, courseLevels, opportunityCategories, opportunityTypes });
}));

// Only real counts from the database; the homepage shows nothing it cannot back up.
router.get('/stats', asyncHandler(async (_req, res) => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM courses)::int AS courses,
      (SELECT COUNT(*) FROM opportunities)::int AS opportunities,
      (SELECT COUNT(*) FROM opportunities
         WHERE deadline IS NULL OR deadline >= (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::date)::int AS open_opportunities`);
  const r = result.rows[0];
  res.json({ data: { courses: r.courses, opportunities: r.opportunities, openOpportunities: r.open_opportunities } });
}));

export default router;
