import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { paaSqliteApiPlugin } from './server/apiPlugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), paaSqliteApiPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
  },
})
