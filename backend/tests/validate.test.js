import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  containsNullByte, escapeLike, isValidEmail, isValidHttpUrl, parseId, passwordProblem,
  validateApplication, validateLogin, validateProfile, validateRegistration
} from '../src/utils/validate.js';

test('isValidEmail accepts normal addresses and rejects bad ones', () => {
  assert.equal(isValidEmail('abebe@student.edu.et'), true);
  for (const bad of ['', 'abebe', 'abebe@', '@x.com', 'a b@x.com', 'a@x', 'a@x.c']) assert.equal(isValidEmail(bad), false, bad);
  assert.equal(isValidEmail(undefined), false);
});

test('passwordProblem enforces length, letter and number', () => {
  assert.ok(passwordProblem('short1'));
  assert.ok(passwordProblem('onlyletters'));
  assert.ok(passwordProblem('12345678'));
  assert.ok(passwordProblem('a1'.repeat(40)));
  assert.equal(passwordProblem('goodpass1'), null);
});

test('validateRegistration trims, lowercases email and reports every problem', () => {
  const ok = validateRegistration({ fullName: '  Abebe Kebede ', email: ' ABEBE@Uni.EDU ', university: 'Mizan-Tepi University', password: 'secret123' });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.value.email, 'abebe@uni.edu');
  assert.equal(ok.value.fullName, 'Abebe Kebede');

  const bad = validateRegistration({});
  assert.deepEqual(Object.keys(bad.errors).sort(), ['email', 'fullName', 'password', 'university']);
});

test('validateLogin requires both fields', () => {
  assert.deepEqual(Object.keys(validateLogin({}).errors).sort(), ['email', 'password']);
  assert.deepEqual(validateLogin({ email: 'A@b.co', password: 'x' }).errors, {});
});

test('validateProfile only validates fields that are sent', () => {
  assert.deepEqual(validateProfile({}).value, {});
  assert.ok(validateProfile({ fullName: '' }).errors.fullName);
  assert.ok(validateProfile({ yearOfStudy: '9th Year' }).errors.yearOfStudy);
  assert.ok(validateProfile({ phone: 'call me maybe' }).errors.phone);
  assert.ok(validateProfile({ bio: 'x'.repeat(501) }).errors.bio);
  const ok = validateProfile({ phone: '+251 911 000 000', yearOfStudy: '3rd Year', bio: '', field: 'Software Engineering' });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.value.bio, ''); // empty string is allowed: lets a student clear their bio
});

test('validateApplication checks cover letter length and portfolio link', () => {
  const base = { opportunityId: 'o1', fullName: 'Abebe K', email: 'a@b.co', university: 'MTU', coverLetter: 'x'.repeat(60) };
  assert.deepEqual(validateApplication(base).errors, {});
  assert.ok(validateApplication({ ...base, coverLetter: 'too short' }).errors.coverLetter);
  assert.ok(validateApplication({ ...base, portfolioUrl: 'javascript:alert(1)' }).errors.portfolioUrl);
  assert.ok(validateApplication({ ...base, portfolioUrl: 'not a url' }).errors.portfolioUrl);
  assert.deepEqual(validateApplication({ ...base, portfolioUrl: 'https://github.com/abebe' }).errors, {});
  assert.ok(validateApplication({ ...base, opportunityId: '' }).errors.opportunityId);
});

test('isValidHttpUrl only allows http and https', () => {
  assert.equal(isValidHttpUrl('https://a.com'), true);
  assert.equal(isValidHttpUrl('ftp://a.com'), false);
  assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
});

test('parseId only accepts positive integers', () => {
  assert.equal(parseId('42'), 42);
  for (const bad of ['0', '-1', '1.5', 'abc', '1; DROP TABLE users', '', '99999999999999999999']) assert.equal(parseId(bad), null, bad);
});

test('escapeLike neutralises SQL wildcards', () => {
  assert.equal(escapeLike('100%_done\\'), '100\\%\\_done\\\\');
});

test('password: bcrypt only reads 72 bytes, so longer (in bytes) passwords are rejected', () => {
  assert.equal(passwordProblem('a1' + 'x'.repeat(70)), null); // exactly 72 bytes
  assert.ok(passwordProblem('a1' + 'x'.repeat(71))); // 73 bytes
  // 32 emoji = only 32 characters but 128 bytes: must be rejected, not silently truncated
  assert.ok(passwordProblem('a1' + '\u{1F600}'.repeat(30)));
});

test('containsNullByte finds NUL characters in strings, nested objects, arrays and keys', () => {
  assert.equal(containsNullByte('hello'), false);
  assert.equal(containsNullByte('he\u0000llo'), true);
  assert.equal(containsNullByte({ a: { b: ['ok', 'bad\u0000'] } }), true);
  assert.equal(containsNullByte({ 'k\u0000ey': 'v' }), true);
  assert.equal(containsNullByte({ a: 1, b: null, c: ['x'] }), false);
  assert.equal(containsNullByte(undefined), false);
});
