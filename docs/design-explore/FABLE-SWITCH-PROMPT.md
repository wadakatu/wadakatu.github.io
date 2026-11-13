# Fable: cool the header switch, leave 機械用 alone

You are working in this Astro 5 worktree only: `~/dev/wadakatu.github.io-design`, branch `design/explore`.

遠慮するな。最高の物を作れ。大まかな指示の内容と全体方針さえ守れば後は全て任せる

## Direction

wadakatu has approved 機械用 as-is. Do **not** change the terminal, its commands, its layout, or the human page — except the header control that chooses 人間用 / 機械用 (and any small shared CSS/markup that control needs). In his words: 「ヘッダーの人間用、機械用っていうのをもうちょいカッコよくしてほしい」.

Redesign that header switch so it feels much cooler and more Matrix. It may remain a quiet pill homage (a felt choice between two worlds) but must **not** use the literal labels “red pill”, “blue pill”, “赤いピル”, “青いピル”, or other verbatim film quotes.

Give him **2–3 distinct new variants**, selectable by a shareable URL flag such as `?switch=a|b|c` (you may pick clearer names). **Keep the current capsule reachable** under an explicit flag (for example `?switch=current` or `?switch=capsule`) so he can compare. Default to your strongest new one, and say so in the notes.

The variants must be genuinely different from each other, not recolors: typography, structure, motion, and/or metaphor. You may reconsider the wording (HUMAN/MACHINE, `--human`/`--machine`, glyphs, 実行権限 jokes, or something better). Japanese and English prose must never appear as translations of the same sentence side by side. A single language, or a terminal token that is not a translation pair, is fine.

Constraints for every variant:

- Keyboard accessible, with a clear selected state (`aria-current`, `aria-pressed`, or an equivalent role). Readable and tappable at 390px wide. Visible focus.
- Works in phosphor and `?palette=operator`, night and day.
- Honors `prefers-reduced-motion` / `?motion=0`.
- The no-JS fallback must still be real links between `/proto/matrix/` and `/proto/matrix/machine/` (and the Projects twins), carrying the `switch` flag along with existing flags (`palette`, `motion=0`, etc.).
- Do not break the in-place switch, `\`, boot capsule, or `exit`. If the large “Two readings” capsule at the foot of Home and the boot-layer capsule share `_Pill.astro`, you may restyle them to stay consistent, or leave those as the old capsule — say which you chose. Do not redesign the terminal itself.

Keep this pass short and focused. One tight set of variants, then `npm run build`, a few Playwright stills of the header if you want to judge them, and notes. Do not start a large new test campaign.

## Constraints (keep these; everything else is yours)

- Prototype only. You may edit `src/pages/proto/matrix/_Pill.astro` and related proto/matrix markup, `src/layouts/ProtoMatrixLayout.astro` (only if the switch needs it), `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js` (only if the switch needs it), and `docs/design-explore/MATRIX-NOTES.md`. Do **not** change production routes, `tombo.css`, `site.css`, `BaseLayout.astro`, FooterLogo, other `/proto/*` concepts, the two data files, `_shell.ts`, `_term.ts`, `_world.ts`, or the terminal’s recorded session. Do not add package.json dependencies. Do not git commit or push. Do not merge or deploy. Do not edit `~/dev/wadakatu.github.io`.
- A local Astro dev server is already running on `127.0.0.1:4321` (PID 88553 / node 88583). **Do not stop it.** Do not start a second long-running server that you leave behind. After edits, run `npm run build` and fix errors you introduced.
- Existing flags must keep working: `?boot=1`, `?boot=frozen`, `?motion=0`, `?source=1`, `?mode=machine`, `?theme=day|night`, `?palette=operator`, `?run=`. Carry `switch` the same way `palette` is carried.
- Update `docs/design-explore/MATRIX-NOTES.md` with the variants and their flags, which is the default and why, how no-JS and reduced-motion behave, that this pass was built with Fable (Claude Code `--model fable`), and anything still weak.

Start now.
