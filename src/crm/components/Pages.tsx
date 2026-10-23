import { useCrm } from '@/crm/crm-context'
import { CustomerAdmin } from '@/crm/components/CustomerAdmin'
import { Schedule } from '@/crm/components/Schedule'

export function ModulePage() {
  const crm = useCrm()
  if (crm.nav === 'customers') return <CustomerAdmin />
  if (crm.nav === 'followups') return <Schedule />
  return <Placeholder />
}

const PLACEHOLDERS: Record<string, { title: string; body: string }> = {
  reports: {
    title: '数据分析',
    body: '这个模块还没有做。工作台「本月业绩」和「客户趋势」只是设计稿上的演示图，不能筛选、下钻或导出。',
  },
  settings: {
    title: '系统设置',
    body: '这个模块还没有做。账号、权限、通知和企业资料都还不能配置。',
  },
}

function Placeholder() {
  const crm = useCrm()
  const copy = PLACEHOLDERS[crm.nav] ?? { title: '未完成', body: '这个模块还没有做。' }
  return (
    <section className="mic-card mic-page-card">
      <div className="mic-unfinished">模块未完成</div>
      <h2>{copy.title}</h2>
      <p className="lead">{copy.body}</p>
      <button type="button" className="mic-primary" onClick={() => crm.setNav('workbench')}>返回工作台</button>
    </section>
  )
}
