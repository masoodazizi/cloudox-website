/** Native anchor sections first; keyboard-accessible tabs after enhancement. */
export function initializeShowcase(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>('[data-showcase-tabs]');
  const tabs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-showcase-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-showcase-panel]'));
  if (!list || !tabs.length || tabs.length !== panels.length) return;
  const select = (index: number, focus = false) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  };
  list.setAttribute('role', 'tablist');
  tabs.forEach((tab, i) => {
    tab.id = `${panels[i].id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', event => { event.preventDefault(); select(i); });
    tab.addEventListener('keydown', event => {
      let index = i;
      if (event.key === 'ArrowRight') index = (i + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') index = (i + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else if (event.key !== ' ') return;
      event.preventDefault(); select(index, true);
    });
  });
  const requested = tabs.findIndex(tab => tab.hash === window.location.hash);
  select(requested >= 0 ? requested : 0);
  root.setAttribute('data-enhanced', '');
}
