import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/proyecto-prisma/',
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/proyecto-prisma/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proyecto-prisma/, ''),
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: /^es-toolkit\/compat\/isEqual(\.m?js)?$/,
        replacement: path.resolve(__dirname, 'src/shared/utils/esToolkitIsEqual.js'),
      },
    ],
  },
})
