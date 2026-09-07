/** Shared theme state for the desktop and mobile controls. No storage is required. */
export function initializeTheme() {
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]'));
  let choice: 'light' | 'dark' | null = null;
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') choice = stored;
  } catch { /* Private browsing may disallow storage. */ }

  const render = () => {
    const theme = choice ?? (preference.matches ? 'dark' : 'light');
    if (choice) root.setAttribute('data-theme', choice);
    else root.removeAttribute('data-theme');
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0a0d12' : '#ffffff';
    const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    buttons.forEach(button => {
      button.querySelector('[data-icon="sun"]')?.classList.toggle('hidden', theme !== 'dark');
      button.querySelector('[data-icon="moon"]')?.classList.toggle('hidden', theme === 'dark');
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('data-theme-ready', '');
    });
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    const current = choice ?? (preference.matches ? 'dark' : 'light');
    choice = current === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', choice); } catch { /* Keep the in-memory choice. */ }
    render();
  }));
  preference.addEventListener('change', () => { if (!choice) render(); });
  window.addEventListener('storage', event => {
    if (event.key !== 'theme' && event.key !== null) return;
    choice = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
    render();
  });
  render();
}
