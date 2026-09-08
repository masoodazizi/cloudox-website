/** A finite introduction. The complete, readable diagram is the default. */
export function initializeKnowledgeStory(root: HTMLElement) {
  const replay = root.querySelector<HTMLButtonElement>('[data-story-replay]');
  if (!replay || !window.matchMedia) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers: number[] = [];
  let consumed = false;
  let observer: IntersectionObserver | undefined;
  const stop = () => {
    consumed = true;
    timers.forEach(id => window.clearTimeout(id));
    timers = [];
    root.classList.remove('is-playing');
    root.dataset.storyStage = 'complete';
  };
  const play = () => {
    stop();
    if (preference.matches || document.hidden) return;
    // Restart the finite CSS timeline after a previous replay.
    void root.offsetWidth;
    root.classList.add('is-playing');
    root.dataset.storyStage = 'discover';
    timers = [
      window.setTimeout(() => { root.dataset.storyStage = 'connect'; }, 1200),
      window.setTimeout(() => { root.dataset.storyStage = 'understand'; }, 2400),
      window.setTimeout(stop, 4000),
    ];
  };
  const updatePreference = () => {
    replay.hidden = preference.matches;
    if (preference.matches) stop();
  };
  const visibility = () => { if (document.hidden) stop(); };
  const owner = root.closest<HTMLElement>('[data-evidence-explorer]') ?? root;
  // Reading or interacting always takes priority over the introduction.
  owner.addEventListener('pointerdown', stop);
  owner.addEventListener('focusin', stop);
  replay.addEventListener('click', play);
  preference.addEventListener('change', updatePreference);
  document.addEventListener('visibilitychange', visibility);
  updatePreference();
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting && entry.intersectionRatio >= .35 && !consumed) play();
      else if (!entry.isIntersecting && consumed) stop();
    }, { threshold: [0, .35] });
    observer.observe(root);
  }
  // Keep preference listeners on bfcache restores; the document owns their lifetime.
  window.addEventListener('pagehide', stop);
}
