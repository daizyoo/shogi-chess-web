# 素材リソースガイド

このドキュメントは、ゲームで使用する素材（駒の画像など）の調達と実装方法をまとめています。

## 駒の素材

### 必要な素材

#### 将棋の駒

- 王/玉 (King)
- 飛車 (Rook)
- 角行 (Bishop)
- 金将 (Gold General)
- 銀将 (Silver General)
- 桂馬 (Knight)
- 香車 (Lance)
- 歩兵 (Pawn)
- 成り駒（と、成香、成桂、成銀、竜王、竜馬）

#### チェスの駒

- King (♔)
- Queen (♕)
- Rook (♖)
- Bishop (♗)
- Knight (♘)
- Pawn (♙)

### フリー素材の調達先

#### 推奨サイト

1. **Wikimedia Commons**

   - URL: https://commons.wikimedia.org/
   - ライセンス: パブリックドメイン、CC0 など
   - 検索: "shogi pieces svg", "chess pieces svg"
   - フォーマット: SVG 推奨

2. **lichess.org（チェス）**

   - GitHub: https://github.com/lichess-org/lila/tree/master/public/piece
   - ライセンス: GPL-3.0
   - フォーマット: SVG
   - 複数のスタイルあり（cburnett, merida, alpha, など）

3. **electron-shogi（将棋）**

   - GitHub: https://github.com/sunfish-shogi/electron-shogi/tree/main/assets
   - ライセンス: 確認が必要
   - フォーマット: PNG, SVG

4. **いらすとや**
   - URL: https://www.irasutoya.com/
   - 検索: "将棋"
   - ライセンス: 商用利用可（規約確認必要）
   - フォーマット: PNG

### 配置場所

ダウンロードした素材は以下のディレクトリに配置：

```
web/public/assets/pieces/
├── shogi/
│   ├── king.svg (または .png)
│   ├── rook.svg
│   ├── bishop.svg
│   ├── gold.svg
│   ├── silver.svg
│   ├── knight.svg
│   ├── lance.svg
│   ├── pawn.svg
│   ├── promoted_rook.svg (竜王)
│   ├── promoted_bishop.svg (竜馬)
│   ├── promoted_pawn.svg (と金)
│   ├── promoted_lance.svg (成香)
│   ├── promoted_knight.svg (成桂)
│   └── promoted_silver.svg (成銀)
└── chess/
    ├── king.svg
    ├── queen.svg
    ├── rook.svg
    ├── bishop.svg
    ├── knight.svg
    └── pawn.svg
```

## 素材が見つからない場合の代替案

### 1. Unicode 文字を使用（現在の実装）

**メリット:**

- 実装済み（`lib/game/board.ts`で使用中）
- ファイル不要、軽量
- すぐに動作確認可能

**デメリット:**

- 見た目がシンプル
- プラットフォーム依存（フォントによって表示が異なる）

**使用中の Unicode:**

```typescript
// チェス
"♔" // King
"♕" // Queen
"♖" // Rook
"♗" // Bishop
"♘" // Knight
"♙" // Pawn

// 将棋（漢字）
"王" // 王
"飛" // 飛車
"角" // 角行
"金" // 金将
"銀" // 銀将
"桂" // 桂馬
"香" // 香車
"歩" // 歩兵
```

### 2. SVG で自作

**CSS で簡素な SVG を作成:**

```html
<!-- 例: 将棋の王 -->
<svg viewBox="0 0 100 100" width="50" height="50">
  <!-- 駒の形 -->
  <path
    d="M10,80 L50,10 L90,80 Z"
    fill="#f0d9b5"
    stroke="#000"
    stroke-width="2"
  />
  <!-- 文字 -->
  <text x="50" y="65" text-anchor="middle" font-size="30" font-weight="bold">
    王
  </text>
</svg>
```

保存先: `public/assets/pieces/custom/king.svg`

### 3. AI 画像生成

**DALL-E、Midjourney、Stable Diffusion などを使用:**

プロンプト例:

```
"Minimalist shogi piece icon, simple line art, black and white, top view"
"Chess knight piece, flat design, vector style, clean lines"
```

**注意点:**

- 生成 AI の利用規約を確認
- 商用利用の可否
- 著作権の取り扱い

### 4. Canvas/WebGL で動的描画

JavaScript で駒を描画する方法。高度だが完全にカスタマイズ可能。

```javascript
// 例: Canvasで円を描く
const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")
ctx.beginPath()
ctx.arc(25, 25, 20, 0, 2 * Math.PI)
ctx.fillStyle = "#f0d9b5"
ctx.fill()
ctx.stroke()
```

## 素材の実装方法

### 画像ファイルを使用する場合

`Piece.tsx`を以下のように修正:

```typescript
import Image from "next/image"

export default function PieceComponent({ piece }: PieceComponentProps) {
  const imagePath = `/assets/pieces/${
    piece.type.startsWith("chess_") ? "chess" : "shogi"
  }/${piece.type.replace("chess_", "")}.svg`

  return (
    <div className={styles.piece}>
      <Image
        src={imagePath}
        alt={getPieceName(piece.type)}
        width={40}
        height={40}
        className={piece.player === 2 ? styles.rotated : ""}
      />
    </div>
  )
}
```

CSS で回転:

```css
.rotated {
  transform: rotate(180deg);
}
```

## 推奨ワークフロー

1. **開発段階**: Unicode 文字で実装（現在の状態）
2. **テスト段階**: Wikimedia Commons から SVG をダウンロード
3. **本番前**: 必要に応じてデザイナーに依頼 or AI 生成

## ライセンス確認事項

素材を使用する際は必ず以下を確認：

- [ ] ライセンスの種類（CC0, CC-BY, GPL, etc.）
- [ ] 商用利用の可否
- [ ] クレジット表記の必要性
- [ ] 改変の可否
- [ ] 再配布の条件

## サイズとフォーマットの推奨

- **フォーマット**: SVG（拡大縮小に対応）
- **代替**: PNG（透過背景、最低 128x128px）
- **ファイルサイズ**: 各ファイル 50KB 以下推奨

## カラースキーム

現在の CSS 変数を活用:

- Player 1（下側）: 白ベース (`--color-surface`)
- Player 2（上側）: 黒ベース (`--color-text`)
- ハイライト: `--color-accent` (ゴールド)
- 盤面: `--color-board-light`, `--color-board-dark`

## トラブルシューティング

### 画像が表示されない

1. パスを確認: `/assets/pieces/...`
2. Next.js の`public`フォルダに配置されているか確認
3. ファイル名の大文字・小文字を確認
4. ブラウザのコンソールでエラー確認

### 画像のサイズが合わない

CSS で調整:

```css
.piece img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

### パフォーマンスが悪い

- SVG を使用（軽量）
- PNG の場合は最適化ツールを使用
- Next.js の`Image`コンポーネントを活用（自動最適化）

## 参考リンク

- [Wikimedia Commons - Shogi](https://commons.wikimedia.org/wiki/Category:Shogi)
- [Wikimedia Commons - Chess SVG](https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces)
- [lichess pieces](https://github.com/lichess-org/lila/tree/master/public/piece)
- [unicode-table.com - Chess Symbols](https://unicode-table.com/en/blocks/chess-symbols/)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
