/**
 * Everything 機械用's shell knows, built once per build from the two data files, this repository's
 * git history and two real files (the assembled ~/wadakatu and the logo). Node only: the page
 * receives the result as JSON. Nothing below is typed in except file names, labels and layout.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { person, bio, projects, skills, activity } from '../../../data/proto-content';
import { commits, blogExcerpts } from '../../../data/proto-matrix-corpus';
import pkg from '../../../../package.json';
import { home as elf } from './_machine';
import { logo, splitJa } from './_lib';
import { createShell, plain, isLogo, zshrc, type World, type FileNode, type Env, type Item } from './_shell';

/** Hash and date for each commit subject in the corpus, when this checkout has the history. The author's address is never read. */
const log = (() => {
  try {
    return execFileSync('git', ['log', '-n', '1000', '--format=%h%x1f%H%x1f%ad%x1f%s', '--date=short'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .trim().split('\n').map((l) => l.split('\x1f'));
  } catch {
    return []; // no git, or a shallow clone: `git log` then prints subjects without hashes
  }
})();
let from = 0;
const history = commits.map((s) => {
  // The corpus is a run of the log, newest first, so each subject is looked for after the one before it.
  const i = log.findIndex((l, k) => k >= from && l[3] === s);
  if (i < 0) return { s };
  from = i + 1;
  return { s, h: log[i][0], H: log[i][1], d: log[i][2] };
});

const table = (rows: (readonly [string, string | number])[]) => {
  const wide = Math.max(...rows.map(([k]) => k.length));
  return rows.map(([k, v]) => `${k.padEnd(wide + 2)}${v}\n`).join('');
};
type Project = (typeof projects)[number];
const slug = (p: Project) => p.href.replace(/\/$/, '').split('/').pop()!;
const projectFile = (p: Project): FileNode => {
  const [en, ja] = splitJa(p.blurb);
  const links = [[p.href.includes('github.com') ? 'repo' : 'site', p.href], ...('docs' in p ? [['docs', p.docs]] : []), ...('site' in p ? [['site', p.site]] : [])] as [string, string][];
  return {
    text: [`# ${p.name}`, '', en, ...(ja ? [ja] : []), ...('note' in p ? [p.note] : []), '', table([['lang', p.lang], ...links])].join('\n'),
    href: p.href,
    note: `${p.lang} · ${en}`,
  };
};
const postFile = (p: (typeof blogExcerpts)[number]): FileNode => ({
  text: `---\ntitle: ${p.title}\ndate: ${p.date}\nurl: ${person.site}/blog/${p.slug}/\n---\n\n${p.excerpt}\n\n(An excerpt. The rest is at the url above: open ~/posts/${p.slug}.md)\n`,
  href: `/blog/${p.slug}/`,
  date: p.date,
  note: p.title,
});

/** The mark's own file: what `file` says about it is read from its IHDR chunk, and `xxd` gets its first 256 bytes. */
const png = (() => {
  const b = readFileSync(`public${logo.src}`), v = new DataView(b.buffer, b.byteOffset);
  assert.equal(b.subarray(12, 16).toString('latin1'), 'IHDR');
  const colour = ({ 0: 'grayscale', 2: 'RGB', 3: 'colormap', 4: 'gray+alpha', 6: 'RGBA' } as Record<number, string>)[b[25]];
  return {
    b64: b.subarray(0, 256).toString('base64'),
    kind: `PNG image data, ${v.getUint32(16)} x ${v.getUint32(20)}, ${b[24]}-bit/color ${colour}, ${b[28] ? 'interlaced' : 'non-interlaced'}`,
    size: b.length,
    src: logo.src,
    px: v.getUint32(16),
  };
})();
const code = elf.regions.find((r) => r.id === 'text')!;
const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(' ');

export const world: World = {
  user: person.name,
  host: person.location.toLowerCase(),
  site: person.site,
  repo: pkg.repository.url.replace(/^.*github\.com\/|\.git$/g, ''),
  who: `${person.role} · ${person.location}`,
  motto: splitJa(projects.find((p) => p.name === 'tombo')!.blurb)[1],
  root: {
    dir: {
      projects: { dir: Object.fromEntries(projects.map((p) => [`${slug(p)}.md`, projectFile(p)])) },
      posts: { dir: Object.fromEntries(blogExcerpts.map((p) => [`${p.slug}.md`, postFile(p)])) },
      'README.md': {
        text: [
          '# ~', '',
          'The home directory of 機械用: this site as a shell.', '',
          "- Files are generated from the site's own data. Nothing is made up.",
          "- `git log` is this repository's history.",
          '- ./wadakatu is a real x86-64 Linux program. It is not offered as a download.',
          '- Everything is read-only.', '',
          'Type `help`.', '',
        ].join('\n'),
      },
      'about.txt': { text: `${person.name} (${person.alternateName})\n${person.role}\n\n${bio.line1}\n${bio.line2}\n${bio.line3}\n` },
      'contact.txt': { text: table([['email', person.email], ['github', person.github], ['x', person.x], ['site', person.site]]) },
      'skills.txt': { text: skills.map((s) => s + '\n').join('') },
      'activity.txt': {
        text:
          table([['original repos', activity.originalRepos], ['oss forks', activity.ossForks], ['recent prs', activity.recentPrs], ['shipping since', activity.since], ['checked by hand', activity.verifiedOn]]) + '\n' +
          table([['articles published', activity.articlesPublished], ['latest entry', activity.latestEntry]]) +
          `${activity.latestEntryTitle}\n${person.site}${activity.latestEntryHref}\n`,
      },
      'logo.png': { text: '', bin: 'png', size: png.size, href: logo.src },
      wadakatu: { text: '', bin: 'elf', size: elf.size },
      '.zshrc': { text: zshrc },
      '.zsh_history': { text: '', live: 'history' },
    },
  },
  links: {
    github: person.github,
    x: person.x,
    email: `mailto:${person.email}`,
    site: person.site,
    blog: '/blog/',
    about: '/about/',
    ...Object.fromEntries(projects.map((p) => [slug(p), p.href])),
    docs: projects.flatMap((p) => ('docs' in p ? [p.docs] : []))[0],
    credit: person.logoCreditUrl,
  },
  commits: history,
  // neofetch's keys are the tool's own; the values are the data file's.
  fetch: [
    ['Role', person.role],
    ['Location', person.location],
    ['Uptime', `shipping since ${activity.since}`],
    ['Packages', `${activity.originalRepos} (original repos), ${activity.ossForks} (OSS forks)`],
    ['PRs', `${activity.recentPrs} recent`],
    ['Checked', `by hand, ${activity.verifiedOn}`],
    ['Posts', `${activity.articlesPublished} published, latest ${activity.latestEntry}`],
    ['Stack', skills.join(', ')],
    ['Projects', projects.map(slug).join(', ')],
    ['Logo', person.logoCredit.replace(/^Logo by /, ''), person.logoCreditUrl],
  ],
  elf: {
    b64: Buffer.from(elf.bytes).toString('base64'),
    kind: 'ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, stripped',
    asm: code.rows.map((r) => ({ addr: (parseInt(elf.entry, 16) - code.off + r.off).toString(16), hex: hex(r.bytes), text: r.text, note: r.note! })),
  },
  png: { ...png, credit: person.logoCredit, creditUrl: person.logoCreditUrl },
};

/** A shell with nothing of the reader in it: no clock, no history, no dice. What the build records with. */
export const still = (): Env => ({ now: () => new Date(0), ua: '', t0: 0, history: [], rand: () => 0 });

// Self-check, run on every build: the shell answers the way the page promises, and never throws.
{
  const sh = createShell(world, still());
  const say = (c: string) => sh.exec(c).out.flatMap((i: Item) => (isLogo(i) ? i.side ?? [] : [i])).map(plain).join('\n');
  assert.equal(say('whoami').split('\n')[0], person.name);
  assert.equal(say('ls -l posts | wc -l').trim(), String(activity.articlesPublished));
  assert.equal(say('cat skills.txt | wc -l').trim(), String(activity.skillCount));
  assert.equal(say('git log --oneline | wc -l').trim(), String(commits.length));
  assert.match(say('neofetch | grep Location'), /Japan$/);
  assert.match(say('cat ../../etc/passwd'), /Permission denied/);
  assert.match(say('cat projects/*.md | grep -c github.com'), /^\d+$/);
  assert.match(say('./wadakatu | head -n 1'), /^person\.name=wadakatu$/);
  assert.match(say('xxd wadakatu | head -n 1'), /7f45 4c46.*\.ELF/);
  assert.equal(say('echo $USER@$HOSTNAME'), `${world.user}@${world.host}`);
  assert.equal(sh.complete('cat ab').line, 'cat about.txt ');
  assert.equal(sh.complete('cd p').list.join(), 'projects/,posts/');
  assert.equal((say('cd projects'), sh.prompt()), `${world.user}@${world.host}:~/projects$`);
  assert.equal((say('cd ..; cd ..'), sh.cwd()), '~');
  assert.ok(sh.exec('vim about.txt').fx?.vim && sh.exec(':w').fx?.vim?.msg.startsWith('E45') && sh.exec(':q!').fx?.vim === null);
  for (const c of ['', '|', 'ls |', 'constructor', '__proto__ x', 'cat *', 'grep ( *', 'ls -la ~ /', 'rm -rf / --no-preserve-root', 'man man', 'open', 'open posts', 'help | sort | uniq | tail -3', '!!', 'sudo !!', 'echo a > b', 'tree', 'follow the white rabbit.', 'xxd logo.png', 'objdump -d wadakatu', 'file *', 'git log -3', 'head -n', 'wc', 'cd /']) {
    assert.doesNotMatch(say(c), /is not a function|undefined|Cannot read|Invalid/, c); // exec catches; a caught crash still fails the build
  }
}
