# コミットメッセージガイドライン

このドキュメントは、プロジェクトでのコミットメッセージの書き方を統一するためのガイドラインです。

## 📝 基本フォーマット

```
<type>: <subject>

<body>
```

### 必須項目

- **type**: 変更の種類（下記参照）
- **subject**: 変更内容の簡潔な説明（50 文字以内推奨）

### オプション項目

- **body**: 詳細な説明（必要な場合）

## 🏷️ Type（変更の種類）

コミットの先頭には、以下の type を必ず付けてください：

| Type         | 説明                                                       | 例                                                       |
| ------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| **feat**     | 新機能の追加                                               | `feat: Add AI difficulty selection`                      |
| **fix**      | バグ修正                                                   | `fix: Resolve piece movement validation error`           |
| **docs**     | ドキュメントのみの変更                                     | `docs: Update README with setup instructions`            |
| **style**    | コードの意味に影響しない変更（フォーマット、セミコロン等） | `style: Format code with prettier`                       |
| **refactor** | リファクタリング（機能追加でもバグ修正でもない）           | `refactor: Extract move validation into helper function` |
| **perf**     | パフォーマンス改善                                         | `perf: Optimize board evaluation algorithm`              |
| **test**     | テストの追加・修正                                         | `test: Add unit tests for chess piece movements`         |
| **chore**    | ビルド処理・補助ツールの変更                               | `chore: Update dependencies`                             |
| **change**   | 既存機能の変更・削除                                       | `change: Remove unused room creation button`             |

## ✍️ Subject（件名）の書き方

### ✅ Good Examples

```
feat: Add CLI argument support for selfplay mode
fix: Correct promotion zone detection for chess pieces
docs: Add comprehensive README.md
refactor: Simplify AI evaluation function
```

### ❌ Bad Examples

```
update files                    # typeがない、具体性がない
Fix bug                          # 何のバグか不明
Added new feature to the game   # 過去形を使わない、具体性がない
```

### ルール

1. **動詞は現在形・命令形**を使う（"Added"ではなく"Add"）
2. **最初の文字は大文字**にする
3. **文末にピリオド不要**
4. **具体的に**書く（"Fix bug"ではなく"Fix piece capture validation"）
5. **日本語でも英語でも OK**（プロジェクト内で統一すれば良い）

## 📄 Body（本文）の書き方

複雑な変更の場合、本文で詳細を説明します：

```
feat: Add CLI argument support for selfplay mode

- Added selfplay subcommand parsing
- Support flags: --num-games, --board, --ai1-strength, --ai2-strength
- Support execution modes: --parallel [N], --sequential
- Added --help flag with usage examples
```

### ルール

1. **何を変更したか**を箇条書きで説明
2. **なぜ変更したか**を説明（必要な場合）
3. **破壊的変更**がある場合は明記

## 🌟 実例集

### 新機能追加

```
feat: Add web interface using Next.js

- Implemented room creation and joining
- Added real-time game synchronization with Supabase
- Created responsive UI with modern design
```

### バグ修正

```
fix: Resolve Git LFS file size error on push

- Removed large .h5 training data files from Git history
- Updated .gitignore to exclude models/ directory
- Fixed repository size from 52MB to 25MB
```

### ドキュメント

```
docs: Organize web documentation into web/docs directory

- Moved 5 web documentation files to web/docs/
  - ASSETS_GUIDE.md
  - DEPLOYMENT.md
  - README.md
  - SUPABASE_SETUP.md
  - WEB_STRUCTURE.md
```

### リファクタリング

```
refactor: Extract board initialization logic

- Created separate BoardFactory class
- Simplified main game loop
- Improved code readability and testability
```

### 変更・削除

```
change: Remove unused room creation button

- Removed non-functional "ルームを作成" button
- Cleaned up unused useState import
- Simplified page layout
```

## 🚫 避けるべきコミット

### ❌ 悪い例

```
update
fix
WIP
test commit
asdf
修正
```

### なぜダメか

- 何を変更したか不明
- 後から履歴を追いづらい
- チーム開発で混乱を招く
- コードレビューが困難

## 💡 Tips

### 1. 小さく分割する

1 つのコミットに複数の変更を含めない：

```
# ❌ 悪い例
feat: Add AI and fix bugs and update docs

# ✅ 良い例（3つのコミットに分割）
feat: Add AI difficulty selection
fix: Resolve piece movement bug
docs: Update AI configuration guide
```

### 2. コミット前に確認

```bash
# 変更内容を確認
git diff

# ステージングエリアを確認
git status

# コミット履歴を確認
git log --oneline -5
```

### 3. エディタを使う

長いメッセージはエディタを使って書く：

```bash
git commit -a    # エディタが開く
```

## 🔗 関連リソース

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

## ❓ FAQ

### Q: 日本語と英語、どちらを使うべき？

A: プロジェクト内で統一されていればどちらでも OK です。このプロジェクトでは両方使われています。

### Q: 複数のファイルを変更した場合は？

A: 変更が関連している場合は 1 つのコミット、関連していない場合は複数のコミットに分けてください。

### Q: typo 修正もコミットメッセージが必要？

A: はい。`fix: Correct typo in README`のように明確に書いてください。

### Q: 緊急のホットフィックスは？

A: 通常通り`fix:`を使い、本文で緊急性を明記してください。

---

**作成日**: 2026-01-15  
**最終更新**: 2026-01-15
