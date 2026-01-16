# Migration: Add Last Activity Tracking

## 概要

ルームの最終アクティビティ時刻を追跡するためのカラムを追加します。

## 適用方法

Supabase ダッシュボードで以下の SQL を実行してください：

### SQL

```sql
-- roomsテーブルにlast_activity_atカラムを追加
ALTER TABLE rooms
ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- 既存のルームに対して、updated_atの値をコピー
UPDATE rooms
SET last_activity_at = updated_at
WHERE last_activity_at IS NULL;

-- インデックスを追加（クリーンアップクエリのパフォーマンス向上）
CREATE INDEX idx_rooms_last_activity
ON rooms(last_activity_at)
WHERE status != 'finished';

-- コメントを追加
COMMENT ON COLUMN rooms.last_activity_at IS 'ルームでの最後のアクティビティ（手の実行、プレイヤー参加など）の時刻';
```

### 確認

マイグレーション後、以下のクエリで確認してください：

```sql
-- カラムが追加されたことを確認
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'rooms' AND column_name = 'last_activity_at';

-- データが正しく設定されているか確認
SELECT id, name, status, created_at, last_activity_at
FROM rooms
LIMIT 5;
```

## ロールバック

万が一問題が発生した場合、以下の SQL でロールバックできます：

```sql
-- インデックスを削除
DROP INDEX IF EXISTS idx_rooms_last_activity;

-- カラムを削除
ALTER TABLE rooms DROP COLUMN IF EXISTS last_activity_at;
```
