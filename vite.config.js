import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('docxtemplater') || id.includes('pizzip') || id.includes('papaparse')) {
              return 'vendor-docx';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
