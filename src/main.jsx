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
import { solydTheme } from './app/theme'

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>

    <Provider store={store}>

      <BrowserRouter>

        <ThemeProvider theme={solydTheme}>

          <CssBaseline />

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 2000,
              style: {
                background: '#111827',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '16px'
              }
            }}
          />

          <ErrorBoundary>
            <App />
          </ErrorBoundary>

        </ThemeProvider>

      </BrowserRouter>

    </Provider>

  </React.StrictMode>,
)