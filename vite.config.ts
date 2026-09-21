import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Base du site. Sur GitHub Pages, le frontend est servi sous /<nom-du-repo>/ :
// le workflow .github/workflows/deploy-pages.yml injecte VITE_BASE=/. Ex. : /ligan-frontend/
const base = process.env.VITE_BASE ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // En développement, /api est proxifié vers le backend local.
      // En production, le frontend est un site statique qui utilise VITE_API_URL.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})