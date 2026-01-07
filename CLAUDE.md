# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for wadakatu (Backend Developer). Static site hosted on GitHub Pages at https://www.wadakatu.dev/.

## Tech Stack

- Pure HTML/CSS/JavaScript (no build tools or frameworks)
- Single `index.html` file with inline styles and scripts
- GitHub Pages for hosting

## Development

No build or install commands needed. Open `index.html` directly in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using PHP
php -S localhost:8000
```

## Architecture

The site is a single-page bento grid layout with:
- **CSS Variables**: Theme colors defined in `:root` (Matrix green theme)
- **Bento Grid**: CSS Grid with responsive breakpoints (1024px, 640px)
- **Inline JavaScript**: Matrix rain canvas animation, JST clock, card expand transitions
- **Accessibility**: Reduced motion support via `prefers-reduced-motion`

### Key Sections
- Hero card with name/role
- About card with stats and tech tags
- Tech stack grid
- Project cards (Resume, UI Lab, W3C Hackathon)
- Social links (GitHub, Zenn, X, Email)
- Footer with logo

## File Structure

```
/
├── index.html    # Main page (all HTML, CSS, JS inline)
├── ogp.webp      # OGP image and favicon
└── CLAUDE.md     # This file
```

## Subpages

Internal links reference subpages not in this repo:
- `/resume` - Career history page
- `/ui_lab` - Frontend experiments
- `/w3c-hackathon` - Hackathon project page
