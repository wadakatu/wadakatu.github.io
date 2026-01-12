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

### Hybrid Structure
The site uses a hybrid approach:
- **Static HTML pages**: `index.html`, `about/index.html`, `projects/index.html`, `404.html`, `offline.html`
- **Astro-generated pages**: Blog posts from `src/content/blog/`

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
