# Supabase セットアップガイド

## 1. Supabase プロジェクトの作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. プロジェクト名を入力（例: `shogi-chess-web`）
4. データベースパスワードを設定（必ず保存）
5. リージョンを選択（Japan 推奨）
6. 「Create new project」をクリック

## 2. データベーステーブルの作成

プロジェクトダッシュボード → SQL Editor → 新しいクエリを作成：

```sql
-- rooms テーブル
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    board_type TEXT NOT NULL,
    has_hand_pieces BOOLEAN DEFAULT false,
    player1_id TEXT,
    player2_id TEXT,
    status TEXT DEFAULT 'waiting',
    current_turn INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- game_states テーブル
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    board JSONB NOT NULL,
    hands JSONB NOT NULL,
    status TEXT DEFAULT 'waiting',
    winner INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- moves テーブル
CREATE TABLE moves (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player INTEGER NOT NULL,
    from_row INTEGER,
    from_col INTEGER,
    to_row INTEGER NOT NULL,
    to_col INTEGER NOT NULL,
    piece_type TEXT NOT NULL,
    promoted BOOLEAN DEFAULT false,
    captured_piece TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- custom_boards テーブル
CREATE TABLE custom_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    board JSONB NOT NULL,
    player1 JSONB NOT NULL,
    player2 JSONB NOT NULL,
    promotion_zones JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_game_states_room_id ON game_states(room_id);
CREATE INDEX idx_moves_room_id ON moves(room_id);
CREATE INDEX idx_custom_boards_user_id ON custom_boards(user_id);
```

クエリを実行（Run をクリック）

## 3. Realtime の有効化

1. ダッシュボード → Database → Replication
2. 以下のテーブルで Realtime を有効化：
   - `rooms`
   - `game_states`
   - `moves`
   - `custom_boards`（オプション：カスタムボード機能使用時）

## 4. Row Level Security (RLS) の設定（オプション）

### 開発中は無効で OK

本番環境では以下のポリシーを設定：

```sql
-- すべてのユーザーが読み取り可能
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow read access to all users" ON game_states FOR SELECT USING (true);
CREATE POLICY "Allow read access to all users" ON moves FOR SELECT USING (true);
CREATE POLICY "Allow read access to all users" ON custom_boards FOR SELECT USING (true);

CREATE POLICY "Allow insert to all" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert to all" ON game_states FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert to all" ON moves FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert to all" ON custom_boards FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to all" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Allow update to all" ON game_states FOR UPDATE USING (true);
CREATE POLICY "Allow users to update own boards" ON custom_boards FOR UPDATE USING (true);
CREATE POLICY "Allow users to delete own boards" ON custom_boards FOR DELETE USING (true);
```

## 5. 環境変数の設定

### プロジェクト URL と API キーを取得

1. ダッシュボード → Settings → API
2. 以下をコピー：
   - Project URL
   - anon/public API key

### ローカル開発

`web/.env.local` を作成：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel デプロイ

Vercel ダッシュボード → Settings → Environment Variables：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. テスト

ローカルで起動：

```bash
cd web
npm run dev
```

http://localhost:3000 にアクセス

1. 「オンライン対戦」をクリック
2. 「新しいルームを作成」
3. 別のブラウザで同じルームに参加
4. 対戦開始！

## トラブルシューティング

### エラー: Missing Supabase environment variables

→ `.env.local`を確認

### エラー: relation "rooms" does not exist

→ SQL クエリを実行してテーブルを作成

### Realtime が動かない

→ Database → Replication でテーブルを有効化

## 制限事項（無料プラン）

- データベース: 500MB
- Realtime 接続: 200 同時接続
- API 呼び出し: 無制限
- 帯域幅: 5GB/月

**通常のゲーム利用には十分です！**
