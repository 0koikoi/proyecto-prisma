import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/proyecto-prisma',
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
