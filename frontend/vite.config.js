import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.1.13:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://192.168.1.13:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  }
})

