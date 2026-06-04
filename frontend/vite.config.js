import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const backendUrl = 'http://localhost:4000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      open: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('[Vite Proxy Error] Backend unreachable:', err.message)
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: 'Backend server is not running' }))
            })
          },
        },
        '/images': {
          target: backendUrl,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('[Vite Proxy Error] Image proxy failed:', err.message)
            })
          },
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  }
})
