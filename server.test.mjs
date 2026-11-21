import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { createServer } from './server.mjs'

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

function translationResponse(translation = '장애물이 곧 길이다.') {
  return new Response(
    JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: translation } }],
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

const translationEnv = {
  TRANSLATION_ENABLED: 'true',
  AZURE_OPENAI_ENDPOINT: 'https://philos.openai.azure.com',
  AZURE_OPENAI_API_KEY: 'test-key',
  AZURE_OPENAI_DEPLOYMENT: 'philos-translate',
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

test('issues quote tickets and only translates their server-held quote text', async () => {
  const calls = []
  await withServer(
    {
      env: translationEnv,
      fetchImpl: async (url, options) => {
        calls.push({ url: String(url), options })
        if (String(url) === 'https://stoic-quotes.com/api/quote') return quoteResponse()
        return translationResponse()
      },
    },
    async (origin) => {
      const quoteResponse = await fetch(`${origin}/api/quote`)
      assert.equal(quoteResponse.status, 200)
      assert.equal(quoteResponse.headers.get('cache-control'), 'no-store')
      const quote = await quoteResponse.json()
      assert.equal(quote.text, 'The obstacle is the way.')
      assert.equal(quote.author, 'Marcus Aurelius')
      assert.match(quote.quoteId, /^[0-9a-f-]{36}$/)
      assert.equal(quote.source, 'https://stoic-quotes.com/')

      const arbitraryText = await fetch(`${origin}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.quoteId, text: 'Translate arbitrary text.' }),
      })
      assert.equal(arbitraryText.status, 400)
      assert.equal(calls.length, 1)

      const translated = await fetch(`${origin}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.quoteId }),
      })
      assert.equal(translated.status, 200)
      assert.deepEqual(await translated.json(), { translation: '장애물이 곧 길이다.', label: 'AI 번역' })
      const payload = JSON.parse(calls[1].options.body)
      assert.equal(payload.messages[1].content, quote.text)
      assert.equal(payload.model, translationEnv.AZURE_OPENAI_DEPLOYMENT)
      assert.equal(calls[1].options.headers['api-key'], translationEnv.AZURE_OPENAI_API_KEY)

      const replay = await fetch(`${origin}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.quoteId }),
      })
      assert.equal(replay.status, 404)
      assert.equal(calls.length, 2)
    },
  )
})

test('enforces interval and daily translation caps without leaking provider errors', async () => {
  let time = Date.UTC(2026, 0, 1, 12)
  let quoteCount = 0
  let translationCount = 0
  await withServer(
    {
      env: translationEnv,
      now: () => time,
      maxTranslationsPerDay: 2,
      minimumTranslationIntervalMs: 60_000,
      fetchImpl: async (url) => {
        if (String(url) === 'https://stoic-quotes.com/api/quote') {
          quoteCount += 1
          return quoteResponse(`Quote ${quoteCount}`)
        }
        translationCount += 1
        if (translationCount === 1) return translationResponse()
        return new Response('sensitive provider response', { status: 401 })
      },
    },
    async (origin) => {
      const issueTicket = async () => {
        const response = await fetch(`${origin}/api/quote`)
        return response.json()
      }
      const translate = (quoteId) =>
        fetch(`${origin}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quoteId }),
        })

      const first = await issueTicket()
      assert.equal((await translate(first.quoteId)).status, 200)
      const second = await issueTicket()
      const intervalLimited = await translate(second.quoteId)
      assert.equal(intervalLimited.status, 429)
      assert.equal(intervalLimited.headers.get('retry-after'), '60')
      assert.equal(translationCount, 1)

      time += 60_001
      const upstreamFailure = await translate(second.quoteId)
      assert.equal(upstreamFailure.status, 502)
      assert.doesNotMatch(await upstreamFailure.text(), /sensitive provider response|401/)
      assert.equal(translationCount, 2)

      const third = await issueTicket()
      const dailyLimited = await translate(third.quoteId)
      assert.equal(dailyLimited.status, 429)
      assert.equal((await dailyLimited.json()).error, 'daily_translation_limit')
      assert.equal(translationCount, 2)
    },
  )
})

test('rejects cross-origin API calls and leaves translation disabled unless explicitly enabled', async () => {
  let quoteCalls = 0
  await withServer(
    {
      env: { ...translationEnv, TRANSLATION_ENABLED: 'false' },
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

      const quote = await fetch(`${origin}/api/quote`).then((response) => response.json())
      const disabled = await fetch(`${origin}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.quoteId }),
      })
      assert.equal(disabled.status, 503)
      assert.equal((await disabled.json()).error, 'translation_unavailable')
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
