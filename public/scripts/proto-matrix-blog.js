/**
 * /proto/matrix/blog/<slug>/ enhancement. The article is complete without this file. It adds a
 * Copy button on each code block, copy link and the system share sheet, and the mark on the
 * section being read in the contents.
 */
(() => {
  const $$ = (s) => [...document.querySelectorAll(s)];
  const copy = async (btn, text, rest) => {
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; btn.dataset.done = ''; }
    catch { btn.textContent = 'Not copied'; }
    setTimeout(() => { btn.textContent = rest; delete btn.dataset.done; }, 1600);
  };

  $$('.prose pre').forEach((pre) => {
    const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'copy', textContent: 'Copy' });
    btn.lang = 'en';
    btn.addEventListener('click', () => copy(btn, pre.querySelector('code').textContent, 'Copy'));
    pre.append(btn);
  });

  const link = document.getElementById('copy-link'), share = document.getElementById('share');
  link.addEventListener('click', () => copy(link, link.dataset.url, 'Copy link'));
  if (navigator.share) {
    share.hidden = false;
    share.addEventListener('click', () => navigator.share({ title: share.dataset.title, url: share.dataset.url }).catch(() => {}));
  }

  // Contents. From 1100px it is always open; an engine that cannot force that gets it opened here.
  const toc = document.querySelector('.toc details'), desk = matchMedia('(min-width: 1100px)');
  if (desk.matches) toc.open = true;
  const links = $$('.toc a'), heads = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
  // Below that it is a disclosure over the article: choosing a section closes it.
  toc.addEventListener('click', (e) => e.target.closest('a') && !desk.matches && (toc.open = false));
  let queued = 0;
  const mark = () => {
    queued = 0;
    // The section being read is the last heading to have passed the top of the window.
    const at = heads.findLastIndex((h) => h && h.getBoundingClientRect().top < 96);
    links.forEach((a, i) => (i === at ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  };
  addEventListener('scroll', () => (queued ||= requestAnimationFrame(mark)), { passive: true });
  mark();
})();
