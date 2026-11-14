# Fable: slim and refine the phone header

You are working in this Astro 5 worktree only: `~/dev/wadakatu.github.io-design`, branch `design/explore`.

遠慮するな。最高の物を作れ。大まかな指示の内容と全体方針さえ守れば後は全て任せる

## Direction

wadakatu, in his words: 「スマホ幅の時のHeaderの占める割合が多いね ここもっとブラッシュアップして綺麗にしてほしい」.

The phone header takes too much vertical space and looks messy. Redesign it at phone widths so it is slim, refined, and the page (and the 機械用 terminal) get the height back. Pick one strong design and implement it. Do not offer a flag-comparison set this time.

## What I already measured (do not redo this as a long investigation)

Against the running preview at `http://127.0.0.1:4321` (leave it running; do not kill PID 3545 / 3598):

| View | 360 / 390 / 430 | 1440 |
| --- | --- | --- |
| 人間用 Home and Projects | **204.6px, 24.2% of 844** | 69px, 7.7% of 900 |
| 機械用 | **92.8px, 11.0% of 844** | 69px, 7.7% of 900 |

At 390 人間用 the header is four bands: logo + `wadakatu_` (44px, full width), Main nav (24px, full width), then the compact rain switch + Hold rain + Operator colours, then Daylight wrapped underneath (controls 88px). At 390 機械用 it is already two rows (32px mark + 46px switch on the first row, numbered nav on the second); palette / theme / Hold rain are already hidden because `theme` and `palette` exist as shell commands.

Before stills (do not overwrite): `docs/design-explore/shots/matrix-header-before-*.png`.

## Target

At **max-width: 600px** (also consider 601–719, where the header already wraps; check 360, 390, 430):

- A single slim row, about **48–56px** tall: the real logo (Chisato Satoh, `public/images/logo-400.png`, no shape distortion; recolor via the existing palette filter is fine), `wadakatu_`, and the **one-button rain switch with its drop glimpse** (already shipped; do not throw it away or go back to two strands at this width).
- Move **Hold rain**, **Operator colours**, and **Daylight** out of the header row: a compact menu or sheet, or the footer. Nav will not fit the slim row either — it should go in that same menu (or an equally tight, refined place). 機械用's numbered window list can live there too, so the terminal gains the second row.
- Optional hide-on-scroll / shrink-on-scroll on 人間用 only. Skip it if it fights reduced motion, no-JS, or the 機械用 one-viewport shell (the machine window does not scroll). Prefer a quiet slim bar over a clever disappearing one.
- 44px touch targets (the mark, the switch, the menu button, items in the menu). Keyboard and screen-reader access. Visible focus. `aria-expanded` / `aria-controls` if you add a disclosure.
- Phosphor and `?palette=operator`, night and day, `?motion=0` / `prefers-reduced-motion`. The compact rain switch's glimpse and the motion-off `▾` must still work.
- **No-JS still usable:** Main nav stays real links; the rain switch stays two real links; Hold rain stays a checkbox. `<details>` is a good default for the menu. Palette and theme buttons are already `.needs-js`.
- Japanese and English prose never as translations of the same sentence side by side.

## Must not change

- The **desktop / 1440 header**. After your work, 1440 人間用 and 機械用 must still be the current one-row 69px bar, same content, same order. Compare against `docs/design-explore/shots/matrix-header-before-human-home-1440.png` if useful.
- 機械用 **terminal content, commands, `_shell.ts`, `_term.ts`, `_world.ts`**. You may only change shared header/layout CSS (and tiny JS/markup the header needs) so the shell grid gets the reclaimed height. Keep `#hold`, `#palette-toggle`, `#theme-toggle` working.
- Production routes, `main`, `~/dev/wadakatu.github.io`, `chore/location-japan`.
- Do **not** commit, do **not** push, do **not** kill the dev server on 4321, do **not** kill other `claude` processes (an Inqlite job is running).
- Do not invent content, testimonials, or film-quote lockups. Location is Japan only.

## Likely files

`src/layouts/ProtoMatrixLayout.astro`, `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js`. Add a short section to `docs/design-explore/MATRIX-NOTES.md` (before/after heights, what moved where, weak spots). Leave official after-stills and `hold-recolor.mjs` to the executor if you are short on time; if you run Playwright, use the existing `node_modules/playwright` symlink (Chrome channel) against `127.0.0.1:4321`.

Keep this pass short and focused. Implement, glance at 360 / 390 / 430 and 1440, write the notes, stop.
