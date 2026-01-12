# Performance Rules

## Animation Performance

- Use `requestAnimationFrame` instead of `setInterval` for animations
- Implement frame rate limiting for consistent behavior across displays
- Cancel animations when page is not visible (`visibilitychange` event)

## Resource Loading

- Use `preconnect` for external domains (e.g., Google Fonts)
- Use `preload` for critical resources
- Lazy load non-critical resources
- Optimize images (WebP format, appropriate sizes)

## Web Vitals

Monitor and optimize Core Web Vitals:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## GitHub Pages Constraints

- No server-side processing
- Static files only
- Limited HTTP header control (use meta tags where possible)
