/**
 * /proto/matrix/ enhancement. The page is complete without this file: both readings (人間用, the
 * page, and 機械用, the same facts as a program listing) are in the markup, each has its own URL,
 * and the head script already ends the boot layer on Skip / Escape / click / timeout. This adds
 * the in-place change between the two, the theme and palette buttons, the backslash shortcut, the
 * prompt at the end of the machine reading, and (only when motion is allowed and GSAP loads) the
 * boot, the drop between readings and three small glitches.
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
    if (forcedStill) q.set('motion', '0');
    const s = q.toString();
    return s ? `?${s}` : '';
  }
  // The static twin is the shareable address of each reading, and it also works without JavaScript.
  const address = (v) => (v === 'machine' ? root.dataset.machineUrl : root.dataset.pageUrl) + flags();
  function sync(v) {
    root.dataset.view = v;
    document.title = `${root.dataset.page === 'home' ? 'Home' : 'Projects'}${v === 'machine' ? ', machine reading' : ''} | wadakatu`;
    $$('[data-machine-href]').forEach((a) => (a.href = (v === 'machine' ? a.dataset.machineHref : a.dataset.pageHref) + flags()));
    halves.forEach((a) => {
      a.href = address(a.dataset.mode);
      if (a.closest('#boot')) return; // in the boot neither side has been chosen yet
      if (a.dataset.mode === v) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  function swap(v) {
    // Focus inside the reading that is about to be hidden would be lost; hand it to the capsule in the header.
    if (document.activeElement.closest('.view')) $(`.top a[data-mode="${v}"]`).focus();
    sync(v);
    history.replaceState(null, '', address(v));
    $('#status').textContent = v === 'machine' ? 'Machine reading' : 'Human reading';
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
  const PRINTED = '.view-machine :is(.byte, .word, .facts div, .about-file > .rem, .toc li, .listing h2, .row)';
  function toggle() {
    finish(); // a second press finishes the first change before starting its own
    const v = root.dataset.view === 'machine' ? 'page' : 'machine';
    if (!motion || !window.gsap || curtain.classList.contains('on')) return swap(v);

    main.setAttribute('aria-busy', 'true');
    // The tube collapses around the middle of the window, wherever the page is scrolled to.
    const origin = () => gsap.set(main, { transformOrigin: `50% ${innerHeight / 2 - main.getBoundingClientRect().top}px` });
    // Into the machine: the first screenful of the listing, known before it is shown. Back: what is on screen now.
    const lines = v === 'machine' ? $$(PRINTED).slice(0, 90) : $$(PRINTED).filter(onScreen);
    const t = (tl = gsap.timeline({
      onComplete() {
        gsap.set([main, ...lines], { clearProps: 'all' });
        main.removeAttribute('aria-busy');
        tl = null;
        if (v === 'page') double();
      },
    }));
    if (v === 'machine') {
      // The constructed page gives way: its text becomes its own character codes, the picture
      // collapses to a line and goes out, and the listing prints top to bottom.
      const d = dissolve(0.34);
      origin();
      t.add(d.tween)
        .to(main, { scaleY: 0.004, duration: 0.16, ease: 'power2.in' })
        .to(main, { scaleX: 0, duration: 0.1, ease: 'power2.in' })
        .add(() => { d.restore(); swap(v); gsap.set(main, { clearProps: 'all' }); })
        .fromTo(lines, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: { amount: 0.55 } }, '+=0.08');
    } else {
      // Back: the listing clears from the bottom, then the picture opens from a line.
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
  sync(root.dataset.view);
  // The capsule's halves are links to the two static routes; here the same choice happens in place.
  addEventListener('click', (e) => {
    const a = e.target.closest?.('a[data-mode]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
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
    history.replaceState(null, '', address(root.dataset.view));
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

  // ---------- prompt: a few real commands over the real file ----------
  const prompt = $('#prompt'), tty = $('#tty'), cmd = $('#cmd');
  let file = null;
  // The bytes the listing prints, fetched once: xxd and ./file read them, not the page.
  const load = async () => (file ??= new DataView(await (await fetch(prompt.dataset.src)).arrayBuffer()));
  const sections = () => $$('.listing section').map((s) => ({ name: $('h2 span', s).textContent, el: s }));
  const commands = {
    help: () => `ls            the sections of ./${prompt.dataset.file}\ncat SECTION   print one section, for example: cat .projects\nxxd           the whole file as raw bytes\n./${prompt.dataset.file}    run it\nclear         clear this output\nexit          leave the machine reading`,
    ls: () => $$('.toc li').map((li) => `${$('.size', li).textContent.padStart(13)}  ${$('.sec', li).textContent}`).join('\n'),
    cat: (arg) => {
      const s = sections().find((x) => x.name === arg || x.name === `.${arg}`);
      if (!s) return arg ? `cat: ${arg}: no such section. Try ls.` : 'cat: which section? Try ls.';
      return $$('.row .txt', s.el).map((t) => t.textContent.replace(/\s+/g, ' ').trim()).join('\n');
    },
    xxd: async () => {
      const v = await load(), out = [];
      for (let o = 0; o < v.byteLength; o += 16) {
        const b = Array.from({ length: Math.min(16, v.byteLength - o) }, (_, i) => v.getUint8(o + i));
        const hex = b.map((x, i) => x.toString(16).padStart(2, '0') + (i % 2 ? ' ' : '')).join('');
        out.push(`${o.toString(16).padStart(8, '0')}: ${hex.padEnd(40)} ${b.map((x) => (x > 31 && x < 127 ? String.fromCharCode(x) : '.')).join('')}`);
      }
      return out.join('\n');
    },
    run: async () => {
      // What the 33 bytes of code do, read from their own operands: write(1, rip + rel32, edx).
      const v = await load(), text = Number(v.getBigUint64(24, true) - v.getBigUint64(0x50, true));
      const from = text + 17 + v.getInt32(text + 13, true), size = v.getUint32(text + 18, true);
      return new TextDecoder().decode(new Uint8Array(v.buffer, from, size)).trimEnd();
    },
    clear: () => (tty.replaceChildren(), ''),
    exit: () => (toggle(), ''),
  };
  prompt.addEventListener('submit', async (e) => {
    e.preventDefault();
    const line = cmd.value.trim(), [word, arg] = line.split(/\s+/);
    cmd.value = '';
    if (!line) return;
    const fn = word === `./${prompt.dataset.file}` ? commands.run : Object.hasOwn(commands, word) && word !== 'run' ? commands[word] : null;
    let out;
    try { out = fn ? await fn(arg) : `${word}: command not found. Try help.`; } catch { out = `${word}: could not read ./${prompt.dataset.file}`; }
    if (word === 'clear' || word === 'exit') return;
    const pre = document.createElement('pre');
    pre.append(Object.assign(document.createElement('span'), { className: 'echo', textContent: `$ ${line}\n` }), out);
    tty.append(pre);
    cmd.scrollIntoView({ block: 'nearest' });
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
  addEventListener('pagehide', () => { finish(); bootTl?.progress(1); effects.forEach((effect) => effect.progress(1)); });
})();
