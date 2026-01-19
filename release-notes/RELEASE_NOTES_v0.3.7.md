# Release Notes v0.3.7

## 🎯 主な新機能

### 駒タイプ別プロモーションゾーン

- **エディタで将棋駒とチェス駒のプロモーションゾーンを個別に設定可能に**
  - 将棋駒用：行数と方向を設定
  - チェス駒用：行数と方向を設定
  - rows=0 でプロモーション無効化が可能
- **カスタムプロモーションゾーンがゲーム中も正しく動作**
  - GameState で promotion zones 設定を保持
  - プレイヤー 1 とプレイヤー 2 で個別の設定
  - 移動後も promotion zones 設定が維持される

### ボードエディタの改善

- **駒タイプ選択機能**
  - 将棋のみ/チェスのみ/両方から選択可能
  - 選択した駒タイプのみがパレットに表示
- **王/King 配置制限**
  - 各プレイヤーにつき王(K)または King(CK)のいずれか 1 つのみ配置可能
  - 既に配置されている場合は追加配置を防止
  - 同じマスへの置き換えは可能

### プロモーション UI の統一

- **PromotionModal コンポーネント使用**
  - チェス駒のプロモーション時に統一された UI を表示
  - 駒のシンボル（♕♖♗♘）と名前を表示
  - 2x2 グリッドの見やすいレイアウト

## 🔧 技術的な改善

- 駒タイプベースのプロモーション判定に変更（カスタムボード対応）
- Board.tsx の重複したプロモーション処理を削除
- 後方互換性を維持（旧形式の promotion zone 設定も読み込み可能）

## 📝 変更されたファイル

- `app/editor/page.tsx`: 駒タイプ別 promotion zones UI
- `lib/types.ts`: GameState に promotionZones 追加
- `lib/board/types.ts`: PieceTypePromotionZones 型定義
- `lib/game/promotion.ts`: カスタムゾーン対応
- `app/local/[mode]/[boardType]/page.tsx`: 統合と state 保持
- `components/Board.tsx`: 重複処理削除
- `components/BoardEditor.tsx`: 駒タイプ選択と王制限
- `components/PromotionModal.tsx`: チェスプロモーション UI
- `styles/promotion.module.css`: 2x2 グリッドレイアウト

## 🐛 バグ修正

- プロモーションゾーン設定が移動後に失われる問題を修正
- カスタムボードで promotion が正しく機能しない問題を修正
- 王/King を複数配置できる問題を修正
- チェスプロモーション UI の不一致を修正

---

**リリース日**: 2026-01-19
