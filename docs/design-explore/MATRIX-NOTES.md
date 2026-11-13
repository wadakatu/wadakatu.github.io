# /proto/matrix/ build notes

Built with Claude Code on 13 November 2026, on `design/explore`, in this worktree only. Reviewed and tightened with Codex on the same date; see `MATRIX-CRITIQUE.md`. A palette and logo pass followed, also with Claude Code; see the last section, which is current where it differs from the ones above. Nothing is committed.

**Current state: the last section, "人間用 / 機械用".** That pass replaced the source view described below with the
machine reading. Where the two disagree ("See the source", the `/source/` routes, the View source button, the
curtain on a view change, `_Records.astro`), the last section is right.

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
