# 通信量削減のための推奨設定

## 現在の状況

ポーリング方式では、10 秒ごとにリクエストが発生します。これでも通信量が気になる場合は、**Supabase Realtime を有効化することを強く推奨します**。

## Supabase Realtime 有効化（推奨）

### メリット

- ポーリング不要（通信量が 95%以上削減）
- 即座にゲーム状態が同期（10 秒待たない）
- より快適なゲーム体験

### 設定方法

1. **Supabase ダッシュボードにアクセス**

   - https://app.supabase.com
   - プロジェクトを選択

2. **Database → SQL Editor**

3. **以下の SQL を実行**:

```sql
-- Realtimeを有効化
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_states;

-- 確認
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

4. **ブラウザをリロード**
   - コンソールに「Rooms table UPDATE event received」が表示されるようになります
   - ポーリングは引き続き動作しますが、Realtime が優先されます

## 設定後の動作

### Realtime 有効時

- 相手が手を指すと**即座**に同期
- ネットワークリクエストは大幅に削減

### Realtime 無効時（現在）

- 10 秒ごとにポーリング
- 相手の手を指してから最大 10 秒後に同期

## その他の選択肢

### ポーリングをさらに遅く（非推奨）

- 15 秒、20 秒も可能ですが、ゲーム体験が悪化します
- Realtime 有効化の方が良い解決策です

### ポーリングを完全に無効化

- `useEffect`のポーリング部分をコメントアウト
- ただし、Realtime なしでは同期されません
