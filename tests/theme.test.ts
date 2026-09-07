import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/scripts/theme.ts', import.meta.url), 'utf8');
const code = ts.transpile(source.replace('export function', 'function'), { target: ts.ScriptTarget.ES2022 });
function setup(dark = false, stored: string | null = null, denied = false) {
  const events: Record<string, Function> = {};
  const attrs: Record<string, string> = {};
  const buttons = [0, 1].map(() => {
    const hidden: Record<string, boolean> = {};
    const attributes: Record<string, string> = {};
    let click = () => {};
    return { hidden, attributes, click: () => click(),
      querySelector: (s: string) => ({ classList: { toggle: (_: string, hide: boolean) => { hidden[s] = hide; } } }),
      setAttribute: (k: string, v: string) => { attributes[k] = v; },
      addEventListener: (_: string, f: () => void) => { click = f; },
    };
  });
  const preference = { matches: dark, addEventListener: (_: string, f: Function) => { events.system = f; } };
  const meta = { content: '' };
  runInNewContext(code + '\ninitializeTheme();', {
    document: { documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v; }, removeAttribute: (k: string) => { delete attrs[k]; } }, querySelectorAll: () => buttons, querySelector: () => meta },
    window: { matchMedia: () => preference, addEventListener: (k: string, f: Function) => { events[k] = f; } },
    localStorage: { getItem: () => { if (denied) throw Error(); return stored; }, setItem: (_: string, v: string) => { if (denied) throw Error(); stored = v; } },
  });
  return { attrs, buttons, preference, events, meta };
}
test('both controls show the destination and synchronize after a click', () => {
  const s = setup();
  for (const b of s.buttons) { assert.equal(b.hidden['[data-icon="moon"]'], false); assert.equal(b.attributes.title, 'Switch to dark theme'); }
  s.buttons[0].click();
  assert.equal(s.attrs['data-theme'], 'dark');
  for (const b of s.buttons) { assert.equal(b.hidden['[data-icon="sun"]'], false); assert.equal(b.attributes.title, 'Switch to light theme'); }
  s.buttons[1].click();
  assert.equal(s.attrs['data-theme'], 'light');
});
test('system changes apply until an explicit choice is made', () => {
  const s = setup(); s.preference.matches = true; s.events.system();
  assert.equal(s.meta.content, '#0a0d12'); assert.equal(s.attrs['data-theme'], undefined);
  s.buttons[0].click(); s.events.system();
  assert.equal(s.attrs['data-theme'], 'light');
});
test('storage denial does not prevent repeated toggling', () => {
  const s = setup(false, null, true); s.buttons[0].click(); s.buttons[0].click();
  assert.equal(s.attrs['data-theme'], 'light');
});
test('stored choice takes precedence and reset in another tab restores system preference', () => {
  const s = setup(true, 'light'); assert.equal(s.attrs['data-theme'], 'light');
  s.events.storage({key:'theme',newValue:null});
  assert.equal(s.attrs['data-theme'], undefined); assert.equal(s.meta.content, '#0a0d12');
});
