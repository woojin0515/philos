const translations = new Map([
  ['the obstacle is the way', '장애물이 곧 길이다.'],
  ['what we do now echoes in eternity', '우리가 지금 하는 일은 영원에 메아리친다.'],
])

/**
 * @param {string} quoteText
 * @returns {string | null}
 */
export function findQuoteTranslation(quoteText) {
  const key = quoteText
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

  return translations.get(key) ?? null
}
