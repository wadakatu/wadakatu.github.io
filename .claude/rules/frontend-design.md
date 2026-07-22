# Frontend Design Rules — TOMBO

このサイトのビジュアルは自作デザインシステム **TOMBO**(wadakatu/tombo, private)に完全に従う。

## 掟(tombo spec より)

1. **すべてを測る** — 要素は寸法線・目盛・通し番号と共に置く
2. **銘は等幅** — 数値・ラベル・日時・索引は必ず mono(Martian Mono)
3. **朱は現在地** — 赤は 1–2px の「ここ」を指す線だけ。面に塗ったら朱ではない

## ハードルール

- 色は `var(--tombo-*)` のみ。hex / rgb() をサイトコードに書かない(唯一の例外: offline.astro の自己完結トークンコピー)
- font-size は `var(--tombo-text-*)` のみ。`font-weight: 900` 禁止。和文に負の字間禁止
- トークンの単一ソースは `public/styles/tombo.css`(vendor, 現行 v0.3.2)。**このファイルを直接編集しない** — 変更は wadakatu/tombo 側で行い、新タグから `git -C ~/tombo show vX.Y.Z:tombo.css > public/styles/tombo.css` で再コピーして `chore: vendor tombo.css vX.Y.Z` の単独コミットにする
- 音量ダイヤル: top = LP / about・projects・blog = docs / 404・offline = app。音量ごとの密度・方眼は tombo examples を正とする
- UI 変更は必ず chrome-devtools で昼夜(tombo/hotaru)両テーマのスクリーンショット検証。テーマ切替後 350ms 以上待つ。横オーバーフロー(scrollWidth > clientWidth)を出さない
