import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import {persistStore} from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'

const persistor = persistStore(store)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App/>
        </PersistGate>
      </Provider>
      <Toaster/>
    </ErrorBoundary>
  </React.StrictMode>,
)
