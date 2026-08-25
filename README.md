# aquira.art

Aquira.art の静的サイトです。日常の文章、作品、リンク、公式情報は **`content/site-content.js` だけ**を編集します。公開HTML、サイトマップ、クローラー設定は、編集内容から自動生成します。

> `index.html` と各ページの `index.html` は公開用の生成ファイルです。通常は直接編集しません。

## 最短の更新手順

内容を更新するときは、`content/site-content.js` を編集し、次のコマンドをリポジトリのルートで実行します。

```bash
npm run verify
```

この一回の実行で、必須項目・URL・重複・問い合わせ導線を確認し、全ページと `robots.txt`、`sitemap.xml` を再生成します。続いて、正規URL、言語設定、構造化データ、内部リンク、ページ内アンカー、別タブで開く外部リンクの保護まで検査します。成功後は、変更した `content/site-content.js` と生成済みファイルを一緒にコミットしてください。

| コマンド | 用途 | 使う場面 |
| --- | --- | --- |
| `npm run check:content` | 編集データの必須項目・URL・重複を検査 | 書き換え直後 |
| `npm run build` | HTML、サイトマップ、クローラー設定を生成 | 生成物だけ更新したい場合 |
| `npm run check:seo` | canonical、言語、JSON-LD、サイトマップを検査 | 検索・AEO関連の変更後 |
| `npm run check:links` | 内部リンク、アンカー、外部リンクの安全属性を検査 | リンクを追加・変更した後 |
| `npm run verify` | 上記を正しい順序で一括実行 | **通常の更新では常にこれだけ** |

## 編集場所の判断

| 更新したい内容 | 編集する場所 | 補足 |
| --- | --- | --- |
| プロフィール、作品、紹介文、SNS、問い合わせ先 | `content/site-content.js` | 通常の編集窓口です。 |
| ページ構成、構造化データ、生成規則 | `scripts/build-site.mjs` | 変更後は必ず `npm run verify` を実行します。 |
| 表示デザイン | `styles/tokens.css`、`styles/layout.css`、`styles/components.css` | まず `tokens.css` を確認します。 |
| アクセシビリティの操作 | `accessibility.js` | キーボード・表示設定を変更する場合のみ編集します。 |
| 公開URLと検索用ファイル | 直接編集せず `npm run build` | `sitemap.xml` と `robots.txt` は自動生成です。 |

## 継続保全

GitHub上では、`main` への変更とプルリクエストで品質検査が実行されます。さらに毎週、同じ検査を実行し、時間経過による生成不整合を早期に検知します。変更内容に展示歴、受賞歴、協働先、数値実績、商標、料金、法的表現を含む場合は、公開前に一次資料を確認し、`docs/verification-ledger.md` に根拠を残してください。

現在の公開先はこの静的リポジトリとは独立しています。したがって、ここでのコミットは**公開準備と保全を完了するもの**であり、`www.aquira.art` への反映にはホスティング切替、または公開先での同等実装という別途の公開判断が必要です。状況は [`docs/live-site-status-2026-08-25.md`](docs/live-site-status-2026-08-25.md) に記録しています。
