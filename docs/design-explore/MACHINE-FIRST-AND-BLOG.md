# Machine-first IA, and blog posts in the Matrix world

Design for the pass built with Fable (Claude Code `--model fable`) on 15 November 2026, on `design/explore`, in this
worktree only. Prototype; nothing is committed, merged or deployed. What was actually built, measured and left weak
is recorded in `MATRIX-NOTES.md`, last section.

wadakatu's three decisions: the top becomes 機械用 and 人間用 stays as a back route; Fable designs it; blog posts get
a page in this world.

## 1. URL tree

機械用 owns the short address of every page that has two readings. 人間用 is the same tree under `human/`.

| Address | What |
| --- | --- |
| `/proto/matrix/` | **Landing. 機械用 Home**: the approved shell, in `~` |
| `/proto/matrix/projects/` | 機械用 Projects: the same shell, started in `~/projects` |
| `/proto/matrix/human/` | 人間用 Home |
| `/proto/matrix/human/projects/` | 人間用 Projects |
| `/proto/matrix/blog/` | Blog index (new, small, not asked for): the 17 published posts, so an article has a door in this world. 15 of them open the published `/blog/` and say so |
| `/proto/matrix/blog/<slug>/` | An article. Two are prototyped: `431afa748fbed1`, `da5be52d57e9a1` |
| `/proto/matrix/machine/`, `/proto/matrix/source/` | Moved to `/proto/matrix/` |
| `/proto/matrix/projects/machine/`, `/proto/matrix/projects/source/` | Moved to `/proto/matrix/projects/` |

- **Moved** means a stub page: `<meta http-equiv="refresh">`, a canonical link, a visible link, and a script that
  carries the query string across. GitHub Pages cannot send a 301, so this is the honest equivalent.
- **Articles are documents, not a third reading.** An article has one address and no machine twin. On it the header
  switch shows 人間用 as taken; its 機械用 side is a link to the shell at that file
  (`/proto/matrix/?run=cat ~/posts/<slug>.md`). There is still only one terminal.
- The in-place change between readings works as before. Only the two addresses it writes have changed.

### Flags

| Flag | Now |
| --- | --- |
| `?mode=machine`, `?source=1` | Kept. On `human/` routes they land in the shell. On the short routes they change nothing: that is already the shell |
| `?run=COMMAND` | Kept. Also skips the first-visit intro, because it is a deliberate link into the shell |
| `?boot=1`, `?boot=frozen` | Kept. The intro now belongs to Home in either reading, so `/proto/matrix/?boot=1` plays it and ends in the shell |
| `?palette=operator`, `?theme=day\|night`, `?motion=0`, `?switch=` | Unchanged, on every route including articles. Links inside the world carry palette, switch and motion |
| `reboot` (shell command) | Goes to `/proto/matrix/?boot=1` and comes back to the shell. It used to leave for 人間用 |

## 2. What each visitor gets on the landing

**An engineer** gets the terminal, exactly as approved. Nothing in `_shell.ts` changes except which address a post's
link points at.

**A first-time visitor who is not an engineer** must find 人間用 without knowing what a shell is. Four ways out, in
the order they are met, none of them hidden:

1. **The intro** (first visit in a tab, motion allowed). It already ends in Skip and the switch. One line is added
   beside them: it opens as a terminal, and 人間用 is the same site as an ordinary page. Skip, Escape, a click and the
   8 second timeout all land in the shell; the 人間用 side lands in the page.
2. **The guide line** (new). The first row of the terminal, above the session, in plain words: this site opens as a
   terminal, and a button to read it as an ordinary page. It is part of the page, not of the shell: `clear` does not
   remove it and it does not scroll away. An engineer can hide it; the choice is remembered. It is in the markup, so
   it is also the first thing in `main` for a screen reader and for a reader without JavaScript. On a phone the row
   is the button and the hide control only; the sentence stays for assistive tech.
3. **The header switch**, unchanged, and the `人間用` link in the status line, unchanged.
4. **`exit`**, the `exit` chip, Ctrl+D, and the `\` key, unchanged.

The header's Blog and About links are ordinary pages too.

**Without JavaScript** the landing is the recorded session, a normal scrolling document: who he is, the five
projects with their links, the 17 posts as links, contact, the latest commits. The guide line and the switch are
real links to `human/`. Nothing on the landing needs the shell to be read.

**Search engines** get, in the landing's HTML: one `h1`, the recorded session (text and links, not a canvas), the
whole of 人間用 (both readings are in every route's markup; one is `display: none`), and the header and footer
links. Each route has its own `<title>`, description, canonical link, Open Graph and Twitter card tags, and JSON-LD
(`Person` on Home, `BlogPosting` on articles). The image is the real logo, `/images/logo-400.png`. Facts come from
`src/data/proto-content.ts`; location is Japan.

- `human/` routes are canonical to their short twin: one indexed address per page.
- A prototyped article is canonical to the published `/blog/<slug>/`, so the prototype never competes with it.
- `robots: noindex, nofollow` stays on every `/proto/` page while this is a prototype. At launch it goes, and the
  article canonical moves to the article's own address.

**Screen readers** get: skip link, header, `h1`, the guide line with its link to 人間用, then the terminal (a
labelled group, a log, a labelled command field, as approved). Focus still goes to the command field on arrival with
a fine pointer; the guide line is one Shift+Tab away and is announced as the first content of `main`.

**Reduced motion** (`?motion=0` or the OS setting): no intro, so the guide line is the first thing seen.

## 3. Blog post pages

`/proto/matrix/blog/<slug>/` is a long Japanese article set in this world. The body, title, date, tags and images
are the real ones from `src/content/blog/`. Nothing is rewritten. The production `/blog/` is not touched.

### Page

- `<html lang="ja">`; the header and footer chrome stay English and are marked `lang="en"`.
- **Masthead**: a path line (`~/posts/<slug>.md`), the title as `h1`, date, category, reading time, tags. From 720px
  a strip of the article's own words (title, date, tags, file name) falls beside the title, as on Projects.
- **Contents**: built at build time from the `h2` and `h3` headings. A sticky rail on the left from 1100px; below
  that a native disclosure above the article. The script marks the section being read, and closes the disclosure
  when a section is chosen.
- **Body**: one solid panel, set from the left like the rest of 人間用. What is left of the frame on the right is open ground.
- **Foot**: an end-of-file line, share (X, copy link, the system share sheet where there is one), older / newer
  between the two prototyped posts only, and two ways back: 人間用 Home, and the shell at this file.

### Type

| Element | Setting |
| --- | --- |
| Body | M PLUS 1 Code 400 (the face 人間用 already sets Japanese in; no new font), 16px / 2 on a phone, 17px / 2 from 720px. Measure capped at 40 full-width characters. `line-break: strict`, no justification, no negative tracking |
| Title | M PLUS 1 Code 500, 24px to 38px, `word-break: auto-phrase` so Japanese breaks at phrases where the engine can |
| `h2`, `h3`, `h4` | 22px / 18px / the body size, with the Markdown marker (`##`) drawn before each as decoration, not read aloud. The page shows what file it was built from |
| Links | Underlined, in the palette's green |
| A URL alone on a line | A reference line: host, then path, in the mono face, wrapping anywhere |
| Inline code | The panel colour, a rule, the lead colour |
| Code block | The ground colour inside the panel, a rule, the language as a tab, a Copy button. Shiki's `css-variables` tokens mapped onto the palette, so both palettes and both themes follow. Long lines wrap |
| Images | Real files, unrecoloured, in a 1px rule. Real width and height in the markup so nothing shifts. Lazy |
| Lists, `hr`, `strong` | `-` and numbers in green; a dashed rule; weight 500 in the lead colour |

All colour is the existing tokens, so phosphor and Operator, night and day, need no article-specific values.

### Rain

No rain over the article. Body, masthead and contents are solid panels. On blog pages the ambient rain is not fixed
to the window: it is a band over the first screen that fades out, so it stands around the masthead and scrolls away
when reading starts. Below the first screen the page is still.

### Alt text

The Markdown gives every image an empty `alt`. The prototype adds a short Japanese description for each of the five
images, written from the image itself. This is the one place text is added; it is listed in `MATRIX-NOTES.md` for
wadakatu to accept or replace.

### From the terminal

`ls -l posts`, `cat posts/<slug>.md` and `open posts/<slug>.md` lead to the proto page for the two prototyped
slugs. The other 15 still lead to the published `/blog/`. 人間用 Home's recent-post entry for `da5be52d57e9a1` does
the same.

### Without JavaScript, reduced motion, keyboard

The article is static HTML: contents, images, code and links all work. Missing without scripts: the Copy buttons,
copy link, and the current-section mark. Reduced motion parks the rain and the masthead strip. Skip link, one `h1`,
headings in order, visible focus on every control.
