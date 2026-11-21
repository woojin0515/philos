import { useState } from 'react'
import { getQuote, type Quote } from './services/quotes'

export default function App() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function revealQuote() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      setQuote(await getQuote())
    } catch {
      setError('문장을 불러오지 못했어요. 잠시 후 다시 눌러주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`page${quote ? ' page--revealed' : ''}`}>
      <section className="experience" aria-label="오늘의 철학 명언">
        <div className={`quote-scene${quote ? ' quote-scene--revealed' : ''}`}>
          <div className="ambient-glass ambient-glass--back" aria-hidden="true" />
          <div className="ambient-glass ambient-glass--front" aria-hidden="true" />

          {quote ? (
            <div className="quote-content" aria-live="polite">
              <blockquote lang="en">{quote.text}</blockquote>
              <p className="author">{quote.author}</p>
            </div>
          ) : (
            <div className="home-card">
              <header className="card-header">
                <span className="brand-mark" aria-hidden="true">✳</span>
                <div className="card-heading">
                  <span className="wordmark">PHILOS</span>
                  <p className="prompt">생각해보기</p>
                </div>
                <span className="card-corner" aria-hidden="true">↗</span>
              </header>

              <div className="quote-spectrum" aria-hidden="true">
                <span className="spectrum-point" />
                <span className="spectrum-point spectrum-point--bright" />
                <span className="spectrum-point" />
              </div>

              <button
                className="start-button"
                onClick={revealQuote}
                disabled={loading}
                aria-busy={loading}
              >
                <span className="button-icon" aria-hidden="true">
                  {loading ? <span className="spinner" /> : <span>→</span>}
                </span>
                <span>{loading ? '잠시만요' : '한 문장 만나기'}</span>
                <span className="button-more" aria-hidden="true">•••</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="status" role="status">
            {error}
          </p>
        )}

        {quote && (
          <div className="quote-actions">
            <a className="source-link" href={quote.source} target="_blank" rel="noreferrer">
              STOIC QUOTES <span aria-hidden="true">↗</span>
            </a>
            <button className="another-button" onClick={revealQuote} disabled={loading}>
              {loading ? '다른 문장을 찾는 중…' : '다른 문장 만나기'}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
