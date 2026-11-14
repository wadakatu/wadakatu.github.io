/**
 * /proto/matrix/ enhancement. The page is complete without this file: both readings (機械用, a
 * recorded shell session and what the site opens as, and 人間用, the same facts as a page) are in
 * the markup, each has its own URL, and the head script already ends the boot layer on Skip /
 * Escape / click / timeout. A blog page has one reading; there the switch stays two plain links. This
 * adds the in-place change between the two, the theme and palette buttons, the backslash shortcut
 * and (only when motion is allowed and GSAP loads) the boot, the drop between readings and three
 * small glitches. The live shell is its own module (src/pages/proto/matrix/_term.ts); the two only
 * meet at the `mx:view` event below and at the header's 人間用 link, which `exit` presses.
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

  // ---------- reading: 人間用 (the page) or 機械用 (the program) ----------
  const main = $('#main'), curtain = $('#curtain'), slabs = $$('.slab'), name = $('#name');
  // Both readings are in this document, so the change can happen in place. An article has only its own.
  const twin = !!$('.view-machine');
  const halves = $$('a[data-mode]');
  const stagger = { amount: 0.26, from: 'random' };
  let tl = null;
  // Finish a change that is under way. A timeline that grew while it ran needs a second push to reach its new end.
  const finish = () => { for (let i = 0; tl && i < 4; i++) tl.progress(1); };

  // The flags that describe how the page is being read, rebuilt from live state so a spent
  // ?mode=machine or ?boot=1 never rides along. The theme is the reader's stored choice, not an address.
  function flags() {
    const q = new URLSearchParams();
    if (root.dataset.palette === 'operator') q.set('palette', 'operator');
    if (root.dataset.switch) q.set('switch', root.dataset.switch);
    if (forcedStill) q.set('motion', '0');
    const s = q.toString();
    return s ? `?${s}` : '';
  }
  // The static twin is the shareable address of each reading, and it also works without JavaScript.
  // An article's way into the shell already carries a query (?run=).
  const withFlags = (u) => (flags() && u.includes('?') ? u + '&' + flags().slice(1) : u + flags());
  const address = (v) => withFlags(v === 'machine' ? root.dataset.machineUrl : root.dataset.pageUrl);
  function sync(v) {
    root.dataset.view = v;
    document.title = (v === 'machine' ? root.dataset.titleMachine : root.dataset.titlePage) || document.title;
    $$('[data-machine-href]').forEach((a) => (a.href = withFlags(v === 'machine' ? a.dataset.machineHref : a.dataset.pageHref)));
    // Links inside this world that are the same in both readings (the blog) carry the flags too.
    $$('a[data-here]').forEach((a) => (a.href = withFlags(a.dataset.here)));
    halves.forEach((a) => {
      a.href = address(a.dataset.mode);
      if (a.closest('#boot')) return; // in the boot neither side has been chosen yet
      // Only touch aria-current when it actually changes, so the wipe animation does not restart
      // on a palette recast (clip-path wipes have frozen Chrome tabs when restarted mid-composite).
      if (a.dataset.mode === v) {
        if (a.getAttribute('aria-current') !== 'true') a.setAttribute('aria-current', 'true');
      } else if (a.hasAttribute('aria-current')) {
        a.removeAttribute('aria-current');
      }
    });
    syncSwitchA11y();
  }
  function swap(v) {
    // Focus inside the reading that is about to be hidden would be lost; hand it to the switch in the header.
    // On a compact rain switch the side just taken is aria-hidden; focus the one button instead.
    const fromView = document.activeElement.closest('.view');
    sync(v);
    if (fromView) {
      const taken = $(`.top a[data-mode="${v}"]`);
      const btn = taken?.getAttribute('tabindex') === '-1' ? $('.top a[data-mode]:not([tabindex="-1"])') : taken;
      (btn || taken)?.focus();
    }
    // The side just taken settles out of raw glyphs, as the page's own headings do. The old capsule stays as it was.
    if (motion && window.gsap && root.dataset.switch !== 'capsule') $$(`.top a[data-mode="${v}"] [data-text]`).forEach((el) => {
      const t = decode(el, 0.45, true);
      effects.add(t);
      t.then(() => effects.delete(t));
    });
    history.replaceState(null, '', address(v));
    $('#status').textContent = v === 'machine' ? 'Machine reading' : 'Human reading';
    scrollTo(0, 0);
    dispatchEvent(new CustomEvent('mx:view', { detail: v })); // the shell takes focus when it becomes the page
  }
  function decode(el, duration, allWide) {
    const text = el.dataset.text ?? el.textContent.trim(), o = { p: 0 };
    return gsap.to(o, {
      p: 1, duration, ease: 'none',
      onUpdate: () => (el.textContent = frame(text, o.p, Math.floor(o.p * 14), allWide)),
      onComplete: () => (el.textContent = text),
    });
  }
  const onScreen = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
  /** Every piece of text on screen in the page, turned step by step into the hex digits of its own characters. */
  function dissolve(duration) {
    const walk = document.createTreeWalker($('.view-page'), NodeFilter.SHOW_TEXT), nodes = [];
    while (walk.nextNode()) {
      const n = walk.currentNode;
      if (n.nodeValue.trim() && !n.parentElement.closest('.fall') && onScreen(n.parentElement)) nodes.push({ n, text: n.nodeValue });
    }
    const o = { p: 0 };
    const digit = (c, i) => (/\s/.test(c) ? c : c.codePointAt(0).toString(16).at(i % 2 ? -1 : 0));
    return {
      tween: gsap.to(o, {
        p: 1, duration, ease: 'power1.in',
        onUpdate: () => nodes.forEach(({ n, text }) => {
          const cs = Array.from(text);
          n.nodeValue = cs.map((c, i) => ((i * 0.618) % 1 < o.p ? digit(c, i) : c)).join('');
        }),
      }),
      restore: () => nodes.forEach(({ n, text }) => (n.nodeValue = text)),
    };
  }
  const PRINTED = '.view-machine :is(.tty .ln, .tty .logo, .ps1, .chips, .modeline)';
  function toggle() {
    finish(); // a second press finishes the first change before starting its own
    const v = root.dataset.view === 'machine' ? 'page' : 'machine';
    if (!twin) return void (location.href = address(v));
    if (!motion || !window.gsap || curtain?.classList.contains('on')) return swap(v);

    main.setAttribute('aria-busy', 'true');
    // The tube collapses around the middle of the window, wherever the page is scrolled to.
    const origin = () => gsap.set(main, { transformOrigin: `50% ${innerHeight / 2 - main.getBoundingClientRect().top}px` });
    // Into the machine: the session as it stands, known before it is shown. Back: what is on screen now.
    const lines = v === 'machine' ? $$(PRINTED).slice(-90) : $$(PRINTED).filter(onScreen);
    const t = (tl = gsap.timeline({
      onComplete() {
        gsap.set([main, ...lines], { clearProps: 'all' });
        main.removeAttribute('aria-busy');
        tl = null;
        if (v === 'page') double();
        else dispatchEvent(new CustomEvent('mx:view', { detail: v })); // its prompt was still unprinted when the view changed; it can take focus now
      },
    }));
    if (v === 'machine') {
      // The constructed page gives way: its text becomes its own character codes, the picture
      // collapses to a line and goes out, and the session prints top to bottom.
      const d = dissolve(0.34);
      origin();
      t.add(d.tween)
        .to(main, { scaleY: 0.004, duration: 0.16, ease: 'power2.in' })
        .to(main, { scaleX: 0, duration: 0.1, ease: 'power2.in' })
        .add(() => { d.restore(); swap(v); gsap.set(main, { clearProps: 'all' }); })
        .fromTo(lines, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: { amount: 0.55 } }, '+=0.08');
    } else {
      // Back: the session clears from the bottom, then the picture opens from a line.
      t.to(lines, { autoAlpha: 0, duration: 0.01, stagger: { amount: 0.22, from: 'end' } })
        .add(() => { swap(v); origin(); })
        .fromTo(main, { scaleY: 0.004 }, { scaleY: 1, duration: 0.28, ease: 'power2.out', immediateRender: false })
        .add(() => {
          // Settle what is now on screen out of raw glyphs.
          [...new Set($$('.view-page h2, .view-page .stream-name a').map((el) => el.firstElementChild || el))]
            .filter(onScreen)
            .forEach((el, i) => t.add(decode(el, 0.5), t.time() + Math.min(i, 24) * 0.02));
        }, '-=0.2');
    }
  }
  const hold = $('#hold');
  const syncHold = () => {
    if (!hold) return;
    if (hold.checked) root.dataset.rain = 'held';
    else delete root.dataset.rain;
  };
  hold?.addEventListener('change', syncHold);
  syncHold();

  // On a phone the rain switch is one button (see matrix.css). Keep a single tab stop and a
  // name that says where the press goes. The boot layer is left as two strands.
  const compactSwitch = matchMedia('(max-width: 600px)');
  function syncSwitchA11y() {
    const compact = compactSwitch.matches && !root.dataset.switch;
    halves.forEach((a) => {
      if (!a.closest('.top')) return;
      if (compact) {
        const current = a.getAttribute('aria-current') === 'true';
        if (current) {
          a.setAttribute('aria-hidden', 'true');
          a.setAttribute('tabindex', '-1');
          a.removeAttribute('aria-label');
        } else {
          a.removeAttribute('aria-hidden');
          a.removeAttribute('tabindex');
          const to = a.dataset.mode === 'machine' ? '機械用' : '人間用';
          const from = a.dataset.mode === 'machine' ? '人間用' : '機械用';
          a.setAttribute('aria-label', `${from}から${to}へ`);
        }
      } else {
        a.removeAttribute('aria-hidden');
        a.removeAttribute('tabindex');
        a.removeAttribute('aria-label');
      }
    });
  }
  compactSwitch.addEventListener('change', syncSwitchA11y);

  // ---------- menu: below 720px the nav and the controls fold into a native <details> (see matrix.css) ----------
  // It opens and closes without this. Added here: Escape, a press anywhere outside the header, a
  // change of reading and leaving the page all close it. Above 720px the summary is not rendered
  // and none of this runs.
  const menu = $('.menu'), menuBtn = $('summary', menu);
  function closeMenu() {
    if (!menu.open || !menuBtn.offsetParent) return;
    // Focus on something about to be hidden goes back to the button. The switch stays where it is.
    const lost = menu.contains(document.activeElement) && !document.activeElement.closest('.switch');
    menu.open = false;
    if (lost) menuBtn.focus();
  }
  menu.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
  addEventListener('click', (e) => e.target.closest?.('.top') || closeMenu());
  addEventListener('mx:view', closeMenu);
  addEventListener('pagehide', closeMenu); // so Back from a menu link does not restore it unfolded

  sync(root.dataset.view);
  // The switch is two links to the two static routes; here the same choice happens in place.
  addEventListener('click', (e) => {
    const a = e.target.closest?.('a[data-mode]');
    if (!a || !twin || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    // From the boot either half ends it (the head script has, on this same click): 人間用 is Skip, 機械用 goes straight there.
    if (a.dataset.mode !== root.dataset.view) a.closest('#boot') ? swap(a.dataset.mode) : toggle();
  });

  // ---------- palette: phosphor unless the address says operator. Never stored, so it can be shared. ----------
  const paletteBtn = $('#palette-toggle');
  paletteBtn.setAttribute('aria-pressed', root.dataset.palette === 'operator');
  paletteBtn.addEventListener('click', () => {
    const on = root.dataset.palette !== 'operator';
    if (on) root.dataset.palette = 'operator';
    else delete root.dataset.palette;
    paletteBtn.setAttribute('aria-pressed', on);
    history.replaceState(null, '', address(root.dataset.view) + location.hash);
    sync(root.dataset.view);
  });
  const shortcuts = $('#shortcuts');
  try { shortcuts.checked = localStorage.getItem('proto-matrix-shortcuts') !== 'off'; } catch {}
  function syncShortcut() {
    halves.forEach((a) => (shortcuts.checked ? a.setAttribute('aria-keyshortcuts', '\\ ¥') : a.removeAttribute('aria-keyshortcuts')));
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
  const bootLogo = $('.boot-logo');
  const rows = $$('.boot-lines p:not(.boot-logo)').map((p) => ({ p, v: $('.v', p), text: $('.v', p).dataset.text }));
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
    curtain?.classList.remove('on');
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
    // The mark is wiped in whole, top to bottom. The image itself is never scrambled.
    bootTl.add(() => bootLogo.classList.add('on'))
      .fromTo($('img', bootLogo), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: 'steps(10)' })
      .to({}, { duration: 0.5 })
      .add(() => curtain.classList.add('on'))
      .fromTo(slabs, { yPercent: -100 }, { yPercent: 0, duration: 0.45, ease: 'power2.in', stagger })
      .add(() => { washing = true; window.mxEndBoot(); })
      .to(slabs, { yPercent: 100, duration: 0.55, ease: 'power2.out', stagger }, '+=0.05')
      .add(() => curtain.classList.remove('on'));
  }

  // ---------- glitches: rare, tied to his material, off with motion ----------
  function double() {
    if (!motion) return;
    name.classList.add('double'); // the name doubles for a frame after you have seen what it is made of
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
      finish();
      bootTl?.kill();
      effects.forEach((effect) => effect.progress(1));
      curtain?.classList.remove('on');
      $$('.double, .deja').forEach((el) => el.classList.remove('double', 'deja'));
    }
  });
  // A blog page has no boot, no change between readings and no glitches: nothing there needs the library.
  if (!motion || root.dataset.boot === 'frozen' || root.dataset.page === 'blog') return;
  const s = document.createElement('script');
  s.src = body.dataset.gsap;
  s.integrity = body.dataset.gsapSri;
  s.crossOrigin = 'anonymous';
  s.onload = () => { if (motion) { playBoot(); glitches(); } };
  s.onerror = () => window.mxEndBoot?.();
  setTimeout(() => window.gsap || window.mxEndBoot?.(), 2500); // a stalled CDN should not hold the page behind an empty layer
  document.head.append(s);
  // Leaving the page: finish, don't abandon, so a restored page is never caught mid-change.
  addEventListener('pagehide', () => { finish(); bootTl?.progress(1); effects.forEach((effect) => effect.progress(1)); });
})();
