# wadakatu.dev TOMBO リデザイン実装計画(Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 仕様書 `docs/superpowers/specs/2026-07-22-tombo-redesign-design.md` に基づき、全 7 ページを Matrix テーマから TOMBO v0.3.x へ一括移行する(Phase 1 = 見た目のみ、文言・コンテンツ凍結)。

**Architecture:** tombo.css(vendor)をトークンの単一ソースとし、site.css 1 枚 + 縮小 scoped style に再編。テーマは data-theme + localStorage 永続化。ページ移行タスク(5–8)は**転写ではなく制約駆動** — 完成 CSS は計画に書かず、マッピング表・Global Constraints・機械検査・昼夜スクリーンショットが正しさを定義する。

**Tech Stack:** Astro 5 / 純 CSS(tombo v0.3.x)/ chrome-devtools MCP / GitHub Pages(deploy.yml は dist/ のみ公開)。

**Branch:** `feature/issue-105-tombo-redesign`(作成済み)。全タスクこの上にコミット。完了後 PR(`Closes #105`)。

## Global Constraints

- **色リテラル禁止**: site.css と全 .astro(offline.astro を除く)に hex / rgb() / named color を書かない。検査: `grep -rnE "#[0-9a-fA-F]{3,8}|rgba?\(" public/styles/site.css src --include="*.astro" | grep -v offline.astro` が空
- **font-size は `var(--tombo-text-*)` 参照のみ**(offline.astro のインライントークン節も同様に tombo の値を参照コピー)
- 和文に負の字間を当てない。`font-weight: 900` 禁止。フォント読み込みは `<link>` のみ(@import 禁止)
- 文言凍結: 本文・見出しテキスト・JSON-LD・meta description・フィード・llms.txt を変更しない。置換可なのは演出コピー(`$ ` / `cd ..` / `UPLINK ACTIVE`)のみ(spec §1)
- 各タスク完了時に `npm run build` が exit 0
- ブラウザ検証は `npm run dev`(localhost:4321)に対し chrome-devtools で昼夜両テーマ。`data-theme` 切替後 350ms 以上待つ
- コミットは英語 Conventional Commits(`.claude/rules/git-workflow.md` の型: feat/fix/perf/a11y/security/chore/docs)。`Co-Authored-By` 禁止。トレーラー `Claude-Session: https://claude.ai/code/session_01UweRpVg76KG2EveuSwVuzc` を必ず付ける
- tombo クラスは tombo.css v0.3.x に実在するもののみ使用(存在しないクラスを発明しない。カタログ: ~/tombo/examples/components.html)

新フォント `<link>`(BaseLayout / 404 で使用。offline は使わない):

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@600;700&family=M+PLUS+2:wght@450;500;700&family=Martian+Mono:wdth,wght@75..112.5,400..600&display=swap" rel="stylesheet">
```

---

### Task 1: tombo v0.3.1(コード用アクセントトークン)+ vendor + 設定変更

**Files:**
- Modify(別リポジトリ `/Users/wadakatu/tombo`): `tombo.css`, `README.md`
- Create: `public/styles/tombo.css`(vendor コピー)
- Modify: `package.json`, `astro.config.mjs`

**Interfaces:**
- Produces: `--tombo-code-green` `--tombo-code-shu`(Task 2 の Shiki マップが参照)、`public/styles/tombo.css`(全タスクの土台)

- [ ] **Step 1: tombo 本体にシンタックス用静的トークンを追加**

`/Users/wadakatu/tombo/tombo.css` の code block トークン節、OLD:

```css
    --tombo-code-faint:    #7D8A82;              /* captions on code-bg — the panel is dark in both themes */
    --tombo-code-hairline: rgba(229,235,230,.09);
```

NEW:

```css
    --tombo-code-faint:    #7D8A82;              /* captions on code-bg — the panel is dark in both themes */
    --tombo-code-hairline: rgba(229,235,230,.09);
    --tombo-code-green:    #4FC2A2;              /* syntax accent — night-side constant, panel is always dark */
    --tombo-code-shu:      #E5654C;
```

- [ ] **Step 2: tombo 側の検証・コミット・タグ・push**

Run(cwd `/Users/wadakatu/tombo`): `python3 scripts/check_contrast.py > /dev/null; echo exit=$?` → `exit=0`

`/Users/wadakatu/tombo/README.md` の jsDelivr ピンを `@v0.3.0` → `@v0.3.1` に変更(1 行)。

```bash
cd /Users/wadakatu/tombo
git add tombo.css README.md
git commit -m "feat: add static syntax accent tokens for the code panel"   # + Claude-Session トレーラー
git tag v0.3.1 && git push origin main v0.3.1
```

- [ ] **Step 3: vendor コピー**

```bash
cd /Users/wadakatu/www/wadakatu/wadakatu.github.io
git -C /Users/wadakatu/tombo show v0.3.1:tombo.css > public/styles/tombo.css
diff <(git -C /Users/wadakatu/tombo show v0.3.1:tombo.css) public/styles/tombo.css && echo IDENTICAL
```

Expected: `IDENTICAL`(バイト同一。改変禁止)

- [ ] **Step 4: package.json**

OLD: `"license": "MIT"` → NEW: `"license": "UNLICENSED",` + その直後に `"private": true,` を追加。

- [ ] **Step 5: astro.config.mjs の Shiki**

OLD: `shikiConfig: { theme: 'one-dark-pro', wrap: true }` → NEW: `shikiConfig: { theme: 'css-variables', wrap: true }`

- [ ] **Step 6: build + Commit**

Run: `npm run build` → exit 0

```bash
git add public/styles/tombo.css package.json astro.config.mjs
git commit -m "feat: vendor tombo.css v0.3.1 and switch shiki to css-variables"
```

### Task 2: site.css + theme.js(新規、全文 verbatim)

**Files:**
- Create: `public/styles/site.css`, `public/scripts/theme.js`

**Interfaces:**
- Produces: `.site-shell` `.site-foot` の共通レイアウト、`--astro-code-*` マップ、`.tombo-themectl` スタイル、`window` 副作用なしのテーマ制御(Task 3 が `<link>`/`<script>` で取り込む)

- [ ] **Step 1: public/styles/site.css を作成**(初版。ページタスクが節を追記する — 追記時も Global Constraints 準拠)

```css
/* site.css — wadakatu.dev glue on top of TOMBO. Colors/sizes: tombo tokens ONLY. */

/* shell */
.site-shell { max-width: var(--tombo-shell-max, 1100px); margin: 0 auto; padding: 0 32px; }

/* theme control (markup: ThemeToggle.astro) */
.tombo-themectl { display: flex; gap: 14px; }
.tombo-themectl button { background: none; border: 0; padding: 2px 0; cursor: pointer;
  font: inherit; letter-spacing: inherit; text-transform: inherit; color: var(--tombo-ink-faint);
  border-bottom: 2px solid transparent; }
.tombo-themectl button[aria-pressed="true"] { color: var(--tombo-ink); border-bottom-color: var(--tombo-shu); }

/* shiki (css-variables theme) -> tombo code panel. Both variable generations set. */
:root {
  --astro-code-background: var(--tombo-code-bg);
  --astro-code-foreground: var(--tombo-code-ink);
  --astro-code-color-background: var(--tombo-code-bg);
  --astro-code-color-text: var(--tombo-code-ink);
  --astro-code-token-comment: var(--tombo-code-faint);
  --astro-code-token-keyword: var(--tombo-code-green);
  --astro-code-token-function: var(--tombo-code-green);
  --astro-code-token-constant: var(--tombo-code-green);
  --astro-code-token-string: var(--tombo-code-ink);
  --astro-code-token-string-expression: var(--tombo-code-green);
  --astro-code-token-parameter: var(--tombo-code-ink);
  --astro-code-token-punctuation: var(--tombo-code-faint);
  --astro-code-token-link: var(--tombo-code-green);
}

/* scroll to top (replaces scroll-to-top.css; keep the same #scroll-to-top id/behavior) */
#scroll-to-top { position: fixed; right: 24px; bottom: 24px; width: 44px; height: 44px;
  border: 1px solid var(--tombo-hairline); background: var(--tombo-surface); color: var(--tombo-ink-sub);
  cursor: pointer; opacity: 0; pointer-events: none;
  transition: opacity var(--tombo-dur) var(--tombo-ease), color var(--tombo-dur) var(--tombo-ease); }
#scroll-to-top.visible { opacity: 1; pointer-events: auto; }
#scroll-to-top:hover { color: var(--tombo-ink); border-color: var(--tombo-ink-sub); }
```

- [ ] **Step 2: public/scripts/theme.js を作成**

```js
// theme.js — tombo/hotaru toggle with localStorage persistence.
// Init-before-paint lives in an inline <head> script; this file handles interaction.
(() => {
  const KEY = 'tombo-theme';
  const current = () =>
    document.documentElement.dataset.theme ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'hotaru' : 'tombo');
  const syncCtl = () => {
    const t = current();
    document.querySelectorAll('.tombo-themectl button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.t === t));
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', t === 'hotaru' ? m.dataset.hotaru : m.dataset.tombo);
    });
  };
  const applyStored = () => {
    const t = localStorage.getItem(KEY);
    if (t === 'tombo' || t === 'hotaru') document.documentElement.dataset.theme = t;
    syncCtl();
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tombo-themectl button');
    if (!btn) return;
    document.documentElement.dataset.theme = btn.dataset.t;
    try { localStorage.setItem(KEY, btn.dataset.t); } catch {}
    syncCtl();
  });
  document.addEventListener('astro:after-swap', applyStored); // ViewTransitions re-stamps <html>
  applyStored();
})();
```

- [ ] **Step 3: Commit**

```bash
git add public/styles/site.css public/scripts/theme.js
git commit -m "feat: add site.css glue and theme toggle script"
```

### Task 3: BaseLayout + ThemeToggle コンポーネント

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/components/ThemeToggle.astro`

**Interfaces:**
- Consumes: Task 1–2 の成果物
- Produces: `<ThemeToggle />`(Task 4–8 がページ右上・盤面右上に配置)。BaseLayout 経由の 5 ページに tombo.css / site.css / 三声フォント / テーマ初期化が入る

- [ ] **Step 1: BaseLayout の `<head>`**
  - 先頭(他のあらゆる要素より前)にテーマ初期化を追加:

```html
<script is:inline>
  (() => { const t = localStorage.getItem('tombo-theme');
    if (t === 'tombo' || t === 'hotaru') document.documentElement.dataset.theme = t; })();
</script>
```

  - JetBrains Mono / Outfit の Google Fonts `<link>` 群(preload + media swap パターン)を Global Constraints の新 `<link>` に差し替え(非ブロッキングパターンは踏襲)
  - `<meta name="theme-color" content="#0a0a0a">` を以下 2 本に置換:

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F2F4EF" data-tombo="#F2F4EF" data-hotaru="#131714">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#131714" data-tombo="#F2F4EF" data-hotaru="#131714">
```

  (※ ここは HTML 属性であり CSS ではないので色リテラル検査の対象外。値は tombo の paper と一致必須)
  - スタイル `<link>` を `tombo.css` → `site.css` の順で追加、`scroll-to-top.css` の `<link>` を除去

- [ ] **Step 2: BaseLayout の `<body>`**
  - `common.js` の `<script>` 参照を除去(ファイル削除は Task 9)
  - `theme.js` の `<script src="/scripts/theme.js" is:inline defer>` を追加
  - scroll-to-top ボタン等の既存 DOM は不変(`scroll-to-top.js` は継続使用。ただしクラス/ID が site.css の `#scroll-to-top` と一致しているか確認し、相違があれば site.css 側を実 ID に合わせる)

- [ ] **Step 3: src/components/ThemeToggle.astro を作成**

```astro
---
---
<div class="tombo-themectl tombo-label">
  <button type="button" data-t="tombo">tombo</button>
  <button type="button" data-t="hotaru">hotaru</button>
</div>
```

- [ ] **Step 4: 検証 + Commit**

`npm run dev` を起動し chrome-devtools で `http://localhost:4321/` を確認: 三声フォント適用(body = "M PLUS 2" weight 450)、`localStorage.setItem('tombo-theme','hotaru')` + reload で hotaru 起動(FOUC なし)、ページ間遷移(ViewTransitions)後もテーマ保持。※ この時点でページ本体はまだ Matrix スタイルのため見た目の崩れは想定内 — 検証対象はフォント・テーマ機構のみ。

```bash
npm run build
git add src/layouts/BaseLayout.astro src/components/ThemeToggle.astro
git commit -m "feat: load tombo assets and theme machinery from BaseLayout"
```

### Task 4: 共有コンポーネント再スタイル(Footer / FooterLogo / PageHeader / SectionHeader / SkipLink)

**Files:**
- Modify: `src/components/Footer.astro` `FooterLogo.astro` `PageHeader.astro` `SectionHeader.astro` `SkipLink.astro`

**Interfaces:**
- Consumes: `<ThemeToggle />`
- Produces: 全ページ共通の TOMBO フッター(刻印 + クレジット + JST 時計)・戻りリンク・通し番号見出し

- [ ] **Step 1: Footer.astro** — `.tombo-footer` 化。必須マークアップ(tombo 刻印は verbatim):

```html
<span class="tombo-logo" aria-hidden="true"><i class="h"></i><i class="b"></i><i class="w1"></i><i class="w2"></i><i class="t"></i></span>
```

  - `UPLINK ACTIVE` インジケータ → `<span class="tombo-chip" data-status="ok">ONLINE</span>` に置換
  - JST 時計(`#jst-time`)は維持(mono で描画される)。Chisato Satoh クレジットリンクは文言・href とも不変
  - `<ThemeToggle />` をフッター右端に配置(docs/LP ページの「右上」配置は各ページタスクで追加。フッターは全ページ共通のフォールバック位置)
- [ ] **Step 2: PageHeader.astro** — `cd ..` → `← INDEX`(`.tombo-label` の mono リンク)。h1 はスケールトークンに乗せる
- [ ] **Step 3: SectionHeader.astro** — `$ ` プロンプト → `.tombo-sec` の通し番号見出し(`counter-reset` はページ側 main に置く。実装は ~/tombo/examples/components.html §05 の実演を参照)
- [ ] **Step 4: SkipLink.astro / FooterLogo.astro** — 機能・文言不変でトークン参照へ再スタイル(green glow 廃止、focus は tombo の `:focus-visible` に委ねる)
- [ ] **Step 5: 検証 + Commit** — dev サーバーでフッター/ヘッダーを昼夜スクリーンショット(刻印・チップ・時計・クレジット・トグルの 5 点が写っていること)。

```bash
npm run build
git add src/components/
git commit -m "feat: restyle shared components on tombo primitives"
```

### Task 5: index.astro(LP 音量)

**Files:**
- Modify: `src/pages/index.astro`(826 行 → 大幅縮小見込み)、`public/styles/site.css`(追記)

**マッピング表(この表が要件。文言・リンク先・JSON-LD は不変):**

| 現状 | TOMBO 後 |
|---|---|
| 自前 `:root` トークンブロック(203–215 行) | 削除(tombo.css に委譲) |
| ヒーロー | `.tombo-vol-lp` の方眼 + `.tombo-corners` 枠 + `.tombo-kicker`。欧文タイトルのみ `.tombo-display`(和文混在見出しは h1 標準) |
| bento カード群 | `.tombo-corners` カード(`.tombo-metric` / `.tombo-chip` / `.tombo-ticks` を内容に応じて) |
| CRT scanline / glow / green palette | 削除 |
| `MatrixRain` コンポーネント参照 | import ごと削除 |
| ソーシャルリンク(Zenn 含む) | 文言・href・aria-label 不変、見た目のみ mono ラベル化 |
| `<ThemeToggle />` | ヒーロー右上に配置 |

- [ ] **Step 1: 上記マッピングで書き換え**(scoped style は tombo トークン参照のみで再作成)
- [ ] **Step 2: 検証** — 昼夜 × 幅 375/768/1280/1600/2560 スクリーンショット。`document.documentElement.scrollWidth - document.documentElement.clientWidth === 0` を全幅で確認。1600 以上で方眼余白 + 四隅見当マーク(tombo v0.3 挙動)が出ること
- [ ] **Step 3: Commit** — `feat: rebuild home as tombo LP volume`

### Task 6: about + projects(docs 音量)

**Files:**
- Modify: `src/pages/about/index.astro` `src/pages/projects/index.astro`、`site.css`(追記)

**マッピング表:**

| 現状 | TOMBO 後 |
|---|---|
| `common.css` の `<link>` | 削除(BaseLayout に集約済み) |
| body | `class="tombo-gutters"` |
| セクション見出し(`$ `) | `.tombo-sec` 通し番号(main に counter-reset) |
| カード・リスト | `.tombo-corners` / `.tombo-ticks` / `.tombo-table`(表形状のもの) |
| スキルバー等のメーター類 | `.tombo-ruler`(`--tombo-ruler-value`) |
| avatar(logo-80.webp) | 不変(位置・alt 含む) |
| `MatrixRain` 参照 / glow | 削除 |
| `<ThemeToggle />` | PageHeader 行の右端 |

- [ ] Step 1: about 書き換え → Step 2: projects 書き換え → Step 3: 検証(Task 5 と同じ幅×テーマ行列 + オーバーフロー 0)→ Step 4: Commit `feat: rebuild about and projects as tombo docs volume`

### Task 7: blog index + blog/[slug](docs 音量 + TOC)

**Files:**
- Modify: `src/pages/blog/index.astro` `src/pages/blog/[...slug].astro`、`site.css`(追記: 記事本文 typography 節・`.tombo-toc` 拡張)

**マッピング表:**

| 現状 | TOMBO 後 |
|---|---|
| `common.css` / `toc.css` の `<link>` | 削除 |
| 記事リスト | `.tombo-ticks` または寸法線区切りのリスト(日付・トピックは mono 銘) |
| TOC(toc.css 441 行) | `.tombo-toc` + 朱の現在地(scroll spy の既存 JS ロジックは維持し、クラスだけ差し替え) |
| 記事本文 | tombo base(15px/30px)に乗せる。コードブロックは `.tombo-code` 相当の器 + Task 2 の Shiki 変数(実描画はここで初検証) |
| `published_at` 等のメタ表示 | mono 銘(掟 2: 数字は等幅) |
| `MatrixRain` 参照(両ページ) | import ごと削除 |

- [ ] Step 1–2: 2 ファイル書き換え → Step 3: 検証 — 実記事 1 本で: コードブロックのシンタックス色が `--tombo-code-*` 由来か devtools で確認(`getComputedStyle` で `--astro-code-background` 解決値)、TOC 現在地の朱が追従、昼夜 × 5 幅 + オーバーフロー 0。和文長文ページなので R1 の読み味も一読 → Step 4: Commit `feat: rebuild blog on tombo docs volume with css-variables shiki`

### Task 8: 404 + offline(app 音量、standalone 維持)

**Files:**
- Modify: `src/pages/404.astro` `src/pages/offline.astro`

**要件:**

- 404: standalone head のまま `tombo.css` / `site.css` / 新フォント `<link>` + テーマ初期化インラインスクリプト(Task 3 Step 1 と同一)+ `theme.js`。rain canvas・red/blue glow・自前トークン全削除。盤面: `.tombo-metric` の大数字 404(mono 600)+ `.tombo-chip[data-status="err"]` + 戻りリンク。`<ThemeToggle />` / `<SkipLink />` は**そのまま import して使う**(2026-07-22 訂正: 当初「standalone だからコンポーネント不可」と書いたが誤り — 404.astro は BaseLayout を使わないだけの Astro ページなので通常どおり component を import できる。他ページと同一実装に揃える)
- offline: **自己完結**。`<link>` なし・webfont なし(system フォールバック)。tombo v0.3.1 のトークン値(paper/surface/ink/ink-sub/ink-faint/hairline/green/shu/成功系のみ必要分)を `<style>` 内 `:root` に `light-dark()` ごと**値コピー**(唯一の色リテラル許可箇所。コメントで `/* inlined from tombo.css v0.3.1 — keep in sync */` を明記)。DOM rain・CRT 削除。盤面: OFFLINE の計器パネル(chip data-status="warn" 等)。トグルは theme.js を参照できないため、テーマ初期化 + click + localStorage 保存の最小ロジック(theme.js の meta 更新を除いた縮約版、~15 行)をインライン `<script>` で持つ
- 両ページとも `prefers-reduced-motion` 対応は tombo の全体無効化に委ねる

- [ ] Step 1: 404 → Step 2: offline → Step 3: 検証 — 404 は dev サーバーの `/404` を昼夜 × 3 幅(375/1280/2560)。offline は DevTools の Network offline 化 + sw 経由で実表示確認(フォント未達で崩れないこと)→ Step 4: Commit `feat: rebuild 404 and offline as tombo app volume`

### Task 9: レガシー削除 + PWA 追随

**Files:**
- Delete: `public/styles/common.css` `public/styles/toc.css` `public/styles/scroll-to-top.css` `public/scripts/common.js` `src/components/MatrixRain.astro` `index.html` `404.html` `offline.html` `about/index.html` `projects/index.html` `sitemap.xml`(ルート直下のみ)`.github/workflows/generate-articles.yml`
- Modify: `public/sw.js` `public/manifest.json`

- [ ] **Step 1: 削除前の参照ゼロ確認**(1 件でも出たら削除せず BLOCKED 報告):

```bash
grep -rn "common.css\|toc.css\|scroll-to-top.css\|common.js\|MatrixRain" src/ public/sw.js
```

Expected: `public/sw.js` の precache 行のみ(次 Step で書き換え)

- [ ] **Step 2: sw.js** — precache リストの `'/styles/common.css'` `'/styles/toc.css'` `'/styles/scroll-to-top.css'` `'/scripts/common.js'` → `'/styles/tombo.css'` `'/styles/site.css'` `'/scripts/theme.js'` に差し替え。`CACHE_VERSION = '5'` → `'6'`
- [ ] **Step 3: manifest.json** — `"theme_color"` / `"background_color"` を `"#131714"` に
- [ ] **Step 4: 削除実行 + build + Commit**

```bash
npm run build
git add -A
git commit -m "chore: remove matrix-era assets, dead root pages and broken workflow"
```

### Task 10: ドキュメント刷新 + 全数検証

**Files:**
- Modify: `.claude/rules/frontend-design.md`(全面書き換え)`CLAUDE.md`(構造節の実態化)

- [ ] **Step 1: frontend-design.md を以下の内容で全面置換**

```markdown
# Frontend Design Rules — TOMBO

このサイトのビジュアルは自作デザインシステム **TOMBO**(wadakatu/tombo, private)に完全に従う。

## 掟(tombo spec より)

1. **すべてを測る** — 要素は寸法線・目盛・通し番号と共に置く
2. **銘は等幅** — 数値・ラベル・日時・索引は必ず mono(Martian Mono)
3. **朱は現在地** — 赤は 1–2px の「ここ」を指す線だけ。面に塗ったら朱ではない

## ハードルール

- 色は `var(--tombo-*)` のみ。hex / rgb() をサイトコードに書かない(唯一の例外: offline.astro の自己完結トークンコピー)
- font-size は `var(--tombo-text-*)` のみ。`font-weight: 900` 禁止。和文に負の字間禁止
- トークンの単一ソースは `public/styles/tombo.css`(vendor)。**このファイルを直接編集しない** — 変更は wadakatu/tombo 側で行い、新タグから `git -C ~/tombo show vX.Y.Z:tombo.css > public/styles/tombo.css` で再コピーして `chore: vendor tombo.css vX.Y.Z` の単独コミットにする
- 音量ダイヤル: top = LP / about・projects・blog = docs / 404・offline = app。音量ごとの密度・方眼は tombo examples を正とする
- UI 変更は必ず chrome-devtools で昼夜(tombo/hotaru)両テーマのスクリーンショット検証。テーマ切替後 350ms 以上待つ。横オーバーフロー(scrollWidth > clientWidth)を出さない
```

- [ ] **Step 2: CLAUDE.md** — 「Hybrid Structure」節(静的 HTML 併存の記述)を削除し、実態(Astro 5 + dist/ のみデプロイ + TOMBO vendor 構成 + テーマ機構)を 10 行以内で記述。他の節は不変
- [ ] **Step 3: 全数機械検査**

```bash
grep -rniE "matrix|00ff41|jetbrains|outfit|scanline|glitch|uplink" src/ public/styles/ public/scripts/ astro.config.mjs   # 空(src/content/ はヒットしても対象外だが -r の対象から目視で除外判断)
grep -rnE "#[0-9a-fA-F]{3,8}|rgba?\(" public/styles/site.css src --include="*.astro" | grep -v offline.astro              # 空
npm run build   # exit 0
```

- [ ] **Step 4: 全数ブラウザ検証** — 7 ページ × 昼夜 × 5 幅(375/768/1280/1600/2560)スクリーンショット + オーバーフロー 0 + トグル永続(再読込・ページ遷移)+ offline 表示。結果は task report に幅×テーマの表で記録
- [ ] **Step 5: Commit** — `docs: replace matrix design rules with tombo and update repo docs`

---

## 完了後(コントローラーの仕事)

1. 最終ホールブランチレビュー(subagent-driven-development の手順、review-package は `git merge-base main HEAD`..HEAD)
2. PR 作成(`Closes #105`、本文に spec/plan へのリンクと検証サマリ)→ Lighthouse CI の PR コメントで後退なしを確認
3. ユーザーに実機確認を依頼(特に R1 読み味 + 大画面)
4. メモリ更新(tombo-design-system.md: 実適用第一号出荷)
5. Phase 2 の改善 backlog を issue 化(spec §11)
