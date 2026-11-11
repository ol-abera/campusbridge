// A tiny in-memory rate limiter (no dependency). Good enough for a single-server
// student project: it slows down password guessing and spam registrations.
//
// countOnlyFailures: true  -> requests that succeed (status below 400) are NOT counted. Used for login, so many
// students sharing one university network are not locked out, while password guessing is still limited.
export function createRateLimiter({ windowMs, max, message, countOnlyFailures = false }) {
  const hits = new Map();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, Math.min(windowMs, 60_000));
  timer.unref(); // never keep the process alive just for cleanup

  return function rateLimit(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (countOnlyFailures) {
      // Give the attempt back once we know it succeeded. (Until then it counts, so parallel guesses cannot sneak past.)
      res.on('finish', () => { if (res.statusCode < 400) entry.count = Math.max(0, entry.count - 1); });
    }
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message: message || 'Too many requests. Please wait and try again.' });
    }
    next();
  };
}
