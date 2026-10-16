import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { todayLocal, dayNumber, validateRecord, validateEnvelope, daysWaiting, dueDate, isDue, logFollowUp } from '../src/model.mjs';
import { load, save, KEY } from '../src/storage.mjs';
import { createServer } from '../server.mjs';

const today = '2026-10-15';
const record = (overrides = {}) => ({ id: 'sample-1', company: 'Example Company', role: 'Product Designer', appliedDate: '2026-10-08', status: 'waiting', lastFollowUpDate: null, ...overrides });
const envelope = (...applications) => ({ schemaVersion: 1, applications });
function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.has(key) ? data.get(key) : null, setItem: (key, value) => data.set(key, value) };
}

test('todayLocal uses local calendar components', () => {
  assert.equal(todayLocal(new Date(2026, 0, 2, 23, 59)), '2026-01-02');
});

test('queue has precise six, seven, and eight day boundaries', () => {
  for (const [date, days, due] of [['2026-10-09', 6, false], ['2026-10-08', 7, true], ['2026-10-07', 8, true]]) {
    const item = record({ appliedDate: date });
    assert.equal(daysWaiting(item, today), days);
    assert.equal(isDue(item, today), due);
  }
  assert.equal(dueDate(record()), today);
});

test('calendar-day arithmetic survives month/year, leap year, and DST boundaries', () => {
  for (const [start, end] of [['2026-01-28', '2026-02-04'], ['2025-12-28', '2026-01-04'], ['2024-02-25', '2024-03-03'], ['2026-03-05', '2026-03-12'], ['2026-10-29', '2026-11-05']]) {
    assert.equal(dayNumber(end) - dayNumber(start), 7);
    assert.equal(dueDate(record({ appliedDate: start })), end);
    assert.equal(isDue(record({ appliedDate: start }), end), true);
  }
});

test('dates must be real, strict YYYY-MM-DD values', () => {
  for (const value of ['2026-02-29', '2024-02-30', '2026-04-31', '2026-13-01', '2026-00-01', '2026-01-00', '2026-1-01', '2026-01-01T00:00:00Z', '', null, undefined, 123]) {
    assert.throws(() => dayNumber(value), `must reject ${String(value)}`);
  }
  assert.equal(Number.isInteger(dayNumber('2024-02-29')), true);
});

test('follow-up restarts a seven-day clock without mutating the original', () => {
  const original = record();
  const updated = logFollowUp(original, today);
  assert.equal(original.lastFollowUpDate, null);
  assert.equal(updated.lastFollowUpDate, today);
  assert.equal(dueDate(updated), '2026-10-22');
  assert.equal(isDue(updated, '2026-10-21'), false);
  assert.equal(isDue(updated, '2026-10-22'), true);
  assert.equal(isDue(updated, '2026-10-23'), true);
  assert.equal(daysWaiting(updated, '2026-10-22'), 7);
});

test('replied and closed records never enter queue and cannot log a follow-up', () => {
  for (const status of ['replied', 'closed']) {
    const item = record({ status });
    assert.equal(isDue(item, today), false);
    assert.throws(() => logFollowUp(item, today));
    assert.equal(validateRecord(item, today).status, status);
  }
});

test('validates records, trims text, and supports maximum lengths', () => {
  const cleaned = validateRecord(record({ company: '  Example Company  ', role: '  Designer  ' }), today);
  assert.equal(cleaned.company, 'Example Company');
  assert.equal(cleaned.role, 'Designer');
  assert.doesNotThrow(() => validateRecord(record({ id: 'i'.repeat(100), company: 'c'.repeat(120), role: 'r'.repeat(160), appliedDate: today, lastFollowUpDate: today }), today));
});

test('rejects missing, invalid, too long, future, and chronologically inconsistent fields', () => {
  for (const override of [{ id: '' }, { id: 'i'.repeat(101) }, { company: '' }, { company: '   ' }, { company: 2 }, { company: 'c'.repeat(121) }, { role: '' }, { role: 'r'.repeat(161) }, { status: 'unknown' }, { appliedDate: '2026-10-16' }, { appliedDate: '2026-02-30' }, { lastFollowUpDate: '2026-10-07' }, { lastFollowUpDate: '2026-10-16' }, { lastFollowUpDate: 'invalid' }]) {
    assert.throws(() => validateRecord(record(override), today), JSON.stringify(override));
  }
  for (const value of [null, undefined, [], 'text', 42]) assert.throws(() => validateRecord(value, today));
  for (const field of ['id', 'company', 'role', 'appliedDate', 'status', 'lastFollowUpDate']) {
    const item = record(); delete item[field];
    assert.throws(() => validateRecord(item, today), field);
  }
});

test('import is all-or-nothing, versioned, and rejects duplicate IDs', () => {
  assert.deepEqual(validateEnvelope(envelope(record()), today), envelope(record()));
  assert.deepEqual(validateEnvelope(envelope(), today), envelope());
  for (const input of [null, [], {}, { schemaVersion: 2, applications: [] }, { schemaVersion: '1', applications: [] }, { schemaVersion: 1, applications: {} }, envelope(record(), record()), envelope(record(), record({ id: ' sample-1 ' })), envelope(record(), record({ id: 'other', company: '' }))]) {
    assert.throws(() => validateEnvelope(input, today));
  }
});

test('missing storage is empty and valid saved data round-trips', () => {
  const storage = memoryStorage();
  assert.equal(typeof KEY, 'string');
  assert.ok(KEY.length);
  assert.deepEqual(load(storage, today), envelope());
  assert.deepEqual(save(storage, envelope(record()), today), envelope(record()));
  assert.deepEqual(load(storage, today), envelope(record()));
});

test('corrupted storage remains untouched; read and write errors surface', () => {
  const storage = memoryStorage();
  for (const raw of ['', '{broken', JSON.stringify({ schemaVersion: 99, applications: [] }), JSON.stringify(envelope(record({ company: '' })))]) {
    storage.setItem(KEY, raw);
    assert.throws(() => load(storage, today));
    assert.equal(storage.getItem(KEY), raw);
  }
  assert.throws(() => load({ getItem() { throw new Error('Access blocked'); } }, today));
  assert.throws(() => save({ setItem() { throw new Error('Storage full'); } }, envelope(record()), today));
});

test('invalid writes never overwrite existing stored applications', () => {
  const storage = memoryStorage();
  save(storage, envelope(record()), today);
  const before = storage.getItem(KEY);
  assert.throws(() => save(storage, envelope(record({ appliedDate: '2026-10-16' })), today));
  assert.equal(storage.getItem(KEY), before);
});

function request(server, pathname, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path: pathname, method }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject); req.end();
  });
}

test('local server serves only allowlisted public paths and supports HEAD', async t => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const model = await request(server, '/src/model.mjs');
  assert.equal(model.status, 200);
  assert.match(model.headers['content-type'], /javascript/);
  assert.equal(model.headers['x-content-type-options'], 'nosniff');
  assert.equal(model.headers['cache-control'], 'no-store');
  assert.match(model.headers['content-security-policy'], /connect-src 'none'/);
  const head = await request(server, '/src/model.mjs', 'HEAD');
  assert.equal(head.status, 200); assert.equal(head.body, '');
  for (const url of ['/devpost/learner-profile.md', '/.git/config', '/.env', '/server.mjs', '/test/model.test.mjs', '/../devpost/learner-profile.md', '/%2e%2e/.env', '/src/../server.mjs', '/src%2fmodel.mjs', '//src/model.mjs']) {
    assert.equal((await request(server, url)).status, 404, url);
  }
  assert.equal((await request(server, '/src/model.mjs?cache=1')).status, 200);
  const post = await request(server, '/', 'POST');
  assert.equal(post.status, 405); assert.equal(post.headers.allow, 'GET, HEAD');
});
