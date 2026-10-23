import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MicCrmApp } from '@/crm/MicCrmApp'
import '@/index.css'
import '@/crm/crm.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MicCrmApp />
  </StrictMode>,
)
