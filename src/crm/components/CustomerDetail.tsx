import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Building2, CalendarPlus, ChevronLeft, MessageCircle, MoreHorizontal, Pencil, Phone, Plus } from 'lucide-react'
import { money } from '@/crm/data'
import { useCrm } from '@/crm/crm-context'
import {
  contractAmount,
  dayDiff,
  latestFollowDay,
  newId,
  nextTaskDay,
  opportunityAmount,
  paidTotal,
  parseDay,
  readRecord,
  renewalLabel,
  shanghaiDay,
  subscribeRecords,
  writeRecord,
  type CustomerRecord,
  type DetailChannel,
  type DetailOpportunity,
  type DetailPerson,
} from '@/crm/records'
import type { Customer, CustomerLevel } from '@/crm/types'

type TabId = 'overview' | 'contacts' | 'follows' | 'contracts' | 'deals' | 'analysis' | 'ai'
type Panel = '' | 'edit' | 'follow' | 'task' | 'contact' | 'deal' | 'service'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: '客户概览' },
  { id: 'contacts', label: '联系人信息' },
  { id: 'follows', label: '跟进记录' },
  { id: 'contracts', label: '合同与服务' },
  { id: 'deals', label: '加购商机' },
  { id: 'analysis', label: '客户分析' },
  { id: 'ai', label: 'AI建议' },
]

const CHANNELS: { id: DetailChannel; label: string }[] = [
  { id: 'phone', label: '电话' },
  { id: 'wechat', label: '微信' },
  { id: 'visit', label: '上门拜访' },
  { id: 'meeting', label: '会议' },
  { id: 'mail', label: '邮件' },
]

const STAGES = ['线索', '意向沟通', '方案报价', '商务谈判', '已成交', '已放弃']

export function CustomerDetail({ customerId }: { customerId: string }) {
  const crm = useCrm()
  const customer = crm.customers.find((item) => item.id === customerId)
  const [, setVersion] = useState(0)
  const [tab, setTab] = useState<TabId>('overview')
  const [panel, setPanel] = useState<Panel>('')
  const [followChannel, setFollowChannel] = useState<DetailChannel | ''>('')
  const [contactId, setContactId] = useState<string | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => subscribeRecords(() => setVersion((value) => value + 1)), [])

  if (!customer) {
    return (
      <div className="cd">
        <button type="button" className="cd-back" onClick={crm.closeDetail}><ChevronLeft size={16} /> 返回客户列表</button>
        <p className="mic-note">没有找到这个演示客户。</p>
      </div>
    )
  }

  const record = readRecord(customer)
  const recordId = customer.id
  const today = shanghaiDay()
  const paid = paidTotal(record)
  const contracted = contractAmount(record)
  const addon = opportunityAmount(record)
  const end = primaryEnd(record)
  const remain = end ? dayDiff(today, end) : null
  const lastDay = latestFollowDay(record)
  const sleep = lastDay ? Math.max(0, dayDiff(lastDay, today)) : null
  const nextDay = nextTaskDay(record) || parseDay(customer.nextFollow || '')
  const renewal = renewalLabel(end, today)

  function update(recipe: (current: CustomerRecord) => CustomerRecord) {
    writeRecord(recordId, recipe)
  }

  function openFollow(channel: DetailChannel | '') {
    setFollowChannel(channel)
    setPanel('follow')
    setTab('follows')
    setMoreOpen(false)
  }

  return (
    <div className="cd" data-testid="customer-detail-page">
      <button type="button" className="cd-back" onClick={crm.closeDetail}><ChevronLeft size={16} /> 返回客户列表</button>
      <section className="mic-card cd-head">
        <div className="cd-photo" aria-hidden="true"><Building2 size={28} /></div>
        <div className="cd-ident">
          <div className="cd-title">
            <h1>{record.name}</h1>
            <span className={`cust-level ${customer.level}`}>{levelText(customer.level)}</span>
            <span className={`cust-status ${renewal}`}>{renewal}</span>
          </div>
          <p>主营产品：{record.products || '—'}</p>
          <p>客户编号：{record.code || '—'} · {record.region || '未填写地区'} · {record.trade || '未填写行业'}</p>
          <dl className="cd-facts">
            <div><dt>合作年限</dt><dd>{record.years ? `${record.years}年` : '—'}</dd></div>
            <div><dt>客户来源</dt><dd>{record.source || '—'}</dd></div>
            <div><dt>最近跟进</dt><dd>{lastDay || '没有记录'}</dd></div>
            <div><dt>下次跟进</dt><dd>{nextDay || '未安排'}</dd></div>
          </dl>
        </div>
        <div className="cd-actions">
          <button type="button" onClick={() => { setPanel('edit'); setTab('overview') }}><Pencil size={14} /> 编辑客户</button>
          <button type="button" onClick={() => openFollow('phone')}><Phone size={14} /> 电话联系</button>
          <button type="button" onClick={() => openFollow('wechat')}><MessageCircle size={14} /> 微信联系</button>
          <button type="button" className="mic-primary" onClick={() => openFollow('')}><Plus size={14} /> 新增跟进</button>
          <button type="button" onClick={() => { setPanel('task'); setMoreOpen(false) }}><CalendarPlus size={14} /> 创建任务</button>
          <div className="cust-pop-wrap">
            <button type="button" aria-label="更多操作" onClick={() => setMoreOpen(!moreOpen)}><MoreHorizontal size={16} /></button>
            {moreOpen ? (
              <div className="cust-pop cd-more">
                <button type="button" onClick={() => { void navigator.clipboard?.writeText(record.code); crm.pushToast('客户编号已复制'); setMoreOpen(false) }}>复制客户编号</button>
                <button type="button" onClick={crm.closeDetail}>返回客户列表</button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="cd-metrics" aria-label="经营数据">
        <Metric label="历史累计实付" value={money(paid)} foot={`${record.payments.filter((item) => item.confirmed).length} 笔已确认付款`} />
        <Metric label="当前合同金额" value={contracted ? money(contracted) : '未确认'} foot={contracted ? '按合同记录合计' : '档案里没有合同总额'} />
        <Metric label="合同到期" value={end || '—'} foot={remain === null ? '没有到期日' : remain < 0 ? `已过 ${-remain} 天` : remain === 0 ? '今天到期' : `还有 ${remain} 天`} warn={remain !== null && remain <= 60} />
        <Metric label="续约状态" value={renewal} foot="由到期日和今天计算" />
        <Metric label="加购商机金额" value={money(addon)} foot={`${record.opportunities.filter((item) => !item.closed).length} 个未关闭商机`} />
        <Metric label="沉睡天数" value={sleep === null ? '—' : String(sleep)} foot={lastDay ? `最近沟通 ${lastDay}` : '没有沟通记录，无法计算'} warn={sleep !== null && sleep >= 30} />
      </section>

      <div className="cd-split">
        <div className="mic-card cd-main">
          <div className="cd-tabs" role="tablist">
            {TABS.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'active' : undefined} onClick={() => setTab(item.id)}>{item.label}</button>
            ))}
          </div>
          {panel === 'edit' ? <EditForm customer={customer} record={record} update={update} onClose={() => setPanel('')} /> : null}
          {panel === 'follow' ? <FollowForm customerId={customer.id} initialChannel={followChannel} update={update} onClose={() => setPanel('')} /> : null}
          {panel === 'task' ? <TaskForm update={update} onClose={() => setPanel('')} /> : null}
          {panel === 'contact' ? <ContactForm initial={record.contacts.find((item) => item.id === contactId) ?? null} update={update} onClose={() => setPanel('')} /> : null}
          {panel === 'deal' ? <DealForm update={update} onClose={() => setPanel('')} /> : null}
          {panel === 'service' ? <ServiceForm update={update} onClose={() => setPanel('')} /> : null}

          {tab === 'overview' ? <Overview record={record} update={update} /> : null}
          {tab === 'contacts' ? <Contacts record={record} update={update} onEdit={(person) => { setContactId(person?.id ?? null); setPanel('contact') }} /> : null}
          {tab === 'follows' ? <Follows record={record} /> : null}
          {tab === 'contracts' ? <Contracts record={record} today={today} onAdd={() => setPanel('service')} /> : null}
          {tab === 'deals' ? <Deals record={record} update={update} onAdd={() => setPanel('deal')} /> : null}
          {tab === 'analysis' ? <Analysis record={record} today={today} paid={paid} addon={addon} sleep={sleep} remain={remain} /> : null}
          {tab === 'ai' ? <AiNotice /> : null}
          {record.gapNote ? <p className="mic-note">{record.gapNote}</p> : null}
        </div>
        <aside className="cd-rail">
          <Rail title="联系人">
            {record.contacts.length === 0 ? <p className="mic-note">还没有联系人。</p> : null}
            {record.contacts.map((person) => (
              <div key={person.id} className="cd-rail-row">
                <b>{person.name}</b>
                <span>{person.role}{person.decision ? ' · 决策人' : ''}{person.primary ? ' · 主要联系人' : ''}</span>
                <span>{person.phone || '无电话'}{person.wechat ? ` · 微信 ${person.wechat}` : ''}</span>
              </div>
            ))}
          </Rail>
          <Rail title="跟进任务">
            {record.tasks.length === 0 ? <p className="mic-note">没有待办。创建任务后会出现在这里。</p> : null}
            {record.tasks.map((task) => (
              <label key={task.id} className="cd-task">
                <input type="checkbox" checked={task.done} onChange={() => update((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item) }))} />
                <span><b>{task.at}</b>{task.title}</span>
              </label>
            ))}
          </Rail>
          <Rail title="到期提醒">
            <p>{end ? `${end} · ${renewal}` : '没有合同到期日'}</p>
            {remain !== null ? <p className="mic-note">{remain < 0 ? `已过 ${-remain} 天` : `还有 ${remain} 天`}</p> : null}
          </Rail>
          <Rail title="加购机会">
            {record.opportunities.filter((item) => !item.closed).length === 0 ? <p className="mic-note">没有未关闭商机。</p> : null}
            {record.opportunities.filter((item) => !item.closed).map((item) => (
              <div key={item.id} className="cd-rail-row"><b>{item.name}</b><span>{money(item.amount)} · {item.stage}</span></div>
            ))}
          </Rail>
        </aside>
      </div>
    </div>
  )
}

function primaryEnd(record: CustomerRecord) {
  const ends = record.contracts.map((item) => item.end).filter(Boolean).sort()
  const today = shanghaiDay()
  return ends.find((day) => day >= today) || ends.at(-1) || ''
}

function levelText(level?: CustomerLevel) {
  if (!level) return '未分级'
  return level.endsWith('客户') ? level : `${level}客户`
}

function Metric({ label, value, foot, warn }: { label: string; value: string; foot: string; warn?: boolean }) {
  return (
    <article className="mic-card cd-metric">
      <span>{label}</span>
      <b className={warn ? 'warn' : undefined}>{value}</b>
      <small>{foot}</small>
    </article>
  )
}

function Rail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mic-card cd-rail-card">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Overview({ record, update }: { record: CustomerRecord; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void }) {
  const crm = useCrm()
  const [tag, setTag] = useState('')
  const [tagError, setTagError] = useState('')
  const rows: [string, string][] = [
    ['公司名称', record.name],
    ['英文名称', record.englishName || '—'],
    ['客户编号', record.code || '—'],
    ['统一社会信用代码', record.creditCode || '—'],
    ['公司类型', record.companyType || '—'],
    ['成立时间', record.foundedOn || '—'],
    ['公司规模', record.staffSize || '—'],
    ['所属地区', record.region || '—'],
    ['所属行业', record.trade || '—'],
    ['主营产品', record.products || '—'],
    ['客户来源', record.source || '—'],
    ['公司地址', record.address || '—'],
    ['公司官网', record.website || '—'],
    ['备注', record.remark || '—'],
  ]
  return (
    <div>
      <dl className="cd-grid">
        {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      <div className="cd-tags">
        {record.tags.map((item) => (
          <button key={item} type="button" onClick={() => update((current) => ({ ...current, tags: current.tags.filter((tagName) => tagName !== item) }))}>{item} ×</button>
        ))}
      </div>
      <form className="cd-inline" onSubmit={(event) => {
        event.preventDefault()
        const next = tag.trim()
        if (next.length < 2) return setTagError('标签至少 2 个字')
        update((current) => ({ ...current, tags: current.tags.includes(next) ? current.tags : [...current.tags, next] }))
        setTag('')
        setTagError('')
        crm.pushToast('标签已写入本次演示档案')
      }}>
        <input aria-label="新标签" value={tag} placeholder="添加标签" onChange={(event) => setTag(event.target.value)} />
        <button type="submit" className="mic-primary">添加标签</button>
        {tagError ? <span className="mic-err" role="alert">{tagError}</span> : null}
      </form>
    </div>
  )
}

function Contacts({ record, update, onEdit }: { record: CustomerRecord; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onEdit: (person: DetailPerson | null) => void }) {
  const crm = useCrm()
  return (
    <div>
      <button type="button" className="mic-primary" onClick={() => onEdit(null)}><Plus size={14} /> 新增联系人</button>
      {record.contacts.length === 0 ? <p className="mic-note">设计稿没有给出联系人，可以自己加。保存后只留在这次打开的页面里。</p> : null}
      <div className="cd-people">
        {record.contacts.map((person) => (
          <article key={person.id}>
            <b>{person.name}</b>
            <span>{person.role}</span>
            <span>{person.phone}</span>
            <span>微信 {person.wechat || '—'}</span>
            <span>{person.primary ? '主要联系人' : ''}{person.decision ? ' 决策人' : ''}</span>
            <div>
              <button type="button" onClick={() => onEdit(person)}>编辑</button>
              <button type="button" onClick={() => {
                update((current) => ({ ...current, contacts: current.contacts.filter((item) => item.id !== person.id) }))
                crm.patchCustomer(record.customerId, { contacts: record.contacts.filter((item) => item.id !== person.id) })
                crm.pushToast('联系人已从本次演示档案移除')
              }}>删除</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function Follows({ record }: { record: CustomerRecord }) {
  const crm = useCrm()
  const rows = [...record.follows].sort((a, b) => b.at.localeCompare(a.at))
  return (
    <div className="cd-feed">
      {rows.length === 0 ? <p className="mic-note">还没有跟进。新增后按时间倒序出现在这里。</p> : null}
      {rows.map((item) => (
        <article key={item.id}>
          <header><b>{item.at}</b><span>{CHANNELS.find((channel) => channel.id === item.channel)?.label}</span><span>{item.owner}</span></header>
          <p>{item.content}</p>
          {item.feedback ? <p>客户反馈：{item.feedback}</p> : null}
          {item.nextStep ? <p>下一步：{item.nextStep}</p> : null}
          {item.attachments.map((file) => (
            <button key={file.id} type="button" className="cd-file" onClick={() => crm.pushToast(`「${file.name}」只有设计稿里的文件名，没有真实文件`)}>{file.name} {file.size}</button>
          ))}
        </article>
      ))}
    </div>
  )
}

function Contracts({ record, today, onAdd }: { record: CustomerRecord; today: string; onAdd: () => void }) {
  return (
    <div>
      <button type="button" className="mic-primary" onClick={onAdd}><Plus size={14} /> 添加服务</button>
      {record.contracts.map((item) => {
        const days = item.end ? dayDiff(today, item.end) : null
        return (
          <article key={item.id} className="cd-block">
            <b>{item.name}</b>
            <p>合同金额 {item.amount ? money(item.amount) : '未确认'} · {item.start || '未填写开始'} 至 {item.end || '未填写到期'}</p>
            {days !== null ? <p>{days < 0 ? `已过 ${-days} 天` : `还有 ${days} 天`}</p> : null}
            <p className="mic-note">{item.note}</p>
          </article>
        )
      })}
      {record.services.length === 0 ? <p className="mic-note">还没有单独保存的服务项。精点投、聚焦如果还在谈，放在加购商机里，不写成已经购买的服务。</p> : null}
      {record.services.map((item) => (
        <article key={item.id} className="cd-block">
          <b>{item.name}</b>
          <p>{item.start} 至 {item.end} · {renewalLabel(item.end, today)}</p>
        </article>
      ))}
    </div>
  )
}

function Deals({ record, update, onAdd }: { record: CustomerRecord; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onAdd: () => void }) {
  return (
    <div>
      <button type="button" className="mic-primary" onClick={onAdd}><Plus size={14} /> 新增商机</button>
      {record.opportunities.length === 0 ? <p className="mic-note">没有商机。</p> : null}
      {record.opportunities.map((item) => (
        <article key={item.id} className="cd-block">
          <b>{item.name}</b>
          <p>{money(item.amount)} · 预计 {item.expectOn || '未定'} · {item.closed ? '已关闭' : item.stage}</p>
          {item.feedback ? <p>反馈：{item.feedback}</p> : null}
          <label className="cd-inline">阶段
            <select aria-label={`${item.name}阶段`} value={item.stage} onChange={(event) => update((current) => ({
              ...current,
              opportunities: current.opportunities.map((deal) => deal.id === item.id ? nextStage(deal, event.target.value) : deal),
            }))}>
              {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
            </select>
          </label>
        </article>
      ))}
    </div>
  )
}

function nextStage(deal: DetailOpportunity, stage: string): DetailOpportunity {
  if (stage === '已成交' || stage === '已放弃') return { ...deal, stage, closed: true }
  return { ...deal, stage, closed: false }
}

function Analysis({ record, today, paid, addon, sleep, remain }: { record: CustomerRecord; today: string; paid: number; addon: number; sleep: number | null; remain: number | null }) {
  const recent = record.follows.filter((item) => {
    const day = parseDay(item.at)
    return day && dayDiff(day, today) <= 30 && dayDiff(day, today) >= 0
  }).length
  const rows: [string, string][] = [
    ['历史实付', money(paid)],
    ['已确认付款笔数', String(record.payments.filter((item) => item.confirmed).length)],
    ['近 30 天跟进次数', String(recent)],
    ['沉睡天数', sleep === null ? '无法计算' : `${sleep} 天`],
    ['距到期', remain === null ? '没有到期日' : remain < 0 ? `已过 ${-remain} 天` : `${remain} 天`],
    ['未关闭商机', money(addon)],
    ['联系人', String(record.contacts.length)],
    ['续约状态', renewalLabel(primaryEnd(record), today)],
  ]
  return (
    <dl className="cd-grid">
      {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  )
}

function AiNotice() {
  const crm = useCrm()
  const entries = ['续约沟通话术', '微信回访话术', '精点投加购建议', '客户分析']
  return (
    <div className="cd-ai">
      <b>AI 接口尚未配置</b>
      <p>这里不会生成续约结论、话术或风险判断。下面的入口点开会说明未配置，不会返回假分析。</p>
      {entries.map((label) => (
        <button key={label} type="button" onClick={() => crm.pushToast(`「${label}」还不能用：AI 接口尚未配置`)}>{label}</button>
      ))}
    </div>
  )
}

function EditForm({ customer, record, update, onClose }: { customer: Customer; record: CustomerRecord; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onClose: () => void }) {
  const crm = useCrm()
  const [name, setName] = useState(record.name)
  const [products, setProducts] = useState(record.products)
  const [trade, setTrade] = useState(record.trade)
  const [region, setRegion] = useState(record.region)
  const [source, setSource] = useState(record.source)
  const [website, setWebsite] = useState(record.website)
  const [years, setYears] = useState(String(record.years || ''))
  const [remark, setRemark] = useState(record.remark)
  const [level, setLevel] = useState<CustomerLevel>(customer.level ?? '重要客户')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) return setError('请填写公司名称（至少 2 个字）')
    const yearNumber = Number(years)
    if (years && (Number.isNaN(yearNumber) || yearNumber < 0)) return setError('合作年限需要是数字')
    const next = {
      name: name.trim(),
      products: products.trim(),
      trade: trade.trim(),
      region: region.trim(),
      source: source.trim(),
      website: website.trim(),
      years: years ? yearNumber : 0,
      remark: remark.trim(),
    }
    update((current) => ({ ...current, ...next }))
    const [province, city] = region.trim().split(/\s+/)
    crm.patchCustomer(customer.id, {
      name: next.name,
      productDetail: next.products,
      products: next.products,
      trade: next.trade,
      industry: next.trade || customer.industry,
      province: province || '',
      city: city || '',
      source: next.source,
      website: next.website,
      years: next.years,
      level,
    })
    crm.pushToast('客户资料已写进本次演示档案，刷新页面会回到样本')
    onClose()
  }

  return (
    <form className="cd-form" onSubmit={submit}>
      <input aria-label="公司名称" value={name} onChange={(event) => setName(event.target.value)} />
      <input aria-label="主营产品" value={products} placeholder="主营产品" onChange={(event) => setProducts(event.target.value)} />
      <input aria-label="所属行业" value={trade} placeholder="所属行业" onChange={(event) => setTrade(event.target.value)} />
      <input aria-label="所属地区" value={region} placeholder="省 市" onChange={(event) => setRegion(event.target.value)} />
      <input aria-label="客户来源" value={source} placeholder="客户来源" onChange={(event) => setSource(event.target.value)} />
      <input aria-label="公司官网" value={website} placeholder="公司官网" onChange={(event) => setWebsite(event.target.value)} />
      <input aria-label="合作年限" value={years} placeholder="合作年限" onChange={(event) => setYears(event.target.value)} />
      <select aria-label="客户等级" value={level} onChange={(event) => setLevel(event.target.value as CustomerLevel)}>
        <option>高价值</option><option>重要客户</option><option>潜力客户</option>
      </select>
      <textarea aria-label="备注" value={remark} placeholder="备注" onChange={(event) => setRemark(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <div className="cd-form-actions"><button type="button" onClick={onClose}>取消</button><button type="submit" className="mic-primary">保存</button></div>
    </form>
  )
}

function FollowForm({ customerId, initialChannel, update, onClose }: { customerId: string; initialChannel: DetailChannel | ''; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onClose: () => void }) {
  const crm = useCrm()
  const [channel, setChannel] = useState<DetailChannel | ''>(initialChannel)
  const [at, setAt] = useState('')
  const [content, setContent] = useState('')
  const [feedback, setFeedback] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!channel) return setError('请选择跟进方式')
    if (!at) return setError('请填写跟进时间')
    if (content.trim().length < 4) return setError('请填写跟进内容（至少 4 个字）')
    const stamp = at.replace('T', ' ')
    update((current) => ({
      ...current,
      follows: [{ id: newId('df'), at: stamp, channel, content: content.trim(), feedback: feedback.trim(), nextStep: nextStep.trim(), owner: '张晓丽', attachments: [] }, ...current.follows],
    }))
    crm.saveFollowUp({ customerId, channel, summary: content.trim(), atLabel: stamp.slice(5) })
    onClose()
  }

  return (
    <form className="cd-form" onSubmit={submit}>
      <select aria-label="跟进方式" value={channel} onChange={(event) => setChannel(event.target.value as DetailChannel | '')}>
        <option value="">跟进方式</option>
        {CHANNELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input type="datetime-local" aria-label="跟进时间" value={at} onChange={(event) => setAt(event.target.value)} />
      <textarea aria-label="跟进内容" value={content} placeholder="跟进内容" onChange={(event) => setContent(event.target.value)} />
      <input aria-label="客户反馈" value={feedback} placeholder="客户反馈，可空" onChange={(event) => setFeedback(event.target.value)} />
      <input aria-label="下一步计划" value={nextStep} placeholder="下一步计划，可空" onChange={(event) => setNextStep(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <div className="cd-form-actions"><button type="button" onClick={onClose}>取消</button><button type="submit" className="mic-primary">保存跟进</button></div>
    </form>
  )
}

function TaskForm({ update, onClose }: { update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onClose: () => void }) {
  const crm = useCrm()
  const [title, setTitle] = useState('')
  const [at, setAt] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (title.trim().length < 2) return setError('请填写任务内容（至少 2 个字）')
    if (!at) return setError('请填写任务时间')
    update((current) => ({ ...current, tasks: [...current.tasks, { id: newId('task'), title: title.trim(), at: at.replace('T', ' '), done: false }] }))
    crm.pushToast('跟进任务已加到本次档案的右侧列表，没有写入数据库')
    onClose()
  }
  return (
    <form className="cd-form" onSubmit={submit}>
      <input aria-label="任务内容" value={title} placeholder="下次要做什么" onChange={(event) => setTitle(event.target.value)} />
      <input type="datetime-local" aria-label="任务时间" value={at} onChange={(event) => setAt(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <div className="cd-form-actions"><button type="button" onClick={onClose}>取消</button><button type="submit" className="mic-primary">保存任务</button></div>
    </form>
  )
}

function ContactForm({ initial, update, onClose }: { initial: DetailPerson | null; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onClose: () => void }) {
  const crm = useCrm()
  const [name, setName] = useState(initial?.name ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [wechat, setWechat] = useState(initial?.wechat ?? '')
  const [primary, setPrimary] = useState(Boolean(initial?.primary))
  const [decision, setDecision] = useState(Boolean(initial?.decision))
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2 || role.trim().length < 2 || phone.trim().length < 4) return setError('请填写姓名、职位和手机号')
    const person: DetailPerson = { id: initial?.id ?? newId('ct'), name: name.trim(), role: role.trim(), phone: phone.trim(), wechat: wechat.trim(), primary, decision }
    update((current) => {
      const contacts = initial ? current.contacts.map((item) => item.id === person.id ? person : item) : [...current.contacts, person]
      const next = primary ? contacts.map((item) => ({ ...item, primary: item.id === person.id })) : contacts
      crm.patchCustomer(current.customerId, { contacts: next })
      return { ...current, contacts: next }
    })
    crm.pushToast(initial ? '联系人已更新（本次演示）' : '联系人已加入（本次演示）')
    onClose()
  }
  return (
    <form className="cd-form" onSubmit={submit}>
      <input aria-label="联系人姓名" value={name} placeholder="姓名" onChange={(event) => setName(event.target.value)} />
      <input aria-label="职位" value={role} placeholder="职位" onChange={(event) => setRole(event.target.value)} />
      <input aria-label="手机号" value={phone} placeholder="手机号，可打码" onChange={(event) => setPhone(event.target.value)} />
      <input aria-label="微信" value={wechat} placeholder="微信，可打码" onChange={(event) => setWechat(event.target.value)} />
      <label className="cd-check"><input type="checkbox" checked={primary} onChange={(event) => setPrimary(event.target.checked)} />主要联系人</label>
      <label className="cd-check"><input type="checkbox" checked={decision} onChange={(event) => setDecision(event.target.checked)} />决策人</label>
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <div className="cd-form-actions"><button type="button" onClick={onClose}>取消</button><button type="submit" className="mic-primary">保存联系人</button></div>
    </form>
  )
}

function DealForm({ update, onClose }: { update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onClose: () => void }) {
  const crm = useCrm()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [stage, setStage] = useState('线索')
  const [feedback, setFeedback] = useState('')
  const [expectOn, setExpectOn] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (name.trim().length < 2) return setError('请填写商机名称')
    if (Number.isNaN(value) || value < 0) return setError('预计金额需要是数字')
    update((current) => ({
      ...current,
      opportunities: [...current.opportunities, { id: newId('op'), name: name.trim(), amount: value, stage, feedback: feedback.trim(), expectOn, closed: stage === '已成交' || stage === '已放弃' }],
    }))
    crm.pushToast('商机已加到本次演示档案')
    onClose()
  }
  return (
    <form className="cd-form" onSubmit={submit}>
      <input aria-label="商机名称" value={name} placeholder="例如精点投" onChange={(event) => setName(event.target.value)} />
      <input aria-label="预计金额" value={amount} placeholder="预计金额" onChange={(event) => setAmount(event.target.value)} />
      <select aria-label="商机阶段" value={stage} onChange={(event) => setStage(event.target.value)}>{STAGES.map((item) => <option key={item}>{item}</option>)}</select>
      <input type="date" aria-label="预计成交" value={expectOn} onChange={(event) => setExpectOn(event.target.value)} />
      <textarea aria-label="客户反馈" value={feedback} placeholder="客户反馈" onChange={(event) => setFeedback(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <div className="cd-form-actions"><button type="button" onClick={onClose}>取消</button><button type="submit" className="mic-primary">保存商机</button></div>
    </form>
  )
}

function ServiceForm({ update, onClose }: { update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onClose: () => void }) {
  const crm = useCrm()
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) return setError('请填写服务名称')
    if (!start || !end) return setError('请填写开始和到期日期')
    if (end < start) return setError('到期日不能早于开始日')
    update((current) => ({ ...current, services: [...current.services, { id: newId('svc'), name: name.trim(), start, end }] }))
    crm.pushToast('服务已记入本次演示档案')
    onClose()
  }
  return (
    <form className="cd-form" onSubmit={submit}>
      <input aria-label="服务名称" value={name} placeholder="例如中国制造网会员" onChange={(event) => setName(event.target.value)} />
      <input type="date" aria-label="服务开始" value={start} onChange={(event) => setStart(event.target.value)} />
      <input type="date" aria-label="服务到期" value={end} onChange={(event) => setEnd(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <div className="cd-form-actions"><button type="button" onClick={onClose}>取消</button><button type="submit" className="mic-primary">保存服务</button></div>
    </form>
  )
}
