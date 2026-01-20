'use client'

interface AILevelSelectorProps {
  selectedLevel: number
  onSelect: (level: number) => void
}

const LEVEL_INFO = [
  {
    level: 1,
    name: '初心者',
    description: '非常に弱い（深さ3、機能なし）',
    speed: '⚡ 超高速',
  },
  {
    level: 2,
    name: '入門',
    description: '弱い（深さ3、PST）',
    speed: '⚡ 高速',
  },
  {
    level: 3,
    name: '普通',
    description: '標準（深さ4、PST+TT）',
    speed: '🏃 速い',
    recommended: true,
  },
  {
    level: 4,
    name: '中級',
    description: '強い（深さ4、全機能）',
    speed: '🚶 普通',
  },
  {
    level: 5,
    name: '上級',
    description: 'とても強い（深さ5）',
    speed: '🐢 遅い',
  },
  {
    level: 6,
    name: 'エキスパート',
    description: '最強（深さ6）',
    speed: '🐌 とても遅い',
  },
]

export default function AILevelSelector({ selectedLevel, onSelect }: AILevelSelectorProps) {
  return (
    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
      <h3
        style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: '600',
          marginBottom: 'var(--spacing-md)',
          textAlign: 'center',
        }}
      >
        AIの強さを選択
      </h3>
      <p className="text-muted text-center mb-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
        レベルが高いほど強いですが、考える時間が長くなります
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {LEVEL_INFO.map(({ level, name, description, speed, recommended }) => (
          <div
            key={level}
            onClick={() => onSelect(level)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              border: `2px solid ${selectedLevel === level ? 'var(--color-primary)' : recommended ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background:
                selectedLevel === level
                  ? 'var(--color-primary-light)'
                  : recommended
                    ? 'var(--color-accent-light)'
                    : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (selectedLevel !== level) {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedLevel !== level) {
                e.currentTarget.style.borderColor = recommended
                  ? 'var(--color-accent)'
                  : 'var(--color-border)'
                e.currentTarget.style.transform = 'translateX(0)'
              }
            }}
          >
            <input
              type="radio"
              checked={selectedLevel === level}
              onChange={() => onSelect(level)}
              style={{ cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <strong style={{ fontSize: 'var(--font-size-md)' }}>
                  Level {level}: {name}
                </strong>
                {recommended && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.6rem',
                      background: 'var(--color-accent)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                    }}
                  >
                    おすすめ
                  </span>
                )}
              </div>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-sm)', margin: '0.25rem 0 0 0' }}
              >
                {description}
              </p>
              <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                {speed}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
