import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy Error] Backend unreachable:', err.message)
            res.writeHead(503, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: 'Backend server is not running on port 4000' }))
          })
        },
      },
      '/images': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy Error] Image proxy failed:', err.message)
          })
        },
      },
    },
  },
})
