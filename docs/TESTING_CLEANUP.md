# Room Cleanup System - Testing Guide

## Automated Testing Script

このスクリプトを使用して、ルームクリーンアップ機能を自動的にテストできます。

### 使用方法

```bash
cd /Users/daizyoo/Rust/shogi-aho-ai/web
chmod +x test_cleanup.sh
./test_cleanup.sh
```

### スクリプト内容

```bash
#!/bin/bash

echo "========================================="
echo "Room Cleanup System - テスト開始"
echo "========================================="
echo ""

# サーバーが起動しているか確認
echo "1. サーバー接続テスト..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$RESPONSE" != "200" ]; then
  echo "❌ エラー: 開発サーバーが起動していません"
  echo "   'npm run dev' を別のターミナルで実行してください"
  exit 1
fi
echo "✅ サーバー接続成功"
echo ""

# クリーンアップAPIテスト
echo "2. クリーンアップAPIテスト..."
CLEANUP_RESULT=$(curl -s -X POST http://localhost:3000/api/rooms/cleanup)
echo "   レスポンス: $CLEANUP_RESULT"

if echo "$CLEANUP_RESULT" | grep -q "success"; then
  echo "✅ クリーンアップAPI正常動作"
else
  echo "❌ クリーンアップAPIエラー"
  exit 1
fi
echo ""

# ハートビートAPIテスト
echo "3. ハートビートAPIテスト..."
TEST_ROOM_ID="test-room-$(date +%s)"
HEARTBEAT_RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"roomId\":\"$TEST_ROOM_ID\"}" \
  http://localhost:3000/api/rooms/heartbeat)
echo "   レスポンス: $HEARTBEAT_RESULT"

if echo "$HEARTBEAT_RESULT" | grep -q "success"; then
  echo "✅ ハートビートAPI正常動作"
else
  echo "❌ ハートビートAPIエラー"
  exit 1
fi
echo ""

echo "========================================="
echo "✅ すべてのテストが成功しました！"
echo "========================================="
echo ""
echo "次のステップ:"
echo "1. ブラウザで http://localhost:3000 にアクセス"
echo "2. 新しいルームを作成"
echo "3. ブラウザの開発者ツール > Network タブでハートビートリクエストを確認"
echo "4. Supabaseダッシュボードでlast_activity_atが更新されることを確認"
echo ""
```

## 手動テストチェックリスト

### データベース確認

```sql
-- ルームにlast_activity_atカラムが追加されているか確認
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'rooms' AND column_name = 'last_activity_at';

-- インデックスが作成されているか確認
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'rooms' AND indexname = 'idx_rooms_last_activity';

-- 既存ルームのlast_activity_atが設定されているか確認
SELECT id, name, status, last_activity_at
FROM rooms
ORDER BY last_activity_at DESC
LIMIT 5;
```

### フロントエンド確認

- [ ] ルーム作成ページで新規ルームを作成できる
- [ ] ルームに入室できる
- [ ] 開発者ツールの Network タブで 60 秒ごとにハートビートリクエストが送信される
- [ ] ハートビートのレスポンスが`{"success":true}`である
- [ ] ルームから退出してもエラーが発生しない

### バックエンド確認

```bash
# ルーム作成テスト
curl -X POST http://localhost:3000/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","boardType":"shogi","hasHandPieces":true}'

# クリーンアップテスト
curl -X POST http://localhost:3000/api/rooms/cleanup

# ハートビートテスト
curl -X POST http://localhost:3000/api/rooms/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"roomId":"your-room-id-here"}'
```

### エラーハンドリング確認

- [ ] 存在しないルームにアクセスすると「ルームが削除されました」画面が表示される
- [ ] ルームが削除された後に手を指そうとすると適切なエラーメッセージが表示される
- [ ] エラー発生後「トップに戻る」ボタンでトップページに戻れる

## パフォーマンステスト

### 複数ルーム同時テスト

1. 5 つのルームを作成
2. それぞれのルームでゲームを開始
3. クリーンアップ API を実行
4. アクティブなルームが削除されていないことを確認

### 大量ルームクリーンアップテスト

1. 環境変数`ROOM_TIMEOUT_MINUTES=0`に設定（テスト用）
2. 10 個のルームを作成
3. クリーンアップ API を実行
4. すべてのルームが削除されることを確認
5. パフォーマンスが許容範囲内であることを確認（レスポンスタイム < 3 秒）

## 期待される結果

### 正常系

✅ ルーム作成時に`last_activity_at`が自動設定される  
✅ プレイヤー参加時に`last_activity_at`が更新される  
✅ ゲーム中の手ごとに`last_activity_at`が更新される  
✅ ハートビートにより定期的に`last_activity_at`が更新される  
✅ タイムアウトしたルームのみが削除される  
✅ 関連する game_states と moves も一緒に削除される

### 異常系

✅ ルームが削除された場合、ユーザーに適切なエラーが表示される  
✅ 無効な roomId でハートビートを送信してもサーバーエラーにならない  
✅ クリーンアップ中にエラーが発生しても他の処理に影響しない
