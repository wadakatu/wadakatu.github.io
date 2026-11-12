# Codex critique of /proto/matrix/

You are reviewing and tightening one prototype already built by Claude Code in this Astro 5 worktree, branch `design/explore`.

Work only in this worktree (`~/dev/wadakatu.github.io-design`). Do not edit `~/dev/wadakatu.github.io`. Do not git commit or push. Do not change production pages, tombo.css, site.css, BaseLayout.astro, or the other /proto/* concepts (construct, source, operator, spoon, b, d). Do not change `src/data/proto-content.ts` or `src/data/proto-matrix-corpus.ts` (read-only). Do not install anything into ~/.codex or ~/.claude. Do not start a long-running dev server that you leave running. Do not add package.json dependencies.

## Read first

- `.design-skills/frontend-design/SKILL.md`
- `.design-skills/impeccable/SKILL.md`
- `.design-skills/unslop/SKILL.md`
- `.design-skills/gsap-core/SKILL.md` and `.design-skills/gsap-timeline/SKILL.md` if you touch motion
- `docs/design-explore/MATRIX-NOTES.md`
- `docs/design-explore/MATRIX-BUILD-PROMPT.md` (the original brief; this is the bar)
- All files under `src/pages/proto/matrix/`, `src/layouts/ProtoMatrixLayout.astro`, `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js`

## What this prototype must be

Operator streams + in-place constructed vs source of the same real facts, fully committed to a Matrix-inspired world (night phosphor green, rain of his own repo/commit/blog text, skippable boot, rain/decode source toggle, rare glitch rewards). Evoke the film; do not copy it.

Forbidden in typography, labels, voiceover, or comments that ship to the page: film logos, official title treatments, official fonts, stills, character likenesses, and famous lines verbatim (no "Wake up, Neo", no "There is no spoon", no "Follow the white rabbit", no "The Matrix" lockup, no "red pill" / "blue pill" labels).

Real content only. Location is Japan only. Japanese and English are never translations of the same sentence side by side. Japanese text uses a Japanese font, correct `lang`, no Latin negative tracking on Japanese. Body text must stay readable (WCAG AA, solid panels or a scrim, rain aria-hidden). Honor prefers-reduced-motion, skip links, visible focus, no-JS fallbacks. Night is the default even if the OS is light.

## Your job

1. Critique the build against the brief and the skills. Be specific (file + what's wrong). Look especially at:
   - Accessibility: contrast in night and day, focus, keyboard, skip link, heading order, JA typography, reduced motion, no-JS.
   - WCAG 2.1.4 Character Key Shortcuts: the bare `\` (and `¥` on JIS) has no off switch. Fix this without removing the shortcut — e.g. ignore it when focus is in a text field, and provide a way to disable it (a control, or only when a modifier is held in addition to keeping the current documented shortcut if you can do both without confusion). Document the change.
   - Whether rain is his real data and is not the only idea on the page.
   - Whether the boot and the in-place source transition actually feel committed (or whether they are timid, broken, or unreadable).
   - Bugs, contrast misses, overflow at 1440 and 390, typography issues, motion that fails when the GSAP CDN is down.
   - Anything that copies the film too closely.

2. Fix the real problems you find. Stay inside these files only:
   - `src/pages/proto/matrix/**`
   - `src/layouts/ProtoMatrixLayout.astro`
   - `public/styles/proto/matrix.css`
   - `public/scripts/proto-matrix.js`
   - `docs/design-explore/MATRIX-NOTES.md` (update for any behaviour you change)
   - `docs/design-explore/MATRIX-CRITIQUE.md` (write this)

   Do not redesign the concept. Do not dilute the Matrix commitment back into tasteful-minimal. Prefer surgical fixes.

3. After edits, run `npm run build` in this worktree and fix errors you introduced.

4. Write `docs/design-explore/MATRIX-CRITIQUE.md`: what you found, what you changed, what you left, and that this review was done with Codex. Keep it factual and short.

Start now.
