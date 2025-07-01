// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Observe que 'defineConfig' agora recebe uma função com { command }
export default defineConfig(({ command }) => {
  return {
    plugins: [vue()],
    // A base será '/' para desenvolvimento local (yarn dev)
    // E '/drooly/' para o build de produção (yarn build) para o GitHub Pages
    base: command === 'build' ? '/Drooly/' : '/', // <-- ESTA LINHA É CRUCIAL!
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})