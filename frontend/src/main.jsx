import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './landing_page.css'
import App from './landing_page.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
