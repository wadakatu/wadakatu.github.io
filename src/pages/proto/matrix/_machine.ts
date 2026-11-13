/**
 * ~/wadakatu, the one executable in 機械用's home directory. `build()` assembles a static x86-64
 * Linux ELF whose sections hold the site's facts as `key=value` lines and whose 33 bytes of code
 * write them to standard output. It is not served as a file: the shell carries its bytes, so
 * `file`, `xxd`, `objdump -d` and `./wadakatu` all read the real thing. Every offset and size is
 * computed from the bytes it describes. Nothing here is typed in except the instruction encodings
 * and the notes.
 */
import { createHash } from 'node:crypto';
import { person, bio, projects, recentPosts, activity, skills } from '../../../data/proto-content';
import { phrases, readableCommits, corpusCounts } from './_lib';

export type Row = {
  off: number;
  bytes: Uint8Array;
  /** `key=value` lines carry content; `asm` is an instruction; `note` describes structure. */
  kind: 'kv' | 'asm' | 'note';
  key?: string;
  text: string;
  href?: string;
  note?: string;
  head?: boolean;
};
export type Region = { id: string; name: string; what: string; off: number; size: number; rows: Row[] };
type Line = { key: string; value: string; href?: string; head?: boolean };
type Group = { name: string; what: string; lines: Line[] };

const enc = new TextEncoder();
const cat = (parts: ArrayLike<number>[]) => Uint8Array.from(parts.flatMap((p) => Array.from(p)));
/** Little-endian. Every value in these files fits in 32 bits, so the upper half of a 64-bit field is zero. */
const le = (n: number, size: number) => Uint8Array.from({ length: size }, (_, i) => (i < 4 ? (n >>> (8 * i)) & 255 : 0));
const x = (n: number) => '0x' + n.toString(16);
export const num = (n: number) => n.toLocaleString('en-US');
export const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

const BASE = 0x400000, EH = 64, PH = 56, SH = 64;

function build(file: string, groups: Group[]) {
  const data = groups.map((g) => g.lines.map((l) => enc.encode(`${l.key}=${l.value}\n`)));
  const sizes = data.map((d) => d.reduce((n, b) => n + b.length, 0));
  const text0 = EH + PH, data0 = text0 + 33, dataLen = sizes.reduce((a, b) => a + b, 0);
  const first = groups[0].name, last = groups[groups.length - 1].name;

  // write(1, data, dataLen); exit(0). The lea is relative to the instruction after it, at text0 + 17.
  const code: { bytes: number[]; text: string; note: string }[] = [
    { bytes: [0xb8, ...le(1, 4)], text: 'mov eax, 1', note: 'system call 1: write' },
    { bytes: [0xbf, ...le(1, 4)], text: 'mov edi, 1', note: 'to file 1, standard output' },
    { bytes: [0x48, 0x8d, 0x35, ...le(data0 - (text0 + 17), 4)], text: `lea rsi, [rip+${x(data0 - (text0 + 17))}]`, note: `from ${x(BASE + data0)}, the first byte of ${first}` },
    { bytes: [0xba, ...le(dataLen, 4)], text: `mov edx, ${dataLen}`, note: `${num(dataLen)} bytes: ${first === last ? first : `everything from ${first} to ${last}`}` },
    { bytes: [0x0f, 0x05], text: 'syscall', note: 'the kernel prints them' },
    { bytes: [0xb8, ...le(60, 4)], text: 'mov eax, 60', note: 'system call 60: exit' },
    { bytes: [0x31, 0xff], text: 'xor edi, edi', note: 'with status 0' },
    { bytes: [0x0f, 0x05], text: 'syscall', note: 'done' },
  ];

  // Section name table, then one 64-byte header per section. Offsets fall out of the layout above.
  const names = ['', '.text', ...groups.map((g) => g.name), '.shstrtab'];
  const nameOff: number[] = [];
  const strtab = cat(names.map((n, i) => ((nameOff[i] = names.slice(0, i).reduce((a, s) => a + s.length + 1, 0)), enc.encode(n + '\0'))));
  const str0 = data0 + dataLen, sh0 = str0 + strtab.length, size = sh0 + names.length * SH;
  let at = data0;
  const sections = [
    { name: '', type: 0, flags: 0, addr: 0, off: 0, size: 0, align: 0 },
    { name: '.text', type: 1, flags: 6, addr: BASE + text0, off: text0, size: 33, align: 1 },
    ...groups.map((g, i) => ({ name: g.name, type: 1, flags: 2, addr: BASE + at, off: (at += sizes[i]) - sizes[i], size: sizes[i], align: 1 })),
    { name: '.shstrtab', type: 3, flags: 0, addr: 0, off: str0, size: strtab.length, align: 1 },
  ];
  const shdr = (s: (typeof sections)[number], i: number) =>
    cat([le(nameOff[i], 4), le(s.type, 4), le(s.flags, 8), le(s.addr, 8), le(s.off, 8), le(s.size, 8), le(0, 4), le(0, 4), le(s.align, 8), le(0, 8)]);

  const ehdr: [number[] | Uint8Array, string][] = [
    [[0x7f, 0x45, 0x4c, 0x46], 'magic number: 0x7f, then E, L, F'],
    [[2, 1, 1, 0, ...le(0, 8)], '64-bit, little-endian, ELF version 1, System V ABI, 8 bytes of padding'],
    [cat([le(2, 2), le(0x3e, 2), le(1, 4)]), 'an executable for x86-64'],
    [le(BASE + text0, 8), `entry point ${x(BASE + text0)}: execution starts at .text`],
    [le(EH, 8), `the program header is at byte ${EH}`],
    [le(sh0, 8), `the section table is at byte ${num(sh0)}`],
    [cat([le(0, 4), le(EH, 2), le(PH, 2), le(1, 2), le(SH, 2), le(names.length, 2), le(names.length - 1, 2)]),
      `no flags; this header is ${EH} bytes; 1 program header of ${PH} bytes; ${names.length} section headers of ${SH} bytes; their names are in section ${names.length - 1}`],
  ];
  const phdr: [Uint8Array, string][] = [
    [cat([le(1, 4), le(5, 4)]), 'one segment to load, readable and executable'],
    [cat([le(0, 8), le(BASE, 8), le(BASE, 8)]), `file byte 0 is mapped at address ${x(BASE)}`],
    [cat([le(size, 8), le(size, 8)]), `${num(size)} bytes in the file, ${num(size)} in memory: the whole file`],
    [le(0x1000, 8), 'aligned to 4,096 bytes'],
  ];

  // Lay the regions out in file order, giving every row its real offset.
  let off = 0;
  const row = (bytes: ArrayLike<number>, rest: Omit<Row, 'off' | 'bytes'>): Row => {
    const r = { off, bytes: Uint8Array.from(bytes), ...rest };
    off += r.bytes.length;
    return r;
  };
  const region = (id: string, name: string, what: string, rows: () => Row[]): Region => {
    const start = off, rs = rows();
    return { id, name, what, off: start, size: off - start, rows: rs };
  };
  const regions = [
    region('ehdr', 'ELF header', 'what kind of file this is', () => ehdr.map(([b, text]) => row(b, { kind: 'note', text }))),
    region('phdr', 'program header', 'what the kernel loads', () => phdr.map(([b, text]) => row(b, { kind: 'note', text }))),
    region('text', '.text', 'the code: 8 instructions', () => code.map((c) => row(c.bytes, { kind: 'asm', text: c.text, note: c.note }))),
    ...groups.map((g, i) => region(g.name.slice(1), g.name, g.what, () => g.lines.map((l, j) => row(data[i][j], { kind: 'kv', key: l.key, text: l.value, href: l.href, head: l.head })))),
    region('shstrtab', '.shstrtab', 'the section names', () => [row(strtab, { kind: 'note', text: names.slice(1).join(' ') })]),
    region('shdr', 'section table', 'where each section is', () => sections.map((s, i) => row(shdr(s, i), {
      kind: 'note',
      text: i ? `${s.name}: ${num(s.size)} bytes at byte ${num(s.off)}${s.addr ? `, loaded at ${x(s.addr)}` : ', not loaded'}${s.flags & 4 ? ', executable' : ''}` : 'the empty entry every section table starts with',
    }))),
  ];

  const bytes = cat(regions.flatMap((r) => r.rows.map((w) => w.bytes)));
  // Self-check, run on every build: the rows tile the file, and the code points at the data it claims to.
  const view = new DataView(bytes.buffer);
  const ok =
    bytes.length === size && off === size &&
    regions.every((r, i) => r.off === (i ? regions[i - 1].off + regions[i - 1].size : 0)) &&
    text0 + 17 + view.getInt32(text0 + 13, true) === data0 &&
    view.getUint32(text0 + 18, true) === dataLen &&
    Number(view.getBigUint64(24, true)) === BASE + text0 &&
    Number(view.getBigUint64(40, true)) === sh0 &&
    sections.every((s, i) => view.getUint32(sh0 + i * SH, true) === nameOff[i] && Number(view.getBigUint64(sh0 + i * SH + 24, true)) === s.off);
  if (!ok) throw new Error(`machine view: ${file} does not assemble to a consistent ELF`);

  return { file, bytes, regions, size, entry: x(BASE + text0), sha256: sha256(bytes), stdout: { off: data0, size: dataLen } };
}
export type Machine = ReturnType<typeof build>;

// ---------- the facts, as key=value lines. Keys are the data file's own keys. ----------
const isUrl = (v: string) => /^(https?:\/\/|\/)/.test(v);
/** Site-relative paths are written into the file as full addresses; the link on the page stays relative. */
const line = (key: string, v: unknown, head = false): Line => {
  const s = String(v);
  return { key, value: s.startsWith('/') ? person.site + s : s, href: key.endsWith('email') ? `mailto:${s}` : isUrl(s) ? s : undefined, head };
};
const lines = (prefix: string, o: Record<string, unknown>, head?: string) => Object.entries(o).map(([k, v]) => line(`${prefix}.${k}`, v, k === head));

const projectsGroup: Group = {
  name: '.projects', what: `${projects.length} projects`,
  lines: projects.flatMap((p, i) => lines(`projects.${i}`, p, 'name')),
};
export const home = build('wadakatu', [
  { name: '.person', what: 'who', lines: lines('person', person) },
  { name: '.bio', what: 'in his words', lines: lines('bio', bio) },
  projectsGroup,
  { name: '.posts', what: `${recentPosts.length} recent posts`, lines: recentPosts.flatMap((p, i) => lines(`posts.${i}`, p, 'title')) },
  { name: '.activity', what: 'figures', lines: lines('activity', activity) },
  { name: '.skills', what: `${skills.length} skills`, lines: skills.map((s, i) => line(`skills.${i}`, s)) },
  { name: '.rain', what: 'what the rain is made of', lines: [line('rain.phrases', phrases.length), ...lines('rain', corpusCounts)] },
  { name: '.log', what: 'latest commits', lines: readableCommits.slice(0, 6).map((c, i) => line(`log.${i}`, c)) },
]);
