import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { createServer } from './server.mjs'
import {
  findQuoteTranslation,
  translatedQuotes,
} from './src/services/quote-translations.js'

async function withServer(run) {
  const server = createServer()
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

test('serves built HTML and hashed assets with security and caching headers', async () => {
  await withServer(async (origin) => {
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
  await withServer(async (origin) => {
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
  await withServer(async (origin) => {
    const head = await fetch(origin, { method: 'HEAD' })
    assert.equal(head.status, 200)
    assert.ok(Number(head.headers.get('content-length')) > 0)
    assert.equal(await head.text(), '')
    const post = await fetch(origin, { method: 'POST' })
    assert.equal(post.status, 405)
    assert.equal(post.headers.get('allow'), 'GET, HEAD')
  })
})

test('serves a translated quote from the local corpus', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/quote`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    const quote = await response.json()
    assert.ok(
      translatedQuotes.some(
        (entry) => entry.text === quote.text && entry.author === quote.author,
      ),
    )
    assert.ok(findQuoteTranslation(quote.text))
    assert.equal('quoteId' in quote, false)
    assert.equal(quote.source, 'https://www.stoic-quotes.com/')

    const removedTranslator = await fetch(`${origin}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    assert.equal(removedTranslator.status, 404)
  })
})

test('contains 100 distinct quotes with a static Korean translation for each', () => {
  assert.equal(translatedQuotes.length, 100)
  const normalizedTexts = translatedQuotes.map(({ text }) =>
    text
      .normalize('NFKC')
      .toLocaleLowerCase('en-US')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim(),
  )
  assert.equal(new Set(normalizedTexts).size, 100)
  for (const quote of translatedQuotes) {
    assert.ok(quote.translation.trim())
    assert.equal(findQuoteTranslation(quote.text), quote.translation)
  }
})

test('looks up translations regardless of case, punctuation, and whitespace', () => {
  const { text, translation } = translatedQuotes[0]
  const normalizedText = text
    .toLocaleUpperCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
  assert.equal(findQuoteTranslation(normalizedText), translation)
  assert.equal(findQuoteTranslation('A quote without a reviewed translation.'), null)
})

test('keeps replacement quote translations aligned with their source text', () => {
  assert.equal(
    findQuoteTranslation(
      'Nowhere you can go is more peaceful—more free of interruptions—than your own soul.',
    ),
    '네 영혼보다 더 평온하고 방해받지 않는 곳은 어디에도 없다.',
  )
})

test('rejects cross-origin quote requests', async () => {
  await withServer(async (origin) => {
    const crossOrigin = await fetch(`${origin}/api/quote`, {
      headers: { Origin: 'https://untrusted.example' },
    })
    assert.equal(crossOrigin.status, 403)

    const quote = await fetch(`${origin}/api/quote`)
    assert.equal(quote.status, 200)
  })
})
