import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

test('showcase enhances deep links and supports click, keyboard and selection semantics', () => {
  const source = readFileSync(new URL('../src/scripts/product-showcase.ts', import.meta.url), 'utf8');
  const make = (id: string) => ({ id, hash: `#${id}`, hidden: false, tabIndex: 0, focused: false,
    attrs: {} as Record<string, string>, events: {} as Record<string, Function>,
    setAttribute(k: string, v: string) { this.attrs[k] = v; },
    addEventListener(k: string, fn: Function) { this.events[k] = fn; },
    focus() { this.focused = true; },
  });
  const tabs = ['structure', 'change', 'evidence'].map(k => make(`showcase-${k}`));
  const panels = tabs.map(t => make(t.id)); const list = make('tabs');
  const root = { querySelector: () => list,
    querySelectorAll: (s: string) => s === '[data-showcase-tab]' ? tabs : panels,
    setAttribute() {},
  };
  const code = ts.transpile(source.replace('export function', 'function'), { target: ts.ScriptTarget.ES2022 });
  runInNewContext(code + '\ninitializeShowcase(root);', { root, window: { location: { hash: '#showcase-change' } } });
  assert.equal(list.attrs.role, 'tablist');
  const selected = (i: number) => {
    assert.equal(panels.filter(p => !p.hidden).length, 1);
    assert.equal(panels[i].hidden, false); assert.equal(tabs[i].attrs['aria-selected'], 'true');
    assert.equal(tabs.filter(t => t.tabIndex === 0).length, 1);
    assert.equal(panels[i].attrs['aria-labelledby'], tabs[i].id);
  };
  selected(1);
  tabs[2].events.click({ preventDefault() {} }); selected(2);
  for (const [from, key, to] of [[2, 'ArrowRight', 0], [0, 'ArrowLeft', 2], [2, 'Home', 0], [0, 'End', 2], [2, ' ', 2]] as const) {
    tabs[from].events.keydown({ key, preventDefault() {} }); selected(to); assert.equal(tabs[to].focused, true);
  }
});

test('homepage keeps the hero focused and exposes all showcase content without JavaScript', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const hero = html.split('class="hero-copy"')[1]?.split('data-constellation')[0] ?? '';
  assert.match(hero, /data-early-access-form/);
  assert.doesNotMatch(hero, /class="hero-actions"|class="hero-trust"/);
  for (const key of ['structure', 'change', 'evidence']) {
    assert.match(html, new RegExp(`href="#showcase-${key}"`));
    const section = html.match(new RegExp(`<section id="showcase-${key}"[^>]*>`))?.[0];
    assert.ok(section); assert.doesNotMatch(section, /\shidden/);
  }
  assert.match(html, /Lower bound/); assert.match(html, /1 excluded/);
  assert.match(html, /Selected report data · Not a live connection/);
  assert.match(html, /sg-0d6a48061beb72eae/);
});
