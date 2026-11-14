# B / D design exploration

Created:
- `src/pages/proto/b/index.astro`
- `src/pages/proto/b/projects/index.astro`
- `src/pages/proto/d/index.astro`
- `src/pages/proto/d/projects/index.astro`
- `src/layouts/ProtoBLayout.astro`
- `src/layouts/ProtoDLayout.astro`
- `public/styles/proto/b.css`
- `public/styles/proto/d.css`
- `docs/design-explore/CODEX-NOTES.md`

**B — Spectrum:** Within two seconds, the incoming line meets a triangular prism and separates into three colored paths leading into readable project bands. On narrow screens, the optical event sits between the name and the stacked bands. Projects continues the same colored rules at a larger reading scale. Manrope keeps the name and project titles sober; color belongs to the light paths, not a background gradient.

**D — Personal specification:** Within two seconds, the running header, recorded date, large serif title, and restrained particulars establish a personal manuscript. Numbered clauses provide actual document navigation; Projects continues clause 2 as 2.1–2.3. The date comes from the shared content verification date. Paper and night themes retain the same reading structure, with a simplified print treatment.

Both concepts use standalone layouts, Noto Sans JP for Japanese titles, semantic headings, skip links, visible focus, system theme defaults and persistent theme buttons. Content and navigation work without JavaScript; only the theme override requires it. The split is static, including under reduced motion. Responsive styles include the 390px and 1440px target sizes.

Validation: `npm run build` passed, including all four routes, after a network-enabled retry for the existing production Projects page's GitHub fetch. Generated HTML checks passed for one h1, main landmark, English document language, and skip target on each route. Calculated normal-text contrast on both theme backgrounds is at least 6.03:1. No dependencies were added.

Limitation: Chrome DevTools MCP could not connect (missing DevToolsActivePort). Actual 390px/1440px rendering, font loading, and keyboard/theme interaction remain unverified in a live browser. No development server was started. To complete visual verification, enable the Chrome DevTools connection and view these four routes in the local application.

No production source pages, shared styles, BaseLayout, shared content, or A/C exploration files were edited. No commits or pushes were made.
