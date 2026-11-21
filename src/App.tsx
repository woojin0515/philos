import { useEffect, useRef, useState } from 'react'
import { getQuote, translateQuote, type Quote } from './services/quotes'

export default function App() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [translation, setTranslation] = useState('')
  const [translationLoading, setTranslationLoading] = useState(false)
  const [translationError, setTranslationError] = useState(false)
  const requestId = useRef(0)
  const initialRequestStarted = useRef(false)

  async function loadQuote() {
    const request = ++requestId.current
    setQuoteLoading(true)
    setQuoteError('')

    try {
      const nextQuote = await getQuote()
      if (request !== requestId.current) return
      setQuote(nextQuote)
      setTranslation('')
      setTranslationError(false)
      setTranslationLoading(true)

      try {
        const translated = await translateQuote(nextQuote.quoteId)
        if (request === requestId.current) setTranslation(translated)
      } catch {
        if (request === requestId.current) setTranslationError(true)
      } finally {
        if (request === requestId.current) setTranslationLoading(false)
      }
    } catch {
      if (request === requestId.current) setQuoteError('명언을 불러오지 못했습니다. 다시 시도해 주세요.')
    } finally {
      if (request === requestId.current) setQuoteLoading(false)
    }
  }

  async function retryTranslation() {
    if (!quote || translationLoading) return
    const request = requestId.current
    setTranslationLoading(true)
    setTranslationError(false)
    try {
      const translated = await translateQuote(quote.quoteId)
      if (request === requestId.current) setTranslation(translated)
    } catch {
      if (request === requestId.current) setTranslationError(true)
    } finally {
      if (request === requestId.current) setTranslationLoading(false)
    }
  }

  useEffect(() => {
    if (initialRequestStarted.current) return
    initialRequestStarted.current = true
    void loadQuote()
  }, [])

  return (
    <main>
      <p className="eyebrow">PHILOS</p>
      <h1>잠깐 멈추고, 생각하는 시간.</h1>
      <section className="quote" aria-live="polite" aria-busy={quoteLoading || translationLoading}>
        {quote ? (
          <>
            {quoteError && <p className="status" role="status">{quoteError}</p>}
            <blockquote lang="en">{quote.text}</blockquote>
            <p className="author">— {quote.author}</p>
            <p className="translation-label">자동 번역</p>
            <p className="translation" lang="ko">
              {translationLoading
                ? '한국어 해석을 옮기는 중…'
                : translation || (translationError ? '한국어 해석을 불러오지 못했습니다.' : '')}
            </p>
            {translationError && (
              <button className="text-button" onClick={retryTranslation} disabled={translationLoading}>
                다시 번역
              </button>
            )}
            <a className="source" href={quote.source} target="_blank" rel="noreferrer">
              명언 출처
            </a>
          </>
        ) : (
          <p className="status">
            {quoteLoading ? '명언을 불러오는 중…' : quoteError || '명언을 불러오지 못했습니다.'}
          </p>
        )}
      </section>
      <button
        className="quote-button"
        onClick={loadQuote}
        disabled={quoteLoading || translationLoading}
      >
        {translationLoading
          ? '해석하는 중…'
          : quoteLoading
            ? '잠시만 기다려 주세요…'
            : quote
              ? '다른 명언 보기'
              : '다시 시도'}
      </button>
      {translationError && (
        <p className="status" role="status">
          자동 번역이 일시적으로 중단되었습니다.
        </p>
      )}
    </main>
  )
}
