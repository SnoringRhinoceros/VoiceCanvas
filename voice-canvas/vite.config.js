import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // or wherever dev-server.js runs
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
