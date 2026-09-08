import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/scripts/early-access.ts', import.meta.url), 'utf8');
const code = ts.transpile(source.replace('export function', 'function'), { target: ts.ScriptTarget.ES2022 });
function setup(fetcher: Function, valid = true) {
  let submit: Function = () => {};
  let timeout: Function = () => {};
  let reset = false;
  let reported = false;
  let cleared = false;
  const fields = { hidden: false, disabled: false };
  const button = { textContent: 'Request access' };
  const status = { textContent: '' };
  const followup = { hidden: true };
  const form = { action: 'https://api.web3forms.com/submit',
    querySelector: (s: string) => ({ '[data-access-fields]': fields, '[data-access-submit]': button, '[data-access-status]': status, '[data-access-followup]': followup })[s],
    checkValidity: () => valid, reportValidity: () => { reported = true; },
    setAttribute() {}, removeAttribute() {}, reset: () => { reset = true; },
    addEventListener: (_: string, fn: Function) => { submit = fn; },
  };
  class Data extends Map {
    constructor() { super([['email', 'architect@gmail.com'], ['access_key', 'test-key'], ['source', 'homepage-hero'], ['redirect', 'https://cloudox.io/thanks']]); }
  }
  runInNewContext(code + '\ninitializeEarlyAccess(form);', { form, FormData: Data, AbortController, fetch: fetcher,
    window: { setTimeout: (fn: Function) => { timeout = fn; return 1; }, clearTimeout: () => { cleared = true; } },
  });
  return { fields, button, status, followup, submit: () => submit({ preventDefault() {} }), timeout: () => timeout(),
    get reset() { return reset; }, get reported() { return reported; }, get cleared() { return cleared; },
  };
}
test('success sends email/source without redirect, prevents duplicates, and offers optional next steps', async () => {
  let calls = 0;
  let resolve: Function = () => {};
  const s = setup((_url: string, options: {body: string}) => {
    calls++;
    assert.deepEqual(JSON.parse(options.body), { email: 'architect@gmail.com', access_key: 'test-key', source: 'homepage-hero' });
    return new Promise(done => { resolve = done; });
  });
  const pending = s.submit(); assert.equal(s.fields.disabled, true);
  await s.submit(); assert.equal(calls, 1);
  resolve({ok: true, json: async () => ({success: true})}); await pending;
  assert.equal(s.reset, true); assert.equal(s.fields.hidden, true); assert.equal(s.followup.hidden, false);
  assert.match(s.status.textContent, /Request received/); assert.equal(s.cleared, true);
  await s.submit(); assert.equal(calls, 1);
});
test('HTTP, API and malformed-response failures preserve input and permit retries', async () => {
  for (const response of [
    {ok: false, json: async () => ({success: true})},
    {ok: true, json: async () => ({success: false})},
    {ok: true, json: async () => ({success: 'true'})},
    {ok: true, json: async () => { throw Error('Invalid JSON'); }},
  ]) {
    let calls = 0; const s = setup(async () => { calls++; return response; });
    await s.submit(); assert.equal(s.reset, false); assert.equal(s.fields.hidden, false);
    assert.equal(s.fields.disabled, false); assert.match(s.status.textContent, /couldn't confirm/);
    await s.submit(); assert.equal(calls, 2);
  }
});
test('timeout aborts the request and invalid email never triggers a request', async () => {
  const s = setup((_url: string, options: {signal: AbortSignal}) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(Error('Aborted')));
  }));
  const pending = s.submit(); s.timeout(); await pending;
  assert.match(s.status.textContent, /timed out/); assert.equal(s.reset, false); assert.equal(s.fields.disabled, false);
  const invalid = setup(() => { throw Error('Must not fetch'); }, false);
  await invalid.submit(); assert.equal(invalid.reported, true);
});
test('homepage has a native email-only form with delivery metadata and privacy context', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const form = html.match(/<form[^>]*data-early-access-form[\s\S]*?<\/form>/)?.[0];
  assert.ok(form);
  assert.match(form, /method="POST"/); assert.match(form, /action="https:\/\/api.web3forms.com\/submit"/);
  assert.match(form, /name="redirect" value="https:\/\/cloudox.io\/thanks"/);
  assert.match(form, /name="source" value="homepage-hero"/);
  assert.match(form, /name="botcheck"/); assert.match(form, /href="\/privacy"/);
  assert.match(form, /type="email" name="email" required/);
  assert.doesNotMatch(form, /name="(?:name|company|scale|message)"|pattern=/);
});
