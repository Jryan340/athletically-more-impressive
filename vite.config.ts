import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On GitHub Pages the app is served from /<repo>/, so production assets need
// that base path. Dev keeps '/' so localhost works normally.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/athletically-more-impressive/' : '/',
}))
