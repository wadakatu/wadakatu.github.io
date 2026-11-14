# Fable: machine-first IA, and blog post pages in this world

You are working in this Astro 5 worktree only: `~/dev/wadakatu.github.io-design`, branch `design/explore`.

遠慮するな。最高の物を作れ。大まかな指示の内容と全体方針さえ守れば後は全て任せる

## Direction

wadakatu has three decisions. Honour all of them:

1. 「トップを機械用にして、人間用は裏ルートで残そう」
   The site's top becomes 機械用 (the approved interactive terminal). 人間用 is not deleted; it stays as a secondary, reachable route (the header switch, `exit`, and any other way out you design).
2. He asked you to design this (this prompt).
3. He asked how blog post pages look in this prototype. They do not exist here yet — visiting a post still shows the production Tombo design under `/blog/…`. Design and prototype article pages in this Matrix world.

Do this in two steps in the same run:

**First**, write a short design document at `docs/design-explore/MACHINE-FIRST-AND-BLOG.md`. URLs, what non-engineers / recruiters / search engines / screen readers get, how a first-time non-engineer finds a way out, and the blog-page typography and patterns. Keep it concrete and short.

**Then implement it** in this prototype. Do not stop at the doc.

## A. Machine-first information architecture

Today:

- `/proto/matrix/` is 人間用 Home (`view="page"`)
- `/proto/matrix/machine/` is 機械用 Home
- `/proto/matrix/projects/` is 人間用 Projects; `/proto/matrix/projects/machine/` is 機械用 Projects
- `/proto/matrix/source/` and `/projects/source/` still exist

The approved terminal (commands, output, login `who am I?` accordion, `visualViewport` / `fit()`, prompt, jokes) must stay as it is. Do **not** redesign or rewrite `_shell.ts` command behaviour. You may change where `open` / `cat` of a post *goes* (see B), and you may change route files, the layout, the switch targets, and `exit`'s destination so the new IA works.

Decide the URL tree, then make it real. A reasonable starting point, which you may improve on if you have a better one:

- `/proto/matrix/` lands in 機械用
- 人間用 lives on a clearly secondary path (for example `/proto/matrix/human/` — pick a name and use it consistently)
- Old `/proto/matrix/machine/` and `/projects/machine/` should not 404; redirect or alias them to the new machine URLs
- Projects should follow the same “machine is the default, human is the back route” idea
- Blog posts: `/proto/matrix/blog/<slug>/` (see B)

What non-engineers, recruiters, search engines, and screen readers get matters as much as the terminal. Design this explicitly in the doc and in the markup:

- The landing HTML must contain real, crawlable content and links (人間用, projects, posts, contact), not only a canvas or a live prompt that needs JavaScript.
- No-JS must still be readable: the recorded session already exists; add or keep a way to reach 人間用 and the posts without running the shell.
- SEO / OGP for the landing and for each prototyped post (title, description, the real logo). Do not invent bio facts; take them from `src/data/proto-content.ts`. Location is Japan only.
- A first-time visitor who is not an engineer must be able to find 人間用. The boot layer already offers both readings and Skip; the header switch remains; `exit` remains. If the top is now the terminal, Skip-from-boot and a clear, visible way out on the machine landing are your problem to solve well. Do not hide 人間用 behind an unmarked easter egg as the only path.

The header switch, phone Menu, slim 53px phone header, and 69px desktop header (items stay inline at 1440) all stay. Update their destinations to the new routes. Phosphor night is still the default; `?palette=operator` and `?theme=day|night` still work. Existing flags (`?boot=1`, `?boot=frozen`, `?motion=0`, `?source=1`, `?mode=machine`, `?run=`, `?switch=`) should keep working or be remapped honestly and noted.

## B. Blog post pages

Prototype **two** real, already-published posts under `/proto/matrix/blog/<slug>/`:

- Long technical, with code: `src/content/blog/431afa748fbed1.md` — 「🚀 Claude Code × Serena MCP：もうバージョンダウンしなくても良いのか...?」
- Travel / event essay, with images, no code: `src/content/blog/da5be52d57e9a1.md` — 「W3C TPAC 2025参加レポ （Web標準ってどうやってできてるの？）」

Do not prototype `ddca4eab13569c.md` (unpublished). Use the real article body, title, date, tags, and images. Do not invent or rewrite the writing. Do not change the production `/blog/` routes or `BaseLayout.astro` / `tombo.css` / `site.css`.

The page is a readable long-form Japanese article in this Matrix world, consistent with 人間用, the phosphor and operator palettes, and day/night. Readability comes first:

- A comfortable measure and line-height that work for Japanese
- Headings, typography, code blocks, images, a table of contents, date and tags, prev/next (between these two proto pages is enough; do not link prev/next to production `/blog/` or to posts that have no proto page)
- Share / OGP
- **No rain over body text.** Rain may exist at the edges or in the chrome; it must not sit on the article.
- 人間用 and 機械用 must both be reachable from the article (header switch, and a way back to the terminal / to 人間用 Home)
- From the terminal, `cat` and `open` of these posts should lead here (update the post `href`s that the shell already carries, for these slugs). A typed `neofetch` / `help` / other commands stay as they are.
- Japanese and English prose are never shown as translations of the same sentence side by side. The articles are Japanese; UI chrome can stay in the language the rest of `/proto/matrix/` already uses.
- No-JS readable. Reduced motion respected. Keyboard and screen-reader accessible (skip link, heading outline, visible focus, alt text on real images). Works at 390 and 1440.

## Constraints (keep these; everything else is yours)

- Prototype only. You may edit `src/pages/proto/matrix/**`, `src/layouts/ProtoMatrixLayout.astro`, `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js`, `docs/design-explore/MATRIX-NOTES.md`, and the new design doc. You may add files under those proto/matrix paths and proto styles/scripts. You may change post `href`s in `_world.ts` (or equivalent) so `open` hits the proto blog routes; do not otherwise rewrite `_shell.ts` commands or invent facts in `_world.ts`. Do **not** change production routes, `tombo.css`, `site.css`, `BaseLayout.astro`, FooterLogo, the other `/proto/*` concepts, or `package.json`. Do not add dependencies. Do not git commit or push. Do not merge or deploy. Do not edit `~/dev/wadakatu.github.io`.
- A local Astro dev server is already running on `127.0.0.1:4321` (npm PID **3545**, astro PID **3598**). **Do not stop it.** Do not start a second long-running server that you leave behind. After edits, run `npm run build` and fix errors you introduced.
- Real logo only: `public/images/logo-400.png` (recolor via the existing palette filter is fine; no shape distortion). Logo by Chisato Satoh.
- Evoke The Matrix; do not copy film logos, fonts, stills, or famous lines verbatim (including no “Wake up, Neo”, “There is no spoon”, “Follow the white rabbit” as a film-quote lockup, no “The Matrix” lockup, and no literal “red pill” / “blue pill” / 「赤いピル」 / 「青いピル」 labels).
- Do not invent numbers, clients, testimonials, or achievements. Location is Japan only.
- When you are done, the design doc and `MATRIX-NOTES.md` should say what you built, the URL tree, how no-JS / SEO / reduced-motion behave, that this pass was built with Fable (Claude Code `--model fable`), and anything still weak.

Start with the design doc, then build it. Start now.
