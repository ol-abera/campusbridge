// Input validation helpers. This file has NO dependencies on purpose,
// so it can be unit-tested without a database (see tests/validate.test.js).

export const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d\s()-]{0,20}$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email);
}

export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters.';
  // bcrypt silently ignores everything after 72 BYTES (emoji and many non-Latin letters are 2-4 bytes each),
  // so we reject long passwords instead of quietly truncating them.
  if (Buffer.byteLength(password, 'utf8') > 72) return 'Password is too long (72 bytes maximum; emoji and non-Latin letters count as more than one).';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password must contain at least one letter and one number.';
  return null;
}

export function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function lengthError(errors, field, value, label, min, max) {
  if (value.length < min) errors[field] = min === 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`;
  else if (value.length > max) errors[field] = `${label} must be ${max} characters or fewer.`;
}

export function validateRegistration(body = {}) {
  const errors = {};
  const value = {
    fullName: str(body.fullName),
    email: str(body.email).toLowerCase(),
    university: str(body.university),
    password: typeof body.password === 'string' ? body.password : ''
  };
  lengthError(errors, 'fullName', value.fullName, 'Full name', 2, 100);
  if (!value.email) errors.email = 'Email is required.';
  else if (!isValidEmail(value.email)) errors.email = 'Enter a valid email address.';
  lengthError(errors, 'university', value.university, 'University', 2, 150);
  const pw = passwordProblem(value.password);
  if (pw) errors.password = pw;
  return { errors, value };
}

export function validateLogin(body = {}) {
  const errors = {};
  const value = { email: str(body.email).toLowerCase(), password: typeof body.password === 'string' ? body.password : '' };
  if (!value.email) errors.email = 'Email is required.';
  if (!value.password) errors.password = 'Password is required.';
  return { errors, value };
}

// Only fields that are present in the request are validated/updated.
export function validateProfile(body = {}) {
  const errors = {};
  const value = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k) && body[k] !== undefined && body[k] !== null;

  if (has('fullName')) {
    value.fullName = str(body.fullName);
    lengthError(errors, 'fullName', value.fullName, 'Full name', 2, 100);
  }
  if (has('university')) {
    value.university = str(body.university);
    lengthError(errors, 'university', value.university, 'University', 2, 150);
  }
  if (has('yearOfStudy')) {
    value.yearOfStudy = str(body.yearOfStudy);
    if (value.yearOfStudy && !YEARS_OF_STUDY.includes(value.yearOfStudy)) errors.yearOfStudy = 'Choose a valid year of study.';
  }
  if (has('field')) {
    value.field = str(body.field);
    if (value.field.length > 100) errors.field = 'Field of study must be 100 characters or fewer.';
  }
  if (has('phone')) {
    value.phone = str(body.phone);
    if (!PHONE_RE.test(value.phone)) errors.phone = 'Phone can only contain digits, spaces, + ( ) and -, up to 20 characters.';
  }
  if (has('bio')) {
    value.bio = str(body.bio);
    if (value.bio.length > 500) errors.bio = 'Bio must be 500 characters or fewer.';
  }
  return { errors, value };
}

export function validateApplication(body = {}) {
  const errors = {};
  const value = {
    opportunityId: str(body.opportunityId),
    fullName: str(body.fullName),
    email: str(body.email).toLowerCase(),
    phone: str(body.phone),
    university: str(body.university),
    yearOfStudy: str(body.yearOfStudy),
    coverLetter: str(body.coverLetter),
    portfolioUrl: str(body.portfolioUrl)
  };
  if (!value.opportunityId) errors.opportunityId = 'Opportunity is required.';
  lengthError(errors, 'fullName', value.fullName, 'Full name', 2, 100);
  if (!value.email) errors.email = 'Email is required.';
  else if (!isValidEmail(value.email)) errors.email = 'Enter a valid email address.';
  if (value.phone && !PHONE_RE.test(value.phone)) errors.phone = 'Enter a valid phone number.';
  lengthError(errors, 'university', value.university, 'University', 2, 150);
  if (value.yearOfStudy && !YEARS_OF_STUDY.includes(value.yearOfStudy)) errors.yearOfStudy = 'Choose a valid year of study.';
  if (!value.coverLetter) errors.coverLetter = 'Cover letter is required.';
  else if (value.coverLetter.length < 50) errors.coverLetter = 'Cover letter must be at least 50 characters.';
  else if (value.coverLetter.length > 5000) errors.coverLetter = 'Cover letter must be 5000 characters or fewer.';
  if (value.portfolioUrl) {
    if (value.portfolioUrl.length > 300) errors.portfolioUrl = 'Link must be 300 characters or fewer.';
    else if (!isValidHttpUrl(value.portfolioUrl)) errors.portfolioUrl = 'Enter a full link starting with http:// or https://';
  }
  return { errors, value };
}

export const OPPORTUNITY_TYPES = ['Internship', 'Scholarship', 'Research Opportunity'];
export const REVIEW_STATUSES = ['Under Review', 'Accepted', 'Rejected']; // what a coordinator may set
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isRealDate = (v) => DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
const lines = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : []).map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);

export function validateSubmission(body = {}) {
  const errors = {};
  const value = { content: str(body.content), link: str(body.link) };
  if (!value.content) errors.content = 'Your answer is required.';
  else if (value.content.length < 20) errors.content = 'Your answer must be at least 20 characters.';
  else if (value.content.length > 5000) errors.content = 'Your answer must be 5000 characters or fewer.';
  if (value.link) {
    if (value.link.length > 300) errors.link = 'Link must be 300 characters or fewer.';
    else if (!isValidHttpUrl(value.link)) errors.link = 'Enter a full link starting with http:// or https://';
  }
  return { errors, value };
}

export function validateGrade(body = {}, maxPoints = 100) {
  const errors = {};
  const grade = typeof body.grade === 'number' ? body.grade : /^\d{1,4}$/.test(String(body.grade ?? '')) ? Number(body.grade) : NaN;
  const value = { grade, feedback: str(body.feedback) };
  if (!Number.isInteger(grade) || grade < 0 || grade > maxPoints) errors.grade = `Grade must be a whole number from 0 to ${maxPoints}.`;
  if (value.feedback.length > 1000) errors.feedback = 'Feedback must be 1000 characters or fewer.';
  return { errors, value };
}

export function validateAssignment(body = {}) {
  const errors = {};
  const value = { title: str(body.title), description: str(body.description), dueDate: str(body.dueDate), maxPoints: Number(body.maxPoints ?? 100) };
  lengthError(errors, 'title', value.title, 'Title', 3, 120);
  lengthError(errors, 'description', value.description, 'Description', 10, 3000);
  if (value.dueDate && !isRealDate(value.dueDate)) errors.dueDate = 'Enter a valid due date.';
  if (!Number.isInteger(value.maxPoints) || value.maxPoints < 1 || value.maxPoints > 1000) errors.maxPoints = 'Points must be a whole number from 1 to 1000.';
  return { errors, value: { ...value, dueDate: value.dueDate || null } };
}

export function validateOpportunity(body = {}, todayIso) {
  const errors = {};
  const value = {
    title: str(body.title), company: str(body.company), location: str(body.location), type: str(body.type),
    duration: str(body.duration), stipend: str(body.stipend), deadline: str(body.deadline), category: str(body.category),
    description: str(body.description), requirements: lines(body.requirements).slice(0, 10), tags: lines(body.tags).slice(0, 8)
  };
  lengthError(errors, 'title', value.title, 'Title', 3, 120);
  lengthError(errors, 'company', value.company, 'Organisation', 2, 120);
  lengthError(errors, 'category', value.category, 'Category', 2, 60);
  lengthError(errors, 'description', value.description, 'Description', 20, 3000);
  if (value.location.length > 120) errors.location = 'Location must be 120 characters or fewer.';
  if (value.duration.length > 60) errors.duration = 'Duration must be 60 characters or fewer.';
  if (value.stipend.length > 80) errors.stipend = 'Stipend must be 80 characters or fewer.';
  if (!OPPORTUNITY_TYPES.includes(value.type)) errors.type = `Type must be one of: ${OPPORTUNITY_TYPES.join(', ')}.`;
  if (!value.deadline) errors.deadline = 'Deadline is required.';
  else if (!isRealDate(value.deadline)) errors.deadline = 'Enter a valid deadline.';
  else if (todayIso && value.deadline < todayIso) errors.deadline = 'The deadline cannot be in the past.';
  if (value.requirements.some((r) => r.length > 200) || value.tags.some((t) => t.length > 40)) errors.requirements = 'Requirements (200 chars) and tags (40 chars) are too long.';
  return { errors, value };
}

// Returns a positive integer, or null if the value is not a safe database id.
export function parseId(raw) {
  if (!/^\d{1,15}$/.test(String(raw))) return null;
  const n = Number(raw);
  return n > 0 ? n : null;
}

// PostgreSQL cannot store the NUL character (\u0000) in text and throws an error if it receives one.
// Checking for it up front lets the API answer 400 instead of crashing into a 500.
export function containsNullByte(value, depth = 0) {
  if (typeof value === 'string') return value.includes('\u0000');
  if (depth > 10 || value === null || typeof value !== 'object') return false;
  return Object.entries(value).some(([k, v]) => k.includes('\u0000') || containsNullByte(v, depth + 1));
}

// Escape % and _ so user search text is treated literally inside ILIKE.
export function escapeLike(text) {
  return String(text).replace(/[\\%_]/g, (c) => `\\${c}`);
}
