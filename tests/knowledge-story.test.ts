import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/scripts/knowledge-story.ts', import.meta.url), 'utf8');
const code = ts.transpile(source.replace('export function', 'function'), { target: ts.ScriptTarget.ES2022 });
function setup(reduced = false) {
  const events: Record<string, Function> = {};
  const timers = new Map<number, { fn: Function; delay: number }>();
  let nextId = 0;
  let intersect: Function = () => {};
  const classes = new Set<string>();
  const replay = { hidden: true, addEventListener: (_: string, fn: Function) => { events.replay = fn; } };
  const preference = { matches: reduced, addEventListener: (_: string, fn: Function) => { events.preference = fn; } };
  const document = { hidden: false, addEventListener: (name: string, fn: Function) => { events[name] = fn; } };
  const owner = { addEventListener: (name: string, fn: Function) => { events[name] = fn; } };
  const root = { dataset: { storyStage: 'complete' }, offsetWidth: 500,
    querySelector: () => replay, closest: () => owner,
    classList: { add: (name: string) => classes.add(name), remove: (name: string) => classes.delete(name) },
  };
  class Observer { constructor(fn: Function) { intersect = fn; } observe() {} }
  runInNewContext(code + '\ninitializeKnowledgeStory(root);', { root, document,
    IntersectionObserver: Observer,
    window: { IntersectionObserver: Observer, matchMedia: () => preference,
      setTimeout: (fn: Function, delay: number) => { const id = ++nextId; timers.set(id, {fn, delay}); return id; },
      clearTimeout: (id: number) => timers.delete(id),
      addEventListener: (name: string, fn: Function) => { events[name] = fn; },
    },
  });
  return {root, replay, preference, document, events, timers, classes,
    enter: () => intersect([{ isIntersecting: true, intersectionRatio: .5 }]),
    leave: () => intersect([{ isIntersecting: false, intersectionRatio: 0 }]),
    advance: (delay: number) => {
      for (const [id, timer] of [...timers]) if (timer.delay <= delay) { timers.delete(id); timer.fn(); }
    },
  };
}
test('introduction waits for visibility, completes in four seconds and does not loop', () => {
  const s = setup(); assert.equal(s.timers.size, 0);
  s.enter(); assert.equal(s.root.dataset.storyStage, 'discover');
  s.advance(1200); assert.equal(s.root.dataset.storyStage, 'connect');
  s.advance(2400); assert.equal(s.root.dataset.storyStage, 'understand');
  s.advance(4000); assert.equal(s.root.dataset.storyStage, 'complete');
  assert.equal(s.classes.size, 0); assert.equal(s.timers.size, 0);
  s.leave(); s.enter(); assert.equal(s.timers.size, 0);
});
test('reduced motion shows the completed diagram and changing preference stops playback', () => {
  const s = setup(true); s.enter(); s.events.replay();
  assert.equal(s.replay.hidden, true); assert.equal(s.timers.size, 0);
  s.preference.matches = false; s.events.preference(); s.events.replay();
  assert.equal(s.replay.hidden, false); assert.equal(s.timers.size, 3);
  s.preference.matches = true; s.events.preference();
  assert.equal(s.root.dataset.storyStage, 'complete'); assert.equal(s.timers.size, 0);
});
test('interaction cancels playback and replay replaces outstanding timers', () => {
  const s = setup(); s.enter(); s.events.focusin();
  assert.equal(s.timers.size, 0); assert.equal(s.root.dataset.storyStage, 'complete');
  s.events.replay(); s.events.replay(); assert.equal(s.timers.size, 3);
  s.events.pointerdown(); assert.equal(s.timers.size, 0);
  s.enter(); assert.equal(s.timers.size, 0);
});
test('leaving the viewport, hiding the tab or navigating away settles the diagram', () => {
  const s = setup(); s.enter(); s.leave(); assert.equal(s.timers.size, 0);
  s.events.replay(); s.document.hidden = true; s.events.visibilitychange();
  assert.equal(s.timers.size, 0); s.events.replay(); assert.equal(s.timers.size, 0);
  s.document.hidden = false; s.events.replay(); s.events.pagehide();
  assert.equal(s.timers.size, 0); assert.equal(s.root.dataset.storyStage, 'complete');
});
