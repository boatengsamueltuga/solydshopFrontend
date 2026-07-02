import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Group large third-party dependencies into stable vendor chunks.
// Vite 8 bundles with rolldown, whose `output.manualChunks` only accepts the
// function form — the object/record form used by Rollup (Vite <=6) is rejected.
const VENDOR_CHUNKS = [
  { name: 'vendor-react',  test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
  { name: 'vendor-redux',  test: /[\\/]node_modules[\\/](@reduxjs[\\/]toolkit|react-redux|redux|redux-thunk|immer|reselect)[\\/]/ },
  { name: 'vendor-mui',    test: /[\\/]node_modules[\\/](@mui[\\/]|@emotion[\\/])/ },
  { name: 'vendor-stripe', test: /[\\/]node_modules[\\/]@stripe[\\/]/ },
]

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const match = VENDOR_CHUNKS.find((c) => c.test.test(id))
          return match ? match.name : undefined
        },
      },
    },
  },
}))
