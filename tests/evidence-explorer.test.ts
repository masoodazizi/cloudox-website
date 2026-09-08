import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EXAMPLE_EVIDENCE } from '../src/config/example.ts';
const html = readFileSync(new URL('../dist/product/index.html', import.meta.url), 'utf8');
test('product evidence remains available without JavaScript', () => {
  for (const key of ['finding', 'evidence', 'change']) {
    assert.ok(html.includes(`href="#evidence-${key}"`));
    const panel = html.match(new RegExp(`<section id="evidence-${key}"[^>]*>`));
    assert.ok(panel);
    assert.doesNotMatch(panel[0], /\bhidden\b/);
  }
});
test('evidence explorer carries the record and counterpart from the shared source', () => {
  assert.ok(html.includes(EXAMPLE_EVIDENCE.trail[2].detail));
  assert.ok(html.includes(EXAMPLE_EVIDENCE.counterpart));
  assert.match(html, /Prepared example · no live scan/);
  assert.match(html, /Sanitized example/);
});
test('homepage uses an explicitly illustrative constellation and keeps proof on Product', () => {
  const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(home, /data-evidence-explorer/);
  assert.match(home, /data-constellation/);
  assert.match(home, /Illustrative knowledge flow · no live AWS connection/);
  assert.match(home, /Optional AI/);
  assert.match(home, /data-constellation-controls hidden/);
  assert.match(html, /data-evidence-explorer/);
});
