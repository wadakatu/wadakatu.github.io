// theme.js — tombo/hotaru toggle with localStorage persistence.
// Init-before-paint lives in an inline <head> script; this file handles interaction.
(() => {
  const KEY = 'tombo-theme';
  const current = () =>
    document.documentElement.dataset.theme ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'hotaru' : 'tombo');
  const syncCtl = () => {
    const t = current();
    document.querySelectorAll('.tombo-themectl button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.t === t));
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', t === 'hotaru' ? m.dataset.hotaru : m.dataset.tombo);
    });
  };
  const applyStored = () => {
    const t = localStorage.getItem(KEY);
    if (t === 'tombo' || t === 'hotaru') document.documentElement.dataset.theme = t;
    // the markup ships hidden so the buttons never appear without this script
    document.querySelectorAll('.tombo-themectl[hidden]').forEach((c) => { c.hidden = false; });
    syncCtl();
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tombo-themectl button');
    if (!btn) return;
    document.documentElement.dataset.theme = btn.dataset.t;
    try { localStorage.setItem(KEY, btn.dataset.t); } catch {}
    syncCtl();
  });
  document.addEventListener('astro:after-swap', applyStored); // ViewTransitions re-stamps <html>
  applyStored();
})();
