import test from 'node:test';
import assert from 'node:assert/strict';
import { createEnquiryHandler } from '../server/enquiry.mjs';

const env = { CONTACT_SMTP_HOST: 'smtp.test.invalid', CONTACT_SMTP_USER: 'letstalk@reachupmedia.in', CONTACT_SMTP_PASSWORD: 'test-only-not-a-real-password' };
const details = { name: 'Test Contact', email: 'reply@example.com', brand: 'Test Brand', brief: 'A sufficiently detailed test campaign brief.' };
const request = (body = details, headers = {}) => new Request('https://reachupmedia.in/api/enquiry', {
  method: 'POST', headers: { Origin: 'https://reachupmedia.in', 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
});
function setup(extra = {}) {
  const calls = [];
  const handler = createEnquiryHandler({ env, createTransport: options => ({
    sendMail: async mail => { calls.push({ options, mail }); return { accepted: ['letstalk@reachupmedia.in'] }; }, close() {},
  }), ...extra });
  return { handler, calls };
}
test('availability is false without SMTP configuration; no delivery is attempted', async () => {
  const { handler, calls } = setup({ env: {} });
  assert.deepEqual(await (await handler(new Request('https://reachupmedia.in/api/enquiry'))).json(), { available: false });
  assert.equal((await handler(request())).status, 503);
  assert.equal(calls.length, 0);
});
test('rejects unsupported methods and cross-origin requests', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(new Request('https://reachupmedia.in/api/enquiry', { method: 'DELETE' }))).status, 405);
  assert.equal((await handler(request(details, { Origin: 'https://untrusted.example' }))).status, 403);
  assert.equal(calls.length, 0);
});
test('rejects malformed JSON, invalid email, short brief and header injection', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(new Request('https://reachupmedia.in/api/enquiry', { method: 'POST', headers: { Origin: 'https://reachupmedia.in', 'Content-Type': 'application/json' }, body: '{' }))).status, 400);
  for (const patch of [{ email: 'bad' }, { brief: 'short' }, { brand: 'Brand\r\nBcc: attacker@example.com' }]) {
    assert.equal((await handler(request({ ...details, ...patch }))).status, 422);
  }
  assert.equal(calls.length, 0);
});
test('rejects oversized payloads and filled honeypot', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(request({ ...details, brief: 'a'.repeat(13000) }))).status, 413);
  assert.equal((await handler(request({ ...details, company_url: 'spam' }))).status, 422);
  assert.equal(calls.length, 0);
});
test('sends only to the business inbox, with visitor email in reply-to', async () => {
  const { handler, calls } = setup();
  const response = await handler(request({ ...details, to: 'attacker@example.com' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(calls[0].mail.to, 'letstalk@reachupmedia.in');
  assert.equal(calls[0].mail.from.address, 'letstalk@reachupmedia.in');
  assert.equal(calls[0].mail.replyTo.address, 'reply@example.com');
  assert.equal(calls[0].options.requireTLS, true);
  assert.equal(calls[0].options.secure, true);
});
test('uses mandatory STARTTLS for port 587', async () => {
  const { handler, calls } = setup({ env: { ...env, CONTACT_SMTP_PORT: '587' } });
  await handler(request());
  assert.equal(calls[0].options.secure, false);
  assert.equal(calls[0].options.requireTLS, true);
});
test('does not report success or expose SMTP errors when delivery fails', async () => {
  for (const sendMail of [async () => { throw new Error('private SMTP detail'); }, async () => ({ accepted: [] })]) {
    const { handler } = setup({ createTransport: () => ({ sendMail, close() {} }) });
    const response = await handler(request());
    assert.equal(response.status, 502);
    const body = await response.text();
    assert.ok(!body.includes('private SMTP detail'));
    assert.ok(!body.includes('"success":true'));
  }
});
test('throttles repeated submissions and expires the per-instance limit', async () => {
  let time = 0;
  const { handler, calls } = setup({ now: () => time });
  for (let n = 0; n < 5; n++) assert.equal((await handler(request())).status, 200);
  assert.equal((await handler(request())).status, 429);
  assert.equal(calls.length, 5);
  time = 600001;
  assert.equal((await handler(request())).status, 200);
});
