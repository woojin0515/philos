import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { createServer } from './server.mjs'
import { findQuoteTranslation } from './src/services/quote-translations.js'

async function withServer(options, run) {
  const server = createServer(options)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`
  try {
    await run(origin)
  } finally {
    server.closeAllConnections()
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    )
  }
}

function quoteResponse(text = 'The obstacle is the way.', author = 'Marcus Aurelius') {
  return new Response(JSON.stringify({ text, author }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

test('serves built HTML and hashed assets with security and caching headers', async () => {
  await withServer({}, async (origin) => {
    const response = await fetch(origin)
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.match(response.headers.get('content-security-policy'), /default-src 'self'/)
    assert.equal(response.headers.get('cache-control'), 'no-cache')
    const html = await response.text()
    assert.match(html, /<title>Philos<\/title>/)
    const asset = html.match(/src="([^"]+\.js)"/)[1]
    const script = await fetch(`${origin}${asset}`)
    assert.equal(script.status, 200)
    assert.match(script.headers.get('content-type'), /javascript/)
    assert.match(script.headers.get('cache-control'), /immutable/)
  })
})

test('does not expose source, configuration, or unknown paths', async () => {
  await withServer({}, async (origin) => {
    for (const path of [
      '/server.mjs',
      '/.env',
      '/package.json',
      '/staticwebapp.config.json',
      '/%2e%2e/package.json',
      '/api/unknown',
    ]) {
      const response = await fetch(`${origin}${path}`)
      assert.equal(response.status, 404, path)
    }
  })
})

test('HEAD returns no body and unsupported methods are rejected', async () => {
  await withServer({}, async (origin) => {
    const head = await fetch(origin, { method: 'HEAD' })
    assert.equal(head.status, 200)
    assert.ok(Number(head.headers.get('content-length')) > 0)
    assert.equal(await head.text(), '')
    const post = await fetch(origin, { method: 'POST' })
    assert.equal(post.status, 405)
    assert.equal(post.headers.get('allow'), 'GET, HEAD')
  })
})

test('returns a validated quote without issuing a translation ticket or calling an LLM', async () => {
  const calls = []
  await withServer(
    {
      fetchImpl: async (url) => {
        calls.push(String(url))
        return quoteResponse()
      },
    },
    async (origin) => {
      const quoteResponse = await fetch(`${origin}/api/quote`)
      assert.equal(quoteResponse.status, 200)
      assert.equal(quoteResponse.headers.get('cache-control'), 'no-store')
      const quote = await quoteResponse.json()
      assert.equal(quote.text, 'The obstacle is the way.')
      assert.equal(quote.author, 'Marcus Aurelius')
      assert.equal('quoteId' in quote, false)
      assert.equal(quote.source, 'https://www.stoic-quotes.com/')

      const removedTranslator = await fetch(`${origin}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      assert.equal(removedTranslator.status, 404)
      assert.equal(calls.length, 1)
      assert.deepEqual(calls, ['https://www.stoic-quotes.com/api/quote'])
    },
  )
})

test('looks up curated translations regardless of case, punctuation, and whitespace', () => {
  const translation = '우리가 지금 하는 일은 영원에 메아리친다.'
  assert.equal(findQuoteTranslation('What we do now echoes in eternity.'), translation)
  assert.equal(findQuoteTranslation('  WHAT   WE DO NOW ECHOES IN ETERNITY!  '), translation)
  assert.equal(findQuoteTranslation('A quote without a reviewed translation.'), null)
})

test('rejects cross-origin quote requests', async () => {
  let quoteCalls = 0
  await withServer(
    {
      fetchImpl: async () => {
        quoteCalls += 1
        return quoteResponse()
      },
    },
    async (origin) => {
      const crossOrigin = await fetch(`${origin}/api/quote`, {
        headers: { Origin: 'https://untrusted.example' },
      })
      assert.equal(crossOrigin.status, 403)
      assert.equal(quoteCalls, 0)

      const quote = await fetch(`${origin}/api/quote`)
      assert.equal(quote.status, 200)
      assert.equal(quoteCalls, 1)
    },
  )
})

test('rejects invalid quote-provider responses', async () => {
  await withServer(
    { fetchImpl: async () => quoteResponse('', 'Unknown') },
    async (origin) => {
      const response = await fetch(`${origin}/api/quote`)
      assert.equal(response.status, 502)
      assert.deepEqual(await response.json(), { error: 'quote_unavailable' })
    },
  )
})
