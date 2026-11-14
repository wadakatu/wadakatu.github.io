/**
 * Career constants, plus GitHub activity figures used on Home and About.
 *
 * The GitHub counts are fetched at build time from the public API (with
 * GITHUB_TOKEN when the environment has one, as the Pages deploy workflow
 * does). If the request fails or is rate-limited, the last known values and
 * their `verifiedOn` date are shown instead, so a flaky build does not invent
 * a number or hide the fact that it is stale.
 *
 * Definitions (see `loadActivity`):
 * - originalRepos: public repositories wadakatu owns that are not forks
 * - ossForks: public forks wadakatu owns of other people's repositories
 * - recentPrs: pull requests wadakatu authored that merged, in the trailing
 *   12 months, in repositories wadakatu does not own, excluding work orgs
 *   listed in WORK_ORGS (employer and private-work organizations)
 */

const OWNER = 'wadakatu';

/**
 * Organizations treated as wadakatu's work, not OSS, and excluded from recentPrs.
 * - studio-design: Studio Inc. / Studio.Design (studio.design), his employer
 * - TestStudioOrg: private Studio-related test org ("For testing github organization");
 *   no merged PRs in the current window, excluded so a later test PR cannot count as OSS
 */
const WORK_ORGS = ['studio-design', 'TestStudioOrg'] as const;

/** Last successful API reading, recorded 15 November 2026 (Asia/Tokyo). */
export const fallbackActivity = {
  originalRepos: 27,
  ossForks: 60,
  recentPrs: 105,
  verifiedOn: '2026-11-15',
} as const;

export const profile = {
  ...fallbackActivity,
  /** first year shipping professionally */
  since: 2020,
  /** skills tracked on the about page */
  skillCount: 8,
} as const;

export type Activity = {
  originalRepos: number;
  ossForks: number;
  recentPrs: number;
  verifiedOn: string;
  since: number;
  skillCount: number;
};

/** Ratio for a ruler, clamped to 0–1. `max` is the value the track represents. */
export const ratio = (value: number, max: number): number =>
  Math.max(0, Math.min(1, value / max));

function todayInJapan(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Calendar date in Asia/Tokyo, `months` months before today (day clamped to the month). */
function monthsAgoInJapan(months: number): string {
  const [year, month, day] = todayInJapan().split('-').map(Number);
  const index = year * 12 + (month - 1) - months;
  const y = Math.floor(index / 12);
  const m = index - y * 12; // 0-based
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const d = Math.min(day, lastDay);
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function headers(): HeadersInit {
  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined;
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'wadakatu.dev-build',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function github<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json() as Promise<T>;
}

type Repo = { fork: boolean; private: boolean; name: string };

async function listOwnedRepos(): Promise<Repo[]> {
  const repos: Repo[] = [];
  const perPage = 100;
  for (let page = 1; page <= 10; page++) {
    const batch = await github<Repo[]>(
      `https://api.github.com/users/${OWNER}/repos?type=owner&per_page=${perPage}&page=${page}`,
    );
    repos.push(...batch);
    if (batch.length < perPage) break;
  }
  return repos;
}

async function mergedPrsInOtherRepos(since: string): Promise<number> {
  const work = WORK_ORGS.map((org) => `-org:${org}`).join(' ');
  const q = `author:${OWNER} is:pr is:merged -user:${OWNER} ${work} merged:>=${since}`;
  const data = await github<{ total_count: number }>(
    `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=1`,
  );
  if (typeof data.total_count !== 'number') {
    throw new Error('GitHub search response had no total_count');
  }
  return data.total_count;
}

/**
 * GitHub activity as of this build, or the last known values if the API fails.
 */
let pending: Promise<Activity> | undefined;

export async function loadActivity(): Promise<Activity> {
  pending ??= fetchActivity();
  return pending;
}

async function fetchActivity(): Promise<Activity> {
  try {
    const [repos, recentPrs] = await Promise.all([
      listOwnedRepos(),
      mergedPrsInOtherRepos(monthsAgoInJapan(12)),
    ]);
    const publicRepos = repos.filter((repo) => !repo.private);
    const originalRepos = publicRepos.filter((repo) => !repo.fork).length;
    const ossForks = publicRepos.filter((repo) => repo.fork).length;
    return {
      originalRepos,
      ossForks,
      recentPrs,
      verifiedOn: todayInJapan(),
      since: profile.since,
      skillCount: profile.skillCount,
    };
  } catch (error) {
    console.warn('GitHub activity fetch failed; using last known values.', error);
    return {
      ...fallbackActivity,
      since: profile.since,
      skillCount: profile.skillCount,
    };
  }
}
