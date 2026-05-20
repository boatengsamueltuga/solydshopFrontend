import React from 'react'

import ReactDOM from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'

import { Provider } from 'react-redux'

import { Toaster } from 'react-hot-toast'

import App from './App'

import './index.css'

import { store } from './app/store'

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>

    <Provider store={store}>

      <BrowserRouter>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111827',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '16px'
            }
          }}
        />

        <App />

      </BrowserRouter>

    </Provider>

  </React.StrictMode>,
)