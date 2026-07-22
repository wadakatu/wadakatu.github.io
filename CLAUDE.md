# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for wadakatu (Backend Developer). Hosted on GitHub Pages at https://www.wadakatu.dev/.

## Tech Stack

- **Framework**: Astro 5 (every route, including the blog's content collections)
- **Design system**: TOMBO — vendored, pure CSS, no runtime
- **Hosting**: GitHub Pages (publishes `dist/` only)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (Astro)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# For static pages only (no Astro)
python -m http.server 8000
```

## Architecture

### Structure
The site is Astro 5 end-to-end; all 7 routes (`/`, `/about/`, `/projects/`, `/blog/`, blog posts, `/404`, `/offline/`) are Astro pages/layouts under `src/pages/`. GitHub Pages serves the built `dist/` output only — there are no hand-written static HTML pages.

- **Design system**: TOMBO (private `wadakatu/tombo`), vendored at `public/styles/tombo.css` (currently v0.5.0, do not hand-edit) plus site-specific rules in `public/styles/site.css`. Rules: `.claude/rules/frontend-design.md`.
- Everything under `public/` is copied verbatim into `dist/` and published as-is. Generator/tooling scripts (icons, OGP, sitemap, feed) live in the repo-root `tools/` directory, **not** `public/scripts/` — don't put tooling back under `public/`.
- **Theme**: `data-theme` on `<html>` + `localStorage` (`tombo-theme`), toggled by `public/scripts/theme.js`; the pre-paint value is set by an inline script in `BaseLayout.astro`'s `<head>` to avoid a flash of the wrong theme.
- `BaseLayout.astro` takes a `bodyClass` prop for layout variants (docs-volume pages pass `bodyClass="tombo-gutters"`).
- Astro's scoped `<style>` never matches elements a script creates at runtime — rules for JS-injected DOM (the TOC disclosure, the code-copy button) must live in global `public/styles/site.css`, not a component's scoped style block.

### Key Directories
- `src/components/` - Reusable Astro components (Footer, PageHeader, SectionHeader, SkipLink, ThemeToggle, FooterLogo)
- `src/content/blog/` - Blog posts in Markdown
- `src/layouts/` - `BaseLayout.astro` (used by every route except `404` and `offline`, which are standalone)
- `src/pages/` - Astro page routes
- `public/scripts/` - Runtime JavaScript shipped to the browser (theme, toc, code-copy, scroll-to-top, sw + registration)
- `public/styles/` - `tombo.css` (vendored) and `site.css` (this site's glue)
- `public/images/` - Favicons, PWA icons, logo
- `tools/` - Generators run by hand (OGP card, icons, sitemap, feed). Not published.

### Design System
See `.claude/rules/frontend-design.md` for the binding rules. In short: TOMBO's tokens are
the only source of colour and type size, the volume dial decides each page's density
(`/` = LP, docs pages = docs, `404`/`offline` = app), and every visual change is verified
in both themes.

### Type
Three voices, loaded from Google Fonts: Instrument Sans (Latin display), M PLUS 2 (body,
weight 450), Martian Mono (labels, numbers, code). Code blocks are highlighted by Shiki's
`css-variables` theme, mapped onto the TOMBO code-panel tokens in `site.css`.

### JavaScript Features
- Theme toggle with `localStorage` persistence
- JST clock in the footer
- Table of contents with scroll-spy (a disclosure below 900px)
- Copy button on code blocks
- Service Worker for offline support (PWA)
- Scroll-to-top button

### Standalone Pages
`404.astro` and `offline.astro` do not use `BaseLayout` and carry their own `<head>`.
`offline.astro` is additionally **self-contained**: no external stylesheet, no webfont, and
its own inlined copy of the TOMBO tokens it needs — it has to render when every request
fails. Keep it that way.
