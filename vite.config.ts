import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const config = defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'esnext'
  }
});

export default config;