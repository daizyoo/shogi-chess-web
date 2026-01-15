# Git Flow ワークフローガイド

このプロジェクトでは **Git Flow** を採用しています。このドキュメントでは、Git Flow の基本から実践的な使い方まで、誰でも理解できるように説明します。

## 📚 目次

1. [Git Flow とは？](#git-flowとは)
2. [ブランチ構成](#ブランチ構成)
3. [基本的なワークフロー](#基本的なワークフロー)
4. [実践ガイド](#実践ガイド)
5. [コマンドリファレンス](#コマンドリファレンス)
6. [トラブルシューティング](#トラブルシューティング)

---

## 🌊 Git Flow とは？

Git Flow は、Git を使った開発フローの標準的な手法です。ブランチを役割ごとに分けることで、**安定した開発**と**スムーズなリリース**を実現します。

### なぜ Git Flow を使うのか？

- ✅ **main ブランチは常に安定**（本番環境と同じ状態）
- ✅ **複数の機能を並行開発**できる
- ✅ **緊急のバグ修正**に素早く対応できる
- ✅ **チーム開発**がスムーズになる

---

## 🌳 ブランチ構成

Git Flow では、以下の 5 種類のブランチを使います：

```
main          ← 本番環境（リリース済みコード）
  ↑
  └─ hotfix/* ← 緊急バグ修正
  ↑
develop       ← 開発環境（次のリリース準備）
  ↑
  ├─ feature/* ← 新機能開発
  └─ release/* ← リリース準備
```

### 1. **main** ブランチ（永続）

- **役割**: 本番環境のコード
- **ルール**:
  - 直接コミット禁止
  - `develop`または`hotfix`からのみマージ
  - 常に動作する状態を保つ

### 2. **develop** ブランチ（永続）

- **役割**: 開発の中心ブランチ
- **ルール**:
  - 直接コミット禁止
  - `feature`ブランチからマージ
  - 次のリリース候補

### 3. **feature/** ブランチ（一時的）

- **役割**: 新機能の開発
- **命名**: `feature/機能名`
- **例**: `feature/add-ai-difficulty`, `feature/web-ui-redesign`
- **ライフサイクル**:
  - `develop`から分岐
  - 開発完了後、`develop`にマージ
  - マージ後は削除

### 4. **release/** ブランチ（一時的）

- **役割**: リリース準備（バグ修正、ドキュメント更新）
- **命名**: `release/バージョン番号`
- **例**: `release/v1.0.0`, `release/v1.1.0`
- **ライフサイクル**:
  - `develop`から分岐
  - `main`と`develop`の両方にマージ
  - マージ後は削除

### 5. **hotfix/** ブランチ（一時的）

- **役割**: 本番環境の緊急バグ修正
- **命名**: `hotfix/バグ名`
- **例**: `hotfix/fix-critical-crash`, `hotfix/security-patch`
- **ライフサイクル**:
  - `main`から分岐
  - `main`と`develop`の両方にマージ
  - マージ後は削除

---

## 🔄 基本的なワークフロー

### 日常的な開発フロー

```
1. developから新しいfeatureブランチを作成
   ↓
2. 機能を開発・コミット
   ↓
3. developにマージ
   ↓
4. featureブランチを削除
```

### リリースフロー

```
1. developからreleaseブランチを作成
   ↓
2. バグ修正・ドキュメント更新
   ↓
3. mainとdevelopにマージ
   ↓
4. mainにタグを付ける（v1.0.0など）
   ↓
5. releaseブランチを削除
```

### 緊急修正フロー

```
1. mainからhotfixブランチを作成
   ↓
2. バグを修正
   ↓
3. mainとdevelopにマージ
   ↓
4. mainにタグを付ける
   ↓
5. hotfixブランチを削除
```

---

## 💻 実践ガイド

### 初期セットアップ

```bash
# 現在のmainブランチからdevelopを作成
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop

# ローカルのdevelopを最新に保つ
git checkout develop
git pull origin develop
```

### ケース 1: 新機能を開発する

#### Step 1: feature ブランチを作成

```bash
# developから最新を取得
git checkout develop
git pull origin develop

# 新しいfeatureブランチを作成
git checkout -b feature/add-online-multiplayer
```

#### Step 2: 開発・コミット

```bash
# ファイルを編集
# ...

# 変更を確認
git status
git diff

# コミット
git add .
git commit -m "feat: Add room creation API"

# 複数回コミット可能
git add .
git commit -m "feat: Add room joining logic"
```

#### Step 3: develop にマージ

```bash
# developを最新に更新
git checkout develop
git pull origin develop

# featureブランチをマージ
git merge feature/add-online-multiplayer

# コンフリクトがあれば解決
# ...

# プッシュ
git push origin develop

# featureブランチを削除
git branch -d feature/add-online-multiplayer
```

### ケース 2: リリースする

#### Step 1: release ブランチを作成

```bash
# developから最新を取得
git checkout develop
git pull origin develop

# releaseブランチを作成
git checkout -b release/v1.0.0
```

#### Step 2: リリース準備

```bash
# バージョン番号を更新
# Cargo.toml, package.json などを編集

git add .
git commit -m "chore: Bump version to 1.0.0"

# 最終テスト・バグ修正
git add .
git commit -m "fix: Resolve last-minute bug"
```

#### Step 3: main と develop にマージ

```bash
# mainにマージ
git checkout main
git pull origin main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# developにもマージ（バグ修正を反映）
git checkout develop
git pull origin develop
git merge release/v1.0.0
git push origin develop

# releaseブランチを削除
git branch -d release/v1.0.0
```

### ケース 3: 緊急バグ修正

#### Step 1: hotfix ブランチを作成

```bash
# mainから最新を取得
git checkout main
git pull origin main

# hotfixブランチを作成
git checkout -b hotfix/fix-critical-crash
```

#### Step 2: バグ修正

```bash
# バグを修正
# ...

git add .
git commit -m "fix: Resolve critical crash on startup"
```

#### Step 3: main と develop にマージ

```bash
# mainにマージ
git checkout main
git merge hotfix/fix-critical-crash
git tag -a v1.0.1 -m "Hotfix: Critical crash fix"
git push origin main --tags

# developにもマージ
git checkout develop
git merge hotfix/fix-critical-crash
git push origin develop

# hotfixブランチを削除
git branch -d hotfix/fix-critical-crash
```

---

## 📖 コマンドリファレンス

### ブランチ作成・切り替え

```bash
# ブランチ作成
git checkout -b ブランチ名

# ブランチ切り替え
git checkout ブランチ名

# ブランチ一覧
git branch -a

# リモートブランチを取得
git fetch origin
git checkout -b feature/xxx origin/feature/xxx
```

### マージ

```bash
# 現在のブランチに別のブランチをマージ
git merge ブランチ名

# マージをキャンセル（コンフリクト時）
git merge --abort
```

### ブランチ削除

```bash
# ローカルブランチを削除
git branch -d ブランチ名

# 強制削除（マージしていない変更がある場合）
git branch -D ブランチ名

# リモートブランチを削除
git push origin --delete ブランチ名
```

### タグ

```bash
# タグを作成
git tag -a v1.0.0 -m "Release version 1.0.0"

# タグをプッシュ
git push origin v1.0.0

# すべてのタグをプッシュ
git push origin --tags

# タグ一覧
git tag -l
```

### 状態確認

```bash
# 現在のブランチと変更状態
git status

# コミット履歴
git log --oneline --graph --all

# リモートブランチの状態
git remote show origin
```

---

## 🔧 トラブルシューティング

### Q1: コンフリクトが発生した

```bash
# マージ時にコンフリクトが発生
git merge feature/xxx
# CONFLICT (content): Merge conflict in file.txt

# 1. コンフリクトファイルを手動で編集
# <<<<<<< HEAD
# =======
# >>>>>>> feature/xxx
# の部分を解決

# 2. 解決したファイルをステージング
git add file.txt

# 3. マージを完了
git commit -m "Merge feature/xxx into develop"
```

### Q2: 間違ったブランチにコミットした

```bash
# 例: developに直接コミットしてしまった

# 1. コミットを取り消す（変更は保持）
git reset --soft HEAD~1

# 2. 正しいブランチを作成
git checkout -b feature/correct-branch

# 3. 再度コミット
git add .
git commit -m "feat: Correct commit"
```

### Q3: feature ブランチが古くなった

```bash
# developの最新変更をfeatureブランチに取り込む

# 方法1: マージ
git checkout feature/xxx
git merge develop

# 方法2: リベース（履歴がきれいになる）
git checkout feature/xxx
git rebase develop
```

### Q4: プッシュ前に間違いに気づいた

```bash
# 最後のコミットを修正
git commit --amend

# 複数のコミットを修正
git rebase -i HEAD~3
```

### Q5: ブランチ名を間違えた

```bash
# ブランチ名を変更
git branch -m 古い名前 新しい名前

# リモートにプッシュ済みの場合
git push origin :古い名前 新しい名前
git push origin -u 新しい名前
```

---

## 📋 チェックリスト

### 新機能開発時

- [ ] `develop`から最新を取得
- [ ] `feature/機能名`ブランチを作成
- [ ] 機能を開発・テスト
- [ ] コミットメッセージは[ガイドライン](./COMMIT_GUIDELINES.md)に従う
- [ ] `develop`にマージ
- [ ] feature ブランチを削除

### リリース時

- [ ] `develop`から`release/vX.X.X`を作成
- [ ] バージョン番号を更新
- [ ] 最終テスト・バグ修正
- [ ] `main`にマージ
- [ ] タグを作成（`vX.X.X`）
- [ ] `develop`にもマージ
- [ ] release ブランチを削除

### 緊急修正時

- [ ] `main`から`hotfix/バグ名`を作成
- [ ] バグを修正・テスト
- [ ] `main`にマージ
- [ ] タグを作成（`vX.X.X`）
- [ ] `develop`にもマージ
- [ ] hotfix ブランチを削除

---

## 🎯 ベストプラクティス

### 1. ブランチは小さく保つ

- 1 つの feature ブランチ = 1 つの機能
- 大きな機能は複数の feature に分割

### 2. こまめにコミット

```bash
# 悪い例: 1日の終わりに1回だけコミット
git commit -m "今日の作業"

# 良い例: 意味のある単位でコミット
git commit -m "feat: Add room creation API"
git commit -m "feat: Add room validation logic"
git commit -m "test: Add room creation tests"
```

### 3. develop を最新に保つ

```bash
# 作業開始前に必ず実行
git checkout develop
git pull origin develop
```

### 4. マージ前にテスト

```bash
# featureブランチでテスト
cargo test
npm run test

# 動作確認
cargo run --release
npm run dev
```

### 5. ブランチ名は分かりやすく

```bash
# ✅ 良い例
feature/add-ai-difficulty
feature/web-ui-redesign
hotfix/fix-piece-movement-bug

# ❌ 悪い例
feature/update
feature/fix
feature/test123
```

---

## 🔗 関連ドキュメント

- [コミットメッセージガイドライン](./COMMIT_GUIDELINES.md)
- [Git Flow 公式ドキュメント](https://nvie.com/posts/a-successful-git-branching-model/)
- [Atlassian Git Flow チュートリアル](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

## 📝 まとめ

| ブランチ    | 用途         | 分岐元    | マージ先          |
| ----------- | ------------ | --------- | ----------------- |
| `main`      | 本番環境     | -         | -                 |
| `develop`   | 開発環境     | `main`    | `main`            |
| `feature/*` | 新機能開発   | `develop` | `develop`         |
| `release/*` | リリース準備 | `develop` | `main`, `develop` |
| `hotfix/*`  | 緊急バグ修正 | `main`    | `main`, `develop` |

**重要**:

- `main`と`develop`には直接コミットしない
- 作業は必ず専用ブランチで行う
- マージ後は不要なブランチを削除する

---

**作成日**: 2026-01-15  
**最終更新**: 2026-01-15  
**バージョン**: 1.0.0
