-- このSQLをSupabaseダッシュボードのSQL Editorで実行してください

-- 1. last_activity_atカラムが存在するか確認
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'last_activity_at';

-- 2. インデックスが作成されているか確認
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'rooms' AND indexname = 'idx_rooms_last_activity';

-- 3. 現在のルームの状態を確認
SELECT id, name, status, player1_id, player2_id, current_turn, created_at, updated_at, last_activity_at
FROM rooms
ORDER BY created_at DESC
LIMIT 5;

-- 4. もしlast_activity_atが存在しない場合、以下を実行
-- ALTER TABLE rooms ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();
-- UPDATE rooms SET last_activity_at = updated_at WHERE last_activity_at IS NULL;
-- CREATE INDEX idx_rooms_last_activity ON rooms(last_activity_at) WHERE status != 'finished';
