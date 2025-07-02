// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Observe que 'defineConfig' agora recebe uma função com { command }
export default defineConfig(({ command }) => {
  return {
    plugins: [vue()],
    base: command === 'build' ? '/Drooly/' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})