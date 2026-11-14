You are building two working visual prototypes for wadakatu's personal site (www.wadakatu.dev), in this Astro 5 repo, on branch design/explore.

Direction has changed. If the site commits to one world, wadakatu wants that world to be The Matrix, his favorite film. Build two different interpretations of that world. Do not continue or restyle the earlier Spectrum or Personal specification pages as the new brief. Leave `/proto/b/` (Spectrum) untouched; it is the pre-Matrix control. Leave `/proto/d/` untouched as well. Do not edit `src/pages/proto/index.astro`.

Work only in this worktree. Do not edit, checkout, or commit in any other directory. Do not run git commit or git push. Do not change existing production pages, layouts, tombo.css, site.css, or BaseLayout.astro. Do not install anything into ~/.claude or ~/.codex.

Read before you design:
- `.design-skills/frontend-design/SKILL.md`
- `.design-skills/impeccable/SKILL.md`
- `.design-skills/unslop/SKILL.md`
- `src/data/proto-content.ts` (the only allowed facts)

# Legal and taste

Evoke the film. Do not copy it.
Forbidden: film logos, official title treatments, official or obviously trademarked fonts, character likenesses, prop replicas (pills as the film's prop, a 3D spoon, costume chrome), and famous lines set as a headline or wordmark (no "Wake up, Neo", no "There is no spoon" as an H1, no "The Matrix" lockup).
Do not let generic green-on-black falling code be the whole idea of either page.
Each concept must still be obviously about wadakatu (his name, his real work, Japan, his writing).

# Your assignment

## 1. See the source — `/proto/source/` and `/proto/source/projects/`

Signature: a choice between two readings of the same facts: the constructed page, and a source reading that makes the hidden structure visible. This is laravel-spectrum's job, used as a Matrix idea (the world has a source). Do not design a pair of trademarked red/blue pills. A plain, typographic choice is enough: two paths, two modes, or two separate presentations. If you offer Japanese and English, they must be separate pages, never side by side. Prefer constructed vs source over a language split unless you also build a real Japanese page from the Japanese facts we have (blog titles, tombo's Japanese rules). The first two seconds should make the choice, and the difference, obvious.

Both modes must be readable, WCAG AA, with a theme or mode that works without JavaScript (e.g. two URLs such as `/proto/source/` and `/proto/source/raw/`, or a checkbox that degrades). prefers-reduced-motion honored.

## 2. Bent measure — `/proto/spoon/` and `/proto/spoon/projects/`

Signature: a restrained typographic page with one bend. A measured line, rule, or letterform yields when you attend to it (hover, focus, or a careful pointer), then returns. This is tombo's "measure everything" meeting the film's lesson that the construct can give. No 3D spoon, no famous quote as a headline, no pile of distortions. The rest of the page should be calm, precise, and about his work. Under prefers-reduced-motion, the bend is a static, slight, still-readable displacement or is omitted, never an ongoing warp.

Light and dark themes, toggle, prefers-color-scheme.

# Implementation rules

1. Files you may create or edit:
   - `src/pages/proto/source/**`
   - `src/pages/proto/spoon/**`
   - optional: `src/layouts/ProtoSourceLayout.astro`, `src/layouts/ProtoSpoonLayout.astro`
   - optional: `public/styles/proto/source.css`, `public/styles/proto/spoon.css`
   Do not touch proto/b, proto/d, proto/construct, proto/operator, or proto/index.astro.
   Import `src/data/proto-content.ts` read-only. Do not change that file.

2. Finished Home plus a glimpse of Projects for each. Standalone pages: do not use BaseLayout or TOMBO classes. The two concepts must look nothing like each other. Commit to the one signature. Restraint can be the signature.

3. Use only facts in proto-content.ts. Location is "Japan" only. Plain copy, no hype. Japanese and English are never shown as translations side by side. Japanese blog titles stay in Japanese, with a Japanese font and no Latin negative tracking on Japanese. `lang` attributes must be correct.

4. Accessibility: skip link, heading hierarchy, visible focus, WCAG AA in both themes, keyboard, works without JS (mode and motion may enhance). Readable at 1440px and 390px.

5. Footer may include logo credit and email. Nav may link to real `/projects/`, `/blog/`, `/about/` plus the sibling projects glimpse. Small link back to `/proto/`.

6. If node_modules is present, you may run `npx astro check` or `npm run build` and fix errors you introduced. Do not start a long-running dev server. Prefer CDN fonts and plain CSS. Do not add Three.js. Do not add GSAP unless a small motion is justified and has a reduced-motion fallback.

7. When finished, write `docs/design-explore/CODEX-MATRIX-NOTES.md` (do not overwrite `docs/design-explore/CODEX-NOTES.md`, which belongs to the Spectrum control) listing files, which CLI this is (Codex), and how a visitor sees each signature in under two seconds.

Start building now.
