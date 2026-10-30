import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: 'src/public-api.tsx',
      formats: ['es'],
      fileName: 'index',
    },
    outDir: 'dist/library',
    emptyOutDir: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
