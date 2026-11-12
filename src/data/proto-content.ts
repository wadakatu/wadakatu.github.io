/**
 * Shared copy for /proto/* design explorations.
 * Every field is taken from the existing portfolio repo or the
 * 13 Nov 2026 location decision (Japan, no city). Do not invent
 * numbers, clients, testimonials, or achievements beyond this file.
 */

export const person = {
  name: 'wadakatu',
  heading: 'wadakatu_',
  alternateName: 'koyolympus',
  role: 'Backend Developer @ Studio Inc.',
  location: 'Japan',
  email: 'wadakatu.dev@gmail.com',
  site: 'https://www.wadakatu.dev',
  github: 'https://github.com/wadakatu',
  x: 'https://x.com/koyolympus',
  xHandle: '@koyolympus',
  logoCredit: 'Logo by Chisato Satoh',
  logoCreditUrl: 'https://chisatosatoh.myportfolio.com/work',
} as const;

/** Home / about bio, location already updated to the Japan-only rule. */
export const bio = {
  line1: 'Building no-code website builders @ Studio Inc.',
  line2: 'Active OSS contributor to Laravel ecosystem.',
  line3: 'Based in Japan.',
  /** Current meta description, used as a fact sheet, not as marketing copy. */
  meta: 'Building no-code website builders. Active OSS contributor to Laravel ecosystem. Creator of laravel-spectrum & gitlyte.',
} as const;

/** From src/data/profile.ts. Do not change these figures. */
export const activity = {
  originalRepos: 13,
  ossForks: 17,
  recentPrs: 29,
  since: 2020,
  skillCount: 8,
  verifiedOn: '2026-07-22',
  articlesPublished: 17,
  latestEntry: '2026-01-22',
  latestEntryTitle: 'TPAC 2025 Kobe Hackathonでソロ参加し、1位になった話',
  latestEntryHref: '/blog/b7c1f2a8d3e4f5/',
} as const;

export const skills = [
  'PHP',
  'Laravel',
  'Vue.js',
  'TypeScript',
  'MySQL',
  'Docker',
  'GCP',
  'Git',
] as const;

/**
 * Project blurbs rewritten in the brand voice (plain, no hype)
 * while keeping the same facts as /projects and /about.
 */
export const projects = [
  {
    name: 'laravel-spectrum',
    lang: 'PHP',
    href: 'https://github.com/wadakatu/laravel-spectrum',
    docs: 'https://docs.laravel-spectrum.dev',
    blurb: 'Zero-annotation API documentation generator for Laravel.',
  },
  {
    name: 'screenbook',
    lang: 'TypeScript',
    href: 'https://github.com/wadakatu/screenbook',
    blurb:
      'Screen catalog and navigation graph generator. Define screens in code, get documentation that stays current.',
  },
  {
    name: 'gitlyte',
    lang: 'TypeScript',
    href: 'https://github.com/wadakatu/gitlyte',
    blurb: 'Turns a GitHub repo into a live website. No code needed.',
  },
  {
    name: 'tombo',
    lang: 'HTML',
    href: 'https://www.wadakatu.dev/tombo/',
    blurb:
      'A single-file, zero-dependency CSS design system for everything wadakatu ships. すべてを測る・銘は等幅・朱は現在地',
  },
  {
    name: 'W3C Hackathon, TPAC 2025',
    lang: 'JavaScript',
    href: 'https://github.com/wadakatu/w3c-hackathon',
    site: 'https://www.wadakatu.dev/w3c-hackathon/',
    blurb: 'Dashboard built with vibe-coding, guided by web-standards.',
    note: 'Solo entry, first place. Documented in the 22 Jan 2026 blog post.',
  },
] as const;

export const recentPosts = [
  {
    title: 'TPAC 2025 Kobe Hackathonでソロ参加し、1位になった話',
    date: '2026-01-22',
    category: 'Life',
    href: '/blog/b7c1f2a8d3e4f5/',
  },
  {
    title: 'W3C TPAC 2025参加レポ （Web標準ってどうやってできてるの？）',
    date: '2025-12-10',
    category: 'Life',
    href: '/blog/da5be52d57e9a1/',
  },
] as const;

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
] as const;
