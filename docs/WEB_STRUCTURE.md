# Web 版 将棋-チェス ハイブリッドゲーム 構成ドキュメント

## 概要

このドキュメントは、将棋とチェスのハイブリッドゲームの Web 版の全体構成を定義します。
Rust で実装された既存のゲームロジックと AI 機能を Web ブラウザ上で動作させることを目指します。

## 技術スタック

### フロントエンド

- **HTML5** - ゲームの構造
- **CSS3** - スタイリングとアニメーション
- **JavaScript (ES6+)** - ゲームロジックと UI 制御

### バックエンド（オプション）

- **WebAssembly (WASM)** - Rust コードを Web 上で実行するために使用
- **wasm-bindgen** - Rust と JavaScript 間のバインディング
- **wasm-pack** - WASM ビルドツール

### 代替案

- **完全 JavaScript 実装** - Rust コードを参考に JavaScript で再実装

## ディレクトリ構成

```
web/
├── WEB_STRUCTURE.md          # このファイル
├── README.md                 # Web版の説明とセットアップ手順
│
├── public/                   # 静的ファイル
│   ├── index.html           # メインHTMLファイル
│   ├── favicon.ico          # ファビコン
│   └── assets/              # 画像、音声などのアセット
│       ├── images/          # 駒の画像など
│       │   ├── shogi/       # 将棋の駒
│       │   └── chess/       # チェスの駒
│       ├── sounds/          # 効果音
│       └── fonts/           # カスタムフォント
│
├── src/                      # ソースコード
│   ├── styles/              # CSSファイル
│   │   ├── main.css         # メインスタイル
│   │   ├── board.css        # 盤面のスタイル
│   │   ├── pieces.css       # 駒のスタイル
│   │   └── ui.css           # UI要素のスタイル
│   │
│   ├── scripts/             # JavaScriptファイル
│   │   ├── main.js          # エントリーポイント
│   │   ├── game.js          # ゲームメインロジック
│   │   ├── board.js         # 盤面管理
│   │   ├── pieces.js        # 駒の定義と動き
│   │   ├── rules.js         # ゲームルール
│   │   ├── ai/              # AI関連
│   │   │   ├── ai.js        # AI制御
│   │   │   ├── search.js    # 探索アルゴリズム
│   │   │   └── evaluation.js # 評価関数
│   │   ├── ui/              # UI関連
│   │   │   ├── renderer.js  # 描画処理
│   │   │   ├── input.js     # ユーザー入力処理
│   │   │   └── menu.js      # メニュー管理
│   │   └── utils/           # ユーティリティ
│   │       ├── constants.js # 定数定義
│   │       └── helpers.js   # ヘルパー関数
│   │
│   └── wasm/                # WASM関連（オプション）
│       ├── Cargo.toml       # Rustプロジェクト設定
│       └── src/             # Rustソースコード
│           └── lib.rs       # WASMエクスポート
│
├── dist/                     # ビルド成果物（自動生成）
│   └── .gitkeep
│
├── tests/                    # テストコード
│   └── unit/
│       └── .gitkeep
│
├── package.json             # npm設定（必要に応じて）
├── webpack.config.js        # Webpackビルド設定（必要に応じて）
└── .gitignore              # Git除外設定
```

## 機能要件

### 基本機能

1. **盤面表示**

   - 9x9 マスの盤面を描画
   - 将棋とチェスの駒を両方表示可能
   - ドラッグ&ドロップによる駒の移動

2. **ゲームルール**

   - 将棋ルール
   - チェスルール
   - ハイブリッドルール（設定可能）
   - 持ち駒システム（将棋ルール時）

3. **プレイヤーモード**

   - 人間 vs 人間
   - 人間 vs AI
   - AI vs AI（観戦モード）

4. **AI 対戦**
   - 複数の難易度レベル
   - 思考時間の表示
   - 評価値の表示（オプション）

### UI/UX

1. **レスポンシブデザイン**

   - デスクトップ、タブレット、スマートフォン対応
   - タッチ操作対応

2. **視覚効果**

   - 移動可能マスのハイライト
   - 駒の移動アニメーション
   - ターン表示
   - ゲーム終了通知

3. **設定メニュー**
   - ルール選択
   - AI 難易度設定
   - 盤面テーマ変更
   - 音声 ON/OFF

### 拡張機能（将来的に）

- オンライン対戦
- 棋譜の保存/読み込み
- リプレイ機能
- 解析モード
- ランキング機能

## 実装アプローチ

### フェーズ 1: 基本実装

1. HTML ベースの盤面 UI 作成
2. 基本的な駒の移動ロジック
3. ルール検証システム
4. シンプルな AI 実装

### フェーズ 2: WASM 統合（オプション）

1. Rust コアロジックの選択的移植
2. wasm-pack でのビルド設定
3. JavaScript-WASM 間のインターフェース設計
4. 高度な AI 機能の統合

### フェーズ 3: UI/UX 改善

1. レスポンシブデザインの実装
2. アニメーションとエフェクト
3. 音声効果
4. テーマシステム

### フェーズ 4: 高度な機能

1. 棋譜システム
2. 解析モード
3. オンライン対戦（別途サーバー実装が必要）

## 開発ツールとビルドプロセス

### 開発環境

- Node.js (npm/yarn)
- モダンブラウザ（Chrome, Firefox, Safari, Edge）
- ローカル開発サーバー

### ビルドツール（必要に応じて）

- **Webpack** - モジュールバンドラー
- **Babel** - トランスパイラー
- **wasm-pack** - WASM ビルド

### 開発コマンド例

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# WASMビルド（オプション）
wasm-pack build --target web
```

## パフォーマンス目標

- **初期ロード時間**: < 3 秒
- **駒移動レスポンス**: < 100ms
- **AI 思考時間**:
  - 初級: < 500ms
  - 中級: < 2 秒
  - 上級: < 5 秒

## ブラウザサポート

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## セキュリティ考慮事項

- XSS 対策（ユーザー入力のサニタイズ）
- CSP（Content Security Policy）設定
- HTTPS 通信（本番環境）

## デプロイメント

### 静的ホスティング候補

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

### デプロイ手順

1. `npm run build`でビルド
2. `dist/`ディレクトリをホスティングサービスにデプロイ

## 今後の検討事項

1. **Progressive Web App (PWA)化**

   - オフライン対応
   - インストール可能なアプリに

2. **マルチプレイヤー対応**

   - WebSocket 通信
   - マッチメイキングシステム
   - リーダーボード

3. **機械学習モデルの統合**

   - ONNX Runtime for Web で ML モデルを実行
   - 既存の学習済みモデルの活用

4. **国際化 (i18n)**
   - 日本語/英語対応
   - その他言語への拡張

## 参考リンク

- [WebAssembly](https://webassembly.org/)
- [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 変更履歴

| 日付       | バージョン | 変更内容                                                               |
| ---------- | ---------- | ---------------------------------------------------------------------- |
| 2026-01-18 | 0.3.4      | カスタムボード説明機能、マイボード管理ページ、アカウント設定ページ追加 |
| 2026-01-14 | 0.1.0      | 初版作成                                                               |
