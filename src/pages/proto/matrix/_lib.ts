/**
 * Build-time material for /proto/matrix/. Everything here is derived from the two data
 * files; nothing is typed in by hand except the selection rules.
 */
import { rainPhrases, commits, blogExcerpts, repoPaths } from '../../../data/proto-matrix-corpus';

export const hasJa = (s: string) => /[぀-ヿ㐀-鿿]/.test(s);
export const host = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
/** tombo's blurb ends in Japanese; split it so that part can carry lang="ja". */
export const splitJa = (s: string) => {
  const i = s.search(/[぀-ヿ㐀-鿿]/);
  return i < 0 ? [s, ''] : [s.slice(0, i).trim(), s.slice(i)];
};

/** Phrases that name the film are left out of everything, and emoji are dropped (no dot-matrix glyph). */
const usable = (s: string) => !/matrix/i.test(s);
const bmp = (s: string) => Array.from(s).filter((c) => c.codePointAt(0)! < 0x10000).join('').trim();
export const phrases = rainPhrases.filter(usable).map(bmp);

/** Commit subjects that may be set as readable text: no merges, nothing naming the film. */
export const readableCommits = commits.filter((c) => usable(c) && !c.startsWith('Merge '));
export const corpusCounts = { commits: commits.length, repoPaths: repoPaths.length, blogExcerpts: blogExcerpts.length };

/** Explicit pairs for the title-to-commit flicker. A pair only exists if the commit is really in the log. */
const pairs: Record<string, string> = {
  'TPAC 2025 Kobe Hackathonでソロ参加し、1位になった話': 'feat(blog): add TPAC 2025 Kobe Hackathon experience post',
  tombo: "refactor: adopt TOMBO's container scale",
};
export const commitFor = (name: string) => commits.find((c) => c === pairs[name]);

/** mulberry32, so every build lays the rain out the same way. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const chunk = (s: string, n = 22) => {
  const cs = Array.from(s);
  const out: string[] = [];
  for (let i = 0; i < cs.length; i += n) out.push(cs.slice(i, i + n).join('').trim());
  return out.filter(Boolean);
};

// Japanese and Latin phrases alternate, so kana and kanji are always on screen.
const ja = phrases.filter(hasJa);
const latin = phrases.filter((p) => !hasJa(p));
const mixed = (i: number) => (i % 2 ? latin[(i * 7) % latin.length] : ja[(i * 5) % ja.length]);

/** The ambient rain: columns of drops, each drop one piece of one real phrase. */
export function rainColumns(count = 40, perColumn = 3) {
  const r = rng(20261113);
  return Array.from({ length: count }, (_, i) => {
    // One speed per column and evenly spaced starts, so drops in a column never run into each other.
    const t = +(9 + r() * 12).toFixed(1);
    const phase = r();
    return {
      x: +(((i + 0.5) / count) * 100).toFixed(2),
      drops: Array.from({ length: perColumn }, (_, j) => {
        const parts = chunk(mixed(Math.floor(r() * 997) + i + j), 20);
        const text = parts[Math.floor(r() * parts.length)];
        const at = (j + phase) / perColumn;
        return { text, ja: hasJa(text), t, d: +(-at * t).toFixed(1), rest: Math.round(at * 96) };
      }),
    };
  });
}

/** The curtain that covers the page while the view changes: slabs of running corpus text. */
export function curtainSlabs(count = 24, glyphs = 260) {
  const r = rng(1999);
  return Array.from({ length: count }, (_, i) => {
    let s = '';
    for (let k = Math.floor(r() * 997) + i; Array.from(s).length < glyphs; k++) s += mixed(k).replace(/\s+/g, '');
    return Array.from(s).slice(0, glyphs).join('');
  });
}

/** Glyph pools for the decode effect, read off the corpus: full-width for Japanese, half-width for Latin. */
const uniq = (re: RegExp) => [...new Set(Array.from(phrases.join('')).filter((c) => re.test(c)))].join('');
export const glyphs = { wide: uniq(/[぀-ヿ㐀-鿿]/), narrow: uniq(/[A-Za-z0-9]/) };

/**
 * A mask for the giant name: opaque, with lines of commit subjects and post titles cut out of it.
 * It is an SVG image, so it is set in the reader's system monospace.
 */
export const etch = (() => {
  const src = readableCommits.flatMap((c, i) => (i % 3 === 2 ? [c, blogExcerpts[((i / 3) | 0) % blogExcerpts.length].title] : [c])).map(bmp);
  const lines: string[] = [];
  for (let i = 0, k = 0; i < 26; i++) {
    let s = '';
    while (Array.from(s).length < 150) s += src[k++ % src.length] + '  ';
    lines.push(s);
  }
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lh = 13;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${lines.length * lh}">` +
    `<mask id="m"><rect width="100%" height="100%" fill="#fff"/>` +
    `<g font-family="ui-monospace,Menlo,Consolas,monospace" font-size="10.5" font-weight="700" fill="#000">` +
    lines.map((l, i) => `<text x="${-(i * 37) % 90}" y="${(i + 1) * lh - 3}">${esc(l)}</text>`).join('') +
    `</g></mask><rect width="100%" height="100%" mask="url(#m)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

/** The mark, by Chisato Satoh: the real public file at its real size. Shown whole wherever it appears. */
export const logo = { src: '/images/logo-400.png', size: 400 };
