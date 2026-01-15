# Vercel デプロイガイド（Supabase Realtime 版）

## 概要

このプロジェクトは Supabase Realtime を使用しているため、Vercel で完全にデプロイできます。
従来の Socket.io サーバーは不要です。

## アーキテクチャ

```
┌─────────────────────────┐
│   Vercel                │
│   (Next.js Frontend     │
│    + API Routes)        │
└──────────┬──────────────┘
           │ HTTP/WebSocket
           ↓
┌─────────────────────────┐
│   Supabase              │
│   (Database + Realtime) │
└─────────────────────────┘
```

## デプロイ手順

### 1. Supabase プロジェクトの準備

[SUPABASE_SETUP.md](./SUPABASE_SETUP.md) に従って Supabase プロジェクトを作成してください。

**必要な情報:**

- Project URL
- Anon Key

### 2. Vercel CLI のインストール

```bash
npm i -g vercel
```

### 3. Vercel にログイン

```bash
vercel login
```

ブラウザが開き、認証を求められます。

### 4. プロジェクトをデプロイ

```bash
cd web
vercel
```

初回デプロイ時の質問：

```
? Set up and deploy? [Y/n] Y
? Which scope? Your Account
? Link to existing project? [y/N] N
? What's your project's name? shogi-chess-web
? In which directory is your code located? ./
```

### 5. 環境変数を設定

#### 方法 1: Vercel CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 値を入力: https://your-project.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 値を入力: your-anon-key
```

#### 方法 2: Vercel ダッシュボード

1. https://vercel.com/dashboard にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables
4. 以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
```

**重要**: 環境変数は全環境（Production, Preview, Development）で設定してください。

### 6. 本番デプロイ

```bash
vercel --prod
```

デプロイが完了すると、URL が表示されます：

```
https://shogi-chess-web.vercel.app
```

## 継続的デプロイ (CI/CD)

### GitHub と連携

1. **GitHub リポジトリにプッシュ**

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Vercel ダッシュボードでリポジトリを接続**

- Vercel Dashboard → Add New Project
- Import Git Repository
- リポジトリを選択
- Root Directory: `web` を指定
- Environment Variables を設定
- Deploy

3. **自動デプロイ**

以降、`main`ブランチにプッシュするたびに自動デプロイされます。

## カスタムドメイン

### 独自ドメインの設定

1. Vercel Dashboard → プロジェクト → Settings → Domains
2. ドメインを追加
3. DNS レコードを設定（Vercel が指示）

**例:**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## デプロイ後の確認

### 1. 動作確認

デプロイ後、以下を確認：

- ✅ トップページが表示される
- ✅ ローカル対戦が動作する
- ✅ AI 対戦が動作する
- ✅ オンライン対戦ルーム一覧が表示される
- ✅ ルーム作成ができる
- ✅ リアルタイム通信が動作する

### 2. ログの確認

Vercel Dashboard → プロジェクト → Logs

エラーがないか確認してください。

### 3. パフォーマンス確認

Vercel Dashboard → プロジェクト → Analytics

- ページロード時間
- API レスポンス時間
- エラー率

## トラブルシューティング

### エラー: Missing environment variables

**原因**: 環境変数が設定されていない

**解決策**:

```bash
vercel env ls  # 環境変数を確認
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod  # 再デプロイ
```

### エラー: Failed to compile

**原因**: TypeScript エラー

**解決策**:

```bash
# ローカルでビルドテスト
npm run build

# エラーを修正してから再デプロイ
git add .
git commit -m "Fix build errors"
git push
```

### Realtime が接続できない

**原因**:

- Supabase の設定が不完全
- CORS エラー

**解決策**:

1. Supabase Dashboard → Database → Replication でテーブルを有効化
2. Supabase Dashboard → Settings → API → CORS で Vercel ドメインを追加

### API ルートがエラーを返す

**原因**: 環境変数が正しく設定されていない

**解決策**:

1. Vercel Logs でエラーメッセージを確認
2. 環境変数を再設定
3. 再デプロイ

## パフォーマンス最適化

### Edge Functions (Optional)

API Routes を高速化：

`pages/api/rooms/list.ts` の先頭に追加：

```typescript
export const config = {
  runtime: "edge",
}
```

**注意**: Edge Runtime は一部の Node.js API をサポートしていません。

### 画像最適化

Next.js Image Component を使用：

```tsx
import Image from "next/image"

;<Image src="/assets/logo.png" width={300} height={300} alt="Logo" />
```

### ISR (Incremental Static Regeneration)

静的ページのキャッシュ：

```typescript
export const revalidate = 60 // 60秒ごとに再生成
```

## コスト

### Vercel 無料枠

- **帯域幅**: 100GB/月
- **Serverless Function 実行**: 100GB-Hrs
- **Edge Function 実行**: 500K invocations
- **プロジェクト数**: 無制限

→ 個人プロジェクトには十分！

### Supabase 無料枠

- **データベース**: 500MB
- **Realtime 接続**: 200 同時接続
- **API 呼び出し**: 無制限
- **帯域幅**: 5GB/月

→ 小規模〜中規模には十分！

## セキュリティ

### 環境変数の保護

- `.env.local`は`.gitignore`に追加済み
- Vercel 環境変数は暗号化されて保存
- `NEXT_PUBLIC_`プレフィックスの変数のみクライアントに公開

### Supabase RLS (Row Level Security)

本番環境では推奨：

```sql
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON rooms
  FOR ALL USING (true);
```

詳細は [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#row-level-security-rls-の設定オプション) を参照。

## モニタリング

### Vercel Analytics

有効化：

```bash
npm install @vercel/analytics
```

`app/layout.tsx`:

```typescript
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Sentry (エラートラッキング)

Optional:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## まとめ

Vercel へのデプロイは非常にシンプルです：

1. ✅ Supabase プロジェクト作成
2. ✅ `vercel`コマンド実行
3. ✅ 環境変数設定
4. ✅ 完了！

サーバーレス構成により、運用コストを最小限に抑えつつ、スケーラブルなアプリケーションが実現できます。
