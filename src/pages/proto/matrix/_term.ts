/**
 * The live prompt for 機械用. The shell itself is _shell.ts (pure, shared with the build); this
 * file is the tube around it: it prints what the shell returns, keeps a real text field as the
 * command line (history, completion, control keys, a block cursor), and carries out the few
 * things a command can ask of the page (open a link, change the theme, leave, ping, rain, vim).
 * If this file never runs, the recorded session in the markup stays as it is.
 */
import { createShell, isLogo, segs, jaRuns, type Item, type Line, type Seg, type Result, type World, type Vim } from './_shell';

const root = document.documentElement;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const term = $('term'), screen = $('screen'), tty = $('tty'), input = $<HTMLInputElement>('cmd');
const ps = $('ps'), mirror = $('mirror'), cur = $('cur'), where = $('where'), status = $('status');
const world: World = JSON.parse($('mx-world').textContent!);
/** Storage that may be blocked: reads give null, writes are dropped. */
const store = (s: 'localStorage' | 'sessionStorage', key: string, value?: string) => {
  try {
    if (value === undefined) return window[s].getItem(key);
    window[s].setItem(key, value);
  } catch {}
  return null;
};
const saved: unknown = JSON.parse(store('sessionStorage', 'proto-matrix-history') ?? '[]');
const history: string[] = Array.isArray(saved) ? saved.filter((h) => typeof h === 'string') : [];
const shell = createShell(world, { now: () => new Date(), ua: navigator.userAgent, t0: Date.now(), history, rand: Math.random });
const dim = (t: string): Seg => ({ t, c: 'dim' });
/** A foreground process: while one runs there is no prompt, and Ctrl+C stops it. */
let job: { name: string; stop: () => void } | null = null;
let at = history.length, draft = '';

// ---------- printing: the same structure _Out.astro writes for the recorded session ----------
function text(s: string, into: HTMLElement) {
  jaRuns(s).forEach((part, i) => {
    if (i % 2) into.append(Object.assign(document.createElement('span'), { lang: 'ja', textContent: part }));
    else if (part) into.append(part);
  });
}
function line(l: Line) {
  const div = Object.assign(document.createElement('div'), { className: 'ln' });
  for (const s of segs(l)) {
    if (typeof s === 'string') {
      text(s, div);
      continue;
    }
    const node = document.createElement(s.href ? 'a' : s.run ? 'button' : 'span');
    if (s.c) node.className = s.c;
    if (node instanceof HTMLAnchorElement) {
      node.href = s.href!;
      if (!s.href!.startsWith('mailto:')) Object.assign(node, { target: '_blank', rel: 'noopener' });
    } else if (node instanceof HTMLButtonElement) {
      // A command you can tap. Not a tab stop: the log would otherwise grow a tab stop per file name.
      Object.assign(node, { type: 'button', tabIndex: -1 });
      node.classList.add('run');
      node.dataset.run = s.run;
    }
    text(s.t, node);
    div.append(node);
  }
  return div;
}
const bottom = () => (screen.scrollTop = screen.scrollHeight);
function print(items: Item[], into: HTMLElement = tty) {
  for (const item of items) {
    if (!isLogo(item)) {
      into.append(line(item));
      continue;
    }
    // The mark is always the real file, whole and square. It is never drawn out of characters.
    const box = Object.assign(document.createElement('div'), { className: 'fetch' });
    box.append(Object.assign(document.createElement('img'), { className: 'logo', src: world.png.src, width: world.png.px, height: world.png.px, alt: 'wadakatu logo' }));
    if (item.side) {
      const side = Object.assign(document.createElement('div'), { className: 'side' });
      print(item.side, side);
      box.append(side);
    }
    into.append(box);
  }
  while (tty.childElementCount > 500) tty.firstElementChild!.remove(); // scrollback has an end
  bottom();
}
/** The ~/.zshrc neofetch: a <details> on a phone so the prompt has the screen. Typed `neofetch` still prints in the open. */
function loginCard(cmd: string) {
  const r = shell.exec(cmd);
  const card = Object.assign(document.createElement('details'), { className: 'login-card' });
  const sum = document.createElement('summary');
  const role = world.fetch.find((row) => row[0] === 'Role')?.[1];
  sum.append(Object.assign(document.createElement('span'), { className: 'id', textContent: `${world.user}_` }));
  if (role) sum.append(Object.assign(document.createElement('span'), { className: 'role', textContent: role }));
  card.append(sum);
  const line = Object.assign(document.createElement('div'), { className: 'ln echo' });
  line.append(Object.assign(document.createElement('span'), { className: 'ps', ariaHidden: 'true', textContent: shell.prompt() }), ` ${cmd}`);
  card.append(line);
  print(r.out, card);
  tty.append(card);
  if (matchMedia('(min-width: 720px)').matches) card.open = true;
  card.addEventListener('toggle', () => { if (!card.open) bottom(); });
  bottom();
}
function echo(cmd: string, tail = '') {
  const div = Object.assign(document.createElement('div'), { className: 'ln echo' });
  div.append(Object.assign(document.createElement('span'), { className: 'ps', ariaHidden: 'true', textContent: shell.prompt() }), ` ${cmd}${tail}`);
  tty.append(div);
}

// ---------- the command line ----------
/** The block cursor: where the caret is, showing the character under it in reverse. */
function caret() {
  requestAnimationFrame(() => {
    const i = input.selectionStart ?? input.value.length;
    mirror.textContent = input.value.slice(0, i);
    cur.textContent = Array.from(input.value.slice(i))[0] ?? ' ';
    cur.style.transform = `translateX(${mirror.offsetWidth - input.scrollLeft}px)`;
    cur.hidden = input.selectionEnd !== i;
    cur.classList.remove('blink'); // every keystroke starts the five blinks again, then it rests lit
    void cur.offsetWidth;
    cur.classList.add('blink');
  });
}
function refresh() {
  const vim = shell.inVim(), p = shell.prompt();
  ps.hidden = vim || !!job;
  ps.replaceChildren(
    Object.assign(document.createElement('span'), { className: 'ps-who', textContent: p.slice(0, -1) }),
    Object.assign(document.createElement('span'), { className: 'ps-sym', textContent: p.slice(-1) }),
  );
  where.textContent = `0:${vim ? 'vim' : job?.name ?? 'zsh'}* ${job?.name !== 'cmatrix' ? shell.cwd() : root.dataset.motion === 'off' ? 'any key stops the rain (held still: motion is off)' : 'any key stops the rain'}`;
  store('sessionStorage', 'proto-matrix-history', JSON.stringify(history.slice(-200)));
  at = history.length;
  caret();
}
function show(r: Result) {
  print(r.out);
  const fx = r.fx;
  if (fx?.clear) tty.replaceChildren();
  if (fx?.theme && (fx.theme === 'day') !== /day|light/.test(root.dataset.theme ?? '')) $('theme-toggle')?.click();
  if (fx?.palette && (fx.palette === 'operator') !== (root.dataset.palette === 'operator')) $('palette-toggle')?.click();
  // Only a key or a tap may open a window. A command that arrived in the address (?run=) just prints its link.
  if (fx?.open && navigator.userActivation?.isActive) fx.open.startsWith('mailto:') ? (location.href = fx.open) : window.open(fx.open, '_blank', 'noopener');
  if (fx && 'vim' in fx) vimScreen(fx.vim ?? null);
  if (fx?.ping) ping(fx.ping);
  if (fx?.rain) rain();
  if (fx?.boot) location.href = `${root.dataset.pageUrl}?boot=1${root.dataset.palette === 'operator' ? '&palette=operator' : ''}`;
  // Leaving is the header's own 人間用 link, so the change (and its motion) is the page's, not a second copy.
  if (fx?.exit) document.querySelector<HTMLElement>('.top a[data-mode="page"]')?.click();
  refresh();
}
function run(cmd: string, remember = true) {
  if (job) return;
  const n = history.length;
  if (!shell.inVim()) echo(cmd);
  input.value = '';
  const r = shell.exec(cmd);
  if (!remember) history.length = n;
  show(r);
}
function recall(step: number) {
  if (shell.inVim() || job) return;
  const to = Math.min(Math.max(at + step, 0), history.length);
  if (at === history.length) draft = input.value;
  at = to;
  input.value = history[at] ?? draft;
  input.setSelectionRange(input.value.length, input.value.length);
  caret();
}
function tab() {
  const r = shell.complete(input.value);
  if (r.line !== input.value) input.value = r.line;
  else if (r.list.length) {
    echo(input.value);
    print([r.list.join('  ')]);
  }
  caret();
}
function interrupt() {
  if (shell.inVim()) return show(shell.vimKey('C-c'));
  if (job) {
    job.stop();
    return print(['^C']);
  }
  echo(input.value, '^C');
  input.value = draft = '';
  at = history.length;
  bottom();
  caret();
}
const press = (key: string) => (key === 'Tab' ? tab() : key === 'C-c' ? interrupt() : recall(key === 'ArrowUp' ? -1 : 1));

$('prompt').addEventListener('submit', (e) => {
  e.preventDefault();
  run(input.value);
});
let escaped = false;
input.addEventListener('keydown', (e) => {
  if (e.isComposing) return; // the IME owns Enter, Tab and the arrows while it is composing
  const k = e.key, ctrl = e.ctrlKey && !e.metaKey && !e.altKey, was = escaped, end = input.value.length;
  escaped = k === 'Escape';
  if (k === 'Tab') {
    // Tab completes only when there is something to complete. On an empty line, with Shift, or after Escape, focus moves on.
    if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || was || !input.value || input.selectionStart !== end) return;
    e.preventDefault();
    tab();
  } else if (k === 'ArrowUp' || k === 'ArrowDown') {
    e.preventDefault();
    recall(k === 'ArrowUp' ? -1 : 1);
  } else if (k === 'PageUp' || k === 'PageDown') {
    e.preventDefault();
    screen.scrollBy({ top: (k === 'PageUp' ? -0.9 : 0.9) * screen.clientHeight });
  } else if (k === 'Escape' && shell.inVim()) {
    input.value = '';
    show(shell.vimKey('Esc'));
  } else if (ctrl && k === 'c') {
    // Where Ctrl+C copies (Windows, Linux), a selection still copies. With nothing selected it interrupts.
    if (input.selectionStart !== input.selectionEnd || String(getSelection())) return;
    e.preventDefault();
    interrupt();
  } else if (ctrl && k === 'l') {
    e.preventDefault();
    if (!shell.inVim()) tty.replaceChildren();
  } else if (ctrl && k === 'u') {
    e.preventDefault();
    input.value = input.value.slice(input.selectionStart ?? 0);
    input.setSelectionRange(0, 0);
  } else if (ctrl && (k === 'a' || k === 'e')) {
    e.preventDefault();
    input.setSelectionRange(k === 'a' ? 0 : end, k === 'a' ? 0 : end);
  } else if (ctrl && k === 'd' && !input.value && !shell.inVim()) {
    e.preventDefault();
    run('exit', false);
  }
  caret();
});
input.addEventListener('input', (e) => {
  // In vim, keys outside its command line act at once, the way they do there.
  if (shell.inVim() && !(e as InputEvent).isComposing && !input.value.startsWith(':')) {
    const keys = Array.from(input.value);
    input.value = '';
    for (const k of keys) if (shell.inVim()) show(shell.vimKey(k));
  }
  caret();
});
for (const type of ['keyup', 'click', 'focus', 'blur', 'select']) input.addEventListener(type, caret);
document.addEventListener('selectionchange', () => document.activeElement === input && caret());

// Taps: suggested commands, the key row for keyboards without Tab or arrows, and file names in the output.
term.addEventListener('mousedown', (e) => {
  // Keep focus (and a phone's keyboard) where it is.
  if ((e.target as Element).closest('[data-run], [data-key]')) e.preventDefault();
});
term.addEventListener('click', (e) => {
  const t = e.target as Element, b = t.closest<HTMLElement>('[data-run], [data-key]');
  if (b?.dataset.key) press(b.dataset.key);
  else if (b) run(b.dataset.run!);
  // A click on the screen itself is a click into the terminal, unless it was the end of selecting text.
  else if (!t.closest('a, button, input') && getSelection()?.isCollapsed) input.focus({ preventScroll: true });
});

// ---------- what commands can ask of the page ----------
function vimScreen(v: Vim | null) {
  screen.classList.toggle('vim-on', !!v);
  $('vim').hidden = !v;
  if (!v) return bottom();
  if (!$('vim-buf').dataset.on) status.textContent = 'vim. Type colon q and press Enter to leave.';
  $('vim-buf').dataset.on = '1';
  $('vim-buf').replaceChildren(v.lines.map((l) => l + '\n').join(''), Object.assign(document.createElement('span'), { className: 'dim', textContent: '~\n'.repeat(60) }));
  $('vim-msg').textContent = v.msg;
}
const wait = (ms: number, signal: AbortSignal) => new Promise<void>((done, fail) => {
  const t = setTimeout(done, ms);
  signal.addEventListener('abort', () => (clearTimeout(t), fail(signal.reason)));
});
/** ping, as far as a browser can: four timed HTTP requests to the origin this page came from. */
async function ping(host: string) {
  const site = world.site.replace(/^https?:\/\//, ''), here = location.host;
  if (![location.hostname, here, 'localhost', site, site.replace(/^www\./, '')].includes(host)) {
    return print([`ping: ${host}: not this origin. A browser tab only reaches the site it is on.`, [dim('Try '), { t: `ping ${site}`, run: `ping ${site}` }]]);
  }
  const ctl = new AbortController(), times: number[] = [];
  let sent = 0;
  job = { name: 'ping', stop: () => ctl.abort() };
  refresh();
  print([`PING ${here}: HTTP HEAD, because a browser cannot send ICMP`]);
  try {
    for (let seq = 1; seq <= 4; seq++) {
      sent++;
      const t = performance.now();
      const res = await fetch('/images/favicon.ico', { method: 'HEAD', cache: 'no-store', signal: ctl.signal });
      times.push(performance.now() - t);
      print([`${res.status} from ${here}: seq=${seq} time=${times.at(-1)!.toFixed(1)} ms`]);
      if (seq < 4) await wait(1000, ctl.signal);
    }
  } catch {
    if (!ctl.signal.aborted) print([`ping: ${here}: no answer`]);
  }
  const ms = (n: number) => n.toFixed(1);
  print(['', `--- ${here} ping statistics ---`, `${sent} requests sent, ${times.length} answered`,
    ...(times.length ? [`round-trip min/avg/max = ${ms(Math.min(...times))}/${ms(times.reduce((a, b) => a + b) / times.length)}/${ms(Math.max(...times))} ms`] : [])]);
  job = null;
  refresh();
}
/** cmatrix: the page's own rain (every drop a piece of a real phrase) over the whole tube, until a key. */
function rain() {
  const stop = (e?: Event) => {
    e?.preventDefault();
    root.classList.remove('cmatrix');
    removeEventListener('keydown', stop, true);
    removeEventListener('pointerdown', stop, true);
    job = null;
    refresh();
  };
  job = { name: 'cmatrix', stop };
  root.classList.add('cmatrix');
  status.textContent = root.dataset.motion === 'off' ? 'Rain, held still because motion is off. Press any key to stop.' : 'Rain. Press any key to stop.';
  addEventListener('keydown', stop, true);
  addEventListener('pointerdown', stop, true);
}

// ---------- the window: one viewport, also when a phone's keyboard takes half of it ----------
const vv = window.visualViewport;
function fit() {
  if (!vv) return;
  const h = vv.height * vv.scale; // pinch zoom changes height and scale together; a keyboard changes height alone
  root.style.setProperty('--vvh', `${h}px`);
  root.classList.toggle('kb', h < window.innerHeight - 120);
  if (root.dataset.view === 'machine') {
    scrollTo(0, 0);
    bottom();
  }
}
vv?.addEventListener('resize', fit);
vv?.addEventListener('scroll', fit);
const clock = () => ($('jst').textContent = `${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' }).format(new Date())} JST`);
setInterval(clock, 20000);

// ---------- log in ----------
const arrive = () => {
  fit();
  bottom();
  // Ready to type, but a phone should show the screen before its keyboard.
  if (matchMedia('(pointer: fine)').matches) input.focus({ preventScroll: true });
};
addEventListener('mx:view', (e) => (e as CustomEvent).detail === 'machine' && arrive());

const last = store('localStorage', 'proto-matrix-login');
store('localStorage', 'proto-matrix-login', shell.stamp());
tty.replaceChildren();
print(shell.motd(last));
if (term.dataset.cwd) shell.cd(term.dataset.cwd);
// The first command is the one ~/.zshrc ends with, or whatever the address asked for. Neither is something you typed.
const first = (new URLSearchParams(location.search).get('run') ?? term.dataset.first!).slice(0, 200);
if (first === 'neofetch' && !new URLSearchParams(location.search).has('run')) loginCard(first);
else run(first, false);
refresh(); // loginCard does not go through run(); the prompt still has to be drawn
tty.setAttribute('role', 'log'); // from here on, new output is announced
clock();
root.classList.add('term');
root.classList.remove('term-off'); // a shell that arrives late still gets its one viewport
if (root.dataset.view === 'machine') arrive();
