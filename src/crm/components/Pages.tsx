import { useCrm } from '@/crm/crm-context'
import type { Segment } from '@/crm/types'
import { CustomerAdmin } from '@/crm/components/CustomerAdmin'
import { ChannelIcon, CompanyMark, findCustomer } from '@/crm/components/bits'

export function ModulePage() {
  const crm = useCrm()
  if (crm.nav === 'customers') return <CustomerAdmin />
  if (crm.nav === 'followups') return <FollowModule />
  if (crm.nav === 'reactivate') return <SegmentModule title="客户盘活" segment="沉睡客户" note="只列出设计稿里的沉睡样本。唤醒流程、批量触达和任务分配都还没有做。" />
  if (crm.nav === 'renewal') return <SegmentModule title="续约管理" segment="即将到期" note="只列出设计稿里的到期样本。合同、回款和续约审批都还没有做。工作台上的「含续约与加购」是演示指标。" />
  if (crm.nav === 'addon') return <SegmentModule title="加购商机" segment="加购机会" note="只列出设计稿里的加购样本。报价单、产品方案和赢单流程都还没有做。" />
  return <Placeholder />
}

function FollowModule() {
  const crm = useCrm()
  return (
    <section className="mic-card mic-page-card">
      <div className="mic-unfinished">演示数据</div>
      <h2>跟进管理</h2>
      <p className="lead">新建的跟进会立刻出现在下面，并回到工作台的最近跟进。提醒推送和团队评论还没有做。</p>
      <button type="button" className="mic-primary" onClick={() => crm.openFollowUp()}>新建跟进</button>
      <div className="mic-list" style={{ marginTop: 14 }}>
        {crm.followUps.map((item) => {
          const customer = findCustomer(crm.customers, item.customerId)
          return (
            <button key={item.id} type="button" className="mic-list-row" data-testid={`follow-page-${item.id}`} onClick={() => customer && crm.openCustomer(customer.id)}>
              <ChannelIcon channel={item.channel} />
              <span className="copy">
                <b>{customer?.name ?? '演示客户'}</b>
                <span>{item.atLabel} · {item.summary}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SegmentModule({ title, segment, note }: { title: string; segment: Segment; note: string }) {
  const crm = useCrm()
  const rows = crm.customers.filter((item) => item.segments.includes(segment))
  return (
    <section className="mic-card mic-page-card">
      <div className="mic-unfinished">模块未完成</div>
      <h2>{title}</h2>
      <p className="lead">{note}</p>
      <div className="mic-list">
        {rows.map((item) => (
          <div key={item.id} className="mic-list-row">
            <CompanyMark mark={item.mark} />
            <button type="button" className="copy" onClick={() => crm.openCustomer(item.id)} style={{ border: 0, background: 'transparent', textAlign: 'left', minWidth: 0, flex: 1 }}>
              <b>{item.name}</b>
              <span>剩余 {item.daysLeft} 天 · {item.status}</span>
            </button>
            <button type="button" className="mic-follow-btn" onClick={() => crm.openFollowUp(item.id)}>跟进</button>
          </div>
        ))}
      </div>
    </section>
  )
}

const PLACEHOLDERS: Record<string, { title: string; body: string }> = {
  reports: {
    title: '数据报表',
    body: '这个模块还没有做。工作台「本月业绩」和「客户趋势」只是设计稿上的演示图，不能筛选、下钻或导出。',
  },
  ai: {
    title: 'AI销售助手',
    body: '这个模块还没有做。没有模型、话术生成或客户分析。请不要把页面上的数字当成 AI 结论。',
  },
  team: {
    title: '团队协作',
    body: '这个模块还没有做。没有成员、移交、评论或共享待办。当前只有设计稿里的演示账号张晓丽。',
  },
  files: {
    title: '文件中心',
    body: '这个模块还没有做。没有报价单、合同或附件上传。',
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
