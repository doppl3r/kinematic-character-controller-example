import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: './build'
  },
  css: {
    preprocessorOptions : {
      scss: {
        api: "modern",
      }        
    } 
  },
  plugins: [
    vue(),
    wasm()
  ],
  server: {
    hmr: false, // Disable hot reload on save
  }
});