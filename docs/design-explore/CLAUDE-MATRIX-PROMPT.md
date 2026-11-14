You are building two working visual prototypes for wadakatu's personal site (www.wadakatu.dev), in this Astro 5 repo, on branch design/explore.

Direction has changed. If the site commits to one world, wadakatu wants that world to be The Matrix, his favorite film. Build two different interpretations of that world. Do not continue the earlier Flight path or Artboard concepts, and do not edit `/proto/b/` (Spectrum, kept as a control), `/proto/d/`, or `src/pages/proto/index.astro`.

Work only in this worktree. Do not edit, checkout, or commit in any other directory. Do not run git commit or git push. Do not change existing production pages, layouts, tombo.css, site.css, or BaseLayout.astro. Do not install anything into ~/.claude or ~/.codex.

Read before you design:
- `.design-skills/frontend-design/SKILL.md`
- `.design-skills/impeccable/SKILL.md`
- `.design-skills/unslop/SKILL.md`
- `src/data/proto-content.ts` (the only allowed facts)

# Legal and taste

Evoke the film. Do not copy it.
Forbidden: film logos, official title treatments, official or obviously trademarked fonts, character likenesses, prop replicas (pills as the Warner/film prop, a 3D spoon toy, sunglasses-and-leather costume chrome), and famous lines set as a headline or wordmark (no "Wake up, Neo", no "There is no spoon" as an H1, no "The Matrix" lockup).
Do not let generic green-on-black falling code be the whole idea of either page.
Each concept must still be obviously about wadakatu (his name, his real work, Japan, his writing).

# Your assignment

## 1. The Construct — `/proto/construct/` and `/proto/construct/projects/`

Signature: the page is an empty loading program, a pale almost-white (or night, almost-empty) void, where his work materializes as programs being loaded into the construct. Not a city, not rain, not neon green as the main surface. Tied to him: he builds no-code website builders at Studio Inc., and gitlyte turns a GitHub repo into a live site. The first two seconds should feel like a program loading in an empty room, then his name and work arriving.

Light and dark can be "day construct" vs "night construct." Toggle, prefers-color-scheme, prefers-reduced-motion (instant appear, no looping load if motion is reduced).

## 2. Operator — `/proto/operator/` and `/proto/operator/projects/`

Signature: you are at an operator station watching streams built from his real material only: project names and blurbs, blog titles in Japanese, dates, skills, the figures in proto-content.ts. Japanese kana and katakana may appear in the stream, the way the film used Japanese writing, but the glyphs must come from his real text, never from invented "hacker" strings, never from film quotes. This is not a generic `$ whoami` terminal portfolio (the current live site already does that). It should feel like someone is monitoring wadakatu's work, calmly, and you can follow a stream into a project or a post.

Dim, readable screens. Contrast must pass WCAG AA. Reduced motion: static columns or a paused stream, still readable.

# Implementation rules

1. Files you may create or edit:
   - `src/pages/proto/construct/**`
   - `src/pages/proto/operator/**`
   - optional: `src/layouts/ProtoConstructLayout.astro`, `src/layouts/ProtoOperatorLayout.astro`
   - optional: `public/styles/proto/construct.css`, `public/styles/proto/operator.css`
   Do not touch proto/b, proto/d, proto/source, proto/spoon, or proto/index.astro.
   Import `src/data/proto-content.ts` read-only. Do not change that file.

2. Finished Home plus a glimpse of Projects for each. Standalone pages: do not use BaseLayout or TOMBO classes. The two concepts must look nothing like each other. Commit to the one signature. Restraint can be the signature. One hover or hidden detail that belongs to the world is welcome; a bag of effects is not.

3. Use only facts in proto-content.ts. Location is "Japan" only. Plain copy, no hype. Japanese and English are never shown as translations side by side. English chrome is fine; Japanese blog titles stay in Japanese, with a Japanese font and no Latin negative tracking on Japanese. `lang` attributes must be correct (`lang="ja"` on Japanese titles).

4. Accessibility: skip link, heading hierarchy, visible focus, WCAG AA in both themes, keyboard, works without JS (theme and motion may enhance). Readable at 1440px and 390px.

5. Footer may include logo credit and email. Nav may link to real `/projects/`, `/blog/`, `/about/` plus the sibling projects glimpse. Small link back to `/proto/`.

6. If node_modules is present, you may run `npx astro check` or `npm run build` and fix errors you introduced. Do not start a long-running dev server. Prefer CDN fonts and plain CSS. Do not add Three.js. Do not add GSAP unless a small motion is justified and has a reduced-motion fallback.

7. When finished, write `docs/design-explore/CLAUDE-NOTES.md` listing files, which CLI this is (Claude Code), and how a visitor sees each signature in under two seconds.

Start building now.
