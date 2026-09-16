import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Lets PWA behaviour be exercised in dev instead of only surfacing at build time.
      devOptions: { enabled: true },

      includeAssets: ['apple-touch-icon.png', 'favicon.svg'],

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],

        // Deliberately empty, and must stay that way. The product promise is that
        // no data leaves the device; every runtime cache rule is a network request
        // by definition. See claude.md > Constraints.
        runtimeCaching: [],

        // The app is fully client-side under a hash router, so any navigation
        // resolves to the precached index.
        navigateFallback: 'index.html',
      },

      manifest: {
        name: 'moneyman',
        short_name: 'moneyman',
        description:
          'Controla tus gastos y tu meta de ahorro. Todo se guarda en tu dispositivo.',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        categories: ['finance', 'productivity'],
        icons: [
          { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icono-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
