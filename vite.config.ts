import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
  },
  esbuild: {
    // This will prevent TypeScript from trying to generate declaration files
    // during development, which is causing the TS6305 errors
    tsconfigRaw: {
      compilerOptions: {
        declaration: false,
      },
    },
  },
}));