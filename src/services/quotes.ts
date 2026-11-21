export interface Quote {
  quoteId: string
  text: string
  author: string
  source: string
}

export async function getQuote(): Promise<Quote> {
  const response = await fetch('/api/quote')
  if (!response.ok) throw new Error('명언을 불러오지 못했습니다.')

  const data: unknown = await response.json()
  if (
    !data ||
    typeof data !== 'object' ||
    !('quoteId' in data) ||
    typeof data.quoteId !== 'string' ||
    !('text' in data) ||
    typeof data.text !== 'string' ||
    !data.text.trim() ||
    !('author' in data) ||
    typeof data.author !== 'string' ||
    !data.author.trim() ||
    !('source' in data) ||
    typeof data.source !== 'string'
  ) {
    throw new Error('명언 응답을 확인할 수 없습니다.')
  }
  return {
    quoteId: data.quoteId,
    text: data.text,
    author: data.author,
    source: data.source,
  }
}

export async function translateQuote(quoteId: string): Promise<string> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteId }),
  })
  if (!response.ok) throw new Error('한국어 해석을 불러오지 못했습니다.')

  const data: unknown = await response.json()
  if (
    !data ||
    typeof data !== 'object' ||
    !('translation' in data) ||
    typeof data.translation !== 'string' ||
    !data.translation.trim()
  ) {
    throw new Error('한국어 해석 응답을 확인할 수 없습니다.')
  }
  return data.translation
}
