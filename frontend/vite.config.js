import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Use parent dir for .env files when running locally (Docker),
// but fall back to default (cwd) for Render / CI builds.
const parentEnv = resolve(__dirname, '..')
const useParentEnv = existsSync(resolve(parentEnv, '.env'))

export default defineConfig({
  envDir: useParentEnv ? parentEnv : undefined,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
