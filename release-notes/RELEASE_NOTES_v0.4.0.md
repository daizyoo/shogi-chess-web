# Release Notes - v0.4.0

**リリース日**: 2026-01-20

## 🎉 新機能

### Advanced AI (WASM) 統合 (#11)

強力なWebAssembly (WASM) ベースの高度なAIをWebアプリケーションに統合しました。

#### 主な機能

- **AI選択機能**: Simple AIとAdvanced AI (WASM)を選択可能
- **難易度設定**: Easy / Medium / Hardの3段階
- **WebWorker実装**: UIをブロックせずにバックグラウンドでAIが思考
- **ローディングインジケーター**: AI初期化中とAI思考中の状態表示

#### 技術的改善

- **WASMローダー**: 動的にWASMモジュールをロード
- **AIサービス**: Simple AIとWASM AIの統一インターフェース
- **ボード正規化**: WASM AIとの互換性のためにボード状態を正規化

## 🐛 バグ修正

### PvAモードのターン制御 (#11)

Player vs AIモードで、プレイヤーがAIのターン中に駒を動かせてしまう問題を完全に修正しました。

#### 修正内容

1. **Boardコンポーネント**: `onMove`が`undefined`の場合、駒選択を無効化
2. **イベントハンドラ分離**: `executeMove`（内部関数）と`handleMove`（プレイヤー用）に分離し、AIは`fromAI`フラグで制限をバイパス
3. **多層防御**: Props制御、ハンドラガード、コンポーネント内部の3層でブロック

### その他の修正

- **WASM Loader**: 変数シャドーイングエラーを修正
- **型安全性**: `gameState`と`pendingResolve`のnullチェックを追加
- **ボードシリアライゼーション**: `promoted`フィールドの欠落エラーを修正

## 📝 技術詳細

### ファイル構成

```
web/
├── lib/ai/
│   ├── aiService.ts       # AI統一インターフェース
│   ├── wasmLoader.ts      # WASMモジュールローダー
│   └── simpleAI.ts        # Simple AI実装
├── workers/
│   └── ai.worker.ts       # WebWorker for WASM AI
├── wasm-ai/               # Rust WASM AIプロジェクト
│   ├── src/
│   │   ├── lib.rs
│   │   ├── types.rs
│   │   ├── board.rs
│   │   ├── moves.rs
│   │   ├── eval.rs
│   │   └── search.rs
│   └── Cargo.toml
└── components/
    └── Board.tsx          # ターン制御強化
```

### 動作環境

- **WebAssembly対応ブラウザ**が必要
- WASMがサポートされていない場合、自動的にSimple AIにフォールバック

## 🔄 アップグレード方法

```bash
# 依存関係のインストール
npm install

# WASMビルド（初回のみ）
cd wasm-ai
wasm-pack build --target web --release
cd ..

# 開発サーバー起動
npm run dev
```

## 🎮 使い方

1. トップページから「ローカルで遊ぶ」を選択
2. 「Player vs AI」を選択
3. AIタイプで「Advanced AI (WASM)」または「Simple AI」を選択
4. 難易度（Easy / Medium / Hard）を選択
5. ボードタイプ（将棋 / チェス / カスタム）を選択してゲーム開始

## 🙏 謝辞

このリリースは issue #11 の実装として完成しました。AI強化機能のご提案とフィードバックに感謝します！

---

## Known Issues

特になし

## Next Steps

- AI評価関数のさらなる改善
- オンライン対戦機能の強化
- モバイル対応の改善
