# Accessibility Rules

## Core Principles

- All interactive elements must be keyboard accessible
- Respect `prefers-reduced-motion` for animations
- Use semantic HTML elements
- Provide meaningful alt text for images

## Reduced Motion

Always check for reduced motion preference:

```javascript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
  // Disable or simplify animations
}
```

CSS fallback:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## ARIA & Semantic HTML

- Use `aria-label` for icon-only buttons
- Use `aria-hidden="true"` for decorative elements (e.g., Matrix rain canvas)
- Prefer native HTML elements over ARIA when possible
- Include skip links for keyboard navigation
