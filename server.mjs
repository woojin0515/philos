import { createReadStream } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('./dist/', import.meta.url))
const config = JSON.parse(await readFile(join(root, 'staticwebapp.config.json'), 'utf8'))
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}
const files = new Map()
for (const entry of await readdir(root, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile()) continue
  const path = join(entry.parentPath, entry.name)
  const relative = path.slice(root.length).replaceAll('\\', '/')
  if (relative === 'staticwebapp.config.json') continue
  files.set(`/${relative}`, { path, size: (await stat(path)).size })
}
files.set('/', files.get('/index.html'))

export const server = createServer((request, response) => {
  for (const [name, value] of Object.entries(config.globalHeaders)) {
    response.setHeader(name, value)
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  const file = files.get(request.url.split('?')[0])
  if (!file) {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, {
    'Content-Type': contentTypes[extname(file.path)] ?? 'application/octet-stream',
    'Content-Length': file.size,
    'Cache-Control': request.url.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  })
  if (request.method === 'HEAD') response.end()
  else createReadStream(file.path).pipe(response)
}).listen(Number(process.env.PORT ?? 8080), '0.0.0.0')
