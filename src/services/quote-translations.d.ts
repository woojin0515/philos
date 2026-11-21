export interface TranslatedQuote {
  text: string
  author: string
  translation: string
}

export const translatedQuotes: TranslatedQuote[]
export function findQuoteTranslation(quoteText: string): string | null
export function getRandomTranslatedQuote(): TranslatedQuote
