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
  base: '/myenergi-ecosystem-builder-v2/',
  plugins: [react(), stubOptionalDeps],
  optimizeDeps: {
    exclude: ['jspdf'],
  },
  build: {
    outDir: 'docs',
    rollupOptions: {
      external: ["canvg", "dompurify"],
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
