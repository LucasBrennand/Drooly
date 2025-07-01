// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // <-- Add this import!

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: { // <-- Add this section!
    alias: {
      '@': path.resolve(__dirname, './src'), // This tells Vite that '@' means './src'
    },
  },
})