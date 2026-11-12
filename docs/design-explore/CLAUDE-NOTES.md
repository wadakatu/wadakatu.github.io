# Construct / Operator design exploration

Built with **Claude Code**. Two readings of one world (The Matrix), evoked and not copied: no film
logo, title treatment, font, character, prop or line appears on either page.

## Files

- `src/layouts/ProtoConstructLayout.astro`
- `src/layouts/ProtoOperatorLayout.astro`
- `public/styles/proto/construct.css`
- `public/styles/proto/operator.css`
- `src/pages/proto/construct/index.astro`
- `src/pages/proto/construct/projects/index.astro`
- `src/pages/proto/operator/index.astro`
- `src/pages/proto/operator/projects/index.astro`
- `src/pages/proto/operator/_Stream.astro` (component; the underscore keeps it out of routing)
- `docs/design-explore/CLAUDE-NOTES.md`

Nothing else was edited. No dependencies added, no commits, no pushes.

## The Construct — `/proto/construct/`

**In two seconds:** an empty pale room. One hairline draws across the full width while the name
stands on it as a wireframe outline, with "Loading" at the right. The outline fills solid from the
left, the floor below the line takes a slightly darker tone, and the first project loads the same
way at the foot of the screen (line drawn, name filled). "Loading" becomes "5 programs loaded".

- No hue at all: near-white void and ink by day, near-black void and pale ink by night. Geist at
  weight 300, Zen Kaku Gothic New for Japanese.
- The horizon sits on the text baseline. "wadakatu" has no descenders, so the name stands on it.
- Every project and post repeats the motif at small scale: name on a line, detail below it, and
  where it was loaded from (`github.com/wadakatu/gitlyte`) on the right.
- One hover detail: the line under a program loads again, heavier. Footer has "Load again", which
  replays the sequence (shown only with JS and without reduced motion).
- Reduced motion: the finished room, nothing hidden and nothing looping. The load is CSS only and
  sits inside `prefers-reduced-motion: no-preference`, so without JS it still plays once; only
  the theme button and "Load again" need JS, and both stay hidden without it.
- Nav says "Work" rather than "Projects" on this concept so the page title can stand on the line
  ("Projects" has a descender).

## Operator — `/proto/operator/`

**In two seconds:** a dim wall of seven streams, each a group of vertical strands drifting down at
about one glyph a second. The strands are readable: a project's name, its blurb, its language and
its repository path; a post's Japanese title, date, category and URL. Each stream falls into the
entry it decodes to, and the whole column is the link.

- Every glyph comes from `proto-content.ts`, as whole phrases, built at build time. The kana and
  kanji are the two blog titles and tombo's motto. No invented strings, no clocks or telemetry.
- Vertical writing (`writing-mode: vertical-rl`, upright) is how the Japanese titles are set, not
  an effect laid over them. DotGothic16 for streams and names, M PLUS 1 Code for reading text.
- Night is phosphor green on near-black; day is an LCD in daylight (grey-green panel, dark glyphs),
  not an inversion.
- One hover detail: the stream you point at, or focus, holds still and comes up to reading
  brightness.
- "Hold streams" is a checkbox, so pausing works without JS (WCAG 2.2.2). Reduced motion: static,
  unmasked columns that read from their first glyph, and the hold control is removed.
- Below 1000px the wall becomes rows: a strip of falling text beside each entry. The Projects
  glimpse uses the same rows at desk width, with links and the hackathon note.
- The strands are `aria-hidden` and contain nothing focusable; the same text is in the entry.

## What was checked

Run against `npm run build` output, served locally and driven with the installed Chrome over the
DevTools protocol (Playwright is not installed, so `screenshot.mjs` was not run). Screenshots and
the driver scripts lived in a scratch directory under `/tmp`; nothing from them is in the repo.

- `npm run build`: passes, 38 pages.
- Full-page screenshots of all four routes at 1440 and 390, light and dark, reduced motion:
  `scrollWidth` equals `clientWidth` in all 16. One `h1` per page. Webfonts loaded on each.
- Load sequence frames at roughly 350 / 900 / 1600 / 2600 ms after a reload (timed from the
  reload command, not from first paint), motion on, both concepts.
- Theme: follows `prefers-color-scheme`; the button sets `data-theme` and its label flips;
  setting `data-theme` directly (as `screenshot.mjs` does) also switches the palette.
- Keyboard, with real Tab key events at 1440: the first Tab shows the skip link on both concepts;
  the first program and the first stream each get a visible 2px ring around the whole item; the
  "Hold streams" checkbox takes focus with a ring. A focused stream is `paused`.
- "Load again": 400 ms after the click the name is back to a 1px outline with transparent fill.
- Hover: a hovered Construct program draws its heavy line; a hovered Operator stream is `paused`
  while its neighbours keep `running`, its strands go from the dim to the bright token, and the
  point under the cursor resolves to that project's link.
- Operator: "Hold streams" changes the strands from `running` to `paused`. The shortest loop copy
  is 576px against a 378px window at 1440x900 (cap is 440px), so no stream shows a gap.
- No JS (script execution disabled, motion allowed): content renders on both home pages, every
  button stays `hidden`, and ticking "Hold streams" freezes the wall (two frames 2.5 s apart are
  byte-identical; the frame before the click differs).
- Contrast, computed from the CSS tokens for every text colour on every background, both themes:
  Construct 5.71 to 16.21, Operator 5.67 to 15.63. All at or above AA (4.5).

## Not checked

- Safari and Firefox. Both pages rely on `light-dark()`, `:has()` and `overflow: clip`.
- Screen readers. Heading order and `lang` attributes were read from the DOM, not listened to.
- Keyboard and no-JS passes covered the two home pages at 1440, not the Projects pages or 390.
- The masked upper part of each Operator strand fades below AA by design. It duplicates text that
  is shown at full contrast in the entry, and the mask is removed under reduced motion.
- Contrast was computed from tokens, not sampled from pixels.
