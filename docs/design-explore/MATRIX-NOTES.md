# /proto/matrix/ build notes

Built with Claude Code on 13 November 2026, on `design/explore`, in this worktree only. Reviewed and tightened with Codex on the same date; see `MATRIX-CRITIQUE.md`. Nothing is committed.

Direction: the Operator prototype, plus the See-the-source mechanic switching in place, pushed into a
night-time operator's station. Evokes the film; copies nothing from it (no logo, title treatment, film font,
still, likeness or quotation; the two views are not colour-coded against each other).

## Files

Created:

| File | What it is |
| --- | --- |
| `src/layouts/ProtoMatrixLayout.astro` | Standalone shell: head script, rain, header and controls, shared `h1`, both views, curtain, boot layer |
| `src/pages/proto/matrix/index.astro` | `/proto/matrix/` |
| `src/pages/proto/matrix/source/index.astro` | `/proto/matrix/source/` (source view as static HTML) |
| `src/pages/proto/matrix/projects/index.astro` | `/proto/matrix/projects/` |
| `src/pages/proto/matrix/projects/source/index.astro` | `/proto/matrix/projects/source/` |
| `src/pages/proto/matrix/_Home.astro`, `_Projects.astro` | The two pages; each renders both views. The route files only pick which one is displayed |
| `src/pages/proto/matrix/_Stream.astro` | One stream: drops of an item's own text over its readable entry |
| `src/pages/proto/matrix/_Records.astro` | The source view: the data files printed as records |
| `src/pages/proto/matrix/_lib.ts` | Build-time material: phrase list, rain columns, curtain slabs, glyph pools, the name's mask |
| `public/styles/proto/matrix.css` | All styles |
| `public/scripts/proto-matrix.js` | Enhancement: in-place view change, theme, shortcut, boot, glitches |
| `docs/design-explore/MATRIX-NOTES.md` | This file |

Not touched: production pages, `tombo.css`, `site.css`, `BaseLayout.astro`, the other `/proto/*` concepts,
`src/data/*` (imported read-only), `package.json`. `/proto/index.astro` already linked `/proto/matrix/`, so no
link was added. `package-lock.json` and `/proto/index.astro` were already modified before this build started.

No TOMBO classes and no `BaseLayout`. The pages load one stylesheet of their own and three Google Fonts families.

## Type and colour

- **IBM Plex Mono** (400/500/700): Latin reading text, controls, and the giant name. A terminal face with real weights.
- **M PLUS 1 Code** (400/500): Japanese reading text. No negative tracking on Japanese (`:lang(ja)` resets it).
- **DotGothic16**: the rain, the curtain and the boot only. A 16-dot gothic gives kana and kanji a dot-matrix look
  without imitating the film's glyphs. Nothing is mirrored and nothing is converted to half-width kana.
- Night (default): `#020805` ground, `#06120b` panels, `#c4f2d0` text, `#7cbd90` muted, `#2bf07a` phosphor.
- Day ("daylight operator", the same screen as an LCD in daylight): `#ccd7c9` ground, `#dee7db` panels, `#0c2115`
  text, `#2a4735` muted, `#0a5a31` ink green.

**Theme default.** The document ships with `data-theme="night"` and paints night even when the OS is light.
The Daylight button switches and stores `proto-matrix-theme` in `localStorage`. `?theme=day` or `?theme=night`
forces a theme for one load (for stills). `data-theme="light"` is accepted as an alias of `day`, because
`docs/design-explore/screenshot.mjs` forces `light` / `dark`.

## How the rain is sourced

Everything that falls is built at build time in `_lib.ts` from `src/data/proto-matrix-corpus.ts` and
`src/data/proto-content.ts` and written into the HTML. There is no glyph set in the CSS or the JS.

- `phrases` is `rainPhrases` minus any phrase containing "matrix" (so the film's name never appears, even as a
  commit subject), with emoji removed. 171 phrases (the page prints this number from `.length`).
- **Ambient rain**: 40 columns × 3 drops. A drop is one piece (up to 20 glyphs) of one phrase, read top to bottom,
  brightest at its leading end. Japanese and Latin phrases alternate so kana and kanji are always on screen.
  Layout uses a seeded generator, so every build is identical.
- **Streams** (the Operator idea): each project or post has its own strands made only of its own name, blurb,
  host and language (or title, date, URL, category), falling onto its readable entry.
- **Curtain**: 24 slabs of running corpus text, used for the view change and the end of the boot.
- **The name**: the `h1` is masked by an SVG in which commit subjects and post titles are cut out, so the name is
  set out of the commit log and the rain shows through the cuts. The SVG is an image, so those cut-outs use the
  reader's system monospace.
- **Decode glyphs**: the pools are the distinct kana/kanji and the distinct Latin letters and digits that occur in
  `phrases`, passed to the script as `data-wide` / `data-narrow` on `<body>`.

All of it is `aria-hidden`. The same facts are readable text on solid panels. The home page says what the rain is
made of and lists the six latest readable commit subjects; the source view prints the corpus counts.

Reading text never sits on rain: header, panels and footer have solid backgrounds, and the rain shows only in the
gaps and margins and behind the giant name in the page view (display type, solid colour, measured below). In the
source view the name is a small tab on solid ground. Hold rain (a checkbox, so it works without JavaScript) pauses it.
Pointing at or focusing a stream holds that stream still and brightens it.

## Boot

First Home visit in a tab session: five labels appear one by one (`name`, `role`, `location`, which are real keys
of the data file, then `project` and `post`, which are plain labels) and their real values decode out of corpus glyphs, then the curtain falls and lifts on the page. The
values are `person.heading`, `person.role`, `person.location`, the first project's name and the latest post's title.
No other text is typeset.

- **Skip**: the visible "Skip intro" button (focused when the boot starts, so Enter or Space work), Escape, or a
  click or tap anywhere on the layer. The head script focuses Skip even if the enhancement script fails. The boot is scrollable on short screens, with narrower key columns on mobile.
- **Once per session**: `sessionStorage['proto-matrix-boot']`. It plays only on `/proto/matrix/` in page view.
- **Fails open**: whether to boot is decided by the inline head script, which also wires Escape, click, and an
  8-second timeout. The enhancement script additionally gives up on the motion library after 2.5 seconds. If the CDN or the enhancement script never load, the layer still goes away.
- **Reduced motion**: the boot does not run and the page is shown immediately.
- **No JavaScript**: the layer is never shown.

## See the source

Each route contains both readings; `<html data-view="page|source">` decides which is displayed (the other is
`display: none`, so it is out of the accessibility tree and the tab order). One `h1` is shared by both.

- **Control**: the "View source" button in the header, with `aria-pressed`. It stays outside the swapped region, so
  focus survives the change. A polite status line announces "Source view" / "Page view"; the document title also follows the view.
- **Shortcut**: Backslash `\`, shown as a `kbd` hint on the button and in the footer. On a JIS keyboard the same key
  types `¥`, which is accepted too. Ignored with Ctrl, Alt or Meta held (Ctrl+Alt together is allowed because that
  is AltGr), and while the boot is up. Also ignored in inputs, textareas, selects, editable content, textbox/combobox widgets, during IME composition, and for already-handled events.
  The footer’s “Enable \ / ¥ shortcut” checkbox disables both keys without disabling the button. The choice is saved as
  `proto-matrix-shortcuts` when storage is available; disabling also removes `aria-keyshortcuts` and the button’s key hint.
  This provides the off switch required by WCAG 2.1.4. No browser shortcut is intercepted.
- **Transition**: the curtain falls slab by slab, the view swaps behind it, the curtain leaves and the visible
  fields settle out of raw glyphs. Going back, it runs upward. A second press during a change finishes the first
  change, then starts its own. Leaving the page finishes any running timeline. If keyboard focus is inside the
  view being hidden, it moves to the View source button.
- **In the source view** the ambient rain is held still.
- **Shareable state**: after an in-place change the address is replaced with the static twin
  (`/proto/matrix/source/`, `/proto/matrix/projects/source/`), which also works without JavaScript. `?source=1` on
  either main URL lands directly in source view with no transition. Home and Projects links follow the current view.
- **Reduced motion**: instant swap.
- **No JavaScript or missing enhancement script**: the button is replaced by a plain link to the static twin ("View source" / "View page"). Enhancement controls appear only after their handlers are installed. Storage denial does not stop initialization.

The source view prints `src/data/proto-content.ts` with its real keys, then the corpus counts. Every number is a
`.length` or a value from `activity`.

## Query flags

| Flag | Effect |
| --- | --- |
| `?boot=1` | Play the boot even if this session has seen it. A reduced-motion preference (or `?motion=0`) still wins |
| `?boot=frozen` | A still of the boot mid-sequence: three values settled, one half decoded, one raw. Needs no motion and no library, never times out, and is the same on every load |
| `?motion=0` | Treat as reduced motion: no boot, static rain, instant view change, GSAP not requested |
| `?source=1` | Land in source view |
| `?theme=day` / `?theme=night` | Force the theme for this load |

## Small rewards

All three are off with reduced motion and none blocks reading.

- **Déjà vu**: the second time you point at or focus an entry, its name repeats once within the title (about 0.5s), without covering the next line.
- **Title into commit**: two entries have a real matching commit in the log (the TPAC hackathon post and
  `feat(blog): add TPAC 2025 Kobe Hackathon experience post`; tombo and `refactor: adopt TOMBO's container scale`).
  About two seconds after one is first fully on screen, its title flickers into that commit subject and back, once.
  The decorative overlay is clipped to the title footprint; longer commit text is a fragment, never a cover over the metadata or blurb. English commit text carries `lang="en"`, then restores the title’s language.
  The title link itself is the click target; removing the stretched link makes nearby body text selectable. New entry rewards are suppressed while Hold rain is checked.
  The pairs are an explicit list and a pair only exists if the commit is found in the corpus.
- **The name doubles** for 200ms when you come back from the source view to the page.

## Motion and GSAP

The rain is CSS only (transforms). GSAP 3.13.0 is used for the boot and the curtain. It is requested from jsDelivr
by the enhancement script, with an SRI hash and `crossorigin`, only when motion is allowed. It is not in
`package.json`. If it fails to load, the boot ends, the view change is an instant swap, and the title flicker does
not run.

Reduced motion (`prefers-reduced-motion: reduce`, or `?motion=0`): every drop is parked at its own height down the
whole document, so stills still show the rain; the Hold control is hidden because nothing moves. The head script
reads the preference at load and the enhancement listens for changes during the visit. Enabling reduced motion ends the boot, finishes any view swap, clears reward overlays, and parks the rain immediately. Disabling it resumes CSS rain; if GSAP was not loaded initially, view swaps remain instant until reload. The CSS media query covers the no-JavaScript case. `?boot=frozen` does not request GSAP.

## Original build checks (Claude Code)

`npm run build` passes. Two Playwright scripts printed the following. They run against `dist/` in Chrome and are
kept outside the repo (`/tmp/mx-check/check.mjs` and `review.mjs` on the build machine), because the brief limits
which files may be added here; they are not preserved with the branch.

- 1440 and 390 wide × night and day × the four URLs (16 runs, motion off): horizontal overflow 0, exactly one
  visible `h1`, one view displayed. Lowest text contrast measured from rendered colours: 8.68 in night, 5.61 in day
  (the day figure is the name, ink green on the ground).
- Motion on (Hold rain visible, so three controls in the header), the four URLs at 1440, 390, 360 and 320 wide:
  overflow 0, measured two ways (document scroll width, and any element's right edge past the viewport). The
  measure was first confirmed to fail on an injected 600px element. It did catch one real case, a repo link that
  did not wrap on Projects at 320, which is fixed.
- JavaScript disabled, four URLs: the right view is visible, the link reads "View source" / "View page" and points
  at the static twin, the two JS buttons are hidden, Hold rain is present.
- jsDelivr refused: the boot cleared in under a second; click and Backslash both swapped the view and the address.
  jsDelivr never answering: the boot cleared after 3.3s and the toggle still worked.
- Backslash pressed with focus on a stream link: focus landed on the View source button, and the next Tab went to
  Hold rain.
- Projects, with motion: page to source and back, addresses and titles correct, nothing left on screen.
- Boot: played and ended by itself 5.5s after navigation (under the 8s timeout); did not replay on the second load;
  `?boot=1` replayed it and Escape, the Skip button, a click on the layer, and Enter on the focused button each
  ended it. `?boot=frozen` was still up, unchanged, after 9s.
- `?motion=0`: no boot, GSAP not loaded, drops not animating, toggle swaps instantly.
- `?source=1`: source view, button pressed, rain paused, Projects link pointing at the source twin.
- With motion: Backslash changed the view and the address; two quick presses settled cleanly; Ctrl+\ and Meta+\ did
  nothing; a `¥` key event toggled; the name doubled once on return; déjà vu fired on the second visit only; both
  title flickers showed their commit and left nothing behind; the rain moved and Hold rain stopped it.
- A light-OS context still painted night; choosing Daylight persisted across a reload.
- Under the shared harness's conditions (reduced motion, `data-theme` forced to `light` / `dark`, full-page
  capture): correct ground colour for each, no boot, 69 of 120 ambient drops below the first viewport.
- No forbidden phrase in the four built pages, the CSS or the JS; "matrix" appears there only in URLs, file names
  and storage keys.

## Known weak points

- **Not tested with a screen reader**, and only in Chrome (Playwright). A WebKit run was attempted and could not
  start (no matching WebKit build installed for this Playwright version). Safari and Firefox are unverified,
  especially the SVG mask on the name, `background-clip: text` on vertical text, and container-query units in
  the stream keyframes (`100cqh`).
- **Performance is unmeasured.** 164 drops animate on the home page (transforms only). No low-end device was tried
  and no Web Vitals were taken. The home HTML is about 58 KB before compression, most of it rain and curtain text.
- The name keeps its corpus mask on desktop; below 720px it uses solid phosphor lettering for legibility.
- The seven-stream wall now starts at 1360px; narrower screens retain the existing readable stream rows.
- **Latin text in the rain** is stacked upright one letter per cell, so it reads slower than the Japanese.
- **Fonts and GSAP are third-party requests** (Google Fonts, jsDelivr). The pages have no CSP meta tag, like the
  other prototypes.
- **Day theme** is a secondary reading; the rain is quieter there and it got less attention than night.
- The `impeccable` skill's launcher and its reference files (`craft-floor.md`, `new-work.md`) are not in
  `.design-skills/` in this worktree, so only its `SKILL.md` was followed.

## Codex verification

`npm run build` passed (42 pages); the existing production Projects generator needed network access to GitHub.
No production source was changed. `node --check public/scripts/proto-matrix.js` passed.

Playwright with installed Chrome checked all four routes at 1440/390 × night/day: zero horizontal overflow,
one visible h1, one visible view, computed text contrast minima 8.68:1 night / 5.61:1 day. These are solid-colour
measurements, not a pixel-level contrast guarantee for the decorative masked heading. Screenshots of desktop,
mobile, daylight Projects and mobile frozen boot were inspected. The original behavior suite passed, including
boot skips/session state, no-JS, blocked CDN, both transition directions, rapid toggles, rare rewards and Hold rain.
Additional checks covered the shortcut off switch and persistence, text fields/editable content/IME, denied
storage getters, missing enhancement script, live reduced-motion during boot and transition, and mobile Skip visibility.
Motion-on layouts also passed at 1440/1200/390 on all four routes; Japanese font/tracking, skip-link focus and hidden-view focus handoff passed. Frozen boot was verified without a GSAP request.
Temporary scripts, logs and screenshots are under `/tmp/mx-check/` and are not repository deliverables.

Chrome DevTools MCP could not connect (missing DevToolsActivePort). Playwright Chrome was used for browser
verification; the skill’s specific MCP step remains unverified. Screen-reader, Safari/Firefox and low-end-device
performance testing remain unverified. The missing impeccable launcher/reference files were not installed.
