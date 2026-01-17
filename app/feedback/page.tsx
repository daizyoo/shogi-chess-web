'use client'

import { useRouter } from 'next/navigation'

export default function FeedbackPage() {
  const router = useRouter()

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', marginBottom: 'var(--spacing-lg)' }}>
        📝 フィードバック
      </h1>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          ご意見・ご要望をお聞かせください
        </h2>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
          バグ報告、機能要望、改善提案など、どんなフィードバックでも歓迎します！<br />
          GitHub Issuesを通じてご報告ください。
        </p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          🐛 バグを報告する
        </h3>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
          アプリの動作に問題がありましたか？以下の情報を含めて報告してください：
        </p>
        <ul className="text-muted" style={{ marginLeft: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
          <li>発生した問題の詳細</li>
          <li>問題を再現する手順</li>
          <li>期待していた動作</li>
          <li>実際に起きた動作</li>
          <li>スクリーンショット（可能であれば）</li>
        </ul>
        <a
          href="https://github.com/daizyoo/shogi-chess-web/issues/new?labels=bug&template=bug_report.md"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          バグを報告する →
        </a>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          💡 機能要望を提案する
        </h3>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
          こんな機能があったらいいな、という提案をお待ちしています！
        </p>
        <ul className="text-muted" style={{ marginLeft: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
          <li>どんな機能が欲しいか</li>
          <li>どんな場面で使いたいか</li>
          <li>その機能によってどう改善されるか</li>
        </ul>
        <a
          href="https://github.com/daizyoo/shogi-chess-web/issues/new?labels=enhancement&template=feature_request.md"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          機能要望を提案する →
        </a>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          💬 その他のフィードバック
        </h3>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
          質問、改善提案、感想など、何でもお気軽にどうぞ！
        </p>
        <a
          href="https://github.com/daizyoo/shogi-chess-web/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          フィードバックを送る →
        </a>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--color-surface-variant)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          📚 参考: 既存のIssueを確認
        </h3>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
          同じ問題や要望が既に報告されているかもしれません。<br />
          既存のIssueをチェックしてみてください。
        </p>
        <a
          href="https://github.com/daizyoo/shogi-chess-web/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          既存のIssueを見る →
        </a>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          トップに戻る
        </button>
      </div>
    </main>
  )
}
