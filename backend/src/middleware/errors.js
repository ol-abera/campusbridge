import { containsNullByte } from '../utils/validate.js';

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Answers 400 when the address, query string or JSON body contains a NUL character (see containsNullByte).
export function rejectNullBytes(req, res, next) {
  let decodedUrl = req.originalUrl;
  try {
    decodedUrl = decodeURIComponent(req.originalUrl);
  } catch {
    // A stray "%" (for example ?search=100%) is not valid percent-encoding. Express handles that on its own;
    // we only look for the raw encoded form below.
  }
  if (/%00/i.test(req.originalUrl) || decodedUrl.includes('\u0000') || containsNullByte(req.body)) {
    return res.status(400).json({ message: 'The request contains characters that are not allowed.' });
  }
  next();
}

export function notFound(_req, res) {
  res.status(404).json({ message: 'Endpoint not found.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body is not valid JSON.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  // Errors Express raises for bad client input (for example a malformed %-sequence in the address).
  if (err?.status === 400 || err?.statusCode === 400) return res.status(400).json({ message: 'The request is not valid.' });
  // The database is unreachable (stopped, restarting, too many connections): tell the user to retry, not "bug".
  const dbDown = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE', '57P01', '57P03', '53300'].includes(err?.code) || /^08/.test(err?.code || '');
  if (dbDown) {
    console.error('Database unavailable:', err.code, err.message);
    return res.status(503).json({ message: 'The service is temporarily unavailable. Please try again in a moment.' });
  }
  // Log the real error for the developer, but never send database details to the browser.
  console.error('Unhandled error:', err?.message || err);
  res.status(500).json({ message: 'An unexpected server error occurred. Please try again.' });
}
