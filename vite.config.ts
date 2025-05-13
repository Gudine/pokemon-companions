import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    tailwindcss(),
    VitePWA({
      manifestFilename: "manifest.json",
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,webp,woff,woff2}'] },
      manifest: {
        name: "Pokémon Companion Tracker",
        short_name: "Poké-Companions",
        description: "App to keep track of important Pokémon through all your playthroughs",
        start_url: "./",
        display: "standalone",
        theme_color: "#372aac",
        background_color: "#e7e5e5",
        icons: [
          {
            src: "icon.png",
            type: "image/png",
            sizes: "512x512"
          },
          {
            src: "icon.svg",
            type: "image/svg+xml",
            sizes: "any"
          }
        ]
      }
    }),
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
