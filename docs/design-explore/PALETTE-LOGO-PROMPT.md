# Palette + logo pass for /proto/matrix/

You are tightening the existing `/proto/matrix/` prototype in this Astro 5 worktree, branch `design/explore`.

Work only in this worktree (`~/dev/wadakatu.github.io-design`). Do not edit `~/dev/wadakatu.github.io`. Do not git commit or push. Do not change production pages, tombo.css, site.css, BaseLayout.astro, FooterLogo.astro, or the other /proto/* concepts (construct, source, operator, spoon, b, d). Do not change `src/data/proto-content.ts` or `src/data/proto-matrix-corpus.ts` (read-only). Do not install anything into ~/.claude or ~/.codex. Do not start a long-running dev server that you leave running. Do not add package.json dependencies. Do not kill other processes (another Claude may be running elsewhere).

## Read first

- `.design-skills/frontend-design/SKILL.md`
- `.design-skills/impeccable/SKILL.md`
- `docs/design-explore/MATRIX-NOTES.md` (how boot, source toggle, query flags, theme currently work)
- `src/layouts/ProtoMatrixLayout.astro`, `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js`
- `src/pages/proto/matrix/**`
- `public/styles/proto/operator.css` (the Operator palette tokens to reuse)
- The real logo files (inspect, do not invent a new mark):
  - `public/images/logo-400.png` — 400×400 RGBA, **fully opaque**, designed black field, phosphor-green burst. This is the file to use (highest resolution, the mark as designed).
  - `public/images/logo-400.webp`, `src/assets/images/logo-80.webp`, `src/assets/images/logo-48.webp` — same mark, no alpha, smaller. Do not prefer these over the PNG.
- `src/components/FooterLogo.astro` is how the live site uses a smaller webp (it also applies `border-radius: 8px` and `object-fit: cover`). Do **not** copy those crop/rounding treatments. Credit already exists: person.logoCredit / Logo by Chisato Satoh.

## Legal / respect for the mark

A friend (Chisato Satoh) designed this logo. Respect it.

- Use the real file. Do not redraw, trace, re-type the hex numbers, crop, stretch, rotate, or change the mark’s shape.
- Keep a 1:1 aspect ratio and `object-fit: contain`. No `border-radius` that clips the square, no `object-fit: cover`.
- Give it clearspace outside the 400×400 square. The file already includes a small internal margin and a designed black field; treat the whole square as the mark. Do not try to punch out the black field or isolate the burst.
- Recolor **only** via the palette. The PNG has no useful alpha (every pixel is opaque), so do not invent an SVG or a silhouette mask that flattens the burst, the rain texture, or the numbers. A CSS `filter` (e.g. hue-rotate / saturate, tuned by eye) on operator-night is appropriate so the mark belongs in the amber CRT world. Default phosphor-green should show the file as designed (it is already this green). Operator-day is still a grey-green LCD: the original green-on-black badge may fit without a strong shift; tune by eye. Filters must not distort geometry.
- Do not set the logo as a full-bleed background behind the giant name, and do not replace the `h1` with a stretched logo.

## 1. Operator palette variant

Phosphor green remains the default world (`data-theme="night"` as today, no palette attribute or `data-palette="matrix"`).

Add a way to view the same prototype in the earlier `/proto/operator/` palette:

Operator night (warm amber CRT), from `operator.css`:

- bg `#100e0b`, text `#ece4d4`, muted `#c2b496`, stream `#c3b089`, lead `#f0e0b4`, accent `#d9b56a`, rule `#3d362c`

Operator day (LCD in daylight):

- bg `#cdd6cb`, text `#111b15`, muted `#2f4236`, stream `#3c5244`, lead `#06281a`, accent `#0a4f2f`, rule `#8fa093`

Map these onto the existing matrix tokens (`--bg`, `--panel`, `--rule`, `--text`, `--muted`, `--lead`, `--green`, `--rain-tail`, `--rain`, `--rain-head`) so night and day both work. Derive a `--panel` slightly off `--bg` (do not invent a new accent language). Keep WCAG AA for reading text and controls.

**How to switch (required):**

- URL flag `?palette=operator` (and `?palette=matrix` or omitting it = default phosphor). Read it in the existing inline head script, before first paint, same as theme/boot/source.
- A visible, keyboard-accessible control labelled in plain language (e.g. “Operator colours” / “Phosphor”), pressed state. Do not persist the palette in localStorage: the default must stay phosphor unless the URL (or the control, which should update the URL) says otherwise. Shareable.
- Preserve `palette` (and other current flags that belong in the address) when the in-place source toggle does `history.replaceState`. Today `swap()` drops the query string; fix that at least for `palette`. Carry the flag through Home / Projects / source links too.
- You may also add static routes under `/proto/matrix/operator/` that bake `data-palette="operator"` into the HTML (nice for no-JS). Not required if the flag + head script matches how `?theme=day` already works. If you add routes, they must reuse the existing page components, not duplicate content.
- No-JS: default remains phosphor green, as today’s default remains night. Reduced motion unchanged. The page must still work if the enhancement script never loads.

## 2. Logo, as a first-class part of this world

Use `/images/logo-400.png` (the real public file) via a plain `img` with width/height 400 and CSS display size. Alt text: if the wordmark “wadakatu_” is already the accessible name of the home link, the image may be `alt=""`; otherwise a short “wadakatu logo”. Keep the footer credit to Chisato Satoh.

Implement **three treatments that work together** as one system (try them carefully, then recommend one system in the notes — not three competing sites):

1. **Header.** The mark sits in the header with the existing `wadakatu_` wordmark, square, no crop, with clearspace. It must stay legible at 1440 and 390 and not collide with nav/controls (wrap is already how the header behaves). This is the persistent identity.
2. **Boot reveal.** The mark is revealed at the end of the boot (fade or a clip/wipe is fine; do not scramble, pixel-sort, or glyph-decode the image itself). `prefers-reduced-motion` / `?motion=0`: the logo is simply there, no animation. **`?boot=frozen` must show the logo** (update the frozen frame if needed so a still includes it). Skip / Escape / click / timeout behaviour stays as it is.
3. **Source view.** Render the same file in the source reading: a record (path `/images/logo-400.png`, and the existing credit/url) plus the image itself at intrinsic ratio, no crop, on the solid source panel. This is “see the source” applied to the mark.

Do not make the logo the only idea on the page. Header + boot + source should feel inevitable, not stacked decoration.

## Implementation rules

You may edit only:

- `src/pages/proto/matrix/**`
- `src/layouts/ProtoMatrixLayout.astro`
- `public/styles/proto/matrix.css`
- `public/scripts/proto-matrix.js`
- `docs/design-explore/MATRIX-NOTES.md` (update behaviour, flags, logo file used, the three treatments, and your recommendation)
- optional: one line on `src/pages/proto/index.astro` if you need to mention the palette flag. Prefer not to rewrite the chooser.

Then run `npm run build` in this worktree and fix errors you introduced. Do not commit or push.

Keep existing accessibility: skip link, focus, AA text, JA typography, no-JS source URLs, reduced motion, shortcut off-switch.

No verbatim film quotes, logos, or title treatments (the wadakatu logo is not a film asset; it is his).

Update MATRIX-NOTES.md with: files touched, `?palette=operator`, how the logo is used, which file, recommended treatment, anything still weak. State that this pass was built with Claude Code (a Codex review may follow).

Start now.
