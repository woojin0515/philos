export interface Quote {
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
    text: data.text,
    author: data.author,
    source: data.source,
  }
}
