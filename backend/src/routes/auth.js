import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/index.js';
import { createToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import { userToJson } from '../utils/mappers.js';
import { validateLogin, validateProfile, validateRegistration } from '../utils/validate.js';

const router = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts. Please wait a few minutes and try again.',
  countOnlyFailures: true // only failed logins count, so a shared campus network is not locked out
});
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many sign-up attempts from this network. Please try again later.'
});

// A real bcrypt hash of a random string. Comparing against it when the email is
// unknown makes "wrong email" and "wrong password" take the same time.
const DUMMY_HASH = bcrypt.hashSync('campusbridge-dummy-password', 12);

const USER_COLUMNS = 'id, full_name, email, university, year_of_study, field, phone, bio, role, created_at';

router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  const { errors, value } = validateRegistration(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: Object.values(errors)[0], errors });
  }

  const passwordHash = await bcrypt.hash(value.password, 12);
  try {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, university, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING ${USER_COLUMNS}`,
      [value.fullName, value.email, value.university, passwordHash]
    );
    const row = result.rows[0];
    res.status(201).json({ success: true, token: createToken(row), user: userToJson(row) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists.', errors: { email: 'This email is already registered.' } });
    }
    throw err;
  }
}));

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { errors, value } = validateLogin(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Enter your email and password.', errors });
  }

  const result = await pool.query(`SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = $1`, [value.email]);
  const row = result.rows[0];
  const passwordOk = await bcrypt.compare(value.password, row ? row.password_hash : DUMMY_HASH);
  if (!row || !passwordOk) return res.status(401).json({ message: 'Incorrect email or password.' });

  res.json({ success: true, token: createToken(row), user: userToJson(row) });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: userToJson(req.user) });
});

// A user can only ever update their own row: the id comes from the verified token, never from the request body.
router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const { errors, value } = validateProfile(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: Object.values(errors)[0], errors });
  }

  const result = await pool.query(
    `UPDATE users SET
       full_name     = COALESCE($1, full_name),
       university    = COALESCE($2, university),
       year_of_study = COALESCE($3, year_of_study),
       field         = COALESCE($4, field),
       phone         = COALESCE($5, phone),
       bio           = COALESCE($6, bio),
       updated_at    = NOW()
     WHERE id = $7
     RETURNING ${USER_COLUMNS}`,
    [value.fullName ?? null, value.university ?? null, value.yearOfStudy ?? null,
     value.field ?? null, value.phone ?? null, value.bio ?? null, req.user.id]
  );
  res.json({ success: true, user: userToJson(result.rows[0]) });
}));

export default router;
