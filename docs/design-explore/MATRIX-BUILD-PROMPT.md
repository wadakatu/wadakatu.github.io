You are building one committed visual prototype for wadakatu's personal site, in this Astro 5 repo, on branch design/explore, worktree only.

wadakatu picked a direction: start from the Operator prototype, add the See-the-source mechanic (constructed view vs raw/source view of the same facts), and push MUCH harder into a Matrix-inspired world. Commit fully. This is not a tasteful-minimal exercise.

Work only in this worktree. Do not edit ~/dev/wadakatu.github.io. Do not git commit or push. Do not change production pages, tombo.css, site.css, BaseLayout.astro, or the other /proto/* concepts (construct, source, operator, spoon, b, d). You may add one link only if /proto/index.astro does not already mention /proto/matrix/. Do not install anything into ~/.claude or ~/.codex.

Read first:
- `.design-skills/frontend-design/SKILL.md`
- `.design-skills/impeccable/SKILL.md`
- `.design-skills/unslop/SKILL.md`
- `.design-skills/gsap-core/SKILL.md` and `.design-skills/gsap-timeline/SKILL.md` (and gsap-performance if you use motion)
- `src/data/proto-content.ts`
- `src/data/proto-matrix-corpus.ts` (real commit subjects, repo paths, and 17 published blog excerpts)
- Existing `/proto/operator/` and `/proto/source/` as references to steal structure from, not files to edit

# Legal

Evoke the film. Do not copy it.
Forbidden: film logos, official title treatments, official or trademarked fonts, stills, character likenesses, prop replicas, and famous lines set verbatim as typography or voiceover (no "Wake up, Neo", no "There is no spoon", no "Follow the white rabbit", no "The Matrix" lockup, no "red pill" / "blue pill" labels).
A boot sequence may exist. It must not typeset those quotations.

# What to build

Routes (standalone pages, no BaseLayout, no TOMBO classes):

- `/proto/matrix/` Home
- `/proto/matrix/projects/` Projects glimpse

Night is the default world: phosphor green on near-black, operator-terminal typography (a serious mono + a Japanese gothic or code face such as IBM Plex Mono / Share Tech Mono / M PLUS 1 Code / DotGothic16 — choose deliberately, never a recreation of the film's title font). Day can exist as a secondary "daylight operator" theme, but first paint is night unless the user has forced light or prefers... actually: default the document to night (`data-theme="night"` or equivalent) even if OS is light, and offer a control to switch. Document this.

## 1. Operator streams, made of his data

Keep the Operator idea and go further. Streams / rain glyphs must be built at build time from `proto-matrix-corpus.ts` and `proto-content.ts` only: project names and blurbs, Japanese blog titles and excerpts (kana, katakana, kanji), commit subjects from this repo, real repo paths, skills, Japan, the name wadakatu / koyolympus. The film's falling-code rain is welcome here if and only if every glyph comes from that real material, and rain is not the only idea on the page. The constructed page must still read as a portfolio: name, role, Japan, work, writing.

Rain / unused decorative streams are `aria-hidden`. The same facts appear as readable text in the constructed view at WCAG AA contrast. Do not invent telemetry, quotes, or "hacker" strings.

## 2. Boot sequence (first load of a session)

On the first Home visit in a session, play a skippable boot / coming-online sequence that types or decodes real phrases from the corpus (his name, role, Japan, a project or a Japanese title), then resolves into the constructed page.

- Skippable: a visible Skip control, plus Escape and click/tap on the boot layer.
- Once per session: `sessionStorage` (or equivalent). Later visits in the same tab skip it.
- `prefers-reduced-motion: reduce`: do not play the type-on; show the finished page immediately, or a static first frame that is already the page.
- No JavaScript: the constructed page is visible; boot simply does not run.
- For screenshots and recording, honor these query flags:
  - `?boot=1` force the boot layer (even if already seen)
  - `?boot=frozen` freeze mid-sequence so a still can be captured
  - `?motion=0` treat as reduced motion

## 3. See the source, in place

A constructed view and a raw/source view of the same facts (as in `/proto/source/`), but they must switch in place on this page, not only by navigating away.

- Visible control, labeled in plain language (e.g. "View source" / "View page"), pressed state, keyboard accessible.
- Keyboard shortcut, documented on the page (a kbd hint). Suggested: Backslash `\` or `Shift+S`. Do not trap default browser shortcuts like Ctrl/Cmd+U unless you also keep a visible button. Prefer Backslash and the button.
- Transition: the constructed page dissolves / decodes into the source view through rain or a character-decode, then the source reading settles (labeled fields, records, his facts). Reverse when toggling back.
- Also support `?source=1` to land already in source view (no transition), and a shareable state (query or hash) so a still can be taken.
- `prefers-reduced-motion`: instant swap, no rain dissolve.
- No JavaScript: provide a real second URL, `/proto/matrix/source/` and `/proto/matrix/projects/source/` (or `/raw/`), that renders the source view as static HTML so the mechanic exists without JS. The in-place toggle can enhance the main URL.

## 4. Rewards for exploring

A few glitch / déjà-vu micro-moments, tied to his material, not a pile of random FX. Examples of the kind of thing (you may invent the interaction, not the copy): a project line briefly repeats itself when revisited; a Japanese title flickers into a matching commit subject then back; the measured name doubles for a frame. Keep them rare, skippable by reduced motion, and never blocking reading.

## Implementation rules

1. Files you may create or edit:
   - `src/pages/proto/matrix/**`
   - optional: `src/layouts/ProtoMatrixLayout.astro`
   - optional: `public/styles/proto/matrix.css`
   - optional: `public/scripts/proto-matrix.js` (or a scoped script in the layout)
   - `docs/design-explore/MATRIX-NOTES.md`
   You may import `src/data/proto-content.ts` and `src/data/proto-matrix-corpus.ts` read-only. Do not change those files. Do not touch other proto routes except the existing matrix link on `/proto/index.astro` if needed.

2. Copy is plain, no hype. Location is Japan only. Japanese and English are never shown as translations of the same sentence side by side. Japanese titles and excerpts stay in Japanese, with a Japanese font and no Latin negative tracking on Japanese. Correct `lang` attributes.

3. Accessibility: skip link, one h1, heading order, visible focus, WCAG AA for all reading text and controls in night and day, keyboard for boot skip, theme, and source toggle. Page works without JS. Honor `prefers-reduced-motion`. Readable at 1440 and 390. Body text must stay readable even when rain is active (do not place low-contrast body text on top of dense rain; either sit content on a solid panel or keep rain in the margins / behind a scrim).

4. Footer may include logo credit and email. Nav to `/proto/matrix/`, `/proto/matrix/projects/`, plus real `/blog/`, `/about/`, and a small link back to `/proto/`.

5. Motion: CSS and/or GSAP. If you use GSAP, load it only on these pages (CDN is fine; do not add a dependency to package.json unless necessary), read the gsap-core / gsap-timeline skills, clean up on leave, and keep a reduced-motion path that does not load or does not run the tweens. The page must remain usable if the CDN fails.

6. When pages are written, run `npm run build` in this worktree and fix errors you introduced. Do not start a long-running dev server that you leave running. Do not commit or push.

7. Write `docs/design-explore/MATRIX-NOTES.md`: files created, that this was built with Claude Code, how boot / source toggle / shortcut / query flags work, how rain is sourced, how reduced motion and no-JS behave, and anything you know is still weak.

Start building now.
