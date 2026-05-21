import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://mern-estate-main-api-1.onrender.com',
        secure: false,
      },
    },
  },
  plugins: [
    tailwindcss(),
  ],
})