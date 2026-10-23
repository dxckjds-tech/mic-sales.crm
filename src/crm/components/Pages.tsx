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
  reactivate: { title: '客户盘活', body: '这个模块还没有做。沉睡客户唤醒与盘活任务尚未接入。' },
  renewal: { title: '续约管理', body: '这个模块还没有做。到期续约看板与续约任务尚未接入。' },
  addon: { title: '加购商机', body: '这个模块还没有做。加购漏斗与商机跟进尚未接入。' },
  reports: {
    title: '数据报表',
    body: '这个模块还没有做。工作台「本月业绩」和「客户趋势」只是设计稿上的演示图，不能筛选、下钻或导出。',
  },
  ai: { title: 'AI销售助手', body: '这个模块还没有做。对话式助手与建议推送尚未接入。' },
  files: { title: '文件中心', body: '这个模块还没有做。合同与跟进附件库尚未接入。' },
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
