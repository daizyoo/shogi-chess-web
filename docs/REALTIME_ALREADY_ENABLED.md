# Supabase Realtime 既に有効

## エラーメッセージ

```
ERROR: 42710: relation "rooms" is already member of publication "supabase_realtime"
```

## 良いニュース

このエラーは、Supabase Realtime が**既に有効になっている**ことを意味します！追加の設定は不要です。

## なぜ Realtime が動作していないのか

Realtime は有効なのに、以前のログで「Rooms table UPDATE event received」が表示されていませんでした。

### 可能性のある原因

1. **Realtime のフィルター条件が厳しすぎる**
2. **イベントが発生していない**（実際には UPDATE されていない）
3. **ブラウザのコネクションの問題**

### 次のステップ

1. ブラウザを完全リロード（Cmd+Shift+R または Ctrl+Shift+R）
2. 新しいルームを作成
3. 別のタブでルームに参加
4. コンソールで以下のログを確認:
   - `Realtime subscription status: SUBSCRIBED`
   - `Rooms table UPDATE event received:` ← これが表示されるはず
   - `Player2 change detected:` ← player2 参加時
   - `Polling: Turn changed` ← これは 10 秒後のフォールバック

### 期待される動作

- **Realtime が機能する場合**: player2 参加時に即座に「Rooms table UPDATE event received」
- **Realtime が機能しない場合**: 10 秒後にポーリングが検出

両方のタブのコンソールログをすべて共有していただければ、問題を特定できます。
