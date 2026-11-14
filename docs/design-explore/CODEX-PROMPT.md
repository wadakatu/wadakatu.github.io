You are building two working visual prototypes for wadakatu's personal site (www.wadakatu.dev), in this Astro 5 repo, on branch design/explore.

Work only in this worktree. Do not edit, checkout, or commit in any other directory. Do not run git commit or git push. Do not change existing production pages, layouts, tombo.css, site.css, or BaseLayout.astro.

# Your assignment

Build these two concepts, and only these:

## B. Spectrum — routes `/proto/b/` and `/proto/b/projects/`

Signature: undescribed work enters as one beam and splits into readable bands. Each project is a wavelength of the same light. This is what laravel-spectrum does (zero-annotation APIs made visible), used as the site's visual idea. Not a rainbow gradient background, not a generic "colorful cards" grid. The optical event (one beam, a split, bands you can read) should be the first thing a visitor understands. The name wadakatu can be the point of refraction, or a quiet prism mark, but keep the typography serious.

Light and dark themes (daylight through a prism vs. a darker room with a single beam), toggle, `prefers-color-scheme`, `prefers-reduced-motion` (static split, no pulsing rainbow).

## D. Personal specification — routes `/proto/d/` and `/proto/d/projects/`

Signature: the site is typeset as a careful, dated specification of one engineer: running headers, clause numbers, a plain voice, a document you could almost print. It comes from his TPAC 2025 work and from a habit of measuring, without imitating the official W3C website, without inventing status labels such as REC or WD, and without looking like the current tombo graph-paper system. Think typographic manuscript, not "docs theme."

A light "paper" theme and a dark "issued at night" theme, toggle, `prefers-color-scheme`, `prefers-reduced-motion`.

# Implementation rules

1. Files you may create or edit:
   - `src/pages/proto/b/**`
   - `src/pages/proto/d/**`
   - optional: `src/layouts/ProtoBLayout.astro`, `src/layouts/ProtoDLayout.astro`
   - optional: `public/styles/proto/b.css`, `public/styles/proto/d.css`
   Do not touch `src/pages/proto/a`, `src/pages/proto/c`, or `src/pages/proto/index.astro`.
   You may import `src/data/proto-content.ts` (read-only). Do not change that file.

2. Each concept needs a finished Home page and a glimpse of Projects (enough that the idea continues, not a full catalog). Standalone pages: do not use BaseLayout or TOMBO classes. You are not bound by the current tombo design system. Invent a new visual language for each concept. They must look nothing like each other, and nothing like a generic dark-mode-with-gradient dev portfolio.

3. Use only the facts in `src/data/proto-content.ts`. Location is "Japan" only (no city). Do not invent numbers, clients, testimonials, or achievements. Copy is plain, no hype, no superlatives, no marketing exclamation. Japanese and English are never shown as translations side by side on one page. English chrome is fine; Japanese blog titles stay in Japanese. Japanese text must render correctly (load a Japanese font such as M PLUS 2, Source Han, or Noto Sans JP, and do not apply Latin negative letter-spacing to Japanese).

4. Accessibility: skip link, real heading hierarchy, visible focus styles, contrast of at least WCAG AA in both themes, `lang="en"` on these pages, semantic HTML, buttons and links keyboard reachable. The page must work without JavaScript (theme can enhance). Responsive at 1440px and 390px.

5. Footer may include the logo credit and email from proto-content.ts. Nav may point at the real `/projects/`, `/blog/`, `/about/` routes, plus the sibling `/proto/b/projects/` or `/proto/d/projects/` for the glimpse. Include a small, unobtrusive link back to `/proto/`.

6. When the pages are written, run `npx astro check` or `npm run build` if dependencies are already installed, and fix errors you introduced in your files. If `node_modules` is missing, run `npm install` in this worktree only. Do not start a long-running dev server. Do not add dependencies unless necessary; prefer CDN fonts and plain CSS.

7. When finished, write a short note to `docs/design-explore/CODEX-NOTES.md` listing the files you created and how a visitor should notice each signature idea in under two seconds.

Start building now.
