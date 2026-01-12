# Security Rules

## Content Security Policy (CSP)

Set CSP via meta tag (GitHub Pages limitation):

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self';
  base-uri 'self';
  form-action 'self';
">
```

## GitHub Pages Limitations

These security headers require HTTP headers (not possible on GitHub Pages):
- `X-Frame-Options`
- `X-Content-Type-Options`
- `frame-ancestors` CSP directive

## External Resources

- Minimize external dependencies
- Self-host critical libraries when possible
- Use Subresource Integrity (SRI) for CDN resources when available

## Referrer Policy

Use strict referrer policy:
```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```
