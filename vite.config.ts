import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function devImageProxyPlugin(): Plugin {
  return {
    name: 'dev-image-proxy',
    configureServer(server) {
      server.middlewares.use('/api/image-proxy', async (req, res) => {
        try {
          const requestUrl = new URL(req.url ?? '', 'http://localhost')
          const imageUrl = requestUrl.searchParams.get('url')
          if (!imageUrl) {
            res.statusCode = 400
            res.end('Missing url parameter')
            return
          }

          const response = await fetch(imageUrl)
          if (!response.ok) {
            res.statusCode = response.status
            res.end(`Failed to fetch image (${response.status})`)
            return
          }

          const contentType = response.headers.get('content-type')
          if (contentType) {
            res.setHeader('Content-Type', contentType)
          }

          const buffer = Buffer.from(await response.arrayBuffer())
          res.end(buffer)
        } catch {
          res.statusCode = 502
          res.end('Image proxy failed')
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), devImageProxyPlugin()],
  server: {
    proxy: {
      '/api/v2': {
        target: 'https://www.opensymbols.org',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api/v2': {
        target: 'https://www.opensymbols.org',
        changeOrigin: true,
      },
    },
  },
})
