const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});