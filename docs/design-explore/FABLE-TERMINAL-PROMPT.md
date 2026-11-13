# Fable: make 機械用 a real terminal

You are working in this Astro 5 worktree only: `~/dev/wadakatu.github.io-design`, branch `design/explore`.

遠慮するな。最高の物を作れ。大まかな指示の内容と全体方針さえ守れば後は全て任せる

## Direction

wadakatu has used the current 機械用 page and wants it to feel like a real terminal, contained in the hero — not a long hex dump you scroll the window to read. In his words:

「機械用のページはリアルなterminalみたいにできない？ Heroで完結してコマンド入力をするとそれに応じたデータが返ってくるみたいな。helpって打つと入力できるコマンドが一覧で見れるみたいな。エンジニアにはクスッとくるようなページにしたいな」

Rework 機械用 so that:

- It feels like a real shell in one viewport. The session scrolls *inside* the terminal, like a real one, not as a 9,700px page.
- A prompt (something in the spirit of `wadakatu@…:~$`), a blinking cursor, command history with ↑/↓, Tab completion, Ctrl+L / `clear`, Ctrl+C.
- Typing `help` lists the commands you can actually run.
- Commands return this site's **real** data: whoami/about, ls/cat for posts and projects, open a real link, contact/links, the real logo, and a way back to 人間用 (exit, or a quiet pill-ish command). Use `src/data/proto-content.ts` and `src/data/proto-matrix-corpus.ts`. Do not invent numbers, clients, testimonials, or achievements. Location is **Japan** only.
- Engineer in-jokes are welcome and should make an engineer smile: `sudo`, `rm -rf /`, vim and how to leave it, `man`, `ping`, a neofetch-style card with the real logo (`public/images/logo-400.png`; recolor OK, no shape distortion), `git log` of his real commits, Matrix nods such as `follow the white rabbit` and `knock knock`. Funny but tasteful. No verbatim long film speeches; short nods are fine. Do not invent facts when joking — jokes can refuse, warn, or riff, but must not fabricate career numbers.
- Commands may be English (terminal convention). Japanese content is shown as it is. Japanese and English prose are never shown as translations of the same sentence side by side.
- Keep the switch capsule between 人間用 and 機械用, phosphor green as the default, and `?palette=operator`.
- Accessibility: the terminal must be usable with the keyboard and with a screen reader (aria-live for output, a real focusable input). It must work on a phone, including the on-screen keyboard; suggested commands you can tap are welcome. Honor `prefers-reduced-motion` (no infinite blink if that is a problem; a finite or CSS-respecting cursor is better).
- No-JavaScript fallback: a static, readable listing of the same real facts is fine (the current long hex page does not have to remain the default view).
- About the ELF hex view and the downloadable executables: decide. Keeping `xxd` (or similar) as a *command* is fine if you want it. Drop the ELF file downloads unless you are sure they are clearly harmless. Do not make the 9,700px listing the main experience.

One strong terminal, not several near-identical variants, unless a second route genuinely helps (for example a no-JS document). Prefer a shareable URL for 機械用 (`/proto/matrix/machine/` and/or `?mode=machine`).

## Constraints (keep these; everything else is yours)

- Prototype only. You may edit `src/pages/proto/matrix/**`, `src/layouts/ProtoMatrixLayout.astro`, `public/styles/proto/matrix.css`, `public/scripts/proto-matrix.js`, and `docs/design-explore/MATRIX-NOTES.md`. You may add files under those proto/matrix paths and proto styles/scripts. Do **not** change production routes, `tombo.css`, `site.css`, `BaseLayout.astro`, FooterLogo, the other `/proto/*` concepts, or the two data files except to import them. Do not add package.json dependencies. Do not git commit or push. Do not merge or deploy. Do not edit `~/dev/wadakatu.github.io`.
- A local Astro dev server is already running on `127.0.0.1:4321` (PID 88553 / node 88583). **Do not stop it.** Do not start a second long-running server that you leave behind. After edits, run `npm run build` and fix errors you introduced.
- Existing flags should keep working unless you must replace them: `?boot=1`, `?boot=frozen`, `?motion=0`, `?source=1`, `?mode=machine`, `?theme=day|night`, `?palette=operator`.
- Update `docs/design-explore/MATRIX-NOTES.md` with what you built, the command list, how no-JS and reduced-motion behave, what you did with the ELF/hex view, that this pass was built with Fable (Claude Code `--model fable`), and anything still weak.

Start now.
