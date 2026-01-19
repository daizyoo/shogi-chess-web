# Web 版 将棋-チェス ハイブリッドゲーム 構成ドキュメント

## 概要

このドキュメントは、将棋とチェスのハイブリッドゲームの Web 版の全体構成を定義します。
Next.js 14 (App Router) と Supabase を使用した、フルスタックのリアルタイム対戦ゲームです。

## 技術スタック

### フロントエンド

- **Next.js 14** - React フレームワーク (App Router)
- **TypeScript** - 型安全性
- **React 18** - UI ライブラリ
- **CSS Modules** - スタイリング

### バックエンド

- **Supabase** - データベース & リアルタイム通信
  - PostgreSQL - データ永続化
  - Realtime - WebSocket ベースの双方向通信
  - Row Level Security (RLS) - アクセス制御

### デプロイ

- **Vercel** - ホスティング

## ディレクトリ構成

```
web/
├── app/                      # Next.js App Router
│   ├── local/[mode]/[boardType]/
│   │   └── page.tsx         # ローカル対戦ページ
│   ├── room/[id]/
│   │   └── page.tsx         # オンライン対戦ルーム
│   ├── editor/
│   │   └── page.tsx         # カスタムボードエディタ
│   ├── my-boards/
│   │   └── page.tsx         # マイボード一覧
│   ├── settings/
│   │   └── page.tsx         # 設定ページ
│   ├── layout.tsx           # ルートレイアウト
│   └── page.tsx             # トップ��ージ
│
├── components/              # React コンポーネント
│   ├── Auth/
│   │   ├── AuthProvider.tsx    # 認証プロバイダー
│   │   └── LoginForm.tsx       # ログインフォーム
│   ├── Board.tsx            # 盤面コンポーネント
│   ├── Piece.tsx            # 駒コンポーネント（赤色成り駒対応）
│   ├── HandPieces.tsx       # 持ち駒表示
│   ├── RoomList.tsx         # ルーム一覧
│   ├── BoardEditor.tsx      # ボードエディター
│   │                        # - 駒タイプ選択（将棋/チェス/両方）
│   │                        # - 王/King 配置制限
│   └── PromotionModal.tsx   # プロモーション選択 UI（2x2 グリッド）
│
├── lib/                     # ビジネスロジック
│   ├── game/                # ゲームロジック
│   │   ├── board.ts         # 盤面管理・駒名取得
│   │   ├── legalMoves.ts    # 合法手生成
│   │   ├── checkmate.ts     # 詰み判定
│   │   ├── drops.ts         # 持ち駒ロジック
│   │   └── promotion.ts     # 成り判定
│   │                        # - 駒タイプ別プロモーションゾーン対応
│   ├── board/               # ボード関連型定義
│   │   ├── types.ts         # PieceTypePromotionZones など
│   │   └── defaults.ts      # デフォルトボード設定
│   ├── ai/                  # AI
│   │   └── simpleAI.ts      # Minimax + Alpha-Beta Pruning
│   ├── supabase/            # Supabase クライアント
│   │   ├── client.ts        # Supabase クライアント初期化
│   │   └── types.ts         # DB 型定義
│   └── types.ts             # 共通型定義
│                            # - GameState（promotionZones 含む）
│                            # - Piece, Move, Player など
│
├── hooks/                   # カスタム React フック
│   └── useSupabaseRealtime.ts  # Realtime サブスクリプション
│
├── styles/                  # CSS Modules
│   ├── globals.css          # グローバルスタイル
│   ├── board.module.css     # 盤面スタイル
│   ├── pieces.module.css    # 駒スタイル
│   ├── promotion.module.css # プロモーション UI（2x2 グリッド）
│   └── hand.module.css      # 持ち駒スタイル
│
├── public/                  # 静的ファイル
│   └── assets/              # アセット
│       └── images/          # 画像
│
├── docs/                    # ドキュメント
│   ├── README.md            # メインドキュメント
│   ├── SUPABASE_SETUP.md    # Supabase セットアップガイド
│   ├── DEPLOYMENT.md        # デプロイガイド
│   └── WEB_STRUCTURE.md     # このファイル
│
├── .env.local               # 環境変数（Git 管理外）
├── next.config.js           # Next.js 設定
├── tsconfig.json            # TypeScript 設定
└── package.json             # npm 設定
```

## 機能要件

### 実装済み機能

#### 1. ゲームモード

- **ローカル対戦**

  - プレイヤー vs プレイヤー
  - プレイヤー vs AI（Minimax AI）
  - 盤タイプ選択（将棋 9x9 / チェス 8x8 / カスタム）

- **オンライン対戦**
  - リアルタイム対戦（Supabase Realtime）
  - ルーム作成・参加
  - 自動ルーム削除（3 時間後）

#### 2. カスタムボードエディタ

- **駒配置機能**

  - ドラッグ & ドロップによる駒配置
  - 駒タイプ選択（将棋駒のみ/チェス駒のみ/両方）
  - 王/King 配置制限（各プレイヤー 1 つまで）
  - 消しゴムモード

- **設定機能**

  - 盤サイズ選択（8x8 / 9x9）
  - プレイヤーごとの持ち駒設定
  - **駒タイプ別プロモーションゾーン**
    - 将棋駒用とチェス駒用を個別に設定
    - 行数と方向（上から/下から）を指定
    - rows=0 でプロモーション無効化可能

- **保存・共有**
  - Supabase へのボード保存
  - マイボード一覧表示
  - ボードの読み込み・削除
  - JSON エクスポート/インポート

#### 3. プロモーションシステム

- **統一された UI**

  - チェス駒用 `PromotionModal`（2x2 グリッド）
  - 将棋駒用プロモーションダイアログ

- **成り駒の表示**

  - と金、成香、成桂、成銀、竜王、龍馬は**赤色表示**
  - 一文字表示で盤面レイアウトを維持（成香 → 香、成桂 → 桂、成銀 → 銀）

- **カスタムゾーン対応**
  - `GameState.promotionZones` でゲーム中もゾーン設定を保持
  - 駒タイプ別のプロモーション判定

#### 4. ゲームルール

- **将棋ルール**

  - 伝統的な駒の動き
  - 持ち駒システム
  - カスタマイズ可能な成りゾーン
  - 二歩禁止

- **チェスルール**
  - 国際チェスの駒の動き
  - ポーンプロモーション
  - キャスリング（未実装）
  - アンパッサン（未実装）

#### 5. UI/UX

- **レスポンシブデザイン**

  - CSS Grid レイアウト
  - モバイル対応

- **視覚効果**

  - 合法手ハイライト
  - 選択中の駒表示
  - ターン表示
  - 勝敗通知

- **認証・アカウント**
  - Supabase Auth（Email/Password）
  - アカウント設定ページ
  - ログイン/ログアウト

## データモデル

### Supabase テーブル

#### rooms

オンライン対戦ルーム

```sql
- id: UUID
- name: TEXT
- board_type: TEXT
- has_hand_pieces: BOOLEAN
- player1_id: TEXT
- player2_id: TEXT
- status: TEXT
- current_turn: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### game_states

ゲーム状態

```sql
- id: UUID
- room_id: UUID (FK)
- board: JSONB
- hands: JSONB
- status: TEXT
- winner: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### moves

指し手履歴

```sql
- id: UUID
- room_id: UUID (FK)
- player: INTEGER
- from_row, from_col: INTEGER
- to_row, to_col: INTEGER
- piece_type: TEXT
- promoted: BOOLEAN
- captured_piece: TEXT
- created_at: TIMESTAMP
```

#### custom_boards

カスタムボード

```sql
- id: UUID
- user_id: TEXT
- name: TEXT
- board: JSONB
- player1: JSONB
- player2: JSONB
- promotion_zones: JSONB  -- PieceTypePromotionZones
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 開発ワークフロー

### ローカル開発

```bash
# 依存関係インスト���ル
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint
npm run lint
```

### 環境変数

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## パフォーマンス目標

- **初期ロード時間**: < 2 秒（Vercel エッジ使用）
- **駒移動レスポンス**: < 50ms
- **AI 思考時間**: < 1 秒（Minimax depth 3）
- **Realtime 遅延**: < 200ms

## セキュリティ

- **Row Level Security (RLS)**: Supabase テーブルで有効化
- **環境変数**: `.env.local` で管理（Git 管理外）
- **XSS 対策**: React の自動エスケープ
- **CORS**: Next.js でデフォルト設定

## 今後の拡張予定

1. **チェスルール完全実装**

   - キャスリング
   - アンパッサン
   - ステイルメイト

2. **棋譜機能**

   - KIF/CSA 形式対応
   - 棋譜再生

3. **解析モード**

   - 形勢グラフ
   - 最善手提案

4. **ランキング**
   - レーティングシステム
   - リーダーボード

## 変更履歴

| 日付       | バージョン | 変更内容                                                               |
| ---------- | ---------- | ---------------------------------------------------------------------- |
| 2026-01-19 | 0.3.8      | 成り駒の赤色表示、盤面拡大問題修正                                     |
| 2026-01-19 | 0.3.7      | 駒タイプ別プロモーションゾーン、ボードエディタ改善、王/King 配置制限   |
| 2026-01-18 | 0.3.6      | AuthProvider の race condition 修正                                    |
| 2026-01-18 | 0.3.4      | カスタムボード説明機能、マイボード管理ページ、アカウント設定ページ追加 |
| 2026-01-14 | 0.1.0      | Next.js + Supabase 実装開始                                            |
