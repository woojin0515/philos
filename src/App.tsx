import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { getQuote, type Quote } from './services/quotes'
import { translateQuote } from './services/translation'

export default function App() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [translation, setTranslation] = useState('')
  const [translationLoading, setTranslationLoading] = useState(false)
  const [translationError, setTranslationError] = useState('')
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const swipeStart = useRef<{ pointerId: number; x: number; progress: number; travel: number } | null>(null)
  const activeQuoteId = useRef<string | null>(null)
  const translationRequest = useRef(0)

  async function loadTranslation(quoteId: string) {
    const requestId = ++translationRequest.current
    setTranslationLoading(true)
    setTranslationError('')
    try {
      const result = await translateQuote(quoteId)
      if (requestId === translationRequest.current && activeQuoteId.current === quoteId) {
        setTranslation(result.translation)
      }
    } catch (translationFailure) {
      if (requestId === translationRequest.current && activeQuoteId.current === quoteId) {
        const code = translationFailure instanceof Error ? translationFailure.message : ''
        if (code === 'daily_translation_limit') {
          setTranslationError('오늘의 번역 한도에 도달했어요. 영어 명언은 계속 볼 수 있어요.')
        } else if (code === 'translation_rate_limit' || code === 'translation_busy') {
          setTranslationError('번역을 잠시 기다리고 있어요. 잠시 후 다시 시도해 주세요.')
        } else {
          setTranslationError('번역을 불러오지 못했어요. 영어 명언은 그대로 볼 수 있어요.')
        }
      }
    } finally {
      if (requestId === translationRequest.current && activeQuoteId.current === quoteId) {
        setTranslationLoading(false)
      }
    }
  }

  async function revealQuote() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const nextQuote = await getQuote()
      activeQuoteId.current = nextQuote.quoteId
      setQuote(nextQuote)
      setTranslation('')
      setTranslationError('')
      void loadTranslation(nextQuote.quoteId)
    } catch {
      setError('문장을 불러오지 못했어요. 잠시 후 다시 눌러주세요.')
    } finally {
      setLoading(false)
    }
  }

  function handleSwipeStart(event: PointerEvent<HTMLDivElement>) {
    if (loading) return
    if (!(event.target instanceof Element) || !event.target.closest('.swipe-handle')) return
    const handleWidth = event.currentTarget.querySelector('.swipe-handle')?.clientWidth ?? 0

    swipeStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      progress: swipeProgress,
      travel: Math.max(1, event.currentTarget.clientWidth - handleWidth),
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  function handleSwipeMove(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current
    if (!start || start.pointerId !== event.pointerId) return
    const nextProgress = Math.max(0, Math.min(1, start.progress + (event.clientX - start.x) / start.travel))
    setSwipeProgress(nextProgress)
  }

  function handleSwipeEnd(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current
    if (!start || start.pointerId !== event.pointerId) return
    const finalProgress = Math.max(0, Math.min(1, start.progress + (event.clientX - start.x) / start.travel))
    swipeStart.current = null
    setIsDragging(false)
    if (finalProgress >= 0.82) {
      setSwipeProgress(0)
      void revealQuote()
    } else {
      setSwipeProgress(0)
    }
  }

  function handleSwipeCancel() {
    swipeStart.current = null
    setIsDragging(false)
    setSwipeProgress(0)
  }

  function handleSwipeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (loading) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void revealQuote()
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setSwipeProgress(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setSwipeProgress(0)
      void revealQuote()
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const nextProgress = Math.max(0, Math.min(1, swipeProgress + (event.key === 'ArrowRight' ? 0.2 : -0.2)))
      setSwipeProgress(nextProgress)
      if (nextProgress >= 0.82) {
        setSwipeProgress(0)
        void revealQuote()
      }
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
              <div className="translation-block" aria-live="polite">
                {translationLoading && (
                  <p className="translation-status" role="status">
                    아직 번역본을 생성하지 못했어요.
                  </p>
                )}
                {translation && (
                  <div className="translation-content">
                    <p className="translation-label">한국어 · AI 번역</p>
                    <p className="korean-translation" lang="ko">{translation}</p>
                  </div>
                )}
                {translationError && (
                  <div className="translation-error" role="status">
                    <p>{translationError}</p>
                    <button
                      className="translation-retry"
                      onClick={() => void loadTranslation(quote.quoteId)}
                      disabled={translationLoading}
                    >
                      다시 번역
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="home-card">
              <header className="card-header">
                <span className="brand-mark" aria-hidden="true">✳</span>
                <div className="card-heading">
                  <span className="wordmark">PHILOS</span>
                  <p className="prompt">생각해보기</p>
                  <p className="card-description">철학자의 명언을 영어와 한국어로 만나보세요.</p>
                </div>
                <span className="card-corner" aria-hidden="true">↗</span>
              </header>

              <div className="quote-spectrum" aria-hidden="true">
                <span className="spectrum-point" />
                <span className="spectrum-point spectrum-point--bright" />
                <span className="spectrum-point" />
              </div>

              <div
                className="start-button"
                role="slider"
                tabIndex={0}
                aria-label="밀어서 오늘의 문장 보기"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(swipeProgress * 100)}
                aria-valuetext={
                  loading
                    ? '문장을 불러오는 중'
                    : swipeProgress > 0
                      ? `${Math.round(swipeProgress * 100)}퍼센트, 오른쪽으로 밀어 오늘의 문장 보기`
                      : '오른쪽으로 밀어 오늘의 문장 보기'
                }
                aria-disabled={loading}
                onPointerDown={handleSwipeStart}
                onPointerMove={handleSwipeMove}
                onPointerUp={handleSwipeEnd}
                onPointerCancel={handleSwipeCancel}
                onLostPointerCapture={handleSwipeCancel}
                onKeyDown={handleSwipeKeyDown}
                data-dragging={isDragging}
                data-loading={loading}
              >
                <span className="swipe-fill" style={{ width: `${swipeProgress * 100}%` }} aria-hidden="true" />
                <span className="swipe-label">{loading ? '문장을 불러오는 중' : '밀어서 명언 보기'}</span>
                <span
                  className="swipe-handle"
                  style={{
                    left: `${swipeProgress * 100}%`,
                    transform: `translate(-${swipeProgress * 100}%, -50%)`,
                  }}
                  aria-hidden="true"
                >
                  {loading ? <span className="spinner" /> : <span>→</span>}
                </span>
              </div>
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
