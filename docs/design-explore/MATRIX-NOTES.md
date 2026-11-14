# /proto/matrix/ build notes

Built with Claude Code on 13 November 2026, on `design/explore`, in this worktree only. Reviewed and tightened with Codex on the same date; see `MATRIX-CRITIQUE.md`. A palette and logo pass followed, also with Claude Code; see the last section, which is current where it differs from the ones above. Nothing is committed.

**Current state: the last section, "機械用 as a shell".** The "人間用 / 機械用" section before it introduced the two
readings and is still right about 人間用, the capsule and the change between readings; its machine reading (the
byte listing, the bit grid, the downloadable executables) was replaced by a terminal in the last section. Older
sections describe the source view that came before both. Where sections disagree, the later one is right.

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
of the data file, then `project` and `post`, which are plain labels) and their real values decode out of corpus glyphs. A sixth
line, `logo` (also a plain label), then resolves to the logo image itself, wiped in whole; then the curtain falls and lifts on the page. The
values are `person.heading`, `person.role`, `person.location`, the first project's name and the latest post's title.
No other text is typeset. See "Palette and logo pass" for the logo line.

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
  The address and those links keep `palette=operator` and `motion=0` when they are in effect; `source`, `boot` and
  `theme` are not written back.
- **Reduced motion**: instant swap.
- **No JavaScript or missing enhancement script**: the button is replaced by a plain link to the static twin ("View source" / "View page"). Enhancement controls appear only after their handlers are installed. Storage denial does not stop initialization.

The source view prints `src/data/proto-content.ts` with its real keys, then the corpus counts. Every number is a
`.length` or a value from `activity`.

## Query flags

| Flag | Effect |
| --- | --- |
| `?boot=1` | Play the boot even if this session has seen it. A reduced-motion preference (or `?motion=0`) still wins |
| `?boot=frozen` | A still of the boot: three values settled, one half decoded, one raw, and the logo shown whole (a composite; in playback the logo comes after the last value). Needs no motion and no library, never times out, and is the same on every load |
| `?motion=0` | Treat as reduced motion: no boot, static rain, instant view change, GSAP not requested. Kept in the address and the links |
| `?source=1` | Land in source view. Replaced by the static twin's path on the next in-place change |
| `?theme=day` / `?theme=night` | Force the theme for this load. Not written back to the address |
| `?palette=operator` | Operator palette. Kept in the address and the links. Never stored |
| `?palette=matrix` (or none) | Phosphor, the default |

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

## Palette and logo pass

Built with Claude Code on 13 November 2026, in this worktree only, after the build and the Codex review
above. Reviewed by Codex; see `PALETTE-LOGO-CRITIQUE.md` and the follow-up below. Nothing is committed. Where this section and an older one
disagree (the flags, the address after a view change, the boot's length), this section is current.

### Files touched

| File | Change |
| --- | --- |
| `src/layouts/ProtoMatrixLayout.astro` | Head script reads `?palette`; the mark in the header link; the "Operator colours" button; the `logo` line in the boot |
| `public/styles/proto/matrix.css` | Operator night and day token blocks; `.logo` and its three sizes; the frozen-boot rule |
| `public/scripts/proto-matrix.js` | `flags()`; palette button; the address and the links keep the flags; the boot's logo wipe |
| `src/pages/proto/matrix/_Records.astro` | The `logo` record in the source view |
| `src/pages/proto/matrix/_lib.ts` | `logo = { src, size }`, the one place the file is named |
| `docs/design-explore/MATRIX-NOTES.md` | This section |

Not touched: production pages, `tombo.css`, `site.css`, `BaseLayout.astro`, `FooterLogo.astro`, the other
`/proto/*` concepts, `src/data/*`, `/proto/index.astro`, `package.json`. No route was added.
`package-lock.json` was already modified before this pass.

### `?palette=operator`

Phosphor green is still the default world. `?palette=operator` shows the same prototype in the palette of
`/proto/operator/`; `?palette=matrix`, any other value, or no flag is phosphor.

- The inline head script sets `data-palette="operator"` on `<html>` before first paint, next to theme, view and boot.
- **Control**: "Operator colours" in the header, a button with `aria-pressed`, after Hold rain. Pressing it
  changes the palette in place and rewrites the address (`history.replaceState`), so the address bar is always
  the shareable state.
- **Never stored.** No `localStorage` or `sessionStorage` key. A visit without the flag is phosphor.
- **Carried**: Home, Projects, "All projects" and the address after a view change all keep the flag.
- **Tokens** (`operator.css` names on the left):

  | Matrix token | Operator night | Operator day | From |
  | --- | --- | --- | --- |
  | `--bg` | `#100e0b` | `#cdd6cb` | bg |
  | `--panel` | `#17140f` | `#dbe2d9` | derived: a step off bg |
  | `--rule` | `#3d362c` | `#8fa093` | rule |
  | `--text` | `#ece4d4` | `#111b15` | text |
  | `--muted` | `#c2b496` | `#2f4236` | muted |
  | `--lead`, `--rain-head` | `#f0e0b4` | `#06281a` | lead |
  | `--green` | `#d9b56a` | `#0a4f2f` | accent |
  | `--rain` | `#8a7b5e` | `#6f8073` | derived: stream (`#c3b089` / `#3c5244`) stepped towards bg |
  | `--rain-tail` | `#2a251d` | `#b7c3b6` | derived: between bg and rule |

  `--rain` is not the literal stream colour. I tried the literal first: in Operator it fills narrow strips,
  here it fills the viewport, and at full strength the rain read at text brightness around the name and
  the nav. The stepped value puts it at about the weight the phosphor rain has.

**The address after a view change** used to lose its whole query string. `swap()` now rebuilds it from live
state: `palette=operator` if the palette is on, and `motion=0` if the page was loaded with it. `source=1` and
`boot` are deliberately not kept (they are spent, and `source=1` would contradict `/proto/matrix/` on reload).
`theme` is not kept either: the theme is the reader's stored choice, and the Daylight button does not write to
the address. The links carry the same two flags.

### The logo

One file everywhere: `/images/logo-400.png` (`public/images/logo-400.png`, 400×400, by Chisato Satoh), in a
plain `<img width="400" height="400">`. It is never redrawn, cropped, rounded, rotated or masked: every instance
is `aspect-ratio: 1`, `object-fit: contain`, no `border-radius`, and its black field is treated as part of the mark.

**Colour.** Phosphor night and both day themes show the file exactly as designed (`filter: none`). Operator
night applies `filter: hue-rotate(-80deg) saturate(1.15)`, which moves the green to amber and moves no pixel.
Chosen by eye over two rounds of candidates rendered beside an accent swatch, then eased from
`saturate(1.3)` to `1.15`: `hue-rotate(-98deg)` came out salmon, and the `sepia()` chains flattened the white
numerals into the burst. Black stays black and the numerals stay white.
Operator day is left untinted: on the grey-green LCD the green-on-black badge already belongs.

Three treatments, meant as one system:

1. **Header.** The mark sits left of `wadakatu_` inside the home link, 44px square, 14px from the wordmark and
   at least 12px from everything else. `alt=""`, because the wordmark is the link's name. Persistent identity.
2. **Boot.** After the five values decode, a sixth line, `logo`, resolves to the image itself, wiped in from
   the top in ten steps over 0.5s (a `clip-path` wipe; the image is never scrambled or glyph-decoded), held
   0.5s, then the curtain falls. `logo` is a plain label like `project` and `post`, not a key of the data file.
   `?boot=frozen` shows the logo whole, by CSS alone, without the script or the motion library. That frame is a
   composite: in playback the logo only appears after the last two values have settled.
   Reduced motion or `?motion=0`: no boot, and the mark is simply in the header.
3. **Source view.** A `logo` record after `person`: `src` (`/images/logo-400.png`, a link to the file), then
   `logoCredit` and `logoCreditUrl` (the same values printed under `person`), then the image at
   `min(100%, 400px)`, `alt="wadakatu logo"`, on the solid panel. It sits outside every `[data-d]` node, so the
   view change's text decode cannot touch it. Not shown on `/projects/source/`, which prints projects only.

The footer credit link to Chisato Satoh is unchanged.

**Recommendation.** Keep all three, as one system with one job each: the header carries the mark, the boot
introduces it once per session as the last fact about him, the source view shows the file it came from. If one
has to go, drop the boot line first: it is seen once and the header already shows the mark the moment the
curtain lifts. Keep phosphor as the default. The operator palette is worth keeping at night, where it is a
different room; in daylight it is close to a no-op (see below).

The "Query flags" table above lists every flag, including these.

### Checks

`npm run build` passes (42 pages). Two scripts ran against `dist/` in Chrome through Playwright; both are
outside the repo because the brief limits which files may be added. Stills are in `/tmp/mx-palette/shots/`.
Neither the scripts nor the stills are preserved with the branch.

`/tmp/mx-palette/check.mjs`, 69 checks, all passing on the final build:

- Load: no flag, `?palette=matrix` and `?palette=nonsense` paint `rgb(2, 8, 5)`; `?palette=operator` paints
  `rgb(16, 14, 11)`, and with `&theme=day` `rgb(205, 214, 203)`. The button's pressed state matches.
- With motion and the curtain, on Projects: `…/projects/source/?palette=operator`, then back to
  `…/projects/?palette=operator`; the three in-page links carried the flag in both views; following Home
  landed on `/proto/matrix/?palette=operator`, still operator.
- `?source=1&palette=operator&motion=0&theme=day`: toggling gave `/proto/matrix/?palette=operator&motion=0`,
  then `/proto/matrix/source/?palette=operator&motion=0`. In phosphor no palette flag appears by itself.
- `?source=1&motion=0`, then the palette button: `/proto/matrix/source/?palette=operator&motion=0`, and a reload
  came back in source view and operator. This case failed on an earlier build of this pass (the button wrote
  the page path while the source view was showing) and is why the button and the view change now share one
  `address()` helper.
- The button, by keyboard (Enter, then Space): address, `aria-pressed` and links flipped both ways; focus stayed
  on the button; storage stayed empty; a later visit without the flag was phosphor.
- JavaScript disabled with `?palette=operator`: phosphor, no palette button, logo unfiltered.
- Enhancement script blocked with `?palette=operator&boot=frozen`: the palette painted, the logo was visible in
  the boot, Escape ended it.
- The mark, 4 palette/theme combinations × 1440 and 390: `naturalWidth` 400×400, rendered square (44×44 in the
  header; 400×400 or 329.5×329.5 in the source view), `object-fit: contain`, `border-radius: 0px`, no clip, no
  transform; the filter is `none` except in operator night.
- Header clearspace at 1440, 390 and 320 with all four controls showing: at least 12px on every side. Only the
  header was measured; the boot and source placements were judged from stills.
- Boot with motion: the logo line was hidden until its turn, the wipe was seen from `inset(0 0 100%)` to
  `inset(0 0 0%)`, and the boot ended by itself after 6184ms. The original suite measured 6102ms on the same
  build; earlier builds of this pass measured between 5959ms and 6242ms. The failsafe is 8000ms.
- `?boot=frozen` at 1440×900, 390×844 and 390×600, in phosphor, operator and with `?motion=0`: logo visible, no
  GSAP request, Skip intro focused and inside the viewport, no horizontal overflow.
- Reduced motion with `?boot=1`: no boot, header mark present, nothing animating.
- After an animated view change all three `img` elements were intact.
- Operator palette, motion on (so Hold rain is in the header), 4 routes × 1440, 1200, 390, 320 × night and day
  (32 runs): overflow 0, one visible `h1`. Lowest text contrast from rendered colours: **8.98** night, **6.48**
  day. Control border on the ground: 9.42 night, 6.48 day. Focus ring: 9.88 on ground and 9.42 on panel at
  night, 6.48 and 7.32 in day. As before these are solid-colour measurements; the masked name is not a
  pixel-level guarantee.

`/tmp/mx-check/check.mjs` (the original suite, unchanged), 40 checks, all still passing on this build:
phosphor contrast minima still 8.68 night / 5.61 day, no-JS, blocked CDN, boot skips, rapid toggles, rewards.

### Still weak

- **The tint has not been seen by the designer.** Operator night recolours a friend's mark. The geometry is
  untouched and the default shows it as designed, but Chisato Satoh should see the amber version before it
  goes anywhere public.
- **Operator day barely differs from phosphor day.** The two grounds are `#cdd6cb` and `#ccd7c9`. In daylight
  the palette button changes the accent by a shade and little else.
- **The file is 240,877 bytes**, loaded on every page for a 44px header image. Right for a prototype that must
  use the mark as designed; a shipped version would want a smaller derivative for the header.
- **At 44px the mark is a burst.** The numerals and the rain texture inside it are not legible at header size;
  they are in the boot and the source view.
- **On the day themes the mark is a black square on a light header.** It reads as a badge. That is the mark as
  designed, and it is the hardest edge on the page.
- **No operator palette without JavaScript.** No static `/operator/` routes were added; the flag works the way
  `?theme=day` does. If the enhancement script fails to load, the palette still paints from the head script but
  there is no button. The Codex follow-up below preserves the flags in fallback links.
- **`?theme=` falls out of the address** on an in-place view change or a press of the palette button (the page
  keeps the theme until reload). Before this pass the view change dropped the whole query.
- **The boot is about half a second longer**, roughly 1.8s inside the failsafe. On a slow CDN the failsafe can
  end the boot before the logo line.
- Chrome only, as before. `filter` on the image in Safari and Firefox, and a screen reader, are unverified.
- The `impeccable` launcher and its reference files are still absent from `.design-skills/`; only its
  `SKILL.md` and `frontend-design/SKILL.md` were followed.

### Codex palette/logo follow-up — 13 November 2026

The head script now synchronizes plain fallback links at DOM readiness if the enhancement did not initialize.
Home, Projects, All projects and the static view-twin link keep `palette=operator` and `motion=0`.
They also follow the actual `data-view`, including a view selected by `?source=1`; the twin reads "View page"
when source is already showing. Previously the head selected the palette/view but only the external script
updated links, so blocking that file lost flags and could leave the twin pointing at the current view.
The fallback does not rewrite the current address, persist the palette, or carry spent boot/source flags.
Fully disabled JavaScript still uses the original static phosphor pages. No routes or visual tokens changed.

Review findings and verification are recorded in `PALETTE-LOGO-CRITIQUE.md`.

## 人間用 / 機械用 (Fable pass)

Built with Fable (Claude Code `--model fable`) on 13 November 2026, in this worktree only, on top of everything
above. This section is current where it differs from the older ones. The work is on `design/explore` (do not merge).

The page now has two readings of the same data file.

- **人間用** is the page as it was: rain, streams, boot, logo, palettes. Unchanged apart from the control that
  switches and one short panel at the foot of Home.
- **機械用** is the same facts as the program they assemble to. At build time each page is assembled into a real
  x86-64 Linux executable (ELF64, static, no libc): 33 bytes of code that write the page's facts to standard
  output, and one section per group of facts (`.person`, `.bio`, `.projects`, `.posts`, `.activity`, `.skills`,
  `.rain`, `.log`), each a run of `key=value` lines whose keys are the data file's own keys. The machine reading
  is that file printed byte for byte in a terminal: offset, the bytes, and what they say. The same bytes are
  served beside the page for download.

It replaces the earlier source view. `_Records.astro` is deleted; every field it printed is in the listing.

One variant, not several. The raw, unannotated view exists as a command (`xxd`) inside it rather than as a
second route.

### Routes and flags

| Address | What |
| --- | --- |
| `/proto/matrix/`, `/proto/matrix/projects/` | 人間用 |
| `/proto/matrix/machine/`, `/proto/matrix/projects/machine/` | 機械用, as static HTML. Works without JavaScript |
| `/proto/matrix/machine/wadakatu`, `/proto/matrix/projects/machine/projects` | The two executables (4,208 and 1,666 bytes in this build) |
| `/proto/matrix/source/`, `/proto/matrix/projects/source/` | Earlier addresses, kept: they render the machine reading. The next in-place change rewrites the address to `/machine/` |

| Flag | Effect |
| --- | --- |
| `?mode=machine` | New. Land in the machine reading on either main URL, with no transition |
| `?source=1` | Kept, as the earlier name of `?mode=machine` |
| `?boot=1`, `?boot=frozen`, `?motion=0`, `?theme=day\|night`, `?palette=operator` | Unchanged, and all work in both readings. `palette` and `motion=0` are carried by every link and by the address after a change, as before |

`<html data-view>` is now `page` or `machine` (was `page` or `source`).

### How to switch

1. **The capsule in the header**: one capsule, two halves, `人間用` and `機械用`. They are two links to the two
   static routes, with `aria-current` on the side you are on; the script makes the same choice happen in place
   and puts the static twin in the address bar. This replaces the View source button and its no-JS twin link.
2. **Backslash** `\` (or `¥`), as before, with the same guards and the same off switch in the footer.
3. **The same capsule, large, in a "Two readings" panel at the foot of Home**, each half saying what is on its
   side (`the page`, `4,208 bytes of x86-64`).
4. **On the boot layer**, beside Skip intro. `機械用` ends the intro straight into the machine reading; `人間用`
   is Skip. `?boot=frozen` shows it, so the choice can be taken as a still.
5. **From inside the machine reading**: the mode line fixed to the bottom of the window (`-- 機械用 --`, the
   file and its size, and a link back to `人間用`), or `exit` at the prompt.

The homage is the capsule itself: one capsule, two halves, a blue dot on the side that stays in the constructed
page and a red dot on the side that shows what it is made of. Those two colours (`--pill-human`,
`--pill-machine`) are used for the dots only, never for text. No film wording is used anywhere; the labels are
his own words for the idea. The earlier note that the two views are not colour-coded against each other no
longer holds for these two dots.

Languages: `人間用` and `機械用` are the only Japanese in the controls, each `lang="ja"` in the Japanese face,
and neither is glossed in English beside it. The small text under the large capsule describes what is there; it
does not translate the label.

### What the machine reading shows

Top to bottom, on `/proto/matrix/machine/`:

- **The name as a line of terminal text** with a block cursor (the one shared `h1`; the cursor blinks five
  times and stays lit).
- **The name as bits.** `wadakatu` is 8 bytes, so it is an 8 × 8 grid, one row per letter, and it fits one
  64-bit register (`0x7574616b61646177`). `Projects` is also 8 bytes, so the Projects page gets the same.
  Decorative, `aria-hidden`; the sentence beside it says the same in text.
- **The file**: a download link, kind, size, entry point, SHA-256, and the command that runs it.
- **The section table**, which doubles as the way around: one link per region with its offset and size.
- **The listing**: ELF header, program header, `.text` (the eight instructions with what each does), then the
  content sections, then `.shstrtab` and the section table. Every byte of the file appears exactly once, in
  order. Bytes above `0x7f` are lit, which is where the Japanese is: the three-byte runs are visible in `.posts`
  and in tombo's blurb.
- **`public/images/logo-400.png`**, on Home only: the file's first 33 bytes read from disk at build time (PNG
  signature and the IHDR chunk: 400 × 400, 8 bits per channel, RGB with alpha), then the picture itself. The
  mark is never set in glyphs or drawn from characters; it is the real `<img>`, whole and square, with the same
  palette filter as everywhere else, lifted above the scan lines so nothing is drawn across it.
- **A prompt** (needs the script): `help`, `ls`, `cat SECTION`, `xxd`, `./wadakatu`, `clear`, `exit`.
  `xxd` and `./wadakatu` fetch the real file. `./wadakatu` does what the code does, reading the address and the
  length from the instructions' own operands. Output goes to a `role="log"` region and focus stays in the field.

Around it the page itself gives way: no rain, no panels, no giant masked name, full window width, scan lines,
the nav as a numbered window list with the current one starred, phosphor bloom on headings and lit bits at
night (none in daylight).

**Where the numbers come from.** Every number on the machine side is computed from the bytes it describes or
is a value from the data file: offsets, sizes, the entry point, the hashes, the operands. There are no
invented PIDs, hosts, uptimes or versions. The prompt's `wadakatu@japan` is `person.name` and
`person.location`. The assembler refuses to build if its rows do not tile the file or if the code's operands do
not point at the data (a self-check in `_machine.ts`, run on every build). Phrases that name the film are
still excluded: the listing uses `phrases` and `readableCommits`, never the raw corpus.

### The change between readings

With motion and GSAP: the text on screen turns into the hex digits of its own characters, the picture collapses
to a line and goes out like a tube being switched off, and the listing prints top to bottom. Going back, the
listing clears from the bottom, the page opens from a line, its headings settle out of raw glyphs and the name
doubles once, as before. A little over a second each way (the timeline's durations add up to about 1.2s in
and up to about 1.3s back). One collapse, no flashing. A second press finishes
the first change before starting its own: the way back adds its heading tweens while it runs, so finishing it
takes a second push to the timeline's new end (`finish()` in the script). The curtain of corpus slabs is now used only at the end of the boot.

- **Reduced motion** (`prefers-reduced-motion`, or `?motion=0`): the change is an instant swap, GSAP is not
  requested, the cursor does not blink, and nothing else in the machine reading moves.
- **No JavaScript**: the capsule's halves and the mode line's link are plain links between the two static
  routes. The whole listing, the section table, every link and the download are in the markup. Only the prompt
  is missing (it is hidden without the script). The operator palette still needs the head script, as before.
- **Enhancement script blocked, head script running**: the head script's fallback now sets the capsule's
  links, their `aria-current`, and the flags, for whichever reading the address asked for.
- **GSAP unreachable**: instant swap, as before.

### Accessibility

- Skip link, one visible `h1`, visible focus, and the same keyboard paths in both readings. Tab order in the
  header: Home, Projects, Blog, About, 人間用, 機械用, Operator colours, Daylight (on the page, with motion, Hold
  rain sits before Operator colours, as before).
- Offsets and bytes are `aria-hidden`. The reading column is real text: `key=value` lines, real links (URLs,
  `mailto:`), project names and post titles as `h3`, sections as `h2` with their region labelled.
- Focus is never left in a hidden reading: a change made from inside one (the large capsule, the prompt's
  `exit`, Backslash with focus on a stream link) hands focus to the header capsule.
- The status region announces "Machine reading" / "Human reading"; the title follows.
- The mode line is fixed, so the root has `scroll-padding-bottom` and the shell has room under the footer.
- Blink is finite (five times), per the repo's earlier decision to drop indefinite blinking.

### Files

| File | Change |
| --- | --- |
| `src/pages/proto/matrix/_machine.ts` | New. The assembler: ELF layout, the instructions, the `key=value` sections, the row model, the self-check, the logo file's header |
| `src/pages/proto/matrix/_Machine.astro` | New. The machine reading |
| `src/pages/proto/matrix/_Pill.astro` | New. The capsule |
| `src/pages/proto/matrix/machine/index.astro`, `projects/machine/index.astro` | New static routes |
| `src/pages/proto/matrix/machine/wadakatu.ts`, `projects/machine/projects.ts` | New endpoints serving the bytes |
| `src/pages/proto/matrix/_Records.astro` | Deleted |
| `src/pages/proto/matrix/source/index.astro`, `projects/source/index.astro` | Now render the machine reading |
| `src/pages/proto/matrix/_Home.astro`, `_Projects.astro` | The `machine` slot; the "Two readings" panel on Home |
| `src/layouts/ProtoMatrixLayout.astro` | `view` is `page \| machine`; `?mode=machine`; the capsule in the header and the boot; fallback link sync |
| `public/styles/proto/matrix.css` | Source-view rules removed; the capsule, the machine reading, the mode line; three tokens (`--pill-human`, `--pill-machine`, `--glow`) |
| `public/scripts/proto-matrix.js` | The in-place change and its motion; the prompt; the capsule replaces the button |
| `src/pages/proto/matrix/_lib.ts` | One comment |

Not touched: production routes, `tombo.css`, `site.css`, `BaseLayout.astro`, `FooterLogo.astro`, the other
`/proto/*` concepts, `src/data/*` (imported only; `logo-400.png` is read, not written), `package.json`.
`package-lock.json` was already modified before this pass. No dependency added: the assembler uses `node:crypto`
and `node:fs` at build time only.

### Checks

`npm run build` passes (44 pages, up from 42: the two `/machine/` routes; the two endpoints are files, not
pages). Scripts and stills are in `/tmp/mx-machine/` on the build machine, outside the repo because the brief
limits which files may be added; they are not preserved with the branch. All figures below were printed by
those scripts or by the named tool on the final build, after the last edit to the page.

**The file is real.**

- `file` reports both as `ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, stripped`.
- LLVM `objdump -d` disassembles `.text` to the same eight instructions the page prints, and `objdump -h`
  lists the same sections with the same sizes and addresses.
- Run in an `alpine:3.20` container under `--platform linux/amd64` (Docker on an arm64 Mac, so emulated; the
  image was pulled for this and removed afterwards):
  `wadakatu` exits 0 and writes 3,275 bytes, `projects` exits 0 and writes 1,230. The SHA-256 of each output
  equals the SHA-256 of that file's bytes 153 onward for that length, which is what the page says it prints.
- `shasum -a 256` of each file equals the hash printed on its page.
- The hex on the page, concatenated, equals the file (4,208 of 4,208 bytes; 1,666 of 1,666), and every row's
  offset is where its bytes are.
- The prompt's `xxd` output is identical to `/usr/bin/xxd` on the same file (263 and 105 lines), and
  `./wadakatu` at the prompt prints exactly the bytes the container run printed.
- The logo rows match `xxd -l 33 public/images/logo-400.png`; the file is 240,877 bytes.

**`act.mjs`, 42 checks, all passing**: the in-place change by click, by Backslash, from the large capsule, from
the mode line and from the prompt, with the address, title, status, `aria-current` and focus after each; text
seen as hex and the transform seen mid-change; nothing left styled, scrambled or `aria-busy` afterwards; two
quick presses settling cleanly; modifiers ignored; Backslash typed into the prompt staying text; every prompt
command, including an unknown one and a prototype name, with focus staying in the field; `?mode=machine`, `?source=1` and `/source/` landing in
the machine reading and then normalising to the static twins; the operator palette, the palette button and
Daylight inside the machine reading; the boot capsule in `?boot=frozen` and in a playing boot; JavaScript
disabled (113 rows visible, 16 links in the listing, the way back a link, no prompt); reduced motion (instant,
no GSAP, no running animation).

**`layout.mjs`, 64 runs, all passing**: phosphor and operator × night and day × 1440, 960, 390, 320 × the four
routes, motion on. Horizontal overflow 0 (document width, and any element's right edge), one visible `h1`,
every visible logo square at its natural 400 × 400 with `object-fit: contain`, no radius, clip or transform.
Lowest text contrast from rendered colours:

| | Machine reading | Page |
| --- | --- | --- |
| Phosphor night | 9.18 | 8.68 |
| Phosphor day | 5.61 | 5.61 |
| Operator night | 9.42 | 8.98 |
| Operator day | 6.48 | 6.48 |

The bytes column, which is decorative and hidden from assistive tech, measures 9.18, 6.89, 9.42 and 7.21 in
the same order. These are solid-colour measurements; the scan lines are a 28% wash of the ground colour on one
pixel row in three and are not included.

**The two earlier suites, ported.** `/tmp/mx-check/check.mjs` and `/tmp/mx-palette/check.mjs` cannot run
unchanged: they look for `.view-source` and `#view-toggle`, which no longer exist. `port.py` rewrites only
selectors and expected names (source to machine, the button to the capsule) and one expectation: Hold rain must
be present on the page and absent in the machine reading, where there is no rain. Ported, they pass 40 of 40
and 69 of 69: boot (ended by itself after 6,159ms; failsafe 8,000ms), the four ways to skip it, the frozen
still, blocked CDN (boot cleared after 897ms, the change still works), `?motion=0`, the déjà vu, the title
flicker, the name doubling, rain and Hold rain, night on a light OS, the palette button and its addresses, the
logo geometry and the boot's logo wipe.

**`extra.mjs`, 24 checks, all passing.** It covers what the third earlier suite (`codex-regression.mjs`,
`codex-layout.mjs`) covered, on the new model, plus two things the rewrite put at risk:

- The shortcut's off switch: keys do nothing, the choice survives a reload, the key hint is removed from the
  capsule, the capsule still works; back on, Backslash is ignored in inputs, textareas, selects, editable
  content, the prompt and during composition, and works with focus on the capsule.
- `proto-matrix.js` blocked: Skip intro focused and working, the capsule shown as links, script-only controls
  hidden. With `?mode=machine&palette=operator&motion=0` the head script alone sets the reading, the palette,
  both capsule hrefs, `aria-current` on the machine half only, the mode line's link and the three nav links,
  all carrying the flags; pressing `人間用` is then a real navigation that keeps the palette.
- Storage getters that throw: the change still works, no errors.
- Reduced motion switched on during the boot, and during a change in each direction: it finishes at once and
  leaves nothing styled, busy, doubled or scrambled.
- **Rapid changes**, six patterns from 50ms to 400ms apart, two to five presses, starting from either side:
  each settles in the right reading at the right address with every heading and title restored. This check
  was confirmed to fail without the fix: with `finish()` reduced to a single push, five of the six patterns
  left a heading scrambled (for example "Work and writsiW").
- Japanese runs on all four routes use M PLUS 1 Code first with `letter-spacing: normal`; the skip link is the
  first tab stop in the machine reading and moves focus to `main`; every tab stop there shows an outline. Tab
  order in the machine reading: Skip to content, wadakatu_, Home, Projects, Blog, About, 人間用, 機械用,
  Operator colours, Daylight, then the download link and the section table.

No forbidden phrase in the built pages, the CSS, the JS or the sources (0 matching files). "Kobe" appears three
times in the machine reading, each inside a real post title; the location is `Japan` only.

The running dev server (PID 88553, port 4321) was left alone and serves the new routes and the binary.

### Still weak

- **It serves executables.** Two small ELF files sit beside the pages. Browsers and scanners can be wary of
  unknown executables; decide whether that is wanted before this goes anywhere public. The page works the same
  if the download link is dropped: the listing is static markup.
- **Run only under emulation.** The container run was amd64 emulated on an arm64 Mac. It was not run on real
  x86-64 hardware. The program makes a single `write` call and does not retry a short write.
- **The machine reading is long**: about 9,700px at 1440 wide and 15,560px at 390 (measured before the last
  small fixes). The section table gets you around, but on a phone it is a lot of scrolling, and the section
  table at the end of the file is 704 bytes of mostly zeros.
- **Every route carries both readings.** Home's HTML is now 102,484 bytes uncompressed (the earlier notes
  measured about 58 KB), Projects 70,643. Most of the growth is hex.
- **The labels are Japanese on an English page.** That is the idea as he named it, but a reader without
  Japanese has to learn what the two halves do by pressing one. Nothing on the page says in English what the
  two words mean, on purpose: a gloss beside them would be a translation set side by side. The "Two readings"
  panel describes what is on each side (the page, the program) and no more.
- **The dots are the whole homage.** It is quiet. If it should be felt more, the capsule is the place.
- **`0x80` and above are lit everywhere**, so opcodes and addresses in the structural rows light up as well as
  the Japanese. It reads as texture there; it only means "Japanese" in the content sections.
- **The prompt is small.** Seven commands, no history, no completion. `cat` reads the page's own text, not the
  file; `xxd` and `./wadakatu` read the file. `xxd` prints the whole file (263 lines on Home) into the log.
- **The scan lines dim one pixel row in three** over text as well as ground. Contrast was measured without
  them.
- **The transition was judged from slow-motion stills**, not on a slow machine. The text-to-hex step rewrites
  every visible text node for about a third of a second.
- **Chrome only**, through Playwright, as before. No screen reader, Safari or Firefox run. `content: … / ''`
  alt text on generated content, `color-mix()` and `:has()` are all used.
- **`?boot=frozen` stills can catch Japanese mid-decode.** On 13 November 2026 the frozen overlay showed
  readable English (name, role, Japan) but garbled project and post lines (`laravel-利生ャ発べル・ァ`, and a
  run of mixed-up kana/kanji instead of the real post title). The live boot finishes correctly; this is a
  stills/freeze problem, not a content invention. Prefer a completed boot, or a playing one, when judging
  those two lines.
- **The old stills in `docs/design-explore/shots/` that show the source view** are from the earlier pass, which
  this one replaced. New stills for the two readings and the switch were added in that folder after Fable
  finished (see below). They are also copied to the box at `/workspace/wadakatu-dev/design-protos/`.

### Official stills (taken after Fable finished)

Playwright, Chrome, 1440×900 and 390×844, against the running dev server at `http://127.0.0.1:4321`. The switch
video is about 2.7s at the true capture rate (~14.7 fps), 1440×900, human page then the in-place change.

| File | What |
| --- | --- |
| `docs/design-explore/shots/matrix-human-home-1440.png` | 人間用, first screen |
| `docs/design-explore/shots/matrix-human-home-390.png` | 人間用, phone |
| `docs/design-explore/shots/matrix-machine-home-1440.png` | 機械用, first screen (bit grid and section table) |
| `docs/design-explore/shots/matrix-machine-home-390.png` | 機械用, phone |
| `docs/design-explore/shots/matrix-switch-1440.png` | Mid-change: body text turned into its own hex |
| `docs/design-explore/shots/matrix-switch-390.png` | Mid-change, phone |
| `docs/design-explore/shots/matrix-machine-listing-1440.png` | Listing at `.posts`, Japanese bytes lit |
| `docs/design-explore/shots/matrix-machine-logo-1440.png` | Real `logo-400.png` in the listing, square, no crop |
| `docs/design-explore/shots/matrix-machine-operator-1440.png` | 機械用 with `?palette=operator` |
| `docs/design-explore/shots/matrix-boot-choice-1440.png` | `?boot=frozen` with the capsule (see the Japanese caveat above) |
| `docs/design-explore/shots/matrix-human-machine-switch-1440.mp4` | Switch video (not committed; on the box) |

## 機械用 as a shell (Fable terminal pass)

Built with Fable (Claude Code `--model fable`) on 13 November 2026, in this worktree only, on `design/explore`
(do not merge). This section is current where it differs from everything above. It
replaces the machine reading of the previous section: the 9,700px byte listing, the bit grid, the section table,
the seven-command prompt at the foot of it, and the two downloadable executables are gone.

機械用 is now one shell in one viewport. The header, the screen, a row of keys and a status line fill the window
exactly; the session scrolls inside the screen and the window itself does not scroll. You type commands and get
this site's real data back. 人間用 is unchanged apart from the wording of the "Two readings" panel.

One terminal, not several. The Projects routes are the same terminal started in `~/projects`.

### Routes and flags

| Address | What |
| --- | --- |
| `/proto/matrix/machine/` | The shell, in `~`, after `neofetch`. Shareable |
| `/proto/matrix/projects/machine/` | The same shell, in `~/projects`, after `ls -l` |
| `/proto/matrix/source/`, `/proto/matrix/projects/source/` | Earlier addresses, kept: the same two shells |
| `/proto/matrix/`, `/proto/matrix/projects/` | 人間用 |

| Flag | Effect |
| --- | --- |
| `?mode=machine`, `?source=1` | Kept. Land in the shell on either main URL |
| `?run=COMMAND` | New. The first command is this one instead of `neofetch` (for example `?run=git%20log%20--oneline`). It is not added to the history, and `open` run this way prints its link without opening a window |
| `?palette=operator`, `?theme=day\|night`, `?motion=0` | Unchanged, and all apply to the shell |
| `?boot=1`, `?boot=frozen` | Unchanged (they belong to 人間用) |

The executables at `/proto/matrix/machine/wadakatu` and `/proto/matrix/projects/machine/projects` no longer exist.

### What it is like

- **Prompt** `wadakatu@japan:~$` (`person.name` and `person.location`, as before), with the working directory in
  it. Below 720px it takes two lines, path above and `$` below, so there is room to type.
- **Block cursor.** The field is a real `<input>`; its native caret is hidden and a block is drawn where the
  caret is, showing the character under it in reverse. It is lit while the field has focus and hollow when it
  does not. It blinks five times after each keystroke and then rests lit.
- **Keys.** Up/Down recall (the draft you were typing comes back), Tab completes commands, paths, `man` topics,
  `git` subcommands and `open` names and lists the candidates when ambiguous, Ctrl+L clears, Ctrl+C cancels the
  line or stops a running command, Ctrl+U cuts to the start, Ctrl+A / Ctrl+E jump, Ctrl+D on an empty line exits,
  PageUp/PageDown scroll the session.
- **Login.** Two lines, then the first command already run: `Last login:` is the reader's own previous visit
  (kept in `localStorage`; "never" the first time), and `neofetch` is there because `~/.zshrc` ends with it.
- **Status line**, tmux style: `[機械用] 0:zsh* ~/projects`, the time in Japan, and `人間用` as the way back. The
  process name changes while `vim`, `ping` or `cmatrix` runs.
- **Taps.** A row of suggested commands sits above the status line. On touch devices it starts with the keys a
  phone keyboard lacks: `tab`, `↑`, `↓`, `^C`. File names in `ls` output and commands mentioned in messages can
  be tapped to run. None of this moves focus, so a phone's keyboard stays as it was.
- Scan lines, phosphor green by default, the numbered window list in the header, and the capsule are as before.

### Commands

`help` lists these 19. All of them run, and each has a `man` page.

| Command | Returns |
| --- | --- |
| `whoami` | Name, role, Japan |
| `about` | `cat ~/about.txt`: name, role, the three bio lines |
| `ls [-la] [DIR]`, `cd`, `pwd`, `tree` | The file tree below |
| `cat FILE...`, `head`, `tail`, `grep [-cinrv]`, `wc [-lwc]`, `sort`, `uniq` | File contents and filters |
| `projects` | `ls -l ~/projects`: the five projects with language and blurb |
| `posts` (also `blog`) | `ls -l ~/posts`: the 17 published posts with date and title; the title links to the post |
| `open NAME` | Opens a real link in a new tab: `github`, `x`, `email`, `site`, `blog`, `about`, `docs`, `credit`, a project name, or a file (`open posts/b7c1f2a8d3e4f5.md`) |
| `contact` (also `links`) | Email, GitHub, X, site, as links |
| `skills` | The eight skills, one per line |
| `neofetch` | The real logo beside the facts: role, location, since 2020, repos and forks, PRs, posts, stack, projects, logo credit, and the eight theme colours |
| `logo` | The real logo and its credit |
| `git log [--oneline] [-n N]` | This repository's real commits |
| `xxd [-l N] FILE` | Hex dump of any file, or of piped text |
| `theme day\|night`, `palette operator\|phosphor` | The header's own two buttons, by name |
| `history`, `man COMMAND`, `clear`, `exit` | As named. `exit` returns to 人間用 |

Shell behaviour that also works: pipes (`git log --oneline | grep fix | wc -l`), `;` and `&&`, `*` globs,
quotes, `$USER` `$HOME` `$PWD` `$SHELL` `$EDITOR` `$HOSTNAME`, `!!`, aliases (`alias` prints the table), and
`which`, `echo`, `date` (Japan time), `uptime` (minutes this tab has been open), `uname -a` (your browser's
user agent), `hostname`, `file`, `reboot` (the boot sequence again).

**The file tree** is generated at build time from the two data files:

```
~
├── projects/   laravel-spectrum.md  screenbook.md  gitlyte.md  tombo.md  w3c-hackathon.md
├── posts/      17 files, one per entry in blogExcerpts, named by slug
├── README.md  about.txt  contact.txt  skills.txt  activity.txt
├── logo.png    public/images/logo-400.png
├── wadakatu*   the ELF program (see below)
└── .zshrc  .zsh_history      hidden; .zsh_history is the session's real history
```

A post file is front matter (title, date, URL), the excerpt from the corpus and a line saying the rest is at the
URL. Sizes in `ls -l` are the real byte lengths of what `cat` prints.

**Not listed in `help`** (the last line of `help` says so):

| Typed | Answer |
| --- | --- |
| `sudo ...` | `wadakatu is not in the sudoers file. This incident will be reported.` |
| `rm -rf /` | GNU's own refusal. With `--no-preserve-root`, `Read-only file system` for each file, and everything is still there |
| `rm`, `touch`, `mkdir`, `mv`, `cp`, `chmod`, `>` | `Read-only file system` |
| `vim [FILE]` (`vi`, `nvim`) | Opens. See below |
| `:q`, `:wq`, `:q!` at the shell | "You are not in vim. Good reflex, though." |
| `emacs`, `nano` | Not found; vim is installed; read `man vim` first |
| `man vim`, `man sudo`, `man rm`, `man man`, `man`, `man woman` | Short pages, and man's real replies |
| `ping HOST` | Four timed HTTP HEAD requests to this origin, with real round-trip times and statistics. Ctrl+C stops it. Other hosts are refused: a tab only reaches its own site |
| `cmatrix` (`matrix`) | The page's own rain over the whole window until any key |
| `follow the white rabbit` | A rabbit, and a real post picked at random with a way to open it |
| `knock knock` | `Race condition.` / `Who's there?`, and where the rabbit went |
| `make me a sandwich`, `sudo make me a sandwich` | `What? Make it yourself.` / `Okay.` |
| `php artisan inspire` | tombo's three rules, in his words. Other `php` is not found: static files only |
| `git status`, `git push [--force]`, `git blame`, `git commit` | Clean; a 403 for `visitor`; "It was like that when I got here."; read-only |
| `ssh`, `curl`, `wget`, `top`, `htop`, `docker`, `make`, `sl` | One line each |
| `cat /etc/passwd`, `cd ..`, `cd /` | `Permission denied` |
| An unknown command | `zsh: command not found`, with "Did you mean" when one is close |

**vim.** `vim` takes the screen: the file (read-only) or a splash, tildes, a message line. Keys act at once
outside the command line (`i` gives `-- INSERT --`, typing then gives E21, `ZZ` leaves). `:w` gives E45, `:w!`
E212, anything else E492, Ctrl+C gives vim's own "Type :qa! and press <Enter>" line. After three failed tries
the message adds a hint. `:q`, `:q!`, `:wq`, `:x` leave, and the shell says how many attempts it took.
`/proto/matrix/machine/?run=vim` drops a reader straight into it.

### Where the facts come from

- Every fact is from `src/data/proto-content.ts` and `src/data/proto-matrix-corpus.ts`, imported and not
  changed. Location is `Japan` only. "Kobe" appears only inside real post titles.
- **`git log`**: subjects are the 60 in the corpus, in its order. Hashes and dates are looked up at build time
  with `git log` (`%h`, `%H`, `%ad`, `%s` only; the author's address is never read). In this build all 60 of 60
  matched. In a checkout without history the subjects print without hashes (checked once by building with
  `GIT_DIR=/nonexistent`: 0 of 60 matched, `git log --oneline` printed subjects only). `Author:` is `person.name`.
- **Numbers that are not in the data files are computed, not typed**: file sizes, `wc` counts, `ping` times
  (measured), `date`, `uptime`, the vim attempt count, "Last login". There are no PIDs, load averages, kernel
  versions or packages counts. neofetch's keys are the tool's (`Uptime`, `Packages`); their values are
  `activity.since`, `activity.originalRepos` and `activity.ossForks`, labelled.
- The jokes refuse, warn or riff. `git push` names the real repository (`wadakatu/wadakatu.github.io`, from
  `package.json`); "GitHub Pages serves static files" is from `CLAUDE.md`. `git status` says `On branch main`.
- Film nods are the two the brief named plus `cmatrix`, which is the name of a real program. No speeches.
- The logo is always the real `<img>` of `logo-400.png`, square, with the palette filter only. It is never
  drawn out of characters.

### The ELF and the hex view: what was decided

- **Downloads dropped.** No executable is served. The two endpoints are deleted.
- **The hex view is a command.** `xxd FILE` dumps any file; `cat about.txt | xxd` works too. The 9,700px listing
  is gone.
- **The program is kept as one file inside the shell**, `~/wadakatu`. `_machine.ts` still assembles it at build
  time (the same 4,208 bytes as the previous pass: SHA-256 `82c2bb9f…c373`, unchanged) and the page carries its
  bytes as base64 inside the JSON the shell reads. So `file wadakatu`, `xxd wadakatu | head`,
  `objdump -d wadakatu` (the eight instructions with notes) and `./wadakatu` (which reads the address and length
  from the instructions' operands and prints those bytes) all work on the real thing, and nothing can be saved
  and run by accident. The Projects program is deleted.
- `logo.png` carries its first 256 bytes for `xxd`; `file logo.png` is read from its IHDR chunk. `cat logo.png`
  shows the picture.

### No JavaScript, reduced motion, failures

- **No JavaScript.** `/machine/` is a recorded session in an ordinary scrolling page: the build runs the same
  shell and prints `neofetch`, `cat about.txt`, `ls -l projects`, each project file, `ls -l posts`,
  `cat contact.txt` and `git log --oneline -n 8` (Projects: `ls -l`, each project file, the contact file). All
  links are real links. The second line says it is a recording; the status line says `recorded session`; there is
  no prompt and no dead button. The header capsule and the status line link lead back, and the footer is there.
- **The shell module fails to load.** The viewport lock is applied as soon as any script runs. If the live
  shell has not started after 4 seconds, the head script sets `.term-off` and the recorded session becomes the
  same scrolling page as without JavaScript. If the shell then arrives late, it takes the one viewport back.
- **`proto-matrix.js` fails to load.** The shell still works. `exit` is then a plain navigation to 人間用.
  `theme` and `palette` do nothing, because the buttons they press are not wired.
- **Reduced motion** (`prefers-reduced-motion`, or `?motion=0`): the cursor does not blink, the change between
  readings is instant, `cmatrix` shows the rain parked still and says so in the status line, and nothing else in the shell moves
  anyway (output is printed at once, never typed out).
- **With motion**: the change from 人間用 is the previous pass's (text to hex, the tube collapses), then the
  session prints line by line and the prompt takes focus. `exit` plays the way back.
- Storage blocked: the shell runs, history does not survive a reload, and "Last login" always says never.

### Accessibility

- A real, labelled text field (`Command`), described by a hint that names `help`, `exit` and the Tab rule.
- **Tab is not a trap.** It completes only when the line has text and the caret is at its end. On an empty
  line, with Shift, or after Escape, it moves focus as usual.
- Output is `role="log"` (set after the first screen is printed, so arriving does not read the whole card out).
  Prompts in the scrollback are `aria-hidden`; the commands after them are text.
- The screen is a labelled, focusable region, so the scrollback can be scrolled with the keyboard; PageUp and
  PageDown also work from the field.
- Tappable file names are buttons outside the tab order (otherwise every listing would add tab stops). Links in
  output are ordinary links. Chips are buttons in a labelled group; the four key chips have names.
- `vim` announces how to leave when it opens; its message line is a status. `cmatrix` announces how to stop.
- Ctrl+C is left to the browser when text is selected, so copying still works on Windows and Linux.
- Keys are ignored while an IME is composing. Japanese output is marked `lang="ja"` run by run.
- Arriving focuses the field on devices with a fine pointer only. On touch devices nothing is focused, so the
  keyboard does not cover the first screen.
- The `\` / `¥` shortcut still works from the header and the status line. Inside the field it is a character.
  Its off switch is in the footer, which 機械用 no longer shows; the setting is stored, so switch it off from 人間用.

### Phone

- The shell's height follows `visualViewport`, so when the on-screen keyboard opens the prompt stays above it.
  While it is open the header's nav row and the status line are hidden to give the session the room.
- The header folds to two short rows; the two colour buttons are hidden there because `theme` and `palette` do
  the same.
- The field is 16px on touch devices, so iOS does not zoom into it.

### Files

| File | Change |
| --- | --- |
| `src/pages/proto/matrix/_shell.ts` | New. The shell: file system, commands, pipes, completion, vim. Pure, no DOM and no Node |
| `src/pages/proto/matrix/_world.ts` | New. Build-time data for the shell from the data files, git, the ELF and the logo. Ends with a self-check that fails the build |
| `src/pages/proto/matrix/_term.ts` | New. The live prompt: printing, keys, cursor, history, and the effects (open, vim screen, ping, rain, viewport) |
| `src/pages/proto/matrix/_Terminal.astro`, `_Out.astro` | New. Markup, the recorded session, the JSON island |
| `src/pages/proto/matrix/_Machine.astro`, `machine/wadakatu.ts`, `projects/machine/projects.ts` | Deleted |
| `src/pages/proto/matrix/_machine.ts` | Trimmed to the assembler and the one program |
| `src/pages/proto/matrix/_Home.astro`, `_Projects.astro` | Use the terminal; "Two readings" wording |
| `src/layouts/ProtoMatrixLayout.astro` | The 4-second fallback timer; one comment |
| `public/styles/proto/matrix.css` | Listing rules out, shell rules in. No new colours: tokens only |
| `public/scripts/proto-matrix.js` | Old prompt removed; `mx:view` event so the shell can take focus |

`_shell.ts` is shared: the build imports it to print the recorded session and to run the self-check, and Astro
bundles it with `_term.ts` for the browser (29,237 bytes, 12,773 gzipped). So the no-JS reading and the live
shell cannot disagree. Home's HTML is 100,377 bytes (26,950 gzipped), about the same as before: the listing's
hex went out and the shell's data (30,690 bytes of JSON) came in.

Not touched: production routes, `tombo.css`, `site.css`, `BaseLayout.astro`, `FooterLogo.astro`, the other
`/proto/*` concepts, `src/data/*`, `package.json`. No dependency added. `package-lock.json` was already
modified before this pass.

### Checks

`npm run build` passes (44 pages). The build itself runs a self-check of the shell (`_world.ts`): counts
against the data files, a path escape, the ELF's first output line, completion, vim, and 25 awkward inputs.

Scripts and stills are in `/tmp/mx-term/` on the build machine, outside the repo because the brief limits which
files may be added. All figures below were printed by those scripts on the final build, served from `dist/` by
a short-lived static server, in Chrome through Playwright.

**`term.mjs`, 82 checks, all passing.**

- One viewport at 1440×900, 960×700, 390×844, 320×568 and 390×420 (standing in for a phone with its keyboard
  up), on both routes: the document is no taller than the window, the session scrolls inside, the prompt and
  status line are on screen, nothing passes the right edge.
- All 19 listed commands run and have man pages. The data commands return the data file's values.
- `git log --oneline -n 5` lines are each found in the repository's real `git log`. The full form has a
  40-character hash, `Author: wadakatu`, a date and no `@`.
- `xxd -l 32 logo.png` equals `/usr/bin/xxd -l 32` on the real file. `file` gives the ELF and PNG lines.
  No executable exists in `dist/`.
- `open github` opens `https://github.com/wadakatu` in a new tab; `open` on a post goes to `/blog/<slug>/`.
- History, completion, Tab leaving the field in the three ways, Ctrl+C with and without a selection,
  Ctrl+A/E/U/L/D, PageUp, the block cursor's position, keys during composition.
- `exit`, Ctrl+D and the status link lead back; returning finds the session intact.
- vim: eight replies checked against the expected messages, `:q!` and `ZZ`.
- `ping`: another origin refused; two real replies then Ctrl+C gives `2 requests sent, 2 answered`; left alone
  it sends four. `cmatrix` starts and any key stops it without typing that key.
- 38 answers from the unlisted commands and the shell features. Typed markup (`<img onerror>`, `<script>`) is
  printed as text.
- `theme` / `palette` commands; all seven addresses and flag combinations; `?run=`; reload keeps history and
  shows the last login; blocked storage.
- No JavaScript on both routes; the shell module blocked (falls back after 4 seconds); the shell module five
  seconds late (falls back, then locks to one viewport again).
- The keyboard branch, with a stand-in `visualViewport` of 420 out of 844: the shell is 420 tall, the nav row
  and status line give way, the prompt and keys are above the line, the capsule stays. A pinch zoom (half the
  height at twice the scale) is not taken for a keyboard.
- What was typed never becomes a link: `?run=cat .zsh_history https://…` and `echo https://…` followed by
  `cat`, `head`, `grep` and `history` produce no anchor.
- `reboot` goes to `/proto/matrix/?boot=1` and keeps the palette.
- Touch: no autofocus, key row, 16px field, chips and file names run without focusing.
- Cursor: `blink` × 5 with motion, none with reduced motion or `?motion=0`, no other animation.
- The animated change in and `exit` back leave nothing styled.
- Lowest text contrast in the session, chips and status line: 9.18 (phosphor night), 5.61 (phosphor day),
  9.42 (operator night), 6.48 (operator day).

**The four earlier suites, ported** (`port.py` rewrites selectors and the expectations this pass changed on
purpose; each change is commented there): 40 of 40, 69 of 69, 24 of 24 and 64 of 64. They cover the boot and its
skips, the frozen still, blocked CDN, `?motion=0`, the glitches, the palette and its addresses, the logo's
geometry on every route, rapid changes, reduced motion switched on mid-change, the shortcut's off switch, the
blocked enhancement script, Japanese faces, and overflow, one `h1` and contrast for 64 route × size × colouring
combinations. Run unported first, they found one real fault, since fixed: on a phone the shell's grid let wide
content widen the header past the viewport.

The changed expectations: in 機械用 the prompt has focus, so a backslash typed there is text (the suites press
the shortcut from outside the field); arriving puts focus in the prompt, not on the capsule; the footer is not
shown in 機械用.

The running dev server (PID 88553, port 4321) was left alone and serves the new routes.

### Still weak

- **Not tried on a real phone.** The keyboard handling (`visualViewport`, hiding rows while it is up) was only
  run against a stand-in viewport object. iOS Safari and Android Chrome with a real on-screen keyboard are untested.
- **No screen reader run.** The roles and labels are checked by script; how the log reads aloud in VoiceOver or
  NVDA, and how vim's takeover feels there, is untested. Chrome only: no Safari or Firefox run.
- **Ctrl+L, Ctrl+U, Ctrl+A, Ctrl+D are browser shortcuts on Windows and Linux.** The page takes them while the
  field has focus. Ctrl+W and Ctrl+N cannot be taken and are not used.
- **The cursor replaces the field's focus outline.** Lit block for focus, hollow for none. It is a visible
  change, but it is not the 2px outline every other control has.
- **`cat` on a post prints an excerpt**, because the brief limits the data to the two files. One excerpt in the
  corpus stops mid-word. `open` goes to the full post.
- **`open` and links in output use a new tab**, so the session is not lost. That is a choice a reader does not
  get to make per link. `open` only opens a window where the browser reports a user gesture
  (`navigator.userActivation`); in browsers without it, it prints the link and you click it.
- **`?run=` puts someone else's words on the page.** The command and anything it echoes are shown as text, never
  as markup or links, but a link to `/machine/?run=echo …` does display the sender's sentence in his terminal.
- **The suggested commands are fixed.** They do not change with the directory or with what was just printed.
- **`ls` does not align columns**; names are separated by two spaces and wrap. `posts/` holds slug file names,
  which only mean something in `ls -l`.
- **`git log` needs the repository's history at build time** for hashes and dates. A shallow CI checkout gives
  subjects only.
- **Pipes are line-based.** Links survive `head` and `tail` but not `grep`, which re-prints matching text with
  the match lit. There is no `less`; long output scrolls in the session.
- **The shortcut's off switch is not reachable from inside 機械用** (see Accessibility).
- **vim is a set of replies, not an editor.** There is no cursor movement in the buffer.
- **The earlier stills in `docs/design-explore/shots/` named `matrix-machine-*` and the switch videos show the
  byte listing**, which no longer exists. New stills are in `/tmp/mx-term/shots/` (`final-*.png`) and were not
  added to the repo.

### Official stills (terminal pass)

Playwright, Chrome, 1440×900 and 390×844, against the running dev server at `http://127.0.0.1:4321`.
Window overflow was 0 on every still. The session video is about 7.6s at the true capture rate (~11.9 fps).

| File | What |
| --- | --- |
| `docs/design-explore/shots/matrix-term-neofetch-1440.png` | Login + `neofetch` with the real logo |
| `docs/design-explore/shots/matrix-term-neofetch-390.png` | Same, phone, with tappable keys |
| `docs/design-explore/shots/matrix-term-help-1440.png` | `?run=help` |
| `docs/design-explore/shots/matrix-term-help-390.png` | `?run=help`, phone |
| `docs/design-explore/shots/matrix-term-jokes-1440.png` | `sudo rm -rf /`, `knock knock`, `php artisan inspire`, `make me a sandwich` |
| `docs/design-explore/shots/matrix-term-git-1440.png` | `git log --oneline -n 8` |
| `docs/design-explore/shots/matrix-term-vim-1440.png` | `?run=vim` |
| `docs/design-explore/shots/matrix-term-operator-1440.png` | `?palette=operator` |
| `docs/design-explore/shots/matrix-term-session-1440.mp4` | Typing `help`, `ls ~/projects`, `knock knock`, `git log` (not committed; on the box) |

Also copied to `/workspace/wadakatu-dev/design-protos/`.

## The header switch (Fable switch pass)

Built with Fable (Claude Code `--model fable`) on 13 November 2026, in this worktree only, on `design/explore`
(do not merge, nothing committed). This section is current where it differs from everything above.

Only the control that chooses 人間用 / 機械用 changed. The terminal, its commands, its layout and the human page
are as they were. The switch is still two real links to the two static routes; what changed is how the pair is
drawn. There are three new drawings and the old capsule, chosen by one flag.

### Variants and flags

| Flag | Name | What it is |
| --- | --- | --- |
| none (default) | **rain** | Each name is a strand of the rain: three glyphs set top to bottom in the rain's own face (DotGothic16, upright vertical text). The strand you are reading has settled and is filled. Down the other one a drop still falls, one glyph at a time (a lit head with a tail one glyph behind it), about once every three seconds |
| `?switch=brace` | **brace** | One shell word, `{人間,機械}用`, which is the brace expansion that produces both names. 用 is set once, after the brace. The side you are on is a solid block, the terminal's caret; the side you point at gets the hollow caret |
| `?switch=bits` | **bits** | A two-line listing with permission bits: `r--  人間用` and `r-x  機械用`. One reading can only be read; the other can be run. `▸` marks the row you are on. Below 720px the two rows sit side by side |
| `?switch=capsule` (alias `?switch=current`) | **capsule** | The previous capsule with the blue and red dots, unchanged |

Addresses to compare (each also works on `/machine/`, `/projects/` and `/projects/machine/`):

- `/proto/matrix/` and `/proto/matrix/machine/`
- `/proto/matrix/?switch=brace`
- `/proto/matrix/?switch=bits`
- `/proto/matrix/?switch=capsule`

**The default is rain.** It is the only one of the three that is made of the film's own picture rather than of
terminal wit: the choice is two strands of the rain that happen to spell the two readings, and vertical Japanese
is native, not a trick. It is also the smallest (71×50px against the capsule's 175×34px), and in 機械用, where
the page's rain is switched off, it is the one piece of rain left on screen, which is the way back. Brace is the
quietest and the one a shell user will smile at; bits carries the 実行権限 joke but is the widest on a phone.

Wording was reconsidered and kept. All three still say 人間用 and 機械用: they are his words, the mode line in
the shell uses them, and an English pair in the header would sit in the same window as the Japanese pair in the
mode line. The tokens that were added (`{ , }`, `r--`, `r-x`, `▸`) are not translations of anything. None of
the new drawings uses the pill colours or any film wording; the pill homage now lives only in the capsule.

### What stayed a capsule

- **The large "Two readings" capsule at the foot of Home is still the old capsule**, in every variant. It is
  where the choice is offered as a choice, with a note under each side, and the capsule suits that.
- **The switch on the boot layer follows the flag**, like the header. Neither side is chosen there, so in rain
  both strands drip (half a cycle apart), and in brace and bits neither side is filled.
- With `?switch=capsule` the header and boot are the old capsule. Its rules were moved under one selector and
  no declaration changed: the header stills at 1440 (人間用) and 390 (機械用) are pixel-identical to the ones
  taken before this pass.

### How it is built

- One markup for all four. `_Pill.astro` renders the same two `<a class="half" data-mode>` links as before; the
  header and boot pair has the class `switch`, the foot pair `pill--big`. The label is now
  `<span class="lab" lang="ja"><span data-text="人間">人間</span><span class="yo" data-text="用">用</span></span>`,
  so brace can set 用 once (the per-link 用 gets `font-size: 0` there and stays in the link's name).
- The head script reads `?switch=` against a whitelist and sets `<html data-switch>` for `brace`, `bits` and
  `capsule`. No attribute is rain. Everything else is CSS in `matrix.css` under "the switch".
- `switch` is carried exactly as `palette` is: by `flags()` in `proto-matrix.js` (every header link, the address
  after an in-place change) and by the head script's fallback when the enhancement never arrives. Like the
  palette it is never stored.
- The selected side is the same idiom in every drawing and every palette: `--green` under `--bg`, plus
  `aria-current="true"` on the link, as before. `exit`, `\`, the boot switch and the mode line's link were not
  touched; they still act on the same two links.
- The header keeps its height in every variant: 69px at 1440 in both readings, 80.6px at 390 in 機械用,
  192.4px at 390 in 人間用, the same as before this pass. Rain and bits stand 6px taller than the row and take
  it back with a negative margin, so the shell loses no height. Window overflow was false on every still.
- `.controls` gained `align-items: center` so the other three controls do not stretch to the taller switch.
- Tap targets at 390: rain 31×39 and 32×39, brace 38×32 each, bits 102×32 each.

### Motion, reduced motion, no JavaScript

- **CSS**: the drop falling through the unselected rain strand (`drip`), and a short stepped wipe when a side
  becomes the current one (top to bottom for rain, left to right for brace and bits). Pointing at the other
  strand stops its drop and brings it up to reading brightness, as the streams on the page do.
- **Script** (only with motion allowed and GSAP loaded, and never for the capsule): on a change, the name just
  taken settles out of raw corpus glyphs over 0.45s, using the page's existing `decode()`. The tweens are in
  `effects`, so leaving the page or turning motion off finishes them.
- **`prefers-reduced-motion` and `?motion=0`**: no animation on the switch at all (checked for rain, brace and
  bits: zero running animations before and after a change, in both). The resting state is the whole label in
  `--muted`, and the change is immediate. `?boot=frozen` also parks the drop, so that layer is still a still.
- **Enhancement missing** (`proto-matrix.js` blocked): the head script still applies the flag and rewrites the
  links, so the two links navigate between the static routes carrying `switch`, `palette` and `motion=0`.
- **No JavaScript at all**: two plain links with their static `href`s and `aria-current` from the markup. The
  flag cannot be read, so the drawing is always the default (rain).
- **Forced colours**: the strand's text colour is restored and the current side uses `Highlight`.

### Accessibility

- Two links in a `role="group"` labelled "Reading", in tab order, each named by its whole word (`人間用`,
  `機械用`) in all three drawings (checked with an accessibility snapshot). The braces, comma, bits and `▸` are
  generated content with empty alternative text.
- `aria-current="true"` marks the side you are on; `aria-keyshortcuts` is unchanged.
- Focus is the page's 2px `--green` outline with a 2px `--bg` gap inside it, so it shows on the filled side too
  and is drawn above the neighbouring link.

### Files

| File | Change |
| --- | --- |
| `src/pages/proto/matrix/_Pill.astro` | Class `switch` on the header/boot pair; label split into stem and 用 with `data-text` |
| `src/layouts/ProtoMatrixLayout.astro` | Head script: read `?switch=`, set `data-switch`, carry it in the fallback links. One comment |
| `public/styles/proto/matrix.css` | "the switch" block (rain, brace, bits, forced colours); the capsule rules scoped to the foot capsule and `?switch=capsule`; `.controls` alignment; `?motion=0` line |
| `public/scripts/proto-matrix.js` | `flags()` carries `switch`; the settle on change; two comments |
| `docs/design-explore/shots/matrix-switch-variants-1440.png` | Header at 1440, top to bottom: rain, brace, bits, capsule (人間用), rain (機械用) |
| `docs/design-explore/shots/matrix-switch-variants-390.png` | Header at 390: rain, brace, bits, capsule in 機械用, then rain, brace, bits in 人間用 |
| `docs/design-explore/shots/matrix-switch-rain-states.png` | Rain at 4x: at rest, four frames of the drop, hover, focus, 機械用, day, operator, operator day, `?motion=0` |

### Checks

`npm run build` completes (44 pages). One Playwright script (Chrome, against the dev server on
`127.0.0.1:4321`, kept in `/tmp/mx-switch/behave.mjs`, not in the repo), all passing:

- For rain, brace, bits and capsule, starting at `/proto/matrix/?palette=operator[&switch=x]`: every header
  link carries the flags; a click goes to `/proto/matrix/machine/?palette=operator[&switch=x]` in place and
  moves `aria-current`; `\` goes back; `exit` in the shell goes back; the names read `人間用` / `機械用` once
  the change has settled; no page errors.
- Five `\` presses 120ms apart end with whole names and `aria-current` on the side shown.
- With `proto-matrix.js` blocked, and with JavaScript off: as described above.
- At 390: both links are at least 24×24px and tabbable in all three drawings.
- The boot layer, played with `?boot=1` (rain, brace, bits): neither side is `aria-current` while it is up; a
  click on 機械用 ends it in the shell at `/machine/` with the flag carried, a click on 人間用 ends it on the
  page, and the header then marks the side shown.

Stills were looked at at 1440 and 390 and on `?boot=frozen`: rain in night, day, operator and operator day;
brace and bits in night, day and operator (not operator day). Hover and focus were looked at at 1440 only.

### Still weak

- **`boot` typed in the shell drops the flag.** `_term.ts` builds that address with `palette` only, and that
  file was off limits in this pass. Everything else carries it.
- **The drop is faint in daylight.** There the head is a darker green on an already dark `--muted`, so the
  motion reads as a slight pulse rather than a light. The filled side does not depend on it.
- **Rain on a phone is set at 13px** to keep the shell's header at its old height. DotGothic16 is drawn for
  16px; it is sharp on a phone's screen but would be soft at 13px on a 1x display narrower than 720px.
- **Rain is a small target next to the capsule**: about a third of the width. It is above the 24px minimum, not
  generous.
- **Bits may not read to someone who has never run `ls -l`.** The names still do; the joke is lost. Its bits
  and cursor are not exposed to assistive technology.
- **During the 0.45s settle the link's text is raw glyphs**, as the page's headings are when they decode.
- **The header and the foot of Home now draw the same choice two ways** (switch above, capsule below), by
  decision; see "What stayed a capsule".
- **Checked in Chrome only.** The drawings rely on CSS nesting, `background-clip: text` and alternative text on
  generated content (`content: '…' / ''`), which the file already used; Firefox and Safari were not opened (no WebKit build is installed for Playwright
  here). The one to look at first on an iPhone is the default: its drop is an animated `background-clip: text`.
- **No video.** The drop and the settle were judged from paused frames, not a recording.

### Official stills (switch pass)

Playwright, Chrome, against the running dev server at `http://127.0.0.1:4321`. Human pages use the default (rain) switch. Close-ups are padded crops at 2×.

| File | What |
| --- | --- |
| `docs/design-explore/shots/matrix-human-now-home-1440.png` | 人間用 Home, night phosphor, 1440 |
| `docs/design-explore/shots/matrix-human-now-home-390.png` | 人間用 Home, 390 |
| `docs/design-explore/shots/matrix-human-now-projects-1440.png` | 人間用 Projects, 1440 |
| `docs/design-explore/shots/matrix-human-now-projects-390.png` | 人間用 Projects, 390 |
| `docs/design-explore/shots/matrix-human-now-home-operator-1440.png` | 人間用 Home, `?palette=operator` |
| `docs/design-explore/shots/matrix-switch-variants-1440.png` | All four header variants in one sheet |
| `docs/design-explore/shots/matrix-switch-rain-human-close-1440.png` | rain, 人間用 close-up |
| `docs/design-explore/shots/matrix-switch-brace-human-close-1440.png` | brace, 人間用 close-up |
| `docs/design-explore/shots/matrix-switch-bits-human-close-1440.png` | bits, 人間用 close-up |
| `docs/design-explore/shots/matrix-switch-capsule-human-close-1440.png` | capsule (current), 人間用 close-up |

Matching `*-machine-close-1440.png` and 390 crops live in the same folder. Also copied to `/workspace/wadakatu-dev/design-protos/`.

### Hold rain recolor, and the compact rain switch

wadakatu confirmed this pass (「それで進めてくれる？」). Two changes, both on `/proto/matrix/` only. 機械用 itself is untouched except the header switch.

**1. Hold rain, then a palette or theme change, no longer freezes 人間用.**

Chrome could lock the tab after `#hold` was checked and then Operator colours or Daylight was pressed. Three things stacked: paused drop animations whose `to` state used `var(--h)` (and `100cqh` on the stream drops) were re-resolved when a `data-*` attribute changed on `:root`; `:has(#hold:checked)` was re-evaluated against the whole tree on that same recast; and a `clip-path` wipe whose `to` was `none` could be restarted mid-composite when `sync()` rewrote `aria-current` on every recast.

The drops now animate to plain `100vh` / `100cqh` (`drop-vh`, `drop-cqh`). Checking Hold rain also sets `data-rain='held'` on `:root`, so the paused state does not depend on `:has()` once JS has run (`:has()` remains the no-JS path). `sync()` only writes `aria-current` when the value actually changes. The wipe keyframes end on `inset(0 0 0 0)`, not `none`.

**2. On a phone, the default rain switch is one button.**

At `max-width: 600px`, and only for the default rain drawing (`.top .switch`, not the boot layer, not `?switch=brace|bits|capsule`), the two strands share one 44×44 cell. The current reading is the filled face. A hole travels down it on the same 3.2s cadence as the desktop drip, and through the hole you read the other name, a glyph at a time, then the current face returns. With `?motion=0` or `?boot=frozen` the hole is removed and a small `▾` (empty alternative text) sits on the right of the face, so it is still obvious there is another reading underneath.

JS keeps a single tab stop: the current half is `aria-hidden` / `tabindex="-1"`; the other is named `人間用から機械用へ` or `機械用から人間用へ`. Enter on that link still goes in place. Brace, bits and capsule at 390 are unchanged. Desktop (and 601px and up) is still two strands.

### Checks (this pass)

- `docs/design-explore/hold-recolor.mjs` against `127.0.0.1:4321`: 1440 and 390, rain / brace / bits / capsule, Hold rain then palette and theme (twice), plus a no-hold control. All cases passed (clicks 19–73ms, ~91 animation frames in 1.5s).
- Playwright, Chrome: 390 compact switch is 44×44, one tab stop, named destination, Enter opens the other reading; 601px is still two strands; no horizontal overflow on 人間用 or 機械用; `?motion=0` draws the caret.
- Stills looked at: compact rest, mid-glimpse, motion-off, machine header (switch lifted above the tube scanlines), and Hold rain + Operator / Daylight at 1440.

### Official stills (this pass)

| File | What |
| --- | --- |
| `docs/design-explore/shots/matrix-rain-compact-human-390.png` | 人間用 Home, compact rain switch at rest, 390 |
| `docs/design-explore/shots/matrix-rain-compact-human-header-390.png` | Header crop of the same |
| `docs/design-explore/shots/matrix-rain-compact-glimpse-strip-390.png` | Six frames of the drop falling through 人間用, revealing 機械用, then the face returning |
| `docs/design-explore/shots/matrix-rain-compact-glimpse-header-390.png` | Mid-drop, in the header |
| `docs/design-explore/shots/matrix-rain-compact-human-motion0-390.png` | `?motion=0`, caret on the right |
| `docs/design-explore/shots/matrix-rain-compact-machine-header-390.png` | 機械用 header, compact 機械用 face, no scanlines on the switch |
| `docs/design-explore/shots/matrix-hold-recolor-operator-1440.png` | Hold rain, then Operator colours, page still live |
| `docs/design-explore/shots/matrix-hold-recolor-day-1440.png` | Then Daylight, still live |

Also copied to `/workspace/wadakatu-dev/design-protos/`.

### Still weak

- **The glimpse hole is high-contrast.** The other name sits on `--bg`, so the drop reads as a black bar with a cut glyph, not a soft phosphor trail. The other word is a glimpse, not a clear reading.
- **`▾` is a 9px mark in 10px of side padding.** It is visible, but tight, and it is only a hint that another reading is underneath.
- **No-JS at 390** still stacks the two links visually, but it cannot set the single-tab-stop attributes; both names are in the tree. Clicks still land on the other reading because the current face has `pointer-events: none`.
- **Checked in Chrome only.** The compact drop is a CSS mask animation; Safari / iPhone were not opened.
- **The shell `boot` command still drops the `switch` flag** (`_term.ts` was left alone).

## The phone header (Fable header pass)

wadakatu: 「スマホ幅の時のHeaderの占める割合が多いね ここもっとブラッシュアップして綺麗にしてほしい」. Below 720px the header is now one slim row, and everything else folds into a menu. One design, no flags. `/proto/matrix/` only. From 720px up nothing changed.

### Heights

Playwright, Chrome, against `http://127.0.0.1:4321`. Home, Projects and 機械用 measure the same at each width.

| Width × height | Before, 人間用 | Before, 機械用 | After, both | Share of the viewport after |
| --- | --- | --- | --- | --- |
| 360 × 800 | 204.6px | 92.8px | **53px** | 6.6% |
| 390 × 844 | 204.6px (24.2%) | 92.8px (11.0%) | **53px** | 6.3% |
| 430 × 932 | 204.6px | 92.8px | **53px** | 5.7% |
| 601 and 719 × 844 | not measured | not measured | **53px** | 6.3% |
| 1440 × 900 | 69px | 69px | 69px, unchanged | 7.7% |

The "before" phone figures are the ones handed to this pass; 390 was re-measured here and matched (204.6 / 92.8). At 390 the 機械用 screen went from 677.6px to 717.4px tall.

### What is in the row, and what moved

The row, left to right: the mark at 32px with `wadakatu_`, then the menu button, then the switch. The button and the compact rain switch are the same cell: 46×46, a 44×44 target inside a 1px ring (the switch's link is 44×44, as shipped). The button is three rules; open, it is the filled face with one rule.

| Was in the header | Now |
| --- | --- |
| Logo, `wadakatu_` | In the row (logo 44px to 32px, as 機械用 already had it) |
| Rain switch | In the row. One button with its drop up to 600px, two strands from 601 to 719px, both 46px tall |
| Main nav (Home, Projects, Blog, About) | In the menu, a list of four 44px lines |
| 機械用's numbered window list | The same list in the menu: `0:Home*`, `1:Projects`, … |
| Hold rain | In the menu, a full-width 44px line |
| Operator colours, Daylight | In the menu, side by side, 44px tall. In the live shell they stay hidden as before (`palette`, `theme`) |

Opened, the header unfolds in place and pushes the page down: 346px at 390 on 人間用, 242px on 機械用 (the window list only). There is no hide-on-scroll: the header is not sticky, so it already leaves when the page scrolls, and 機械用 does not scroll.

### How it is built

- The nav and `.controls` sit in one `<details class="menu">` with `<summary class="control">Menu</summary>`. The markup order inside is the old order, so the switch is still inside `.controls`.
- From 720px up, `.menu` and `.menu::details-content` are `display: contents`, the content is `content-visibility: visible` whether or not the details is open, and the summary is `display: none`. The nav and `.controls` are the header's flex items exactly as before.
- Below 720px `.controls` is `display: contents` too, so the switch is a flex item of the row. Closed, only the nav and the three `.control`s are hidden (`.menu:not([open])`). Open, they take `order: 1` and wrap under the row.
- The compact switch's own rules are untouched. The row's padding is 3px so that its 46px cell gives a 53px header.
- The on-screen-keyboard rule that hid `.top nav` in 機械用 now only applies from 720px up. Below that the list is in the menu and costs no row.
- `proto-matrix.js` adds four ways to close it: Escape, a press outside the header, a change of reading (`mx:view`) and `pagehide` (so Back from a menu link should not restore it unfolded; not tested). If focus was on a line that is about to be hidden, it goes to the button. Opening and closing is the native element.
- `hold-recolor.mjs` opens the menu first in its 390 cases.

### No JavaScript, reduced motion, accessibility

- No JS: the summary toggles natively, the nav is real links, the switch is two links, Hold rain is a checkbox. The header is 53px closed and 294px open at 390 (no palette or theme buttons).
- `?motion=0` and `prefers-reduced-motion`: Hold rain is hidden as before, so the menu ends with Operator colours and Daylight. The switch's `▾` is still drawn. The menu has no animation of its own.
- The button is a native `<summary>`: Chrome exposes it as a disclosure named "Menu" with `expanded` true or false, so no `aria-expanded` or `aria-controls` was added. Its word is set at `font-size: 0`, the same way the brace drawing hides 用.
- Tab order closed: Skip, mark, Menu, switch. That is also the visual order, which is why the button is left of the switch.
- At 1440 the Tab order and every header rect are identical to before, with JS on and off. The markup order of the nav and controls did not change.

### Checks

- Header rects at 1440, 1024, 900 and 720 (人間用, and 機械用 at 1440 and 720), before and after: identical. Tab order was compared at 1440 only, on both readings and with JS off on 人間用: identical. The 1440 人間用 header matches `shots/matrix-header-before-human-home-1440.png` pixel for pixel within a threshold of 24 levels; 機械用 at 1440 is identical to a still taken before the change.
- 53px and no horizontal overflow at 320, 360, 390, 430, 601, 719, on Home, Projects and 機械用. Phosphor and Operator, night and day, `?motion=0`, reduced motion and JS off were opened at 390 only.
- Behaviour at 390: Enter opens, Escape closes and returns focus, an outside press closes, Hold rain set in the menu stays held when it is closed, palette and theme change without closing it, switching reading closes it, `\` with focus on a menu line closes it and leaves focus on the button, `theme day` and `exit` in the shell still work, resizing to 1440 while open gives the 69px row. In 機械用 the shell does not pull focus back from the open menu, and Tab goes from the button to `0:Home`.
- `docs/design-explore/hold-recolor.mjs`: all cases passed.

### Still weak

- **Open, the Tab order goes nav, switch, then Hold rain.** The switch is drawn in the row above but sits between them in the markup. Moving it would change the desktop Tab order, which was out of bounds.
- **The menu pushes the page down, it does not float over it.** On 機械用 the screen is 189px shorter while it is open.
- **It depends on `::details-content`** (Chrome 131, Safari 18.4, Firefox 143, from MDN's compat data; Baseline since September 2025). An older engine gets a plain "Menu" disclosure at every width, 69px closed at 390. That branch was only exercised by making the `@supports` test false in current Chrome, never in a real old engine.
- **Checked in Chrome only.** `display: contents` on `<details>` with the content kept visible was not opened in Safari or Firefox. An iPhone is the first place to look.
- **`?switch=bits` and `?switch=capsule` wrap to a second row at 360** (86.8px). Brace fits in the row.
- **From 601 to 719px each strand is 46px tall but still about 32px wide.**
- **Without JS** the menu closes only from its own button.
- **A closed menu still reads "collapsed" while the switch inside it is reachable**, and at desktop the details adds an unnamed group around the nav and controls in the accessibility tree.
- Open, the header at 390 is **346px** on 人間用 and **242px** on 機械用 (executor re-measure; this pass's earlier note said 345 / 241).

### Official stills (header pass)

Playwright, Chrome, against `http://127.0.0.1:4321`. `npm run build` completed (44 pages). `hold-recolor.mjs` all cases passed after the menu change. Also copied to `/workspace/wadakatu-dev/design-protos/`.

| File | What |
| --- | --- |
| `docs/design-explore/shots/matrix-header-before-human-home-page-390.png` | 人間用 Home, 390, before (204.6px) |
| `docs/design-explore/shots/matrix-header-after-human-home-page-390.png` | 人間用 Home, 390, after (53px) |
| `docs/design-explore/shots/matrix-header-after-human-home-open-page-390.png` | Same, menu open |
| `docs/design-explore/shots/matrix-header-after-human-projects-page-390.png` | 人間用 Projects, 390, after |
| `docs/design-explore/shots/matrix-header-after-machine-page-390.png` | 機械用, 390, after (screen 717.4px) |
| `docs/design-explore/shots/matrix-header-after-machine-open-page-390.png` | 機械用, menu open |
| `docs/design-explore/shots/matrix-header-after-human-home-operator-page-390.png` | 人間用 Home, `?palette=operator` |

## The login neofetch on a phone

wadakatu: 「スマホの機械用ですが、上の自己紹介部分はaccordionとかで閉じられるようにすると良さそうかな それかスマホ版の場合は出さないようにするとか あまりにTerminal部分が小さい」. The block is the auto-run login `neofetch` card on `/proto/matrix/machine/` (logo + Role / Location / …), not a separate page section. Below 720px it is now a native `<details class="login-card">`, closed by default, one 44px summary line (`who am I?`, with a `▸` / `▾`). The prompt sits under that line and has most of the screen. From 720px up the summary is hidden and the card is just its contents, the same session as before. Accordion, not hidden: the same facts are still one open away, and `whoami` / `about` / a typed `neofetch` were already there. `/projects/machine/` has no login card (it still starts with `ls -l`) and was left alone. Terminal commands and their output are unchanged.

### Heights

Playwright, Chrome, live shell, boot skipped, against `http://127.0.0.1:4321`. `.screen` itself was already the viewport minus the 53px header, the chips and the modeline, so it does not grow; the gain is inside the screen.

| Width × height | `.screen` | Intro before | Intro after, closed | Free below the prompt, before → after (closed) |
| --- | --- | --- | --- | --- |
| 360 × 844 | 717.4px, unchanged | `.fetch` 567.8px | 46px card (44px summary) | cramped → **535.3px** |
| 390 × 844 | 717.4px, unchanged | `.fetch` **500.6px**, tty 608.2px, ~64px under the prompt | 46px card, tty 119.2px | **64.2px → 535.3px** |
| 430 × 844 | 717.4px, unchanged | `.fetch` 478.3px | 46px card | cramped → **535.3px** |
| 1440 × 900 | 757.4px, unchanged | `.fetch` 313.5px, tty 398.6px, header 69px | the same; summary not drawn | 318.2px, unchanged |

At 390, opened, the card is 587px and the prompt sits 16px above the fold (`bottom()` on toggle). `/projects/machine/` at 390 is unchanged (tty 498.6px, no card). The summary is the short label `who am I?`; it does not ellipsize at 360 or 390. Its accessible name is `who am I? wadakatu_, Backend Developer @ Studio Inc.`

### How it is built

- The recorded session in `_Terminal.astro` wraps only the first `neofetch` block (the echo line and the `.fetch`) in `<details class="login-card">`. Later commands print as they did.
- The live shell in `_term.ts` does the same for the auto-run `~/.zshrc` `neofetch`. A typed `neofetch`, or `?run=` of any command including `neofetch`, still prints in the open. `loginCard()` does not go through `run()`, so it calls `refresh()` so the prompt is drawn.
- Below 720px the summary is a 44px flex row with a `▸` / `▾` marker (`display: flex` hides the native triangle). From 720px, `.login-card` and `::details-content` are `display: contents`, the content stays `content-visibility: visible` whether or not the details is open, and the summary is `display: none` — the same pattern as the header menu. The live shell also sets `open` at 720px and up, for engines without `::details-content`.
- Toggling the details (open or close) calls `bottom()` on the next frame so the prompt stays in view. `visualViewport` / `fit()` / `.kb` are untouched; `.kb` still only hides the modeline (and the desktop nav from 720px up).

### No JavaScript, reduced motion, accessibility

- No JS, 390: the recorded session's card is closed, 46px, and the later recorded commands are still in the page. No JS, 1440: `::details-content` keeps the card visible even though the details is closed in the markup (fetch 313.5px, same as live).
- The control is a native `<summary>`. Phosphor and Operator, night and day, use the same tokens (`--green`, `--muted`, `--rule`). There is no open/close animation, so reduced motion is unchanged.
- The facts in the card are also still reachable with `whoami`, `about`, and `neofetch`.

### Checks

- `npm run build`: 44 pages, complete.
- `docs/design-explore/hold-recolor.mjs`: all cases passed (1440 and 390, rain / brace / bits / capsule, Hold rain then palette and theme, plus a no-hold control).
- 1440 機械用: header 69, screen 757.4, fetch 313.5, tty 398.6, matching the before measure. No-JS at 1440 also shows the fetch.
- A typed `neofetch` after login leaves the original card closed and prints a second `.fetch` in the open (two fetches, one card). `?run=whoami` prints the whoami lines with no card. `?run=neofetch` prints one `.fetch` and no card.

### Official stills (this pass)

Playwright, Chrome, 390 × 844, against `http://127.0.0.1:4321`. Also copied to `/workspace/wadakatu-dev/design-protos/`.

| File | What |
| --- | --- |
| `docs/design-explore/shots/matrix-intro-before-machine-390.png` | 機械用 Home, 390, before (neofetch 500.6px) |
| `docs/design-explore/shots/matrix-intro-390-phosphor-collapsed.png` | After, collapsed, phosphor |
| `docs/design-explore/shots/matrix-intro-390-phosphor-expanded.png` | After, expanded, phosphor |
| `docs/design-explore/shots/matrix-intro-390-operator-collapsed.png` | After, collapsed, Operator |
| `docs/design-explore/shots/matrix-intro-390-operator-expanded.png` | After, expanded, Operator |
| `docs/design-explore/shots/matrix-intro-360-phosphor-collapsed.png` | After, collapsed, phosphor, 360 (`who am I?`) |
| `docs/design-explore/shots/matrix-intro-before-projects-machine-390.png` | `/projects/machine/`, 390, before (no card; left unchanged) |

### Still weak

- **At 360, opened, the card is taller than the screen** (tty 727.4px + prompt 45px). `bottom()` keeps the prompt in view, so the top of the motd can scroll away.
- **It depends on `::details-content` at desktop** (same class of engine as the header menu). An older no-JS desktop would see a closed disclosure; the live shell sets `open` from 720px up.
- **Checked in Chrome only.** An iPhone, and the on-screen keyboard with the accordion open, were not opened. `fit()` itself was not changed.
- **`display: flex` on the summary** means the marker is a CSS `▸` / `▾`, not the native triangle.
- **The shell `boot` command still drops the `switch` flag** (pre-existing; this pass only added a wrap around the login `neofetch`).
