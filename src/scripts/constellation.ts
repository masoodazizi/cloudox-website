/** A small, pausable conceptual story. No rendering engine or network calls. */
export function initializeConstellation(root: HTMLElement) {
  const controls = root.querySelector<HTMLElement>('[data-constellation-controls]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-motion-control]');
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-phase-button]'));
  const descriptions = Array.from(root.querySelectorAll<HTMLElement>('[data-phase-description]'));
  if (!controls || !toggle || buttons.length !== 4 || descriptions.length !== 4) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 1;
  let timer: number | undefined;
  let visible = false;
  let enabled = !reduced.matches;
  const render = () => {
    root.dataset.phase = String(phase);
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === phase)));
    descriptions.forEach((description, i) => { description.hidden = i !== phase; });
  };
  const sync = () => {
    window.clearTimeout(timer);
    const running = enabled && visible && !document.hidden && !reduced.matches;
    root.dataset.running = String(running);
    toggle.textContent = enabled ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', enabled ? 'Pause animation' : 'Play animation');
    toggle.disabled = reduced.matches;
    if (reduced.matches) { toggle.textContent = 'Still'; toggle.setAttribute('aria-label', 'Animation off: reduced motion'); }
    if (running) timer = window.setTimeout(() => { phase = (phase + 1) % 4; render(); sync(); }, 5500);
  };
  buttons.forEach((button, i) => button.addEventListener('click', () => {
    enabled = false;
    phase = i;
    render(); sync();
  }));
  toggle.addEventListener('click', () => { enabled = !enabled; sync(); });
  reduced.addEventListener('change', () => { enabled = false; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { window.clearTimeout(timer); root.dataset.running = 'false'; });
  window.addEventListener('pageshow', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 });
    observer.observe(root);
    if (!reduced.matches) phase = 0;
  } else enabled = false;
  controls.hidden = false;
  render(); sync();
}
