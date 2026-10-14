import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to the Express server during development
      // (PORT is honored so an overridden API port stays consistent)
      '/api': `http://localhost:${process.env.PORT || 5001}`,
    },
  },
})
