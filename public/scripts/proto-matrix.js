/**
 * /proto/matrix/ enhancement. The page is complete without this file: both views are in the
 * markup, the source view has its own URL, and the head script already ends the boot layer on
 * Skip / Escape / click / timeout. This adds the in-place view change, the theme button, the
 * backslash shortcut, and (only when motion is allowed and GSAP loads) the boot, the curtain
 * and three small glitches.
 */
(() => {
  const root = document.documentElement, body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedStill = new URLSearchParams(location.search).get('motion') === '0';
  let motion = !forcedStill && !motionQuery.matches;
  const effects = new Set();

  // Decode glyphs come from the corpus (read off at build time), never from a hard-coded set.
  const WIDE = Array.from(body.dataset.wide), NARROW = Array.from(body.dataset.narrow);
  const isWide = (c) => /[぀-ヿ㐀-鿿＀-￯]/.test(c);
  /** `text` with its first `p` share settled and the rest still raw. Deterministic, so stills repeat. */
  function frame(text, p, tick, allWide) {
    const cs = Array.from(text), n = Math.round(cs.length * p);
    return cs.map((c, i) => {
      if (i < n || c === ' ') return c;
      const pool = allWide || isWide(c) ? WIDE : NARROW;
      return pool[(i * 131 + tick * 71 + cs.length * 17) % pool.length];
    }).join('');
  }

  // ---------- theme: night unless the reader chose day ----------
  const themeBtn = $('#theme-toggle');
  const isDay = () => root.dataset.theme === 'day' || root.dataset.theme === 'light';
  themeBtn.setAttribute('aria-pressed', isDay());
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = isDay() ? 'night' : 'day';
    try { localStorage.setItem('proto-matrix-theme', root.dataset.theme); } catch {}
    themeBtn.setAttribute('aria-pressed', isDay());
  });

  // ---------- view: the page, or its source ----------
  const viewBtn = $('#view-toggle'), main = $('#main'), curtain = $('#curtain'), slabs = $$('.slab'), name = $('#name');
  const stagger = { amount: 0.26, from: 'random' };
  let tl = null;

  function sync(v) {
    root.dataset.view = v;
    document.title = `${root.dataset.page === 'home' ? 'Home' : 'Projects'}${v === 'source' ? ', source view' : ''} | wadakatu`;
    viewBtn.setAttribute('aria-pressed', v === 'source');
    $$('[data-source-href]').forEach((a) => (a.href = v === 'source' ? a.dataset.sourceHref : a.dataset.pageHref));
  }
  function swap(v) {
    // Focus inside the view that is about to be hidden would be lost; hand it to the control instead.
    if (document.activeElement.closest('.view')) viewBtn.focus();
    sync(v);
    // The static twin is the shareable address of each view, and it also works without JavaScript.
    history.replaceState(null, '', v === 'source' ? root.dataset.sourceUrl : root.dataset.pageUrl);
    $('#status').textContent = v === 'source' ? 'Source view' : 'Page view';
    scrollTo(0, 0);
  }
  function decode(el, duration, allWide) {
    const text = el.dataset.text ?? el.textContent.trim(), o = { p: 0 };
    return gsap.to(o, {
      p: 1, duration, ease: 'none',
      onUpdate: () => (el.textContent = frame(text, o.p, Math.floor(o.p * 14), allWide)),
      onComplete: () => (el.textContent = text),
    });
  }
  function toggle() {
    if (tl) tl.progress(1); // a second press finishes the first change before starting its own
    const v = root.dataset.view === 'source' ? 'page' : 'source';
    if (!motion || !window.gsap) return swap(v);

    const dir = v === 'source' ? 1 : -1; // down into the source, back up to the page
    curtain.classList.add('on');
    main.setAttribute('aria-busy', 'true');
    const t = (tl = gsap.timeline({
      onComplete() {
        curtain.classList.remove('on');
        main.removeAttribute('aria-busy');
        tl = null;
        if (v === 'page') double();
      },
    }));
    t.fromTo(slabs, { yPercent: -100 * dir }, { yPercent: 0, duration: 0.36, ease: 'power2.in', stagger })
      .add(() => {
        swap(v);
        // Settle what is now on screen out of raw glyphs, as the curtain leaves.
        const sel = v === 'source' ? '.view-source [data-d]' : '.view-page h2, .view-page .stream-name a';
        [...new Set($$(sel).map((el) => el.firstElementChild || el))]
          .filter((el) => el.getBoundingClientRect().top < innerHeight)
          .forEach((el, i) => t.add(decode(el, 0.5), t.time() + 0.1 + Math.min(i, 24) * 0.02));
      })
      .to(slabs, { yPercent: 100 * dir, duration: 0.42, ease: 'power2.out', stagger }, '+=0.05');
  }
  sync(root.dataset.view);
  viewBtn.addEventListener('click', toggle);
  const shortcuts = $('#shortcuts');
  try { shortcuts.checked = localStorage.getItem('proto-matrix-shortcuts') !== 'off'; } catch {}
  function syncShortcut() {
    if (shortcuts.checked) viewBtn.setAttribute('aria-keyshortcuts', '\\ ¥');
    else viewBtn.removeAttribute('aria-keyshortcuts');
    $('kbd', viewBtn).hidden = !shortcuts.checked;
  }
  syncShortcut();
  shortcuts.addEventListener('change', () => {
    syncShortcut();
    try { localStorage.setItem('proto-matrix-shortcuts', shortcuts.checked ? 'on' : 'off'); } catch {}
  });
  root.classList.add('enhanced');
  addEventListener('keydown', (e) => {
    // Ctrl and Alt together are AltGr, which some layouts need to type a backslash at all.
    if (!shortcuts.checked || e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey !== e.altKey || e.repeat || root.dataset.boot) return;
    if (e.composedPath().some((el) => el instanceof HTMLElement &&
      (el.isContentEditable || el.matches('input, textarea, select, [role="textbox"], [role="combobox"]')))) return;
    // JIS keyboards type ¥ on the same key.
    if (e.key === '\\' || e.key === '¥') {
      e.preventDefault();
      toggle();
    }
  });

  // ---------- boot ----------
  const rows = $$('.boot-lines p').map((p) => ({ p, v: $('.v', p), text: $('.v', p).dataset.text }));
  let bootTl = null, washing = false;
  if (root.dataset.boot) $('#boot-skip').focus(); // Enter or Space skips, as well as Escape
  if (root.dataset.boot === 'frozen') {
    // ?boot=frozen is a still, with no motion and no library: three values settled, one half decoded, one raw.
    rows.forEach(({ p, v, text }, i) => {
      const done = i < 3;
      p.classList.add('on');
      v.textContent = frame(text, done ? 1 : i === 3 ? 0.5 : 0, 3, true);
      v.classList.toggle('done', done);
    });
  }
  addEventListener('mx:bootend', () => {
    if (washing || !bootTl) return; // skipped by the reader: drop the rest of the sequence
    bootTl.kill();
    curtain.classList.remove('on');
  });
  function playBoot() {
    if (root.dataset.boot !== 'play') return;
    bootTl = gsap.timeline({ delay: 0.2 });
    rows.forEach(({ p, v, text }) => {
      bootTl.add(() => p.classList.add('on'))
        .add(decode(v, 0.25 + Array.from(text).length * 0.012, true))
        .add(() => v.classList.add('done'))
        .to({}, { duration: 0.08 });
    });
    bootTl.to({}, { duration: 0.4 })
      .add(() => curtain.classList.add('on'))
      .fromTo(slabs, { yPercent: -100 }, { yPercent: 0, duration: 0.45, ease: 'power2.in', stagger })
      .add(() => { washing = true; window.mxEndBoot(); })
      .to(slabs, { yPercent: 100, duration: 0.55, ease: 'power2.out', stagger }, '+=0.05')
      .add(() => curtain.classList.remove('on'));
  }

  // ---------- glitches: rare, tied to his material, off with motion ----------
  function double() {
    if (!motion) return;
    name.classList.add('double'); // the name doubles for a frame after you have seen the source
    name.addEventListener('animationend', () => name.classList.remove('double'), { once: true });
  }
  function glitches() {
    $$('.stream').forEach((s) => {
      // Déjà vu: the second time you come back to an entry, its line repeats once.
      let visits = 0;
      const visit = () => {
        if (!motion || $('#hold').checked || ++visits !== 2) return;
        s.classList.add('deja');
        setTimeout(() => s.classList.remove('deja'), 520);
      };
      s.addEventListener('pointerenter', visit);
      s.addEventListener('focusin', visit);
    });
    // A title flickers into the commit that shipped it, then back. Once, shortly after it is first seen.
    const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      seen.unobserve(e.target);
      if (!motion || $('#hold').checked) return;
      const h = e.target, s = h.closest('.stream'), a = $('a', h);
      const wrap = Object.assign(document.createElement('span'), { className: 'ghost', innerHTML: '<span></span>' });
      const ghost = wrap.firstChild;
      wrap.setAttribute('aria-hidden', 'true');
      ghost.dataset.text = s.dataset.commit;
      ghost.lang = 'en';
      const effect = gsap.timeline({ delay: 2.2, onComplete: () => { wrap.remove(); s.classList.remove('flick'); effects.delete(effect); } });
      effects.add(effect);
      effect
        .add(() => { h.append(wrap); s.classList.add('flick'); })
        .add(decode(ghost, 0.3))
        .to({}, { duration: 0.7 })
        .add(() => { ghost.lang = a.closest('[lang]').lang; ghost.dataset.text = a.textContent.trim(); decode(ghost, 0.25); })
        .to({}, { duration: 0.3 });
    }), { threshold: 1 });
    $$('.stream[data-commit] .stream-name').forEach((h) => seen.observe(h));
  }

  // ---------- motion library: only when motion is allowed; everything above works if it never arrives ----------
  motionQuery.addEventListener('change', () => {
    motion = !forcedStill && !motionQuery.matches;
    root.dataset.motion = motion ? 'on' : 'off';
    if (!motion) {
      window.mxEndBoot?.();
      tl?.progress(1);
      bootTl?.kill();
      effects.forEach((effect) => effect.progress(1));
      curtain.classList.remove('on');
      $$('.double, .deja').forEach((el) => el.classList.remove('double', 'deja'));
    }
  });
  if (!motion || root.dataset.boot === 'frozen') return;
  const s = document.createElement('script');
  s.src = body.dataset.gsap;
  s.integrity = body.dataset.gsapSri;
  s.crossOrigin = 'anonymous';
  s.onload = () => { if (motion) { playBoot(); glitches(); } };
  s.onerror = () => window.mxEndBoot?.();
  setTimeout(() => window.gsap || window.mxEndBoot?.(), 2500); // a stalled CDN should not hold the page behind an empty layer
  document.head.append(s);
  // Leaving the page: finish, don't abandon, so a restored page is never caught mid-change.
  addEventListener('pagehide', () => { tl?.progress(1); bootTl?.progress(1); effects.forEach((effect) => effect.progress(1)); });
})();
