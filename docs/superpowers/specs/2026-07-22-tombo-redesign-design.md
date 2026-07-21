# wadakatu.dev TOMBO リデザイン設計書(Phase 1)

日付: 2026-07-22
Issue: #105
状態: ドラフト(ユーザーレビュー待ち。【要確認】が 2 + 1 件)
前提: TOMBO v0.3.0(private repo wadakatu/tombo。タイポグラフィ v0.2 + 広幅対応 v0.3 出荷済み)

## 1. 目的と方針

Matrix テーマ(green #00ff41 / rain / CRT / JetBrains Mono + Outfit)を全撤去し、TOMBO デザインシステムへ**一括**移行する。

- **Phase 1 = 見た目の移行のみ。** 文言・情報設計・コンテンツ(blog 18 本、フィード、JSON-LD、llms.txt)・機能(PWA、Lighthouse CI、prefetch)は凍結。ただし「装飾としての文言」(`$ ` プロンプト、`cd ..`、`UPLINK ACTIVE` 等の Matrix 演出コピー)は**デザインの一部**とみなし置換する — 本文コンテンツとの境界はこれで引く
- Phase 2(別 issue 群)で文言・IA 最新化とアクセシビリティ改善を 1 つずつ行う
- サイトロゴは **Chisato Satoh 氏作を維持**(フッターのクレジットリンクも維持)。フッターに TOMBO 刻印(`.tombo-logo`)を追加

## 2. tombo.css の取り込み(vendor)

- `public/styles/tombo.css` に **v0.3.0 のタグからバイト同一コピー**を置く(改変禁止 — 上流との diff を保つ)
- 出所と更新手順はこの spec と CLAUDE.md に記録: 更新 = `~/tombo` の新タグから再コピーして `chore: vendor tombo.css vX.Y.Z` の単独コミット
- vendor 理由: tombo は private のため GitHub Actions(deploy.yml)から git 依存で取得できない。PAT を積むより静的コピーが単純で、純 CSS 1 ファイルなので追随コストも低い
- **公開露出について**: 本リポジトリは public なので vendored tombo.css は公開物になる。ただし Web サイトに適用した CSS はリポジトリが private でも配信時点で全公開であり、実適用第一号を選んだ時点で織り込み済みの露出である(tombo 本体リポジトリの公開戦略とは独立)
- 【要確認 b】`package.json` の `"license": "MIT"` を `"license": "UNLICENSED"` + `"private": true` に変更する(サイトのコード・デザインを再利用自由と誤読させないため。npm 公開物ではないので実害はゼロ)

## 3. CSS アーキテクチャ再編

現状: トークン相当の `:root` が 4 箇所に重複(common.css / index / 404 / offline)、CSS 総量 ≈ 4,539 行が 16 ファイル/ブロックに分散、rain 実装 3 系統。これを:

- **トークンの単一ソース = tombo.css。** サイト側は新しい `public/styles/site.css` 1 枚(サイト固有のレイアウトシェル・ページ部品)+ 各ページの scoped `<style>`(大幅縮小)に再編
- **色リテラル禁止**: site.css と全 .astro の scoped style に hex / rgb() / named color を書かない。色は必ず `var(--tombo-*)` 参照(機械検査: `grep -nE "#[0-9a-fA-F]{3,8}|rgba?\(" public/styles/site.css src/ --include="*.astro" | grep -v "offline.astro"` が空。**唯一の例外は offline.astro** — 自己完結ポリシー(§4)のため tombo トークン値のインラインコピーを持つ。値は tombo.css v0.3.0 と一致していること。SVG データ URI 等の例外が他に出たら plan で許可リスト化)
- font-size は tombo のスケールトークン参照のみ(tombo と同じ規律)
- `common.css` / `toc.css` / `scroll-to-top.css` は廃止し site.css に統合(TOC は `.tombo-toc`、scroll-to-top は tombo トークンで再スタイル)
- 読み込みは BaseLayout に集約: `tombo.css` → `site.css` → フォント `<link>`(v0.2 の三声リンク)。ページ個別の `<link rel="stylesheet">` は撤去
- shell は `--tombo-shell-max` を参照(v0.3 の広幅挙動 — 1600px 以上で 1280px + 余白計器化 — をサイトも自動で得る)

## 4. 音量マッピングとページ別設計

| ページ | 音量 | 主な変更 |
|---|---|---|
| `index.astro` | **LP** | ヒーローに `.tombo-vol-lp`(方眼全面)+ `.tombo-corners`。bento カード群 → 見当マーク付きカード・`.tombo-metric`・`.tombo-chip`・寸法線に置換。JSON-LD・ソーシャルリンク(Zenn 含む)は不変 |
| `about/` `projects/` `blog/` `blog/[slug]` | **docs** | `body.tombo-gutters`(余白方眼)。セクション見出し → `.tombo-sec`(通し番号)。`PageHeader` の `cd ..` → mono の戻りリンク(例 `← INDEX`)。`SectionHeader` の `$ ` プロンプト → 通し番号。blog TOC → `.tombo-toc` + 朱の現在地 |
| `404.astro` `offline.astro` | **app** | 方眼なしの計器盤。大数字は `.tombo-metric`(mono 600)、状態は `.tombo-chip`。rain・glitch・CRT 全撤去 |

- `404.astro` / `offline.astro` は Phase 1 では **standalone のまま**(BaseLayout 化は構造リファクタなので Phase 2)。404 はオンライン配信なので tombo.css / site.css を `<link>` 参照してよい。**offline は自己完結ポリシー維持**: 必要最小限の tombo トークンをインラインコピーし、webfont は使わず system フォールバックで組む(sw キャッシュに依存しない)
- `Footer.astro`: TOMBO 刻印(`.tombo-logo`、examples と同型)+ Chisato Satoh クレジット維持 + JST 時計維持(mono の計器として自然)。`UPLINK ACTIVE` インジケータ → `.tombo-chip` の状態表示に置換(文言は plan で決定)
- `MatrixRain.astro` はコンポーネントごと削除

## 5. テーマ機構(新規)

現状は dark 単一テーマ。TOMBO は tombo(昼)/ hotaru(夜)の二態:

- 既定は `prefers-color-scheme` 追従(tombo.css の `light-dark()` がそのまま働く)
- トグル UI: examples と同型(mono ラベル 2 つ + 朱下線が現在地)を全ページに設置。設置位置は docs/LP はページ右上、404/offline は盤面右上(詳細位置は plan)
- 【要確認 a】**テーマの localStorage 永続化**を入れる: `<head>` 冒頭の同期インラインスクリプト(数行)が `localStorage.tombo-theme` を読んで `data-theme` を設定(FOUC 防止)。トグル操作で保存。※ 入れない場合はページ遷移でも OS 追従のみになる
- `<meta name="theme-color">`: `media="(prefers-color-scheme:)"` 付きで昼 `#F2F4EF` / 夜 `#131714` の 2 本 + トグル時に JS で更新
- `manifest.json` の `theme_color` / `background_color` は単一値しか持てないため **hotaru の `#131714`** にする(PWA スプラッシュは暗背景が無難)【軽微・要確認 c】

## 6. タイポグラフィとコードハイライト

- フォント: JetBrains Mono / Outfit を撤去し、TOMBO 三声の Google Fonts リンク(Instrument Sans 600;700 / M PLUS 2 450;500;700 / Martian Mono wdth,wght)に差し替え。読み込みは BaseLayout(+ 404 の standalone head)。既存の非ブロッキング読み込みパターン(preload + media swap)は踏襲
- 本文・見出し・銘・コードの組みは tombo.css の base/スケールに乗せる(サイト側での上書き最小)
- Shiki: `astro.config.mjs` の `theme: 'one-dark-pro'` → **`'css-variables'`**。`--astro-code-*` 変数を site.css で TOMBO コードパネルのトークン(`--tombo-code-bg` / `--tombo-code-ink` / `--tombo-green` / `--tombo-shu` / `--tombo-code-faint` 等)にマップ(対応表は plan)。コードブロックの器は `.tombo-code`(昼も夜パネル — tombo spec §10-5)

## 7. PWA・デプロイ追随

- `public/sw.js`: precache リストの `common.css` / `toc.css` / `scroll-to-top.css` → `tombo.css` / `site.css` に差し替え、`CACHE_VERSION` 5 → 6
- `manifest.json` 色は §5。アイコン・favicon は変更しない(ロゴ維持のため)
- `deploy.yml` / `lighthouse.yml` は無変更(Lighthouse CI の PR コメントが回帰ゲートを兼ねる)
- feed.xml / atom.xml / sitemap / prefetch / web-vitals は不変

## 8. Matrix 撤去一覧(漏れ検査用)

1. rain 3 実装: `MatrixRain.astro` + `common.js` の rain 関数群 / `404.astro` インライン canvas 版 / `offline.astro` DOM+CSS 版
2. CRT scanline: `common.css` `body::before` / `index.astro` / `offline.astro` の複製
3. green palette + glow トークン(`--matrix*` `--glow*` `--red-glow` `--blue-glow`)全 4 定義箇所
4. JetBrains Mono / Outfit の `<link>`(BaseLayout / 404 / offline)
5. `one-dark-pro`(§6 で置換)
6. 演出コピー: `$ ` / `cd ..` / `UPLINK ACTIVE`(§1 の境界定義による)
7. 検査: 実装完了時に `grep -rniE "matrix|00ff41|jetbrains|outfit|scanline|glitch|uplink" src/ public/styles/ public/scripts/ astro.config.mjs` が空(blog 本文 `src/content/` は対象外)

## 9. リポジトリ衛生

- ルート直下の死んだ静的 HTML 群(`index.html` `404.html` `offline.html` `about/index.html` `projects/index.html` `sitemap.xml`)を削除 — deploy.yml は `dist/` しか公開しておらず、これらは pre-Astro の遺物(CLAUDE.md の「Hybrid Structure」記述は事実と不一致)
- 壊れた `.github/workflows/generate-articles.yml` を削除(存在しないパスをトリガー・実行している)
- `.claude/rules/frontend-design.md` を全面書き換え: 「Never break the Matrix world aesthetic」→ TOMBO の掟(すべてを測る / 銘は等幅 / 朱は現在地)、トークン以外の色・サイズ禁止、音量ダイヤル、昼夜検証必須、vendor 更新手順
- ルート `CLAUDE.md` の構造説明を実態(Astro + dist デプロイ、TOMBO 適用)に更新
- `llms.txt` / `llms-full.txt` はコンテンツ扱いで Phase 1 不変

## 10. 検証

1. 全 7 ページ × 昼夜 × 幅 375 / 768 / 1280 / 1600 / 2560 で chrome-devtools スクリーンショット(テーマ切替後 350ms 待ち)。横オーバーフロー 0(`scrollWidth == clientWidth`)を全組合せで機械確認
2. §8-7 の Matrix 残骸 grep が空、§3 の色リテラル grep が空
3. トグル: 切替・(採用時)再読込後の永続・OS 追従既定・FOUC なし
4. offline: DevTools offline 化で sw フォールバック描画を確認(webfont なしで崩れないこと)
5. Lighthouse CI(PR 自動)で現状水準から後退なし
6. コントラスト: サイトは新規色を導入しない(§3)ため tombo 本体のゲート 28/28 が実質カバー
7. スクリーンリーダー基本動線(SkipLink・見出し順・aria-label)の目視確認 — 全面 audit は Phase 2

## 11. 非スコープ(Phase 2 候補 → 別 issue)

文言・IA 最新化 / WCAG 監査 / llms.txt 更新 / feed 生成パイプライン整理(orphan スクリプト) / 404・offline の BaseLayout 統合 / Playwright 視覚回帰(tombo #7 と連携) / linter・formatter 導入 / `src/` の `.DS_Store` 掃除等の雑衛生

## 12. 決定記録

- 一括移行・ロゴ維持・フッター刻印・Phase 分割はユーザー決定(2026-07-21)
- vendor 方式は private repo × GitHub Actions の制約による(git 依存 + PAT より単純)
- 演出コピーを「デザイン」側に分類する境界は本 spec §1 で定義(2026-07-22)
- 【要確認 a】localStorage テーマ永続化 / 【要確認 b】package.json UNLICENSED / 【要確認 c】manifest 色 = hotaru — の 3 点はユーザーレビューで確定させる
