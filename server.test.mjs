import assert from 'node:assert/strict'
import { once } from 'node:events'
import { after, test } from 'node:test'

process.env.PORT = '0'
const { server } = await import('./server.mjs')
if (!server.listening) await once(server, 'listening')
const origin = `http://127.0.0.1:${server.address().port}`
after(() => new Promise((resolve) => server.close(resolve)))

test('serves built HTML and hashed assets with security and caching headers', async () => {
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

test('does not expose source, configuration, or unknown paths', async () => {
  for (const path of ['/server.mjs', '/.env', '/package.json', '/staticwebapp.config.json', '/api/quote', '/%2e%2e/package.json']) {
    const response = await fetch(`${origin}${path}`)
    assert.equal(response.status, 404, path)
  }
})

test('HEAD returns no body and unsupported methods are rejected', async () => {
  const head = await fetch(origin, { method: 'HEAD' })
  assert.equal(head.status, 200)
  assert.ok(Number(head.headers.get('content-length')) > 0)
  assert.equal(await head.text(), '')
  const post = await fetch(origin, { method: 'POST' })
  assert.equal(post.status, 405)
  assert.equal(post.headers.get('allow'), 'GET, HEAD')
})
