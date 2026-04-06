import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const stubOptionalDeps = {
  name: 'stub-optional-deps',
  resolveId(id) {
    if (id === 'canvg' || id === 'dompurify') return '\0' + id;
  },
  load(id) {
    if (id === '\0canvg' || id === '\0dompurify') return 'export default {}';
  },
};

export default defineConfig({
  plugins: [react(), stubOptionalDeps],
  optimizeDeps: {
    exclude: ['jspdf'],
  },
  build: {
    rollupOptions: {
      external: ["canvg", "dompurify"],
    },
  },
})
