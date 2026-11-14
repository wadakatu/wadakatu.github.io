# Palette and logo critique — Codex

Reviewed by Codex on 13 November 2026, on `design/explore`. This is a tightening pass, not a redesign.
Inspected all 12 existing `_review/*.png` captures and the five implementation files named in the brief.
One capture (`src-op-1440.png`) has older credit labels than the current source; the dedicated logo-record
capture and current code were used for those labels. No review images were added or replaced.

## Findings and change

The night operator palette reads coherently: amber identity and controls, quieter brown rain, and solid
reading panels. The frozen boot gives the actual mark enough room to reveal its numerals and texture;
the source record makes the asset and its credit inspectable. No clipping or distortion needs a visual fix.

One functional defect was reproduced: with `/scripts/proto-matrix.js` blocked, the head script applied
operator/source flags, but navigation discarded them. With `?source=1`, the fallback even said "View source"
while source was already visible. `ProtoMatrixLayout.astro` now synchronizes the fallback links and label
at DOM readiness when enhancement has not initialized. All four routes retain operator and forced-still
flags through the static twin; spent boot/source flags are not propagated. Notes were updated.

## Deliberately left

- **44px header mark:** it reads as a burst, not legible numerals. That is acceptable for persistent identity
  next to `wadakatu_`; the boot and source provide detail. A modest enlargement would still not make the
  internal lettering readable. The 390px header wraps cleanly, including all four controls; keep its size.
- **Operator day:** nearly the same grey-green reading surface as phosphor day. This limits the toggle's
  visual payoff, but creating a new daylight direction would exceed this review.
- **240,877-byte PNG:** expensive for a small header, but shared by the three placements. Retained the exact
  400×400 file; no derivative, dependency, crop, rounding, redraw or geometry change.
- **No static operator routes:** fully disabled JavaScript still gives usable phosphor pages. The one-file
  fallback fix covers failed enhancement with the head script available; it does not claim query parsing
  without JavaScript. No route set or palette storage was added.
- **Amber tint:** retained only on operator night. Chisato Satoh should see and approve that treatment before
  any public use; a CSS filter preserving geometry does not establish the designer's endorsement.
- **Theme query removal:** existing view/palette controls still discard `theme` from the address. Left as the
  documented one-load override; changing that policy is outside this palette-retention fix.

## Verification

`npm run build` passed: 42 pages. Its existing production Projects generator required network access to
GitHub; no production source changed. JavaScript syntax and `git diff --check` passed.

A temporary Playwright/Chrome reproduction failed before the fix and passed afterward on all four routes
at 390×844, including following the static twin with enhancement blocked. Tests and logs are under
`/tmp/mx-codex-palette/`, outside the repository.

The existing palette/logo suite passed all 69 checks; the existing regression suite passed all 40.
These covered flags and keyboard toggles, palette non-persistence, no-JS, blocked scripts/CDN, boot
skip/frozen/reveal, reduced motion, square unmodified logo geometry, and header clearspace at 390/320px.
Operator layouts passed all four routes at 1440/1200/390/320px in night/day with zero horizontal overflow.
Computed text contrast minima were 8.98:1 / 6.48:1 for operator night/day and 8.68:1 / 5.61:1 for phosphor;
no audited text fell below AA. These are solid-colour checks, not pixel-level certification of the masked
display heading. Operator focus rings exceeded 6:1 against both ground and panels. All temporary servers
and test browsers exited; no dev server was left running.

Chrome DevTools MCP could not connect because the existing Chrome profile had no `DevToolsActivePort`.
The [frontend-live-verify skill](/Users/koyoisono/.agents/skills/frontend-live-verify/SKILL.md) says
"Do not substitute ... a different browser automation surface for this step." Thus its specific MCP step
remains unverified; the browser evidence here is Playwright/Chrome. A reachable DevTools-enabled Chrome
session would be needed for that separate check. Screen-reader, Safari/Firefox and low-end performance
remain unverified.

No commit, push, dependencies, production/data edits or changes to other prototypes were made by Codex.
