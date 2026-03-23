import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </HelmetProvider>,
)
