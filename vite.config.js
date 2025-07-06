import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: './build',
    target: "ES2022"
  },
  css: {
    preprocessorOptions : {
      scss: {
        api: "modern",
      }        
    } 
  },
  plugins: [
    topLevelAwait(),
    vue(),
    wasm()
  ],
  server: {
    hmr: false, // Disable hot reload on save
  }
});