import { getRandomTranslatedQuote } from '../src/services/quote-translations.js'

const QUOTE_SOURCE = 'https://www.stoic-quotes.com/'

function respond(response, status, body) {
  response
    .writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    .end(JSON.stringify(body))
}

export function createQuoteApi() {
  return function handle(request, response, pathname) {
    if (pathname === '/api/quote' && request.method === 'GET') {
      const quote = getRandomTranslatedQuote()
      respond(response, 200, {
        text: quote.text,
        author: quote.author,
        source: QUOTE_SOURCE,
      })
      return
    }
    if (pathname === '/api/quote') {
      respond(response, 405, { error: 'method_not_allowed' })
      return
    }
    respond(response, 404, { error: 'not_found' })
  }
}
