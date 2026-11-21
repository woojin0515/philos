export interface QuoteTranslation {
  translation: string
  label: string
}

export async function translateQuote(quoteId: string): Promise<QuoteTranslation> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteId }),
  })

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('translation_failed')
  }

  if (!response.ok) {
    const code =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'translation_failed'
    throw new Error(code)
  }

  if (
    !data ||
    typeof data !== 'object' ||
    !('translation' in data) ||
    typeof data.translation !== 'string' ||
    !data.translation.trim() ||
    !('label' in data) ||
    typeof data.label !== 'string'
  ) {
    throw new Error('translation_failed')
  }

  return { translation: data.translation.trim(), label: data.label }
}
