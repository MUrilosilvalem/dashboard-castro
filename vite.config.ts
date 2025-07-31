import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/dashboard-castro/', // muito importante para GitHub Pages
  plugins: [react()],
})
