# 将棋・チェス ハイブリッドゲーム Web 版

将棋とチェスのルールを組み合わせたハイブリッドボードゲームの Web 版です。

## 特徴

- ✅ **ローカル対戦**: 同じ端末で 2 人対戦
- ✅ **AI 対戦**: 簡易 AI と対戦
- ✅ **オンライン対戦**: Supabase Realtime でリアルタイム対戦
- ✅ **カスタムボードエディタ**: 独自の盤面を作成・保存
  - 駒タイプ選択（将棋/チェス/両方）
  - 王/King 配置制限（各プレイヤー 1 つまで）
  - カスタムプロモーションゾーン設定
- ✅ **複数の盤タイプ**: 将棋(9x9)、チェス(8x8)、カスタム
- ✅ **持ち駒システム**: 将棋スタイルの持ち駒機能
- ✅ **プロモーションシステム**:
  - 駒タイプ別プロモーションゾーン設定
  - 統一されたプロモーション UI
  - 成り駒の見やすい表示（赤色表示）
- ✅ **詰み判定**: 自動的に勝敗を判定
- ✅ **Vercel 対応**: 完全サーバーレス構成

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **リアルタイム通信**: Supabase Realtime
- **データベース**: Supabase PostgreSQL
- **デプロイ**: Vercel
- **AI**: Minimax + Alpha-Beta Pruning

## セットアップ

### 前提条件

- Node.js 18+
- npm
- Supabase アカウント

### 1. 依存関係のインストール

```bash
cd web
npm install
```

### 2. Supabase プロジェクトの作成

詳細は [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) を参照してください。

**簡易手順:**

1. https://supabase.com でプロジェクト作成
2. SQL Editor でテーブル作成（[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)参照）
3. Realtime を有効化
4. Project URL と Anon Key を取得

### 3. 環境変数の設定

`.env.local` を作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 遊び方

### ローカル対戦

1. トップページで「ローカル対戦」を選択
2. 「プレイヤー vs プレイヤー」を選択
3. 盤タイプ（将棋/チェス/ハイブリッド）を選択
4. 対戦開始！

### AI 対戦

1. トップページで「ローカル対戦」を選択
2. 「プレイヤー vs AI」を選択
3. 盤タイプを選択
4. AI と対戦！

### オンライン対戦

1. トップページで「オンライン対戦」を選択
2. 「新しいルームを作成」または既存のルームに参加
3. 相手が参加するまで待機
4. リアルタイム対戦開始！

## ゲームルール

### 将棋ルール

- **駒の動き**: 伝統的な将棋のルール
- **持ち駒**: 取った駒を自分の駒として使用可能
- **成り**: 敵陣３段に入ると成れる
- **二歩禁止**: 同じ列に 2 つの歩は置けない
- **詰み**: 王が逃げられない状態

### チェスルール

- **駒の動き**: 国際チェスのルール
- **持ち駒なし**: 取った駒は使えない
- **プロモーション**: ポーンが最終行に到達すると昇格
- **チェックメイト**: キングが詰んだら終了

### カスタムボード

- 将棋の駒とチェスの駒を自由に配置
- プレイヤーごとに持ち駒の有無を設定可能
- **駒タイプ別プロモーションゾーン**:
  - 将棋駒用とチェス駒用を個別に設定
  - プロモーション行数と方向を指定可能
  - rows=0 でプロモーション無効化
- エディタで作成したボードを保存・共有
- **成り駒の表示**:
  - と金、成香、成桂、成銀、竜王、龍馬は赤色で表示
  - 一文字表示で盤面レイアウトを維持

## デプロイ

### Vercel にデプロイ

1. **Vercel CLI をインストール**

```bash
npm i -g vercel
```

2. **プロジェクトをデプロイ**

```bash
cd web
vercel
```

3. **環境変数を設定**

Vercel ダッシュボード → Settings → Environment Variables：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **本番デプロイ**

```bash
vercel --prod
```

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## プロジェクト構成

```
web/
├── app/                    # Next.js App Router
│   ├── local/             # ローカル対戦
│   ├── room/[id]/         # オンライン対戦ルーム
│   ├── editor/            # カスタムボードエディタ
│   ├── my-boards/         # マイボード一覧
│   ├── settings/          # 設定ページ
│   └── page.tsx           # トップページ
├── components/            # Reactコンポーネント
│   ├── Board.tsx          # 盤面
│   ├── Piece.tsx          # 駒（赤色成り駒表示対応）
│   ├── HandPieces.tsx     # 持ち駒
│   ├── RoomList.tsx       # ルーム一覧
│   ├── BoardEditor.tsx    # ボードエディター（駒タイプ選択、王制限）
│   └── PromotionModal.tsx # プロモーション選択UI
├── lib/                   # ロジック
│   ├── game/              # ゲームロジック
│   │   ├── board.ts       # 盤面管理
│   │   ├── checkmate.ts   # 詰み判定
│   │   ├── drops.ts       # 持ち駒
│   │   └── promotion.ts   # 成り（駒タイプ別ゾーン対応）
│   ├── board/             # ボード関連
│   │   └── types.ts       # PieceTypePromotionZones型定義
│   ├── ai/                # AI
│   │   └── simpleAI.ts    # Minimax AI
│   ├── supabase/          # Supabase
│   │   ├── client.ts      # クライアント
│   │   └── types.ts       # 型定義
│   └── types.ts           # 共通型（promotionZones追加）
├── hooks/                 # カスタムフック
│   └── useSupabaseRealtime.ts
├── pages/api/             # API Routes
│   ├── rooms/             # ルーム管理
│   ├── boards/            # カスタムボード管理
│   └── game/              # ゲームロジック
├── styles/                # CSS Modules
│   └── promotion.module.css  # 2x2グリッドレイアウト
└── public/                # 静的ファイル
```

## 開発

### ローカルテスト

```bash
npm run dev
```

### ビルド

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## トラブルシューティング

### エラー: Missing Supabase environment variables

→ `.env.local`ファイルを確認してください

### エラー: relation "rooms" does not exist

→ [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)の SQL クエリを実行してください

### Realtime が動作しない

→ Supabase ダッシュボードで以下を確認：

1. Database → Replication でテーブルを有効化
2. テーブルが正しく作成されているか確認

### AI が動かない

→ ブラウザのコンソールでエラーを確認してください

## コントリビューション

プルリクエスト歓迎！

1. Fork
2. Feature Branch 作成 (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Pull Request 作成

## ライセンス

MIT

## 関連ドキュメント

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase セットアップガイド
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイガイド
- [WEB_STRUCTURE.md](./WEB_STRUCTURE.md) - プロジェクト構成詳細

## クレジット

このプロジェクトは将棋とチェスの文化を組み合わせたユニークな実験です。
