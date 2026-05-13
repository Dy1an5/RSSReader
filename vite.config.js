import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function corsProxyPlugin() {
  return {
    name: 'cors-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/cors-proxy')) return next()

        const targetUrl = new URL(req.url, 'http://localhost').searchParams.get('url')
        if (!targetUrl) {
          res.statusCode = 400
          res.end('Missing url parameter')
          return
        }

        try {
          const upstream = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'RSSReader/1.0',
              'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
            }
          })
          if (!upstream.ok) {
            res.statusCode = upstream.status
            res.end(`Upstream error: ${upstream.status}`)
            return
          }
          const body = await upstream.text()
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/xml')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(body)
        } catch (err) {
          res.statusCode = 502
          res.end(`Proxy error: ${err.message}`)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), corsProxyPlugin()]
})
