/**
 * 機械用's shell. Pure: no DOM and no Node, so the build runs it to print the recorded session
 * (what a reader without JavaScript gets) and the browser runs the same code behind the live
 * prompt. Every fact comes in through `World`, which _world.ts builds from the data files.
 * Commands return lines of segments, never markup: typed input only reaches the page as text.
 */
export type Seg = string | { t: string; c?: string; href?: string; run?: string };
export type Line = Seg | Seg[];
/** The mark: the real image file, optionally with lines set beside it (neofetch). */
export type Logo = { logo: true; side?: Line[] };
export type Item = Line | Logo;
export type FileNode = { text: string; bin?: 'elf' | 'png'; live?: 'history'; size?: number; href?: string; date?: string; note?: string };
export type DirNode = { dir: Record<string, Node> };
export type Node = DirNode | FileNode;
export interface World {
  user: string;
  host: string;
  site: string;
  repo: string;
  who: string;
  motto: string;
  root: DirNode;
  links: Record<string, string>;
  commits: { s: string; h?: string; H?: string; d?: string }[];
  fetch: [key: string, value: string, href?: string][];
  elf: { b64: string; kind: string; asm: { addr: string; hex: string; text: string; note: string }[] };
  png: { b64: string; kind: string; size: number; src: string; px: number; credit: string; creditUrl: string };
}
export type Vim = { name: string; lines: string[]; msg: string };
/** What a command asks the page to do. The shell itself touches nothing. */
export type Fx = { open?: string; exit?: boolean; clear?: boolean; theme?: string; palette?: string; ping?: string; rain?: boolean; boot?: boolean; vim?: Vim | null };
export type Result = { out: Item[]; fx?: Fx };
export interface Env { now: () => Date; ua: string; t0: number; history: string[]; rand: () => number }

export const isLogo = (i: Item): i is Logo => typeof i === 'object' && !Array.isArray(i) && 'logo' in i;
export const segs = (l: Line): Seg[] => (Array.isArray(l) ? l : [l]);
export const plain = (l: Line) => segs(l).map((s) => (typeof s === 'string' ? s : s.t)).join('');
/** Text split so runs of Japanese can carry lang="ja": [latin, japanese, latin, ...]. */
export const jaRuns = (s: string) => s.split(/([　-ヿ㐀-鿿＀-￯]+)/);

const flat = (items: Item[]): Line[] => items.flatMap((i) => (isLogo(i) ? i.side ?? [] : [i]));
const dim = (t: string): Seg => ({ t, c: 'dim' });
const hi = (t: string): Seg => ({ t, c: 'hi' });
const run = (t: string, cmd = t, c?: string): Seg => ({ t, run: cmd, c });
const own = <T,>(o: Record<string, T>, k: string): T | undefined => (Object.hasOwn(o, k) ? o[k] : undefined);
const enc = new TextEncoder();
const num = (n: number) => n.toLocaleString('en-US');
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const literal = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function dist(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return row[b.length];
}

/** The listed commands: name, synopsis, what it is for. `help` and `man` both read this. */
const HELP: [string, string, string][] = [
  ['whoami', 'whoami', 'who this is'],
  ['about', 'about', 'the short version'],
  ['ls', 'ls [-la] [DIR]', 'list files. Also: cd, pwd, tree'],
  ['cat', 'cat FILE...', 'print files. Also: head, tail, grep, wc, sort'],
  ['projects', 'projects', 'what he builds'],
  ['posts', 'posts', 'what he writes'],
  ['open', 'open NAME', 'open a real link in a new tab'],
  ['contact', 'contact', 'email, GitHub, X'],
  ['skills', 'skills', 'one per line'],
  ['neofetch', 'neofetch', 'the card from login'],
  ['logo', 'logo', 'the mark'],
  ['git', 'git log [--oneline] [-n N]', "this site's real commits"],
  ['xxd', 'xxd [-l N] FILE', 'hex dump'],
  ['theme', 'theme day|night', 'the same screen in daylight'],
  ['palette', 'palette operator|phosphor', 'amber or green'],
  ['history', 'history', 'what you typed'],
  ['man', 'man COMMAND', 'the manual'],
  ['clear', 'clear', 'or Ctrl+L'],
  ['exit', 'exit', 'back to 人間用'],
];
const MAN: Record<string, string[]> = {
  vim: ['vim - a text editor people enter by accident', 'To leave: type :q! and press Enter.', 'This page exists because you will need it.'],
  sudo: ['sudo - run a command as someone you are not', 'You are not in the sudoers file.'],
  rm: ['rm - remove files', 'Not here. The file system is read-only: this site is static files.'],
  man: ['man - the manual', 'You are reading it. It is short.'],
};
const ALIASES: Record<string, string> = {
  about: 'cat ~/about.txt',
  skills: 'cat ~/skills.txt',
  contact: 'cat ~/contact.txt',
  links: 'cat ~/contact.txt',
  projects: 'ls -l ~/projects',
  posts: 'ls -l ~/posts',
  blog: 'ls -l ~/posts',
  logo: 'cat ~/logo.png',
  ll: 'ls -la',
  la: 'ls -a',
  vi: 'vim',
  nvim: 'vim',
  matrix: 'cmatrix',
  logout: 'exit',
  quit: 'exit',
};
/** What ~/.zshrc says, generated from the alias table the shell really uses. */
export const zshrc = ['# ~/.zshrc', 'export EDITOR=vim', ...Object.entries(ALIASES).map(([k, v]) => `alias ${k}='${v}'`), '', 'neofetch'].join('\n') + '\n';

export function createShell(w: World, env: Env) {
  const HOME = ['home', w.user];
  let cwd: string[] = [];
  let vim: (Vim & { tries: number; insert: boolean; z: boolean }) | null = null;

  // ---------- the file system: one read-only tree under ~ ----------
  const isDir = (n?: Node | null): n is DirNode => !!n && 'dir' in n;
  const at = (p: string[]) => p.reduce<Node | undefined>((n, k) => (isDir(n) ? own(n.dir, k) : undefined), w.root);
  /** A typed path as segments under ~, or null when it points outside. */
  const resolve = (p: string): string[] | null => {
    const abs = p.startsWith('/') ? [] : p === '~' || p.startsWith('~/') ? [...HOME] : [...HOME, ...cwd];
    for (const part of p.replace(/^~/, '').split('/')) {
      if (part === '..') abs.pop();
      else if (part && part !== '.') abs.push(part);
    }
    return abs[0] === HOME[0] && abs[1] === HOME[1] ? abs.slice(2) : null;
  };
  const tilde = (p: string[]) => ['~', ...p].join('/');
  const prompt = () => `${w.user}@${w.host}:${tilde(cwd)}$`;
  const textOf = (n: FileNode) => (n.live ? env.history.map((h) => h + '\n').join('') : n.text);
  const linesOf = (n: FileNode) => textOf(n).replace(/\n$/, '').split('\n');
  /** A file's lines for printing. The history file holds what the reader typed, so nothing in it becomes a link. */
  const printed = (n: FileNode): Line[] => (n.live ? linesOf(n) : linesOf(n).map(linkify));
  const bytesOf = (n: FileNode) => (n.bin ? unb64(w[n.bin].b64) : enc.encode(textOf(n)));
  const sizeOf = (n: FileNode) => n.size ?? enc.encode(textOf(n)).length;
  const fileAt = (p: string, cmd: string): FileNode | string => {
    const r = resolve(p), n = r && at(r);
    if (!r) return `${cmd}: ${p}: Permission denied`;
    if (!n) return `${cmd}: ${p}: No such file or directory`;
    return isDir(n) ? `${cmd}: ${p}: Is a directory` : n;
  };
  const walk = (d: DirNode, base: string): [string, FileNode][] =>
    Object.entries(d.dir).flatMap(([k, n]) => (isDir(n) ? walk(n, `${base}${k}/`) : [[base + k, n] as [string, FileNode]]));

  /** Addresses and URLs in file text become real links. Posts on this site (and their pages in this prototype) stay relative, so they work on any host. */
  const href = (s: string) => (s.includes('@') && !s.includes('/') ? `mailto:${s}` : /^\/(blog|proto)\//.test(s.slice(w.site.length)) && s.startsWith(w.site) ? s.slice(w.site.length) : s);
  const linkify = (s: string): Line => {
    const parts = s.split(/(https?:\/\/[^\s)"]*[^\s)".,]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/);
    return parts.length === 1 ? s : parts.map((p, i): Seg => (i % 2 ? { t: p, href: href(p) } : p)).filter((p) => p !== '');
  };
  /** The lines a filter works on: the named files, or whatever was piped in. */
  const source = (cmd: string, paths: string[], stdin: Line[] | null): Line[] =>
    paths.length
      ? paths.flatMap((p): Line[] => {
          const f = fileAt(p, cmd);
          return typeof f === 'string' ? [f] : f.bin ? [`${cmd}: ${p}: binary file`] : printed(f);
        })
      : stdin ?? [];
  const count = (args: string[], fallback: number) => {
    const i = args.findIndex((a) => /^-(n?\d+|n)$/.test(a));
    if (i < 0) return { n: fallback, rest: args };
    const inline = args[i].replace(/^-n?/, '');
    return { n: +(inline || args[i + 1]) || 0, rest: args.filter((_, j) => j !== i && (inline || j !== i + 1)) };
  };

  // ---------- listings ----------
  const entryRun = (path: string, n: Node) => (isDir(n) ? `ls -l ${path}` : n.bin === 'elf' ? `file ${path}` : `cat ${path}`);
  const entryName = (name: string, n: Node) => name + (isDir(n) ? '/' : n.bin === 'elf' ? '*' : '');
  type Entry = [path: string, name: string, node: Node];
  const longRows = (list: Entry[]): Line[] => {
    const size = (n: Node) => (isDir(n) ? '-' : num(sizeOf(n)));
    const wide = Math.max(...list.map(([, , n]) => size(n).length));
    const dated = list.some(([, , n]) => !isDir(n) && n.date);
    return list.map(([path, name, n]): Line => [
      dim(`${isDir(n) ? 'drwxr-xr-x' : n.bin === 'elf' ? '-rwxr-xr-x' : '-rw-r--r--'}  ${size(n).padStart(wide)}  ${dated ? `${(!isDir(n) && n.date) || ''}`.padEnd(12) : ''}`),
      run(entryName(name, n), entryRun(path, n), isDir(n) ? 'dir' : undefined),
      ...(!isDir(n) && n.note ? [n.href && n.date ? ({ t: n.note, href: n.href, c: 'note' } as Seg) : ({ t: n.note, c: 'dim note' } as Seg)] : []),
    ]);
  };

  // ---------- vim: you can get in. Getting out is the exercise. ----------
  const SPLASH = ['', '', '        VIM - Vi IMproved', '        (more or less: this is a web page)', '', '        type  :q<Enter>      to exit', '        type  :help<Enter>   for help'];
  const screen = (): Fx => ({ vim: vim && { name: vim.name, lines: vim.lines, msg: vim.msg } });
  function vimOpen(arg?: string): Result {
    let lines = SPLASH, msg = '';
    if (arg) {
      const r = resolve(arg), n = r && at(r);
      const readable = n && !isDir(n) && !n.bin;
      lines = readable ? linesOf(n) : [];
      msg = readable ? `"${arg}" [readonly] ${lines.length}L, ${sizeOf(n)}B` : isDir(n) ? `"${arg}" is a directory` : n ? `"${arg}" [readonly][noeol] binary` : `"${arg}" [New]`;
    }
    vim = { name: arg ?? '', lines, msg, tries: 0, insert: false, z: false };
    return { out: [], fx: screen() };
  }
  function vimQuit(): Result {
    const tries = vim!.tries + 1;
    vim = null;
    return { out: [dim(tries === 1 ? 'vim: left on the first try. Respect.' : `vim: left on attempt ${tries}.`)], fx: { vim: null } };
  }
  /** A line typed at vim's command line. */
  function vimLine(input: string): Result {
    const c = input.trim();
    if (/^:(q|qa|wq|x|quit|exit)!?$/.test(c)) return vimQuit();
    vim!.tries++;
    vim!.msg = !c.startsWith(':') ? ''
      : /^:w!/.test(c) ? "E212: Can't open file for writing"
      : /^:w/.test(c) ? "E45: 'readonly' option is set (add ! to override)"
      : /^:h(elp)?$/.test(c) ? 'help: type  :q!  and press Enter. That is the whole trick.'
      : `E492: Not an editor command: ${c.slice(1)}`;
    if (vim!.tries >= 3 && !/^:h/.test(c)) vim!.msg += '     (psst: :q! then Enter)';
    return { out: [], fx: screen() };
  }
  /** A key pressed in vim outside its command line: 'Esc', 'C-c', or one character. */
  function vimKey(k: string): Result {
    const v = vim!;
    if (k === 'Esc') Object.assign(v, { insert: false, z: false, msg: '' });
    else if (k === 'C-c') Object.assign(v, { insert: false, tries: v.tries + 1, msg: 'Type  :qa!  and press <Enter> to abandon all changes and exit Vim' });
    else if (v.insert) v.msg = "E21: Cannot make changes, 'modifiable' is off";
    else if (k === 'Z' && v.z) return vimQuit();
    else if (k === 'Z') v.z = true;
    else if ('iIaAoO'.includes(k)) Object.assign(v, { insert: true, msg: '-- INSERT --' });
    return { out: [], fx: screen() };
  }

  /** The time in Japan, the way `date` prints it. */
  const stamp = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', year: 'numeric' }).formatToParts(env.now()).map((x) => [x.type, x.value]));
    return `${p.weekday} ${p.month} ${p.day.padStart(2)} ${p.hour}:${p.minute}:${p.second} JST ${p.year}`;
  };

  // ---------- commands ----------
  type Cmd = (args: string[], stdin: Line[] | null) => Item[] | Result;
  const paths = (args: string[]) => args.filter((a) => !a.startsWith('-'));
  const flags = (args: string[]) => args.filter((a) => /^-[a-zA-Z]+$/.test(a)).join('');
  const readOnly = (cmd: string): Cmd => (args) => {
    const p = paths(args).at(-1);
    return [p ? `${cmd}: ${p}: Read-only file system` : `${cmd}: missing operand`];
  };
  const staticHost = dim('(GitHub Pages serves static files. Nothing is listening.)');
  const cmds: Record<string, Cmd> = {
    help: () => [
      'Commands you can actually run:',
      '',
      ...HELP.map(([name, usage, what]): Line => ['  ', run(name), usage.slice(name.length).padEnd(27 - name.length), { t: what, c: 'dim note' }]),
      '',
      [dim('Pipes work: '), run('git log --oneline | grep fix | wc -l')],
      dim('Tab completes. Up and Down recall. Ctrl+C cancels. Ctrl+L clears.'),
      dim('Not everything is listed.'),
    ],
    whoami: () => [w.user, dim(w.who), [dim('more: '), run('about'), dim(', '), run('neofetch')]],
    hostname: () => [w.host],
    pwd: () => ['/' + [...HOME, ...cwd].join('/')],
    cd: ([p = '~']) => {
      const r = resolve(p), n = r && at(r);
      if (!r) return [`cd: permission denied: ${p}`];
      if (!isDir(n)) return [`cd: ${n ? 'not a directory' : 'no such file or directory'}: ${p}`];
      cwd = r;
      return [];
    },
    ls: (args) => {
      const f = flags(args), list = paths(args);
      return (list.length ? list : ['.']).flatMap((p): Item[] => {
        const r = resolve(p), n = r && at(r);
        if (!r) return [`ls: ${p}: Permission denied`];
        if (!n) return [`ls: ${p}: No such file or directory`];
        const base = p === '.' ? '' : p.replace(/\/?$/, '/');
        const entries: Entry[] = isDir(n)
          ? Object.entries(n.dir).filter(([k]) => f.includes('a') || !k.startsWith('.')).map(([k, v]) => [base + k, k, v])
          : [[p, p, n]];
        const head = list.length > 1 && isDir(n) ? [dim(`${p}:`)] : [];
        if (f.includes('l')) return [...head, ...longRows(entries)];
        return [...head, entries.flatMap(([path, name, v], i): Seg[] => [...(i ? ['  '] : []), run(entryName(name, v), entryRun(path, v), isDir(v) ? 'dir' : undefined)])];
      });
    },
    tree: (args) => {
      const p = paths(args)[0] ?? '.', r = resolve(p), n = r && at(r);
      if (!isDir(n)) return [`tree: ${p}: ${r ? 'not a directory' : 'Permission denied'}`];
      let dirs = 0, files = 0;
      const rows = (d: DirNode, base: string, pad: string): Line[] =>
        Object.entries(d.dir).filter(([k]) => !k.startsWith('.')).flatMap(([k, v], i, all): Line[] => {
          const last = i === all.length - 1;
          isDir(v) ? dirs++ : files++;
          const row: Line = [dim(pad + (last ? '└── ' : '├── ')), run(entryName(k, v), entryRun(base + k, v), isDir(v) ? 'dir' : undefined)];
          return isDir(v) ? [row, ...rows(v, `${base}${k}/`, pad + (last ? '    ' : '│   '))] : [row];
        });
      const body = rows(n, p === '.' ? '' : p.replace(/\/?$/, '/'), '');
      return [p, ...body, '', `${dirs} directories, ${files} files`];
    },
    cat: (args, stdin) => {
      if (!args.length) return stdin ?? ['cat: which file? Try ls.'];
      return args.flatMap((p): Item[] => {
        const f = fileAt(p, 'cat');
        if (typeof f === 'string') return [f];
        if (f.bin === 'png') return [{ logo: true }, [dim(`${p}: ${w.png.kind}. `), { t: w.png.credit, href: w.png.creditUrl }]];
        if (f.bin) return [`cat: ${p}: binary file. It is a real program:`, ['  ', run(`file ${p}`), '   ', run(`xxd ${p} | head`), '   ', run(`objdump -d ${p}`), '   ', run(`./${p}`)]];
        return printed(f);
      });
    },
    head: (args, stdin) => {
      const { n, rest } = count(args, 10);
      return source('head', rest, stdin).slice(0, n);
    },
    tail: (args, stdin) => {
      const { n, rest } = count(args, 10);
      return n ? source('tail', rest, stdin).slice(-n) : [];
    },
    sort: (args, stdin) => {
      const out = [...source('sort', paths(args), stdin)].sort((a, b) => plain(a).localeCompare(plain(b)));
      return flags(args).includes('r') ? out.reverse() : out;
    },
    uniq: (args, stdin) => source('uniq', paths(args), stdin).filter((l, i, all) => !i || plain(l) !== plain(all[i - 1])),
    wc: (args, stdin) => {
      const f = flags(args), list = paths(args);
      const row = (lines: Line[], name: string) => {
        const text = lines.map(plain);
        const all = { l: lines.length, w: text.join(' ').split(/\s+/).filter(Boolean).length, c: enc.encode(text.map((t) => t + '\n').join('')).length };
        const picked = (['l', 'w', 'c'] as const).filter((k) => !f || f.includes(k)).map((k) => String(all[k]).padStart(8)).join('');
        return `${picked}${name && ' ' + name}`;
      };
      if (!list.length) return stdin ? [row(stdin, '')] : ['usage: wc [-lwc] FILE...'];
      return list.map((p) => {
        const file = fileAt(p, 'wc');
        return typeof file === 'string' ? file : row(file.bin ? [] : linesOf(file), p);
      });
    },
    grep: (args, stdin) => {
      const f = flags(args), [pat, ...list] = args.filter((a) => !/^-[a-zA-Z]+$/.test(a));
      if (pat === undefined) return ['usage: grep [-cinrv] PATTERN [FILE...]'];
      let re: RegExp;
      try { re = new RegExp(pat, f.includes('i') ? 'gi' : 'g'); } catch { re = new RegExp(literal(pat), f.includes('i') ? 'gi' : 'g'); }
      const sources: [string, Line[]][] = [];
      if (list.length || f.includes('r')) {
        for (const p of list.length ? list : ['.']) {
          const r = resolve(p), n = r && at(r);
          if (isDir(n) && f.includes('r')) walk(n, p === '.' ? '' : p.replace(/\/?$/, '/')).forEach(([path, file]) => file.bin || sources.push([path, linesOf(file)]));
          else sources.push([p, source('grep', [p], null)]);
        }
      } else if (stdin) sources.push(['', stdin]);
      else return ['usage: grep [-cinrv] PATTERN [FILE...]'];
      const named = sources.length > 1;
      return sources.flatMap(([name, lines]): Line[] => {
        const hits = lines.flatMap((line, i): Line[] => {
          const text = plain(line), found = [...text.matchAll(re)].filter((m) => m[0]);
          if (!!found.length === f.includes('v')) return [];
          const out: Seg[] = [...(named ? [dim(`${name}:`)] : []), ...(f.includes('n') ? [dim(`${i + 1}:`)] : [])];
          let end = 0;
          for (const m of found) {
            out.push(text.slice(end, m.index), hi(m[0]));
            end = m.index! + m[0].length;
          }
          return [[...out, text.slice(end)].filter((s) => s !== '')];
        });
        return f.includes('c') ? [`${named ? `${name}:` : ''}${hits.length}`] : hits;
      });
    },
    echo: (args) => [args.join(' ')],
    history: () => env.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`),
    alias: () => Object.entries(ALIASES).map(([k, v]) => `${k}='${v}'`),
    which: (args) => args.map((a) => (own(ALIASES, a) ? `${a}: aliased to ${ALIASES[a]}` : own(cmds, a) ? `${a}: shell built-in command` : `${a} not found`)),
    date: () => [stamp()],
    uptime: () => [`up ${Math.floor((env.now().getTime() - env.t0) / 60000)} min, 1 user (you, in this tab)`],
    uname: (args) => [flags(args).includes('a') ? `Web ${w.host} ${env.ua}` : 'Web'],
    neofetch: () => [{
      logo: true,
      side: [
        [hi(w.user), '@', hi(w.host)],
        dim('-'.repeat(w.user.length + w.host.length + 1)),
        ...w.fetch.map(([k, v, to]): Line => [hi(k.padEnd(10)), to ? { t: v, href: to } : v]),
        '',
        Array.from({ length: 8 }, (_, i): Seg => ({ t: '   ', c: `sw sw${i}` })),
      ],
    }],
    open: ([name]) => {
      const names = Object.keys(w.links);
      if (!name) return ['usage: open NAME', [dim('names: '), ...names.flatMap((k, i): Seg[] => [...(i ? [' '] : []), run(k, `open ${k}`)])], dim('or a file: open projects/tombo.md')];
      const r = resolve(name), n = r && at(r);
      const to = own(w.links, name.toLowerCase()) ?? (n && !isDir(n) ? n.href : undefined);
      if (!to) return [`open: ${name}: nothing to open. Try: open github`];
      return { out: [[dim('opening '), { t: to.startsWith('/') ? w.site + to : to.replace(/^mailto:/, ''), href: to }]], fx: { open: to } };
    },
    git: ([sub, ...rest]) => {
      if (sub === 'log') {
        const { n, rest: other } = count(rest, 0), short = other.includes('--oneline');
        const list = w.commits.slice(0, n || (short ? undefined : 10));
        if (short) return list.map((c): Line => [...(c.h ? [hi(c.h), ' '] : []), c.s]);
        return [
          ...list.flatMap((c): Line[] => [[hi(`commit ${c.H ?? '(hash not in this build)'}`)], `Author: ${w.user}`, ...(c.d ? [`Date:   ${c.d}`] : []), '', `    ${c.s}`, '']),
          ...(list.length < w.commits.length && !n ? [[dim(`${w.commits.length - list.length} more: `), run('git log --oneline')] as Line] : []),
        ];
      }
      if (sub === 'status') return ['On branch main', 'nothing to commit, working tree clean', dim('(It stays clean. Everything here is read-only.)')];
      if (sub === 'push') return [...(rest.some((a) => /^(-f|--force)/.test(a)) ? [dim(env.now().getDay() === 5 ? '--force, on a Friday?' : '--force? Bold.')] : []), `remote: Permission to ${w.repo} denied to visitor.`, `fatal: unable to access 'https://github.com/${w.repo}/': The requested URL returned error: 403`];
      if (sub === 'blame') return ['It was like that when I got here.'];
      if (sub === 'commit' || sub === 'add') return ['fatal: Unable to create index.lock: Read-only file system'];
      if (!sub) return ['usage: git log [--oneline] [-n N]'];
      return [`git: '${sub}' is not a git command here. See 'git log'.`];
    },
    man: ([name]) => {
      if (!name) return ['What manual page do you want?', [dim('For example, try '), run('man vim')]];
      const h = HELP.find(([n]) => n === name), extra = own(MAN, name);
      if (!h && !extra) return [`No manual entry for ${name}`];
      return [
        [hi(`${name.toUpperCase()}(1)`)], '',
        [hi('NAME')], `    ${extra ? extra[0] : `${name} - ${h![2]}`}`,
        ...(h ? ['', [hi('SYNOPSIS')], `    ${h[1]}`] : []),
        ...(own(ALIASES, name) ? ['', [hi('ALIAS')], `    ${ALIASES[name]}`] : []),
        ...(extra ? ['', [hi('DESCRIPTION')], ...extra.slice(1).map((l) => `    ${l}`)] : []),
      ];
    },
    xxd: (args, stdin) => {
      const i = args.indexOf('-l'), limit = i < 0 ? Infinity : +args[i + 1] || 0;
      const p = args.filter((a, j) => i < 0 || (j !== i && j !== i + 1))[0];
      let b: Uint8Array, more = 0;
      if (p) {
        const f = fileAt(p, 'xxd');
        if (typeof f === 'string') return [f];
        b = bytesOf(f);
        more = sizeOf(f) - b.length; // the picture is not carried whole: only its first bytes are in the page
      } else if (stdin) b = enc.encode(stdin.map((l) => plain(l) + '\n').join(''));
      else return ['usage: xxd [-l N] FILE'];
      const cut = b.slice(0, limit), out: Line[] = [];
      for (let o = 0; o < cut.length; o += 16) {
        const row = Array.from(cut.slice(o, o + 16));
        out.push([dim(`${o.toString(16).padStart(8, '0')}: `), row.map((x, k) => x.toString(16).padStart(2, '0') + (k % 2 ? ' ' : '')).join('').padEnd(41), row.map((x) => (x > 31 && x < 127 ? String.fromCharCode(x) : '.')).join('')]);
      }
      if (more && limit > b.length) out.push([dim(`… ${num(more)} more bytes: the picture itself. `), run(`cat ${p}`), dim(' shows it.')]);
      return out;
    },
    file: (args) => (args.length ? args : ['']).map((p) => {
      const r = resolve(p), n = r && at(r);
      if (!p) return 'usage: file FILE...';
      if (!n) return `${p}: cannot open (${r ? 'No such file or directory' : 'Permission denied'})`;
      return `${p}: ${isDir(n) ? 'directory' : n.bin ? w[n.bin].kind : /[^\x00-\x7f]/.test(textOf(n)) ? 'Unicode text, UTF-8 text' : 'ASCII text'}`;
    }),
    objdump: (args) => {
      const p = paths(args)[0], f = p ? fileAt(p, 'objdump') : 'usage: objdump -d FILE';
      if (typeof f === 'string') return [f];
      if (f.bin !== 'elf') return [`objdump: ${p}: file format not recognized`];
      return [`${p}:     file format elf64-x86-64`, '', 'Disassembly of section .text:', '', ...w.elf.asm.map((a): Line => [dim(`  ${a.addr}:  `), a.hex.padEnd(23), hi(a.text.padEnd(22)), dim(`; ${a.note}`)])];
    },
    theme: ([t]) => (t === 'day' || t === 'night' ? { out: [], fx: { theme: t } } : ['usage: theme day|night']),
    palette: ([p]) => (p === 'operator' || p === 'phosphor' ? { out: [], fx: { palette: p } } : ['usage: palette operator|phosphor']),
    clear: () => ({ out: [], fx: { clear: true } }),
    exit: () => ({ out: [], fx: { exit: true } }),
    reboot: () => ({ out: [dim('rebooting…')], fx: { boot: true } }),
    ping: ([host]) => (host ? { out: [], fx: { ping: host } } : ['usage: ping HOST']),
    cmatrix: () => ({ out: [], fx: { rain: true } }),
    vim: (args) => vimOpen(paths(args)[0]),

    // ---------- not listed ----------
    sudo: () => [`${w.user} is not in the sudoers file.`, 'This incident will be reported.'],
    rm: (args) => {
      const list = paths(args);
      if (!list.length) return ['rm: missing operand'];
      if (!list.some((p) => p === '/' || p === '/*') || !args.some((a) => /^-[a-zA-Z]*[rR]|^--recursive$/.test(a))) return list.map((p) => `rm: cannot remove '${p}': Read-only file system`);
      if (!args.includes('--no-preserve-root')) return ["rm: it is dangerous to operate recursively on '/'", 'rm: use --no-preserve-root to override this failsafe'];
      const all = walk(w.root, `/${HOME.join('/')}/`);
      return [...all.slice(0, 6).map(([p]) => `rm: cannot remove '${p}': Read-only file system`), dim(`… and ${all.length - 6} more. Everything is still here: this is a static site.`)];
    },
    ...Object.fromEntries(['touch', 'mkdir', 'mv', 'cp', 'chmod', 'chown', 'ln'].map((c) => [c, readOnly(c)])),
    emacs: () => ['zsh: command not found: emacs', [dim('(vim is installed. Read '), run('man vim'), dim(' first.)')]],
    nano: () => ['zsh: command not found: nano', [dim('(vim is installed. Read '), run('man vim'), dim(' first.)')]],
    ssh: ([host = w.host]) => [`ssh: connect to host ${host} port 22: Connection refused`, staticHost],
    curl: () => ['curl: you are already inside a browser.', [dim('Try '), run('open'), dim('.')]],
    wget: () => cmds.curl([], null),
    top: () => ['top: one process, this tab. It is behaving.'],
    htop: () => cmds.top([], null),
    docker: () => ['Cannot connect to the Docker daemon. Is the docker daemon running?', dim('(No. It is static files all the way down.)')],
    php: (args) => (args.join(' ') === 'artisan inspire' ? [w.motto, dim('  - tombo')] : ['zsh: command not found: php', staticHost]),
    make: () => ['make: *** No targets specified and no makefile found.  Stop.'],
    sl: () => ['sl: no train today.', [dim('Did you mean '), run('ls'), dim('?')]],
  };
  for (const q of [':q', ':q!', ':wq', ':x', ':qa', ':qa!']) cmds[q] = () => ['You are not in vim. Good reflex, though.'];
  const names = [...Object.keys(cmds).filter((k) => !k.startsWith(':')), ...Object.keys(ALIASES)].sort();

  /** Lines that are not commands at all. Matched whole, before any parsing. */
  const said = (line: string): Item[] | null => {
    const s = line.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
    if (s === 'follow the white rabbit') {
      const posts = Object.entries((w.root.dir.posts as DirNode).dir) as [string, FileNode][];
      const [name, post] = posts[Math.floor(env.rand() * posts.length)];
      return [' (\\_/)', ' (o.o)', ' (> <)', dim('It ran into ~/posts and stopped at:'), [dim(`${post.date}  `), { t: post.note!, href: post.href }], [dim('read it: '), run(`open ~/posts/${name}`)]];
    }
    if (s === 'knock knock') return ['Race condition.', "Who's there?", [dim('(The rabbit went that way: '), run('follow the white rabbit'), dim(')')]];
    if (s === 'make me a sandwich') return ['What? Make it yourself.'];
    if (s === 'sudo make me a sandwich') return ['Okay.'];
    if (s === 'hello' || s === 'hi') return [['hello. ', dim('Try '), run('help'), dim('.')]];
    return null;
  };

  // ---------- reading a line: words, variables, globs, aliases, pipes ----------
  const VARS: Record<string, () => string> = { USER: () => w.user, HOME: () => '/' + HOME.join('/'), PWD: () => '/' + [...HOME, ...cwd].join('/'), SHELL: () => '/bin/zsh', EDITOR: () => 'vim', HOSTNAME: () => w.host };
  const words = (s: string) => [...s.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => ({
    v: m[2] ?? (m[1] ?? m[3]).replace(/\$(\w+)/g, (_, k) => own(VARS, k)?.() ?? ''),
    quoted: m[3] === undefined,
  }));
  /** `*` in the last part of a path. null when nothing matches, the way zsh refuses to run the command. */
  const glob = (arg: string): string[] | null => {
    const cut = arg.lastIndexOf('/') + 1, r = resolve(arg.slice(0, cut) || '.'), d = r && at(r);
    if (!arg.includes('*') || arg.startsWith('-') || !r) return [arg];
    const re = new RegExp(`^${arg.slice(cut).split('*').map(literal).join('.*')}$`);
    const hit = isDir(d) ? Object.keys(d.dir).filter((k) => re.test(k) && (!k.startsWith('.') || arg[cut] === '.')) : [];
    return hit.length ? hit.map((k) => arg.slice(0, cut) + k) : null;
  };
  function simple(text: string, stdin: Line[] | null): Result {
    let toks = words(text);
    const to = toks.findIndex((t) => !t.quoted && t.v.startsWith('>'));
    if (to >= 0) return { out: [`zsh: read-only file system: ${toks[to].v.replace(/^>+/, '') || toks[to + 1]?.v || ''}`] };
    const alias = !toks[0].quoted && own(ALIASES, toks[0].v);
    if (alias) toks = [...words(alias), ...toks.slice(1)];
    const [{ v: name }, ...rest] = toks, args: string[] = [];
    for (const t of rest) {
      const found = t.quoted ? [t.v] : glob(t.v);
      if (!found) return { out: [`zsh: no matches found: ${t.v}`] };
      args.push(...found);
    }
    if (name.includes('/')) {
      const r = resolve(name), n = r && at(r);
      if (!n) return { out: [`zsh: no such file or directory: ${name}`] };
      if (isDir(n) || n.bin !== 'elf') return { out: [`zsh: permission denied: ${name}`] };
      // What its 33 bytes of code do, read from their own operands: write(1, rip + rel32, edx).
      const b = bytesOf(n), v = new DataView(b.buffer), code = Number(v.getBigUint64(24, true) - v.getBigUint64(0x50, true));
      const from = code + 17 + v.getInt32(code + 13, true), size = v.getUint32(code + 18, true);
      return { out: new TextDecoder().decode(b.slice(from, from + size)).trimEnd().split('\n').map(linkify) };
    }
    const fn = own(cmds, name);
    if (!fn) {
      const near = names.filter((n) => dist(n, name) <= (name.length > 3 ? 2 : 1))[0];
      return { out: [`zsh: command not found: ${name}`, ...(near ? [[dim('Did you mean '), run(near), dim('?')] as Line] : [])] };
    }
    const r = fn(args, stdin);
    return Array.isArray(r) ? { out: r } : r;
  }
  function pipeline(text: string): Result {
    const stages = text.split('|').map((s) => s.trim());
    if (stages.some((s) => !s)) return { out: ["zsh: parse error near `|'"] };
    let last: Result = { out: [] }, fx: Fx | undefined;
    for (const [i, s] of stages.entries()) {
      last = simple(s, i ? flat(last.out) : null);
      fx = last.fx ? { ...fx, ...last.fx } : fx;
    }
    return { out: last.out, fx };
  }
  /** Run one typed line. Never throws: a terminal that dies on input is not a terminal. */
  function exec(input: string): Result {
    if (vim) return vimLine(input);
    let line = input.replace(/　/g, ' ').trim();
    if (!line) return { out: [] };
    const out: Item[] = [];
    if (line.includes('!!')) {
      line = line.replaceAll('!!', env.history.at(-1) ?? '');
      out.push(dim(line)); // zsh shows what !! became before running it
    }
    if (line !== env.history.at(-1)) env.history.push(line);
    const spoken = said(line);
    if (spoken) return { out: [...out, ...spoken] };
    let fx: Fx | undefined;
    try {
      for (const part of line.split(/\s*(?:;|&&)\s*/).filter(Boolean)) {
        const r = pipeline(part);
        out.push(...r.out);
        fx = r.fx ? { ...fx, ...r.fx } : fx;
        if (vim) break;
      }
    } catch (e) {
      out.push(`zsh: ${(e as Error).message}`);
    }
    return { out, fx };
  }

  /** Tab. Completes the last word of `line`; `list` is what to show when it is still ambiguous. */
  function complete(line: string): { line: string; list: string[] } {
    const none = { line, list: [] };
    if (vim) return none;
    const cut = Math.max(line.lastIndexOf('|'), line.lastIndexOf(';'), line.lastIndexOf('&')) + 1;
    const parts = line.slice(cut).trimStart().split(/\s+/), word = parts.at(-1)!;
    const cmd = (own(ALIASES, parts[0]) ?? parts[0]).split(' ')[0];
    const within = (word: string, dirsOnly: boolean) => {
      const at0 = word.lastIndexOf('/') + 1, r = resolve(word.slice(0, at0) || '.'), d = r && at(r);
      if (!isDir(d)) return [];
      return Object.entries(d.dir)
        .filter(([k, n]) => k.startsWith(word.slice(at0)) && (!k.startsWith('.') || word[at0] === '.') && (!dirsOnly || isDir(n)))
        .map(([k, n]) => word.slice(0, at0) + k + (isDir(n) ? '/' : ' '));
    };
    const from = (list: string[]) => list.filter((n) => n.startsWith(word)).map((n) => n + ' ');
    const cands =
      parts.length === 1 ? (word.includes('/') ? within(word, false) : from(names))
      : cmd === 'man' || cmd === 'which' ? from(names)
      : cmd === 'git' && parts.length === 2 ? from(['log', 'status', 'push', 'blame'])
      : cmd === 'theme' ? from(['day', 'night'])
      : cmd === 'palette' ? from(['operator', 'phosphor'])
      : [...within(word, cmd === 'cd'), ...(cmd === 'open' ? from(Object.keys(w.links)) : [])];
    if (!cands.length) return none;
    const common = cands.reduce((a, b) => {
      let i = 0;
      while (i < a.length && a[i] === b[i]) i++;
      return a.slice(0, i);
    });
    return { line: line.slice(0, line.length - word.length) + common, list: cands.length > 1 ? cands.map((c) => c.trim()) : [] };
  }

  /** The two lines above the first prompt. `last` is the reader's own previous visit, when the browser remembers one. */
  const motd = (last?: string | null): Line[] => [
    dim(last ? `Last login: ${last} on this browser` : last === null ? 'Last login: never. Welcome.' : 'Last login: not on record.'),
    last === undefined
      ? dim('This is a recorded session. The live prompt needs JavaScript.')
      : [dim('Type '), run('help'), dim(' to see what you can run. '), run('exit'), dim(' returns to '), dim('人間用'), dim('.')],
  ];

  return { exec, complete, prompt, motd, vimKey, stamp, cd: (p: string) => void cmds.cd([p], null), cwd: () => tilde(cwd), inVim: () => !!vim };
}
export type Shell = ReturnType<typeof createShell>;
