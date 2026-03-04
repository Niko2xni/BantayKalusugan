import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './user_dashboard.css'
import App from './user_dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
