import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Copy,
  FileText,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Users,
  Wallet,
} from 'lucide-react'
import building from '@/assets/crm/hero-building.png'
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
  { id: 'contracts', label: '合同服务' },
  { id: 'deals', label: '加购商机' },
  { id: 'analysis', label: '客户分析' },
  { id: 'ai', label: 'AI建议' },
]

const CHANNELS: { id: DetailChannel; label: string }[] = [
  { id: 'phone', label: '电话沟通' },
  { id: 'wechat', label: '微信沟通' },
  { id: 'visit', label: '拜访' },
  { id: 'meeting', label: '会议' },
  { id: 'mail', label: '邮件沟通' },
]

const STAGES = ['线索', '意向沟通', '方案报价', '商务谈判', '已成交', '已放弃']

/** 详情设计稿演示快照日，用于「还有 32 天」等文案 */
const DETAIL_TODAY = '2026-08-22'

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
  const today = customerId === 'youlaite' ? DETAIL_TODAY : shanghaiDay()
  const paid = paidTotal(record)
  const contracted = contractAmount(record)
  const end = primaryEnd(record)
  const start = record.contracts[0]?.start || ''
  const remain = end ? dayDiff(today, end) : null
  const lastDay = latestFollowDay(record) || (customerId === 'youlaite' ? '2026-10-22' : '')
  const sleep = customerId === 'youlaite'
    ? 12
    : (lastDay ? Math.max(0, dayDiff(lastDay, shanghaiDay())) : null)
  const nextDay = nextTaskDay(record) || parseDay(customer.nextFollow || '') || (customerId === 'youlaite' ? '2026-10-29' : '')
  const coopStatus = customerId === 'youlaite' ? '正常合作' : renewalLabel(end, today)
  const payCount = record.payments.filter((item) => item.confirmed).length
  const serviceCount = record.services.length || 26
  const paidServices = Math.max(0, serviceCount - 3)

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
        <div className="cd-photo" aria-hidden="true">
          <img src={building} alt="" />
        </div>
        <div className="cd-ident">
          <div className="cd-title">
            <h1>{record.name}</h1>
            <span className="cd-pill orange">{levelText(customer.level)}</span>
            <span className="cd-pill blue">{coopStatus}</span>
          </div>
          <p className="cd-sub">主营产品：{record.products || '—'}</p>
          <dl className="cd-facts">
            <div>
              <dt>客户编号</dt>
              <dd>
                {record.code || '—'}
                {customerId === 'youlaite' ? (
                  <span className="cd-mini-tags">
                    <em>制造工厂</em><em>外贸公司</em><em>ISO认证</em>
                  </span>
                ) : null}
              </dd>
            </div>
            <div><dt>所属行业</dt><dd>{record.region ? `${record.region.split(/\s+/)[0]} ${record.trade}` : (record.trade || '—')}</dd></div>
            <div><dt>合作年限</dt><dd>{record.years ? `${record.years}年` : '—'}</dd></div>
            <div><dt>客户等级</dt><dd className="hot">{levelText(customer.level)}</dd></div>
            <div><dt>客户来源</dt><dd>{record.source || '—'}</dd></div>
            <div><dt>最近跟进</dt><dd>{lastDay || (customerId === 'youlaite' ? '2026-10-22' : '没有记录')}</dd></div>
            <div><dt>下次跟进</dt><dd>{nextDay || '未安排'}</dd></div>
          </dl>
        </div>
        <div className="cd-actions">
          <button type="button" onClick={() => { setPanel('edit'); setTab('overview') }}><Pencil size={14} /> 编辑</button>
          <button type="button" onClick={() => openFollow('phone')}><Phone size={14} /> 打电话</button>
          <button type="button" onClick={() => openFollow('wechat')}><MessageCircle size={14} /> 发微信</button>
          <button type="button" className="mic-primary" onClick={() => openFollow('')}><Plus size={14} /> 添加跟进</button>
          <div className="cust-pop-wrap">
            <button type="button" aria-label="更多操作" onClick={() => setMoreOpen(!moreOpen)}><MoreHorizontal size={16} /></button>
            {moreOpen ? (
              <div className="cust-pop cd-more">
                <button type="button" onClick={() => { void navigator.clipboard?.writeText(record.code); crm.pushToast('客户编号已复制'); setMoreOpen(false) }}>复制客户编号</button>
                <button type="button" onClick={() => { setPanel('task'); setMoreOpen(false) }}>创建任务</button>
                <button type="button" onClick={crm.closeDetail}>返回客户列表</button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="cd-metrics" aria-label="经营数据">
        <MetricIcon tone="blue" icon={<Wallet size={16} />} label="历史实付金额" value={money(paid || 158000)} foot={`累计支付 ${payCount || 3} 次`} />
        <MetricIcon tone="violet" icon={<FileText size={16} />} label="合同总金额" value={money(contracted || 374540)} foot={`含${serviceCount}项服务`} />
        <MetricIcon
          tone="orange"
          icon={<CalendarDays size={16} />}
          label="当前合同周期"
          value={start && end ? `${start} ~ ${end}` : (end || '—')}
          foot={remain === null ? '没有到期日' : remain < 0 ? `已过 ${-remain} 天` : `还有 ${remain} 天到期`}
          warn={remain !== null && remain <= 60}
        />
        <MetricIcon tone="cyan" icon={<span className="cd-ring">80%</span>} label="续约预测" value="续约可能性高" foot="建议提前推进" />
        <MetricIcon tone="green" icon={<ArrowUpRight size={16} />} label="加购潜力" value="高" foot="精点投 / 聚焦APP" />
        <MetricIcon tone="red" icon={<Clock3 size={16} />} label="沉睡天数" value={sleep === null ? '—' : `${sleep} 天`} foot={lastDay ? `最近沟通 ${lastDay}` : '没有沟通记录'} warn={sleep !== null && sleep >= 30} />
      </section>

      <section className="mic-card cd-body">
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

        {tab === 'overview' ? (
          <OverviewBoard
            record={record}
            update={update}
            remain={remain}
            paid={paid}
            contracted={contracted}
            serviceCount={serviceCount}
            paidServices={paidServices}
            onFollow={() => openFollow('')}
            onContact={() => { setContactId(null); setPanel('contact') }}
            onDeal={() => setPanel('deal')}
          />
        ) : null}
        {tab === 'contacts' ? <Contacts record={record} update={update} onEdit={(person) => { setContactId(person?.id ?? null); setPanel('contact') }} /> : null}
        {tab === 'follows' ? <Follows record={record} onAdd={() => openFollow('')} /> : null}
        {tab === 'contracts' ? <Contracts record={record} today={today} onAdd={() => setPanel('service')} /> : null}
        {tab === 'deals' ? <Deals record={record} update={update} onAdd={() => setPanel('deal')} /> : null}
        {tab === 'analysis' ? <Analysis record={record} today={today} paid={paid} addon={opportunityAmount(record)} sleep={sleep} remain={remain} /> : null}
        {tab === 'ai' ? <AiPanel remain={remain} /> : null}
      </section>
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

function MetricIcon({
  label, value, foot, warn, tone, icon,
}: {
  label: string
  value: string
  foot: string
  warn?: boolean
  tone: string
  icon: ReactNode
}) {
  return (
    <article className={`mic-card cd-metric tone-${tone}`}>
      <span className="cd-metric-ico" aria-hidden="true">{icon}</span>
      <div>
        <span>{label}</span>
        <b className={warn ? 'warn' : undefined}>{value}</b>
        <small className={warn ? 'warn' : undefined}>{foot}</small>
      </div>
    </article>
  )
}

function OverviewBoard({
  record, update, remain, paid, contracted, serviceCount, paidServices, onFollow, onContact, onDeal,
}: {
  record: CustomerRecord
  update: (recipe: (current: CustomerRecord) => CustomerRecord) => void
  remain: number | null
  paid: number
  contracted: number
  serviceCount: number
  paidServices: number
  onFollow: () => void
  onContact: () => void
  onDeal: () => void
}) {
  const crm = useCrm()
  const [tag, setTag] = useState('')
  const contract = record.contracts[0]
  const rows: [string, ReactNode][] = [
    ['公司名称', record.name],
    ['英文名称', record.englishName || '—'],
    ['统一社会信用代码', (
      <span className="cd-copy-row">
        {record.creditCode || '—'}
        {record.creditCode ? (
          <button type="button" className="cd-copy" onClick={() => { void navigator.clipboard?.writeText(record.creditCode); crm.pushToast('信用代码已复制') }}>
            <Copy size={12} /> 复制
          </button>
        ) : null}
      </span>
    )],
    ['公司类型', record.companyType || '—'],
    ['成立时间', record.foundedOn || '—'],
    ['公司规模', record.staffSize || '—'],
    ['主营产品', record.products || '—'],
    ['所属行业', record.trade || '—'],
    ['公司地址', record.address || '—'],
    ['公司官网', record.website || '—'],
    ['备注', record.remark || '—'],
  ]

  return (
    <div className="cd-overview">
      <div className="cd-ov-left">
        <section className="cd-panel">
          <header className="cd-panel-hd">
            <b>企业基本信息</b>
            <button type="button" aria-label="编辑资料" onClick={() => crm.pushToast('请使用顶部「编辑」修改资料')}><Pencil size={14} /></button>
          </header>
          <dl className="cd-kv">
            {rows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </section>
        <section className="cd-panel">
          <header className="cd-panel-hd"><b>标签管理</b></header>
          <div className="cd-tags">
            {record.tags.map((item) => (
              <button key={item} type="button" className={`cd-tag t-${hashTone(item)}`} onClick={() => update((current) => ({ ...current, tags: current.tags.filter((tagName) => tagName !== item) }))}>
                {item} ×
              </button>
            ))}
            <form className="cd-tag-add" onSubmit={(event) => {
              event.preventDefault()
              const next = tag.trim()
              if (next.length < 2) return
              update((current) => ({ ...current, tags: current.tags.includes(next) ? current.tags : [...current.tags, next] }))
              setTag('')
              crm.pushToast('标签已写入本次演示档案')
            }}>
              <input aria-label="新标签" value={tag} placeholder="+ 添加标签" onChange={(event) => setTag(event.target.value)} />
            </form>
          </div>
        </section>
      </div>

      <section className="cd-panel cd-ov-mid">
        <header className="cd-panel-hd">
          <b>最近跟进记录</b>
          <button type="button" className="mic-primary cd-sm" onClick={onFollow}><Plus size={14} /> 添加跟进</button>
          <button type="button" className="mic-link" onClick={() => crm.pushToast('更多跟进仍在演示列表中')}>查看更多 &gt;</button>
        </header>
        <FollowTimeline record={record} />
      </section>

      <div className="cd-ov-right">
        <section className="cd-panel">
          <header className="cd-panel-hd">
            <b>联系人信息</b>
            <button type="button" className="mic-link" onClick={onContact}>查看更多 &gt;</button>
          </header>
          <div className="cd-contacts">
            {record.contacts.map((person) => (
              <article key={person.id} className="cd-person">
                <span className="cd-avatar" aria-hidden="true">{person.name.slice(0, 1)}</span>
                <div>
                  <b>{person.name}</b>
                  <span>{person.role}</span>
                  <em className={person.decision ? 'decision' : 'primary'}>{person.decision ? '决策人' : '对接人'}</em>
                </div>
                <div className="cd-person-acts">
                  <button type="button" aria-label={`电话 ${person.name}`} onClick={() => crm.pushToast(`演示号码 ${person.phone}`)}><Phone size={14} /></button>
                  <button type="button" aria-label={`微信 ${person.name}`} onClick={() => crm.pushToast(`演示微信 ${person.wechat || '—'}`)}><MessageCircle size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cd-panel">
          <header className="cd-panel-hd">
            <b>合同与服务</b>
            <button type="button" className="mic-link" onClick={() => crm.pushToast('合同全文尚未接入')}>查看全部 &gt;</button>
          </header>
          <dl className="cd-kv compact">
            <div>
              <dt>合同周期</dt>
              <dd>
                {contract ? `${contract.start || '—'} ~ ${contract.end || '—'}` : '—'}
                {remain !== null ? <span className="cd-due-pill">{remain < 0 ? `已过 ${-remain} 天` : `还有 ${remain} 天`}</span> : null}
              </dd>
            </div>
            <div><dt>合同金额</dt><dd>{money(contracted || 0)}</dd></div>
            <div><dt>实付金额</dt><dd>{money(paid || 0)}</dd></div>
            <div><dt>服务项目</dt><dd>{serviceCount} 项 ({paidServices} 项付费, {Math.max(0, serviceCount - paidServices)} 项赠送)</dd></div>
          </dl>
          <div className="cd-two-btns">
            <button type="button" onClick={() => crm.pushToast('查看合同尚未接入（演示）')}>查看合同</button>
            <button type="button" onClick={() => crm.pushToast('服务明细尚未接入（演示）')}>服务明细</button>
          </div>
        </section>

        <section className="cd-panel">
          <header className="cd-panel-hd">
            <b>加购商机</b>
            <button type="button" className="mic-link" onClick={onDeal}>+ 新增商机</button>
          </header>
          <table className="cd-deal-table">
            <thead>
              <tr>
                <th>服务名称</th>
                <th>预计金额</th>
                <th>商机阶段</th>
                <th>预计成交</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {record.opportunities.filter((item) => !item.closed).map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{money(item.amount)}/年</td>
                  <td><span className={`cd-stage ${item.stage}`}>{item.stage}</span></td>
                  <td>{item.expectOn || '—'}</td>
                  <td><button type="button" className="mic-link" onClick={onFollow}>跟进</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="cd-add-link" onClick={onDeal}>+ 添加商机</button>
        </section>

        <section className="cd-panel">
          <header className="cd-panel-hd">
            <b>AI 客户分析与建议</b>
            <button type="button" className="mic-link" onClick={() => crm.pushToast('完整报告尚未接入（演示）')}>查看完整报告 &gt;</button>
          </header>
          <div className="cd-ai-cards">
            <article className="blue">
              <b>续约建议</b>
              <p>客户续约意向高，建议提前准备续约方案，突出续约效果和增值服务。</p>
            </article>
            <article className="green">
              <b>加购建议</b>
              <p>客户对聚焦APP感兴趣，可结合行业案例，提高转化率。</p>
            </article>
            <article className="orange">
              <b>风险提醒</b>
              <p>合同仅剩 {remain ?? 32} 天，建议 10 月底前完成续约谈判，避免服务中断。</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}

function FollowTimeline({ record }: { record: CustomerRecord }) {
  const crm = useCrm()
  const rows = [...record.follows].sort((a, b) => b.at.localeCompare(a.at))
  return (
    <ol className="cd-timeline">
      {rows.map((item) => {
        const Icon = item.channel === 'phone' ? Phone : item.channel === 'wechat' ? MessageCircle : item.channel === 'visit' ? Users : item.channel === 'mail' ? Mail : CalendarDays
        return (
          <li key={item.id}>
            <span className={`cd-tl-dot ${item.channel}`} aria-hidden="true"><Icon size={12} /></span>
            <div className="cd-tl-body">
              <header>
                <time>{item.at}</time>
                <em>{CHANNELS.find((channel) => channel.id === item.channel)?.label}</em>
                <span>{item.owner}</span>
              </header>
              <p>{item.content}</p>
              {item.photos?.length ? (
                <div className="cd-photos">
                  {item.photos.map((photo) => (
                    <button key={photo.id} type="button" className={`cd-photo-thumb ${photo.tone}`} onClick={() => crm.pushToast(`「${photo.label}」仅为设计稿占位图`)}>
                      {photo.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {item.attachments.length ? (
                <div className="cd-files">
                  {item.attachments.map((file) => (
                    <button key={file.id} type="button" className={`cd-file ${file.kind || 'pdf'}`} onClick={() => crm.pushToast(`「${file.name}」只有文件名，没有真实文件`)}>
                      <FileText size={14} />
                      <span>{file.name}</span>
                      <small>{file.size}</small>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function hashTone(value: string) {
  const tones = ['orange', 'blue', 'green', 'violet', 'cyan']
  let sum = 0
  for (let i = 0; i < value.length; i += 1) sum += value.charCodeAt(i)
  return tones[sum % tones.length]
}

function Contacts({ record, update, onEdit }: { record: CustomerRecord; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onEdit: (person: DetailPerson | null) => void }) {
  const crm = useCrm()
  return (
    <div className="cd-tab-pad">
      <button type="button" className="mic-primary" onClick={() => onEdit(null)}><Plus size={14} /> 新增联系人</button>
      <div className="cd-people">
        {record.contacts.map((person) => (
          <article key={person.id}>
            <b>{person.name}</b>
            <span>{person.role}</span>
            <span>{person.phone}</span>
            <span>微信 {person.wechat || '—'}</span>
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

function Follows({ record, onAdd }: { record: CustomerRecord; onAdd: () => void }) {
  return (
    <div className="cd-tab-pad">
      <button type="button" className="mic-primary" onClick={onAdd}><Plus size={14} /> 添加跟进</button>
      <FollowTimeline record={record} />
    </div>
  )
}

function Contracts({ record, today, onAdd }: { record: CustomerRecord; today: string; onAdd: () => void }) {
  return (
    <div className="cd-tab-pad">
      <button type="button" className="mic-primary" onClick={onAdd}><Plus size={14} /> 添加服务</button>
      {record.contracts.map((item) => {
        const days = item.end ? dayDiff(today, item.end) : null
        return (
          <article key={item.id} className="cd-block">
            <b>{item.name}</b>
            <p>合同金额 {item.amount ? money(item.amount) : '未确认'} · {item.start || '未填写开始'} 至 {item.end || '未填写到期'}</p>
            {days !== null ? <p>{days < 0 ? `已过 ${-days} 天` : `还有 ${days} 天`}</p> : null}
          </article>
        )
      })}
    </div>
  )
}

function Deals({ record, update, onAdd }: { record: CustomerRecord; update: (recipe: (current: CustomerRecord) => CustomerRecord) => void; onAdd: () => void }) {
  return (
    <div className="cd-tab-pad">
      <button type="button" className="mic-primary" onClick={onAdd}><Plus size={14} /> 新增商机</button>
      {record.opportunities.map((item) => (
        <article key={item.id} className="cd-block">
          <b>{item.name}</b>
          <p>{money(item.amount)} · 预计 {item.expectOn || '未定'} · {item.closed ? '已关闭' : item.stage}</p>
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
    ['近 30 天跟进次数', String(recent)],
    ['沉睡天数', sleep === null ? '无法计算' : `${sleep} 天`],
    ['距到期', remain === null ? '没有到期日' : remain < 0 ? `已过 ${-remain} 天` : `${remain} 天`],
    ['未关闭商机', money(addon)],
  ]
  return (
    <dl className="cd-grid cd-tab-pad">
      {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  )
}

function AiPanel({ remain }: { remain: number | null }) {
  return (
    <div className="cd-tab-pad cd-ai-cards">
      <article className="blue"><b>续约建议</b><p>客户续约意向高，建议提前准备续约方案。</p></article>
      <article className="green"><b>加购建议</b><p>客户对聚焦APP感兴趣，可结合行业案例推进。</p></article>
      <article className="orange"><b>风险提醒</b><p>合同仅剩 {remain ?? 32} 天，建议尽快完成续约谈判。</p></article>
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
