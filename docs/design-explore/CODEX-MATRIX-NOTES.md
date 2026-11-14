# Matrix explorations

CLI: **Codex**. Branch: `design/explore`. Work confined to this worktree. No commit or push.

## Routes and the first two seconds

### See the source

- `/proto/source/`
- `/proto/source/projects/`
- `/proto/source/raw/`
- `/proto/source/raw/projects/`

The first screen presents two named, described choices: **Constructed — The page as composed** and **Source — The structure underneath**. The selected reading is filled and marked with `aria-current`. These are ordinary links, not pills or a JavaScript-only switch. Switching preserves Home versus Projects.

Constructed uses large condensed type and a pale mineral-green surface. Source exposes the same imported facts as labeled fields, indented records and collection boundaries on a dark surface. No simulated terminal, falling code, invented source code or film quotation. The connection to laravel-spectrum is revealing structure that was already there. The visitor always sees wadakatu, his work and Japan.

Design tokens: `#e4e9df` background, `#172c25` ink, `#4e6055` secondary text, `#234d3a` selection; raw background `#101e19`, field color `#a2c892`. Barlow Condensed carries the constructed identity; IBM Plex Mono carries the source reading. Left-aligned composition, wide identity above a compact project preview; source switches to record rows.

### Bent measure

- `/proto/spoon/`
- `/proto/spoon/projects/`

A large, quiet name sits above one measured line, with the instruction **Hover, focus or touch the line**. The slight initial displacement is already visible; attending to the line bends its center, leaving both endpoints anchored. It returns after hover/focus leaves. Nothing else warps or loops. The same single interaction appears on the Projects page.

The connection is tombo's measurement meeting a construct that can yield. Newsreader, ample space and restrained neutral colors distinguish it from Source. The home preview leads with tombo and its actual Japanese rules. No replica prop or film slogan.

Design tokens: light `#fafaf8`, ink `#252723`, secondary `#60645b`, line `#465b35`; dark `#20231f`, ink `#eeeee7`, secondary `#b8bdb1`, line `#c1d4aa`. Newsreader for display text; Arial for interface/body; Noto Sans JP for Japanese in both concepts.

## Files added

- `src/layouts/ProtoSourceLayout.astro`
- `src/layouts/ProtoSpoonLayout.astro`
- `public/styles/proto/source.css`
- `public/styles/proto/spoon.css`
- `src/pages/proto/source/index.astro`
- `src/pages/proto/source/projects/index.astro`
- `src/pages/proto/source/raw/index.astro`
- `src/pages/proto/source/raw/projects/index.astro`
- `src/pages/proto/spoon/index.astro`
- `src/pages/proto/spoon/projects/index.astro`
- `docs/design-explore/CODEX-MATRIX-NOTES.md`

`src/data/proto-content.ts` is imported read-only and supplies every biographical, project and article fact. Existing production files, `/proto/b/`, `/proto/d/`, other prototype directories, `/proto/index.astro` and `CODEX-NOTES.md` were not edited.

## Behavior and accessibility

- Standalone HTML layouts; no BaseLayout, TOMBO classes or production CSS.
- English document language; Japanese titles and tombo rules use `lang="ja"`, Japanese fonts and normal tracking. No side-by-side translations.
- Skip links, one H1 per page, ordered headings, navigation landmarks and visible focus.
- Source modes are real URLs, fully usable without JavaScript.
- Spoon follows `prefers-color-scheme`. A keyboard-accessible native checkbox switches to the alternate theme without JavaScript. The choice is per page, intentionally not persisted.
- The line responds to hover, keyboard focus and touch focus. Reduced motion removes transitions and keeps only the initial slight static displacement.
- CDN fonts have local fallbacks. No added dependencies or film assets.
- Prototype pages include `noindex, nofollow`.

## Verification

- Final `npm run build`: passed, 34 pages. Initial sandbox attempt failed on the existing production Projects page's GitHub API fetch; network-authorized retry passed.
- Headless Chrome against a temporary static server serving this worktree's actual `dist`; no development server.
- All six routes checked at 1440 and 390 pixels. Both Spoon themes checked. Document width equals viewport width; one H1 per page.
- Rendered screenshots inspected for Source constructed/raw and Spoon desktop/mobile. Captures were temporary build artifacts and are not committed.
- Enter on Source mode links navigates correctly; Projects retains its context at `/proto/source/raw/projects/`.
- Space on the native theme checkbox switches both light-to-dark and dark-to-light, including with page JavaScript disabled.
- Source mode navigation also checked with page JavaScript disabled.
- Focus changes the line's center from 47 to 8 in SVG coordinates; after focus leaves it returns to 47. The first asynchronous sample caught the return mid-transition; polling for completion confirmed exact restoration.
- Reduced-motion check: initial static path remains unchanged on focus, computed transition duration `0s`.
- Calculated text contrast: Source lowest pair 5.44:1; Spoon light lowest pair 5.79:1; Spoon dark lowest pair 8.29:1. All used text pairs exceed WCAG AA's 4.5:1 normal-text threshold.

Limits: Chrome DevTools MCP could not connect to the configured Chrome (`DevToolsActivePort` missing), so its prescribed verification was unavailable. Verification instead used an isolated headless Chrome through CDP. No full assistive-technology audit or cross-browser certification was performed. CSS path interpolation may degrade to an immediate state change in browsers without interpolation support; the content and controls remain usable.

## Skill use

Read the supplied frontend-design, impeccable and unslop skills. Impeccable's launcher, `reference/new-work.md` and `reference/craft-floor.md` were absent from the supplied skill directory; no installation or unrelated context-file edits were made. The explicit brief controlled the visual direction and scope.

Unslop guidance credit: Damir Sokolovsky, [@heydamir](https://x.com/heydamir), [unslop](https://heydamir.design/unslop), CC BY 4.0.
