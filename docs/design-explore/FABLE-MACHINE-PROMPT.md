# Fable: 人間用 / 機械用 for /proto/matrix/

You are working in this Astro 5 worktree only: `~/dev/wadakatu.github.io-design`, branch `design/explore`.

遠慮するな。最高の物を作れ。大まかな指示の内容と全体方針さえ守れば後は全て任せる

## Direction

wadakatu wants to try something wild on `/proto/matrix/`. The page has two modes:

- **人間用** — the current designed page (the constructed portfolio: operator streams, rain of his real text, boot, logo, palettes). Keep this as the human reading.
- **機械用** — choosing the machine side turns the *whole web page* into a terminal-style, machine-code rendering of the *same real content*. Not a slightly denser stylesheet. The site should feel like it has dropped out of the constructed page and into the machine's view of the same facts. Wild is welcome.

The idea, in his words: 「ソースを見るを選んだら、WebページがマシンコードでTerminal風で表示されるとかはぶっ飛んでて面白そうかも（人間用と機械用みたいな）」. You may evolve the existing “View source” mechanic into this, or invent a better entry. The choice may carry a red/blue pill *homage* (a felt choice between two worlds) but must **not** use the literal labels “red pill”, “blue pill”, “赤いピル”, “青いピル”, or other verbatim film quotes (“Wake up, Neo”, “There is no spoon”, “Follow the white rabbit”, “The Matrix” lockup).

You may try multiple variants if you want (separate routes, query flags, in-place switch). Prefer shareable URLs so stills can be taken. If you make more than one variant, make them genuinely different, not recolors, and leave a short note saying what each one is for.

## Constraints (keep these; everything else is yours)

- Matrix world. Night phosphor green is the default, even on a light OS. `?palette=operator` (and the existing Operator colours control) must still work in both modes, or you must say clearly if a variant cannot support it. Logo tinting is allowed (the designer said so).
- Real content only. Use `src/data/proto-content.ts` and `src/data/proto-matrix-corpus.ts`. Do not invent numbers, clients, testimonials, or achievements. Location is **Japan** only (no city).
- Use the real logo file `public/images/logo-400.png`. Recolor is OK. Do not change its shape: no crop, no stretch, no rounding that clips the square, no redraw.
- Japanese and English are never shown as translations of the same sentence side by side. Japanese keeps a Japanese font, correct `lang`, no Latin negative tracking on Japanese.
- Accessibility: skip link, visible focus, WCAG AA for reading text, keyboard. Machine mode must remain readable and navigable, or at least clearly escapable back to human mode. Honor `prefers-reduced-motion`. The page must work without JavaScript: if the machine view needs a script, provide a real second URL (or static markup) so the mechanic exists without JS.
- Prototype only. You may edit `src/pages/proto/matrix/**`, `src/layouts/ProtoMatrixLayout.astro`, `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js`, and `docs/design-explore/MATRIX-NOTES.md`. You may add new files under those proto/matrix paths and proto styles/scripts. Do **not** change production routes, `tombo.css`, `site.css`, `BaseLayout.astro`, FooterLogo, or the other `/proto/*` concepts. Do not change the two data files except to import them. Do not add package.json dependencies. Do not git commit or push. Do not merge or deploy. Do not edit `~/dev/wadakatu.github.io`.
- A local Astro dev server is already running on `127.0.0.1:4321` (PID 88553). **Do not stop it.** Do not start a second long-running server that you leave behind. You may use it, or run a short-lived preview against `dist` on another port and stop that one. After edits, run `npm run build` and fix errors you introduced.
- Update `docs/design-explore/MATRIX-NOTES.md` with what you built, routes/flags, how to switch, how reduced-motion and no-JS behave, that this pass was built with Fable (Claude Code `--model fable`), and anything still weak.

Existing query flags to keep working unless you must replace them: `?boot=1`, `?boot=frozen`, `?motion=0`, `?source=1`, `?theme=day|night`, `?palette=operator`. If you add a machine-mode flag, document it (e.g. `?mode=machine` or a `/machine/` route).

Start now.
