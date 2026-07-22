# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for wadakatu (Backend Developer). Hosted on GitHub Pages at https://www.wadakatu.dev/.

## Tech Stack

- **Static Pages**: Pure HTML/CSS/JavaScript (index.html, about/, projects/)
- **Blog**: Astro with content collections
- **Hosting**: GitHub Pages

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

- **Design system**: TOMBO (private `wadakatu/tombo`), vendored at `public/styles/tombo.css` (currently v0.3.2, do not hand-edit) plus site-specific rules in `public/styles/site.css`. Rules: `.claude/rules/frontend-design.md`.
- Everything under `public/` is copied verbatim into `dist/` and published as-is. Generator/tooling scripts (icons, OGP, sitemap, feed) live in the repo-root `tools/` directory, **not** `public/scripts/` — don't put tooling back under `public/`.
- **Theme**: `data-theme` on `<html>` + `localStorage` (`tombo-theme`), toggled by `public/scripts/theme.js`; the pre-paint value is set by an inline script in `BaseLayout.astro`'s `<head>` to avoid a flash of the wrong theme.
- `BaseLayout.astro` takes a `bodyClass` prop for layout variants (docs-volume pages pass `bodyClass="tombo-gutters"`).
- Astro's scoped `<style>` never matches elements a script creates at runtime — rules for JS-injected DOM (the TOC disclosure, the code-copy button) must live in global `public/styles/site.css`, not a component's scoped style block.

### Key Directories
- `src/components/` - Reusable Astro components (Footer, PageHeader, MatrixRain, etc.)
- `src/content/blog/` - Blog posts in Markdown
- `src/layouts/` - Astro page layouts
- `src/pages/` - Astro page routes
- `public/scripts/` - Shared JavaScript (common.js, scroll-to-top.js, sw.js)
- `public/styles/` - Shared CSS
- `public/images/` - Static images (favicon, logo, etc.)

### Design System
- **Theme**: Matrix-inspired (dark background, green accents)
- **Primary color**: `--matrix: #00ff41`
- **Font**: JetBrains Mono (monospace)
- **Layout**: Bento grid with responsive breakpoints (768px)

### JavaScript Features
- Matrix rain canvas animation (with frame rate limiting)
- JST clock display
- Service Worker for offline support (PWA)
- Scroll-to-top button

## Subpages (Static HTML)

These pages are standalone HTML files, not Astro-generated:
- `/` - Navigation hub
- `/about` - Career & skills
- `/projects` - OSS & personal works
- `/blog` - Tech articles (Astro-generated)
