# Codex critique: palette + logo pass on /proto/matrix/

Claude Code just added `?palette=operator` and integrated the real logo (`/images/logo-400.png`) into `/proto/matrix/`. Review and tighten only. Do not redesign.

Work only in `~/dev/wadakatu.github.io-design`, branch `design/explore`. Do not edit `~/dev/wadakatu.github.io`. Do not git commit or push. Do not change production pages, other /proto/* concepts, or the two data files. Do not install into ~/.codex or ~/.claude. Do not add package.json dependencies. Do not leave a dev server running. Do not kill unrelated processes.

## Read

- `.design-skills/impeccable/SKILL.md` and `.design-skills/frontend-design/SKILL.md` if useful
- `docs/design-explore/MATRIX-NOTES.md` (especially "Palette and logo pass" and weak points)
- The files Claude changed: `src/layouts/ProtoMatrixLayout.astro`, `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js`, `src/pages/proto/matrix/_Records.astro`, `src/pages/proto/matrix/_lib.ts`
- Visuals already captured (look at these, do not invent new ones in the repo): `docs/design-explore/_review/*.png` — frozen boot in both palettes, night home 1440/390, source record, header at 390.

## Bar

- Phosphor remains the default. Operator palette is a flag, not stored. Night and day both work. WCAG AA text.
- The logo is Chisato Satoh's mark: use the real PNG, 1:1, no crop, no rounding, no distortion. Recolor only via CSS filter on operator-night. Do not redraw it.
- No-JS and reduced-motion behaviour must stay intact. Boot skip/frozen/flags must still work. `?boot=frozen` must show the logo.
- Preserve `palette` in the address and in-page links (Claude already started this).

## Your job

1. Critique concretely. Known weak points (you may leave them if you agree): header mark is a burst at 44px; operator day is almost phosphor day; 240 KB PNG for a small header; no static /operator/ routes; amber tint should be shown to the designer before anything public.
2. Fix only real problems (bugs, contrast, clipped mark, broken flags, header collision at 390, focus). You may bump the header logo modestly (e.g. 52–56px) if 44px feels too small *and* 390 still wraps cleanly. Do not add a new route set unless a one-file fix is obvious. Do not persist the palette.
3. If you change behaviour, update `docs/design-explore/MATRIX-NOTES.md`. Write a short `docs/design-explore/PALETTE-LOGO-CRITIQUE.md`: what you found, what you changed, what you left, that this review was Codex.
4. `npm run build` and fix errors you introduced.

Start now.
