You are building two working visual prototypes for wadakatu's personal site (www.wadakatu.dev), in this Astro 5 repo, on branch design/explore.

Work only in this worktree. Do not edit, checkout, or commit in any other directory. Do not run git commit or git push. Do not change existing production pages, layouts, tombo.css, site.css, or BaseLayout.astro.

# Your assignment

Build these two concepts, and only these:

## A. Flight path — routes `/proto/a/` and `/proto/a/projects/`

Signature: the page is a still field of paper. A measured dragonfly flight path (day, "tombo") or firefly traces (night, "hotaru") is the structure. The name wadakatu, the navigation, and the work sit on that line. The insects he already named become wayfinding, not a mascot, not a 3D model, not a cartoon character.

Day and night are a meaning change, not just inverted colors: day is a single continuous path, like a dragonfly's route across a sheet; night is several short glowing traces, like fireflies, that still line up into a readable order. Provide a theme toggle. Follow `prefers-color-scheme` by default. Honor `prefers-reduced-motion` (static path, no looping flight).

## C. Artboard — routes `/proto/c/` and `/proto/c/projects/`

Signature: the portfolio is a selected frame in a no-code website builder, with a small screen-graph of this very site in the margin (screenbook turned inward). He builds website builders at Studio Inc.; the site looks like a tool looking at itself. Quiet transform handles, artboard labels, a selected block, a graph of Home / Projects / Blog / About. It must feel precise and calm, not like a parody of Figma and not like a busy design-tool chrome dump.

Light and dark themes, toggle, `prefers-color-scheme`, `prefers-reduced-motion`.

# Implementation rules

1. Files you may create or edit:
   - `src/pages/proto/a/**`
   - `src/pages/proto/c/**`
   - optional: `src/layouts/ProtoALayout.astro`, `src/layouts/ProtoCLayout.astro`
   - optional: `public/styles/proto/a.css`, `public/styles/proto/c.css`
   Do not touch `src/pages/proto/b`, `src/pages/proto/d`, or `src/pages/proto/index.astro`.
   You may import `src/data/proto-content.ts` (read-only). Do not change that file.

2. Each concept needs a finished Home page and a glimpse of Projects (enough that the idea continues, not a full catalog). Standalone pages: do not use BaseLayout or TOMBO classes. You are not bound by the current tombo design system. Invent a new visual language for each concept. They must look nothing like each other, and nothing like a generic dark-mode-with-gradient dev portfolio.

3. Use only the facts in `src/data/proto-content.ts`. Location is "Japan" only (no city). Do not invent numbers, clients, testimonials, or achievements. Copy is plain, no hype, no superlatives, no marketing exclamation. Japanese and English are never shown as translations side by side on one page. English chrome is fine; Japanese blog titles stay in Japanese. Japanese text must render correctly (load a Japanese font, e.g. M PLUS 2, Source Han, or Noto Sans JP, and do not apply Latin negative letter-spacing to Japanese).

4. Accessibility: skip link, real heading hierarchy, visible focus styles, contrast of at least WCAG AA in both themes, `lang="en"` on these pages, semantic HTML, buttons and links keyboard reachable. The page must work without JavaScript (theme can enhance). Responsive at 1440px and 390px.

5. Footer may include the logo credit and email from proto-content.ts. Nav may point at the real `/projects/`, `/blog/`, `/about/` routes, plus the sibling `/proto/a/projects/` or `/proto/c/projects/` for the glimpse. Include a small, unobtrusive link back to `/proto/`.

6. When the pages are written, run `npx astro check` or `npm run build` if dependencies are already installed, and fix errors you introduced in your files. If `node_modules` is missing, run `npm install` in this worktree only. Do not start a long-running dev server. Do not add dependencies unless a font or tiny CSS need requires it; prefer CDN fonts and plain CSS.

7. When finished, write a short note to `docs/design-explore/CLAUDE-NOTES.md` listing the files you created and how a visitor should notice each signature idea in under two seconds.

Start building now.
