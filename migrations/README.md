# データベースマイグレーション

このディレクトリには Supabase データベースのマイグレーション SQL ファイルが含まれています。

## マイグレーション一覧

### MIGRATION_001_INITIAL_SETUP.sql

初期データベーススキーマのセットアップ

- `profiles` テーブル作成
- `rooms` テーブル作成
- `game_states` テーブル作成
- `moves` テーブル作成

### MIGRATION_002_AUTH_AND_BOARDS.sql

認証とカスタムボード機能の追加

- `custom_boards` テーブル作成
- プロフィール自動作成トリガー

### MIGRATION_003_EXTEND_ROOMS.sql

ルーム機能の拡張

- `last_activity_at` カラム追加
- カスタムボードサポート

### MIGRATION_004_ENABLE_RLS.sql

**Row Level Security (RLS) の有効化** ⚠️ セキュリティ重要

- 全テーブルに RLS を有効化
- 適切なセキュリティポリシーを設定

## マイグレーション適用方法

### Supabase Dashboard 経由

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左サイドバーの「SQL Editor」をクリック
4. 「New Query」をクリック
5. マイグレーションファイルの内容をコピー&ペースト
6. 「Run」をクリックして実行

### 推奨: 順番に実行

マイグレーションは番号順に実行してください：

```
MIGRATION_001 → MIGRATION_002 → MIGRATION_003 → MIGRATION_004
```

## セキュリティポリシー概要

### rooms テーブル

- 👁️ **SELECT**: 全員が閲覧可能
- ➕ **INSERT**: 認証済みユーザーのみ
- ✏️ **UPDATE**: プレイヤー本人のみ
- 🗑️ **DELETE**: プレイヤー本人のみ

### game_states テーブル

- 👁️ **SELECT**: 全員が閲覧可能
- ➕ **INSERT**: 認証済みユーザーのみ
- ✏️ **UPDATE**: 認証済みユーザーのみ

### moves テーブル

- 👁️ **SELECT**: 全員が閲覧可能
- ➕ **INSERT**: 認証済みユーザーのみ

### custom_boards テーブル

- 👁️ **SELECT**: 公開ボード or 作成者
- ➕ **INSERT**: 認証済みユーザーのみ
- ✏️ **UPDATE**: 作成者のみ
- 🗑️ **DELETE**: 作成者のみ

### profiles テーブル

- 👁️ **SELECT**: 全員が閲覧可能
- ➕ **INSERT**: 本人のみ
- ✏️ **UPDATE**: 本人のみ

## トラブルシューティング

### RLS 有効化後にデータが見えない場合

ポリシーが正しく設定されているか確認：

```sql
-- ポリシー一覧を確認
SELECT * FROM pg_policies WHERE tablename = 'rooms';
```

### ポリシーエラーが発生する場合

該当テーブルの RLS を一時的に無効化してデバッグ：

```sql
-- 注意: 本番環境では実行しない
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
```

## 注意事項

- ⚠️ マイグレーションは一度のみ実行してください
- ⚠️ 本番環境では必ずバックアップを取ってから実行
- ⚠️ RLS を無効にすると、データが全公開されます
