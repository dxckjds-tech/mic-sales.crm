import { useEffect } from 'react'
import { CrmProvider } from '@/crm/crm-context'
import { Shell } from '@/crm/components/Shell'

export function MicCrmApp() {
  useEffect(() => {
    document.title = 'MIC Sales CRM'
  }, [])

  return (
    <CrmProvider>
      <Shell />
    </CrmProvider>
  )
}
