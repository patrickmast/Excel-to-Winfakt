import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from "lovable-tagger";
import { lastModifiedPlugin } from './src/plugins/lastModifiedPlugin';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: [
      'localhost', 
      '127.0.0.1',
      '*.replit.dev',
      '*.repl.co',
      'ed283830-3aad-4490-a326-01ef0401e16d-00-3ackej8lp5xd9.janeway.replit.dev'
    ],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'development' && lastModifiedPlugin(),
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
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
}));