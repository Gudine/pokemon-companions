import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    tailwindcss(),
  ],
  build: {
    // For top-level await
    target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
    rollupOptions: {
      external: /\/learnsets-\w+.mjs$/,
      output: { manualChunks(id) {
        if (id.includes("@pkmn")) return "pkmn";
      } },
    }
  },
  base: "/pokemon-companions/",
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      },
    ]
  },
})
