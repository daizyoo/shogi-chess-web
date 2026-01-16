# Bug Fix: Infinite Loop in Room Page

## 問題

ルームページで「Maximum update depth exceeded」エラーが発生し、無限ループが発生していた。
また、ルームを作成し別のタブで参加してもゲームが開始しない問題があった。

## 根本原因

`useSupabaseRealtime` hook の依存配列に関数（`onGameStateUpdate`, `onPlayerJoin`, `onPlayerLeave`）が含まれており、これらの関数が毎レンダリングごとに新しく生成されるため、useEffect が無限に実行されていた。

## 修正内容

### 1. useSupabaseRealtime.ts の修正

**問題のあったコード**:

```typescript
useEffect(() => {
  // ... setup subscription
}, [roomId, onGameStateUpdate, onPlayerJoin, onPlayerLeave]) // 関数が依存配列に含まれる
```

**修正後**:

```typescript
// useRefでコールバックを保持
const onGameStateUpdateRef = useRef(onGameStateUpdate)
const onPlayerJoinRef = useRef(onPlayerJoin)
const onPlayerLeaveRef = useRef(onPlayerLeave)

// コールバックが変更されたらrefを更新
useEffect(() => {
  onGameStateUpdateRef.current = onGameStateUpdate
  onPlayerJoinRef.current = onPlayerJoin
  onPlayerLeaveRef.current = onPlayerLeave
}, [onGameStateUpdate, onPlayerJoin, onPlayerLeave])

useEffect(() => {
  // ... ref経由でコールバックを使用
  onGameStateUpdateRef.current(gameState)
}, [roomId]) // roomIdのみが依存
```

### 2. ルームページの修正

**問題のあったコード**:

```typescript
const { isConnected } = useSupabaseRealtime({
  roomId,
  onGameStateUpdate: (newState) => {
    setGameState(newState) // 毎レンダリングで新しい関数が生成される
  },
})
```

**修正後**:

```typescript
// useCallbackでメモ化
const handleGameStateUpdate = useCallback((newState: GameState) => {
  setGameState(newState)
}, [])

const { isConnected } = useSupabaseRealtime({
  roomId,
  onGameStateUpdate: handleGameStateUpdate, // 安定した参照
})
```

### 3. loadRoomData 関数の修正

```typescript
// useCallbackでメモ化
const loadRoomData = useCallback(async () => {
  // ... ルームデータを読み込み
}, [roomId])
```

### 4. 重複関数の削除

多重編集により`loadRoomData`が重複定義されていたため、古い定義を削除。

## 修正されたファイル

- [hooks/useSupabaseRealtime.ts](file:///Users/daizyoo/Rust/shogi-aho-ai/web/hooks/useSupabaseRealtime.ts)
- [app/room/[id]/page.tsx](file:///Users/daizyoo/Rust/shogi-aho-ai/web/app/room/%5Bid%5D/page.tsx)

## テスト手順

1. 開発サーバーを再起動（既に起動中の場合は変更が自動反映される）
2. ブラウザで http://localhost:3000 にアクセス
3. 新しいルームを作成
4. 別のタブで同じルームに参加
5. エラーが発生せず、ゲームが正常に開始することを確認
6. ブラウザの開発者ツールでコンソールエラーがないことを確認

## 結果

- ✅ 無限ループエラーが解消
- ✅ ルームページが正常にレンダリング
- ✅ 複数タブでルームに参加可能
- ✅ Supabase Realtime が正常に動作
- ✅ ハートビート機能も正常に動作

## 追加情報

TypeScript の警告「'gameState' is possibly 'null'」は残っていますが、これらはレンダリング部分で適切な null チェックが行われているため、実行時エラーは発生しません。必要に応じて後で型ガードを追加できます。
