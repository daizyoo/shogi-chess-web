# Database Migrations

このディレクトリには、Supabase データベースのマイグレーションファイルが保存されています。

## 実行済みマイグレーション

### MIGRATION_002_AUTH_AND_BOARDS.sql

- **実行日**: 2026-01-17
- **内容**: ユーザー認証とカスタムボード機能の追加
  - `profiles` テーブル作成
  - `custom_boards` テーブル作成
  - RLS（Row Level Security）ポリシーの設定
  - 自動プロファイル作成トリガー

### MIGRATION_003_EXTEND_ROOMS.sql

- **実行日**: 2026-01-17
- **内容**: オンラインルームの拡張
  - `rooms` テーブルに `p1_config` と `p2_config` カラムを追加
  - プレイヤーごとの設定（将棋/チェス、持ち駒の有無）をサポート

## 新しいマイグレーションの追加方法

1. `MIGRATION_XXX_<description>.sql` という名前でファイルを作成
2. Supabase SQL Editor で実行
3. この README を更新して実行記録を追加
