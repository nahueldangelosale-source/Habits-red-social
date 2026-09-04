import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Bienestar APP',
        short_name: 'Bienestar',
        description: 'Holistic Wellness OS - Intelligence Driven',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: 'module',
        navigateFallback: 'index.html'
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Fase 13 — Capa 1: Routine API → StaleWhileRevalidate
          // Si el atleta abre la app sin red, el SW sirve la última rutina cacheada.
          // Si hay red, sirve la cacheada y revalida en background.
          {
            urlPattern: /\/api\/v1\/athlete\/routine\/today/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'athlete-routine-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas (TTL aprobado por CTO)
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Sets API: Solo online (las escrituras van por el Outbox IDB)
          {
            urlPattern: /\/api\/v1\/athlete\/sets/,
            handler: 'NetworkOnly'
          }
        ]
      }
    }),
    visualizer({
      filename: 'stats.html',
      template: 'treemap', // sunburst, treemap, network
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy vendor libs get their own chunks
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-charts': ['recharts'],
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk warning threshold (default 500KB is noisy)
    chunkSizeWarningLimit: 600,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/token': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})

