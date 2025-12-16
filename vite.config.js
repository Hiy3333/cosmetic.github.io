import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 배포 환경에 따라 base 경로 설정
  // Vercel: '/' (루트)
  // GitHub Pages: '/cosmetic.github.io/'
  base: process.env.VERCEL ? '/' : '/cosmetic.github.io/',
})
