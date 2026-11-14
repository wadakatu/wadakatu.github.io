You are reviewing and tightening the design exploration prototypes already built in this worktree (branch design/explore). Do not start over. Do not git commit or push. Do not edit ~/dev/wadakatu.github.io (the other worktree). Do not change production pages, tombo.css, site.css, or BaseLayout.astro. Do not install anything into ~/.claude or ~/.codex.

# Scope

Only touch the prototype you are assigned in the accompanying message (A/C or B/D), plus your notes file.

# Read first

- `.design-skills/frontend-design/SKILL.md`
- `.design-skills/impeccable/SKILL.md`
- `.design-skills/unslop/SKILL.md`
- `.design-skills/hallmark/SKILL.md` if present
- `src/data/proto-content.ts` (facts only; do not invent)
- The pages and CSS you already wrote

# Critique, then fix

Each concept must commit to ONE strong world taken from wadakatu's own story, not a pile of effects. Restraint can be the signature. A single hidden or hover detail that belongs to that world is welcome; a bag of easter eggs is not. The first two seconds should make the idea obvious.

Watch for, and remove, current AI-design tells from those skills, including: warm cream + terracotta or serif-on-cream defaults; near-black with acid-green or vermilion; generic broadsheet / hairline-newspaper layouts (especially on the "personal specification" concept — it must feel like a typographic document, not a pastiche of the official W3C site and not the default "AI broadsheet"); identical rounded cards with soft grey shadows; tracked-out ALL-CAPS eyebrows; middle-dot meta strings; "WORD — fragment" labels; a trailing "→" on every link; gradient text; emoji as labels; pulsing ornaments.

Copy stays plain. No hype, no superlatives, no "not just X but Y." Japanese titles stay in Japanese, never side by side with an English translation of the same text. Location is Japan only. Keep WCAG AA contrast, visible focus, skip links, `prefers-reduced-motion`, and working light/dark if the concept has both. Japanese type must not get Latin negative tracking.

Do not add Three.js. Do not add GSAP unless a small, justified motion already exists and you can keep a no-JS / reduced-motion fallback.

When done, append a short critique-and-fix note to your existing notes file (CLAUDE-NOTES.md or CODEX-NOTES.md): what the tell was, what you changed, and whether the one-world idea is clearer.
