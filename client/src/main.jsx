import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './debug.css'

// Set environment data attribute for CSS
document.body.setAttribute('data-env', import.meta.env.MODE || 'development');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)