import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/scripts/constellation.ts', import.meta.url), 'utf8');
const code = ts.transpile(source.replace('export function', 'function'), { target: ts.ScriptTarget.ES2022 });
function setup(reduce = false, observerAvailable = true) {
  const events: Record<string, Function> = {};
  const timers = new Map<number, Function>();
  let id = 0;
  let intersection: Function = () => {};
  const controls = { hidden: true };
  const toggle = { textContent: '', disabled: false, setAttribute() {}, addEventListener: (_: string, f: Function) => { events.toggle = f; } };
  const buttons = Array.from({length: 4}, (_, i) => ({ pressed: '', setAttribute(_k: string, v: string) { this.pressed = v; }, addEventListener: (_: string, f: Function) => { events[`phase${i}`] = f; } }));
  const descriptions = Array.from({length: 4}, () => ({ hidden: false }));
  const root = { dataset: { phase: '1', running: 'false' }, querySelector: (s: string) => s === '[data-motion-control]' ? toggle : controls,
    querySelectorAll: (s: string) => s === '[data-phase-button]' ? buttons : descriptions };
  const reduced = { matches: reduce, addEventListener: (_: string, f: Function) => { events.preference = f; } };
  const document = { hidden: false, addEventListener: (s: string, f: Function) => { events[s] = f; } };
  class Observer { constructor(f: Function) { intersection = f; } observe() {} }
  const window = { matchMedia: () => reduced, addEventListener: (s: string, f: Function) => { events[s] = f; },
    setTimeout: (f: Function) => { timers.set(++id, f); return id; }, clearTimeout: (n: number) => timers.delete(n),
    ...(observerAvailable ? { IntersectionObserver: Observer } : {}),
  };
  runInNewContext(code + '\ninitializeConstellation(root);', { root, window, document, IntersectionObserver: Observer });
  return { root, controls, toggle, buttons, descriptions, events, timers, reduced, document,
    visible: (value: boolean) => intersection([{ isIntersecting: value }]),
    tick: () => { const next = timers.entries().next().value; if (next) { timers.delete(next[0]); next[1](); } },
  };
}
test('constellation cycles visible phases; pause and manual selection stop the clock', () => {
  const s = setup(); assert.equal(s.timers.size, 0); s.visible(true);
  for (const phase of ['1', '2', '3', '0']) { s.tick(); assert.equal(s.root.dataset.phase, phase); assert.equal(s.timers.size, 1); }
  s.events.toggle(); assert.equal(s.timers.size, 0); assert.equal(s.root.dataset.running, 'false');
  s.events.phase2(); assert.equal(s.root.dataset.phase, '2');
  assert.equal(s.buttons[2].pressed, 'true'); assert.equal(s.descriptions[2].hidden, false);
  assert.equal(s.descriptions.filter(d => !d.hidden).length, 1);
  s.events.toggle(); assert.equal(s.timers.size, 1);
});
test('offscreen, background tabs, navigation, and reduced motion suspend animation', () => {
  const s = setup(); s.visible(true); s.visible(false); assert.equal(s.timers.size, 0);
  s.visible(true); s.document.hidden = true; s.events.visibilitychange(); assert.equal(s.timers.size, 0);
  s.document.hidden = false; s.events.visibilitychange(); assert.equal(s.timers.size, 1);
  s.events.pagehide(); assert.equal(s.timers.size, 0); s.events.pageshow(); assert.equal(s.timers.size, 1);
  s.reduced.matches = true; s.events.preference(); assert.equal(s.timers.size, 0); assert.equal(s.toggle.disabled, true);
  s.events.phase3(); assert.equal(s.root.dataset.phase, '3'); assert.equal(s.timers.size, 0);
});
test('reduced-motion and unsupported observers retain a usable static diagram', () => {
  for (const s of [setup(true), setup(false, false)]) {
    s.visible(true); assert.equal(s.root.dataset.phase, '1'); assert.equal(s.timers.size, 0);
    assert.equal(s.controls.hidden, false); s.events.phase2(); assert.equal(s.root.dataset.phase, '2');
  }
});
