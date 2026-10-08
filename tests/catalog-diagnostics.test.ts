import assert from 'node:assert/strict';
import test from 'node:test';
import { safeCatalogDiagnostic, unavailable } from '../src/server/http';

test('catalogue diagnostics retain only recognized Prisma names and structured codes', () => {
  for (const field of ['code', 'errorCode']) {
    assert.deepEqual(safeCatalogDiagnostic({
      name: 'PrismaClientInitializationError', [field]: 'P1000',
      message: 'private message', stack: 'private stack', meta: { password: 'private' },
    }), {
      event: 'catalogue_request_failed', type: 'PrismaClientInitializationError', code: 'P1000',
    });
  }
});

test('unknown and credential-bearing errors never leak into diagnostics', () => {
  const secret = 'mysql://fake-user:fake-secret@fake-host/fake-db';
  for (const error of [undefined, null, secret, new Error(secret), {
    name: secret, code: secret, errorCode: secret, message: secret,
    stack: secret, meta: { connectionString: secret },
  }]) {
    assert.deepEqual(safeCatalogDiagnostic(error), {
      event: 'catalogue_request_failed', type: 'UnknownError', code: 'UNKNOWN',
    });
  }
});

test('unavailable logs sanitized diagnostics and preserves the generic no-store 503', async t => {
  const log = t.mock.method(console, 'error', () => {});
  const response = unavailable({ name: 'PrismaClientKnownRequestError', code: 'P2021',
    message: 'fake-secret', meta: { password: 'fake-secret' } });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), {
    error: { code: 'SERVICE_UNAVAILABLE', message: 'Catalogue is temporarily unavailable.' },
  });
  assert.equal(log.mock.calls.length, 1);
  assert.deepEqual(log.mock.calls[0].arguments, [JSON.stringify({
    event: 'catalogue_request_failed', type: 'PrismaClientKnownRequestError', code: 'P2021',
  })]);
});
