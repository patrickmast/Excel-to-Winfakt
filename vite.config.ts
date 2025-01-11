export default {
  plugins: [
    require('@vitejs/plugin-react-swc')()
  ],
  build: {
    outDir: 'dist'
  }
}