import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

const coreRoot = fileURLToPath(new URL('./src/core', import.meta.url)).replace(/\\/g, '/')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^\.\.\/\.\.\/core\/(.*)$/,
        replacement: `${coreRoot}/$1`,
      },
      {
        find: /^\.\.\/core\/(.*)$/,
        replacement: `${coreRoot}/$1`,
      },
      {
        find: /^\.\.\/\.\.\/core$/,
        replacement: `${coreRoot}/index.ts`,
      },
      {
        find: /^\.\.\/core$/,
        replacement: `${coreRoot}/index.ts`,
      },
      {
        find: /^react$/,
        replacement: fileURLToPath(new URL('./node_modules/react/index.js', import.meta.url)),
      },
      {
        find: /^react-dom$/,
        replacement: fileURLToPath(new URL('./node_modules/react-dom/index.js', import.meta.url)),
      },
    ],
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
})
