import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/timers/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ['s5cma.preview.codesignalusercontent-staging.com'],
  },
})
