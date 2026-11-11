import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/utils/rateLimit.js';

function fakeRes() {
  return { statusCode: 200, headers: {}, body: null, handlers: {},
    on(ev, fn) { this.handlers[ev] = fn; return this; },
    finish(code) { this.statusCode = code; this.handlers.finish?.(); },
    set(k, v) { this.headers[k] = v; return this; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; } };
}

test('allows up to max requests then returns 429 with Retry-After', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
  let passed = 0;
  for (let i = 0; i < 3; i++) limiter({ ip: '1.1.1.1' }, fakeRes(), () => passed++);
  assert.equal(passed, 3);
  const res = fakeRes();
  limiter({ ip: '1.1.1.1' }, res, () => assert.fail('should be blocked'));
  assert.equal(res.statusCode, 429);
  assert.ok(res.headers['Retry-After']);
});

test('different IPs are counted separately', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
  let passed = 0;
  limiter({ ip: 'a' }, fakeRes(), () => passed++);
  limiter({ ip: 'b' }, fakeRes(), () => passed++);
  assert.equal(passed, 2);
});

test('countOnlyFailures: successful requests do not use up the limit, failures do', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, countOnlyFailures: true });
  // 10 successful logins from the same IP: never blocked
  for (let i = 0; i < 10; i++) {
    const res = fakeRes();
    let passed = false;
    limiter({ ip: '9.9.9.9' }, res, () => { passed = true; });
    assert.ok(passed, `success #${i + 1} was blocked`);
    res.finish(200);
  }
  // 2 failed logins are allowed, the 3rd attempt is blocked
  for (let i = 0; i < 2; i++) {
    const res = fakeRes();
    limiter({ ip: '9.9.9.9' }, res, () => {});
    res.finish(401);
  }
  const blocked = fakeRes();
  limiter({ ip: '9.9.9.9' }, blocked, () => assert.fail('should be blocked after 2 failures'));
  assert.equal(blocked.statusCode, 429);
});

test('countOnlyFailures: requests still in progress count, so parallel guesses cannot sneak past', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, countOnlyFailures: true });
  let passed = 0;
  for (let i = 0; i < 5; i++) limiter({ ip: '8.8.8.8' }, fakeRes(), () => passed++); // none finished yet
  assert.equal(passed, 2);
});
