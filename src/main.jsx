import React from 'react'

import ReactDOM from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'

import { Provider } from 'react-redux'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { Toaster } from 'react-hot-toast'

import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

import './index.css'

import { store } from './app/store'

window.history.scrollRestoration = 'manual';
import { solydTheme } from './app/theme'

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>

    <Provider store={store}>

      <BrowserRouter>

        <ThemeProvider theme={solydTheme}>

          <CssBaseline />

          {/* Global toast notifications — themed off the app's design tokens
              so they adapt to light/dark mode and signal severity by color,
              not just icon. */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--surface-high)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--border-strong)',
                borderRadius: 'var(--r-lg)',
                padding: 'var(--space-4)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                boxShadow: 'var(--shadow-2)',
              },
              success: {
                duration: 3000,
                iconTheme: { primary: 'var(--success)', secondary: 'var(--surface-high)' },
                style: { borderLeft: '3px solid var(--success)' },
              },
              error: {
                duration: 4500,
                iconTheme: { primary: 'var(--error)', secondary: 'var(--surface-high)' },
                style: { borderLeft: '3px solid var(--error)' },
              },
            }}
            containerStyle={{ zIndex: 'var(--z-toast)' }}
          />

          <ErrorBoundary>
            <App />
          </ErrorBoundary>

        </ThemeProvider>

      </BrowserRouter>

    </Provider>

  </React.StrictMode>,
)