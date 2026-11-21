const QUOTE_URL = 'https://www.stoic-quotes.com/api/quote'
const QUOTE_TIMEOUT_MS = 8_000
const MAX_QUOTE_BYTES = 16_384

function respond(response, status, body) {
  response
    .writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    .end(JSON.stringify(body))
}

function validQuote(data) {
  return (
    data &&
    typeof data.text === 'string' &&
    data.text.trim().length > 0 &&
    data.text.trim().length <= 500 &&
    typeof data.author === 'string' &&
    data.author.trim().length > 0 &&
    data.author.trim().length <= 150
  )
}

function isTimeout(error) {
  return error?.name === 'TimeoutError' || error?.name === 'AbortError'
}

export function createQuoteApi({ fetchImpl = fetch } = {}) {
  async function getQuote(response) {
    let upstream
    try {
      upstream = await fetchImpl(QUOTE_URL, {
        redirect: 'error',
        signal: AbortSignal.timeout(QUOTE_TIMEOUT_MS),
      })
    } catch (error) {
      respond(response, isTimeout(error) ? 504 : 502, { error: 'quote_unavailable' })
      return
    }

    if (!upstream.ok) {
      respond(response, 502, { error: 'quote_unavailable' })
      return
    }

    let data
    try {
      const reader = upstream.body?.getReader()
      if (!reader) throw new Error('empty_response')
      const chunks = []
      let size = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > MAX_QUOTE_BYTES) {
          await reader.cancel()
          throw new Error('response_too_large')
        }
        chunks.push(Buffer.from(value))
      }
      data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      respond(response, 502, { error: 'quote_unavailable' })
      return
    }

    if (!validQuote(data)) {
      respond(response, 502, { error: 'quote_unavailable' })
      return
    }

    respond(response, 200, {
      text: data.text.trim(),
      author: data.author.trim(),
      source: 'https://www.stoic-quotes.com/',
    })
  }

  return async function handle(request, response, pathname) {
    if (pathname === '/api/quote' && request.method === 'GET') {
      await getQuote(response)
      return
    }
    if (pathname === '/api/quote') {
      respond(response, 405, { error: 'method_not_allowed' })
      return
    }
    respond(response, 404, { error: 'not_found' })
  }
}
