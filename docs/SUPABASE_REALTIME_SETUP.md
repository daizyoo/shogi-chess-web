# Supabase Realtime 設定手順

## 問題

Realtime のサブスクリプションは成功していますが、`rooms`テーブルの UPDATE イベントが受信されていません。

## 原因

Supabase では、デフォルトで Realtime が全てのテーブルで有効になっていません。明示的に有効にする必要があります。

## 解決方法

### 1. Supabase ダッシュボードでの設定

1. **Supabase ダッシュボードにアクセス** → [https://app.supabase.com](https://app.supabase.com)

2. **プロジェクトを選択**

3. **Database** → **Replication** に移動

4. **Source** セクションで以下のテーブルを探して有効化:

   - `rooms` テーブルを見つける
   - トグルスイッチを **ON** にする
   - `game_states` テーブルも同様に **ON** にする

5. **または SQL で有効化**:

   Database → SQL Editor で以下を実行:

   ```sql
   -- roomsテーブルのRealtimeを有効化
   ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

   -- game_statesテーブルのRealtimeを有効化
   ALTER PUBLICATION supabase_realtime ADD TABLE game_states;

   -- 確認
   SELECT schemaname, tablename
   FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```

### 2. 設定後の確認

1. ブラウザでページをリロード
2. 新しいルームを作成
3. 別のタブでルームに参加
4. コンソールで以下のログが表示されることを確認:
   - `Rooms table UPDATE event received:`
   - `Player2 change detected:`
   - `Calling onPlayerJoin callback`
   - `Player joined, reloading room data`

## 代替案: ポーリング方式

Realtime が使えない場合や、より確実な方法として、定期的にルーム状態をポーリングする方式に変更できます。

この方式は次のステップで実装可能です。
