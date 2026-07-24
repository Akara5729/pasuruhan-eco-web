import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import aiBackendPlugin from './ai-backend.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), aiBackendPlugin()],
})
