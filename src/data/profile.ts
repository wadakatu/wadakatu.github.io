/**
 * Figures that cannot be derived from the repo — GitHub activity, career start.
 * They are maintained by hand, so `verifiedOn` is part of the data: TOMBO's first
 * rule is "measure everything", and a measurement without a date is a rumour.
 *
 * Rendered in two places (the home hero instrument and the about page metrics),
 * which is exactly why they live here instead of being typed twice.
 */
export const profile = {
  /** public repositories authored, not forked */
  originalRepos: 13,
  /** forks with contributions merged upstream */
  ossForks: 17,
  /** pull requests merged across all repos, trailing 12 months */
  recentPrs: 29,
  /** first year shipping professionally */
  since: 2020,
  /** skills tracked on the about page */
  skillCount: 8,
  /** when the GitHub figures above were last checked by hand */
  verifiedOn: '2026-07-22',
} as const;

/** Ratio for a ruler, clamped to 0–1. `max` is the value the track represents. */
export const ratio = (value: number, max: number): number =>
  Math.max(0, Math.min(1, value / max));
