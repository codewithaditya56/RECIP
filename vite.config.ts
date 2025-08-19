import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/RECIP/',  // 👈 VERY important for GitHub Pages
})

