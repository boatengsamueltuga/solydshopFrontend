import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
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
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux':  ['@reduxjs/toolkit', 'react-redux'],
          'vendor-mui':    ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@emotion/react', '@emotion/styled'],
          'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
  },

  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
}))
