import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'
import AuthInitializer from './layouts/AuthInitializer.jsx'
import { SocketProvider } from "./context/SocketContext.jsx";


const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>

      <BrowserRouter>

        <AuthProvider>
          <AuthInitializer>

            <SocketProvider >
              <App />
              <Toaster position='top-right' />
            </SocketProvider>

          </AuthInitializer>
        </AuthProvider>

      </BrowserRouter>

    </QueryClientProvider>
  </StrictMode>,
)