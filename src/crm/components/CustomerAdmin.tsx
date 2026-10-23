import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { CustomerDetail } from '@/crm/components/CustomerDetail'
import { money } from '@/crm/data'
import {
  DIRECTORY_FEED,
  DIRECTORY_LEVEL_STATS,
  DIRECTORY_TAB_COUNTS,
  DIRECTORY_TODAY_TODOS,
} from '@/crm/directory'
import { useCrm } from '@/crm/crm-context'
import type { AccountStatus, Customer } from '@/crm/types'

type TabId = 'all' | 'follow' | 'reactivate' | 'opportunity'
type ColumnKey = 'region' | 'product' | 'level' | 'paid' | 'end' | 'last' | 'next' | 'status' | 'actions'

const DEMO_TODAY = '2026-10-24'

const TABS: { id: TabId; label: string; count: number; tone: string }[] = [
  { id: 'all', label: '全部客户', count: DIRECTORY_TAB_COUNTS.all, tone: 'blue' },
  { id: 'follow', label: '需要跟进', count: DIRECTORY_TAB_COUNTS.follow, tone: 'violet' },
  { id: 'reactivate', label: '重点盘活', count: DIRECTORY_TAB_COUNTS.reactivate, tone: 'rose' },
  { id: 'opportunity', label: '我的商机', count: DIRECTORY_TAB_COUNTS.opportunity, tone: 'green' },
]

const METRICS = [
  { label: '客户总数', value: String(DIRECTORY_TAB_COUNTS.all), foot: '较上月', delta: '+12%', up: true },
  { label: '高价值客户', value: String(DIRECTORY_TAB_COUNTS.highValue), foot: '占比 22%', delta: '', up: true },
  { label: '即将到期', value: String(DIRECTORY_TAB_COUNTS.dueSoon), foot: '30天内', delta: '', up: false },
  { label: '沉睡客户', value: String(DIRECTORY_TAB_COUNTS.dormant), foot: '较上月', delta: '-8%', up: false },
  { label: '加购机会', value: String(DIRECTORY_TAB_COUNTS.opportunity), foot: `潜在 ${money(DIRECTORY_TAB_COUNTS.addonValue)}`, delta: '', up: true },
]

function daysUntil(end?: string) {
  if (!end) return null
  const start = new Date(`${DEMO_TODAY}T00:00:00`)
  const target = new Date(`${end}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null
  return Math.round((target.getTime() - start.getTime()) / 86400000)
}

function statusLabel(status?: AccountStatus) {
  if (status === '正常客户') return '正常合作'
  return status || '—'
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function CustomerDirectory() {
  const crm = useCrm()
  const fileRef = useRef<HTMLInputElement>(null)
  const directory = crm.customers.filter((item) => item.directory)
  const [tab, setTab] = useState<TabId>('all')
  const [view, setView] = useState<'list' | 'card'>('list')
  const [status, setStatus] = useState('')
  const [level, setLevel] = useState('')
  const [trade, setTrade] = useState('')
  const [province, setProvince] = useState('')
  const [source, setSource] = useState('')
  const [years, setYears] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [columns] = useState<Record<ColumnKey, boolean>>({
    region: true, product: true, level: true, paid: true, end: true, last: true, next: true, status: true, actions: true,
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [jump, setJump] = useState('1')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [menuId, setMenuId] = useState<string | null>(null)
  const [localTodos, setLocalTodos] = useState<{ id: string; time: string; title: string; done: boolean }[]>(
    () => DIRECTORY_TODAY_TODOS.map((item) => ({ ...item })),
  )

  const trades = unique(directory.map((item) => item.trade || ''))
  const provinces = unique(directory.map((item) => item.province || ''))
  const sources = unique(directory.map((item) => item.source || '').filter(Boolean))

  const filtered = useMemo(() => {
    const query = crm.search.trim()
    return directory.filter((item) => {
      if (query && !matchQuery(item, query)) return false
      if (tab === 'follow' && !item.needsFollow) return false
      if (tab === 'reactivate' && item.accountStatus !== '沉睡客户') return false
      if (tab === 'opportunity' && item.accountStatus !== '加购机会') return false
      if (status && item.accountStatus !== status) return false
      if (level && item.level !== level) return false
      if (trade && item.trade !== trade) return false
      if (province && item.province !== province) return false
      if (source && item.source !== source) return false
      if (years && String(item.years) !== years) return false
      return true
    })
  }, [directory, crm.search, tab, status, level, trade, province, source, years])

  const pageCount = Math.max(1, Math.ceil(DIRECTORY_TAB_COUNTS.all / pageSize))
  const pageRows = page === 1 ? filtered.slice(0, pageSize) : []

  useEffect(() => {
    crm.registerCustomerActions({
      export: () => downloadCsv(selectedIds.length ? filtered.filter((item) => selectedIds.includes(item.id)) : filtered, crm.pushToast),
      import: () => fileRef.current?.click(),
    })
    return () => crm.registerCustomerActions(null)
  }, [crm, filtered, selectedIds])

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? pageRows.map((item) => item.id) : [])
  }

  function importFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      crm.pushToast('Excel 工作簿解析尚未接入。请把表格另存为 CSV 再导入，数据只留在本页演示列表。')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      const body = lines[0]?.includes('公司名称') ? lines.slice(1) : lines
      let added = 0
      body.forEach((line) => {
        const cells = line.split(',').map((cell) => cell.replace(/^"|"$/g, '').trim())
        const name = cells[0]
        if (!name) return
        crm.saveCustomer({ name, contact: '导入联系人', phone: '演示号码', industry: cells[3] || cells[2] || '未填写', tags: '导入' })
        added += 1
      })
      crm.pushToast(added ? `已导入 ${added} 条演示客户（仅本页，未提交到任何平台）` : 'CSV 里没有可导入的公司名称')
    }
    reader.readAsText(file)
  }

  return (
    <div className="cust">
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) importFile(file)
      }} />

      <div className="cust-hero-tabs" role="tablist" aria-label="客户中心页签">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`cust-hero-tab tone-${item.tone}${tab === item.id ? ' active' : ''}`}
            onClick={() => { setTab(item.id); setPage(1) }}
          >
            <span>{item.label}</span>
            <strong>{item.count}</strong>
          </button>
        ))}
      </div>

      <div className="cust-metrics">
        {METRICS.map((item) => (
          <article key={item.label} className="cust-metric">
            <span>{item.label}</span>
            <b>{item.value}</b>
            <small>
              {item.delta ? <em className={item.up ? 'up' : 'down'}>{item.delta}</em> : null}
              {item.foot}
            </small>
          </article>
        ))}
      </div>

      <section className="cust-board">
        <div className="mic-card cust-main">
          <div className="cust-toolbar">
            <div className="cust-filters">
              <label className="cust-search">
                <Search size={14} />
                <input
                  value={crm.search}
                  placeholder="搜索公司名称、联系人、电话、微信、主营产品..."
                  aria-label="筛选演示客户"
                  onChange={(event) => {
                    crm.setSearch(event.target.value)
                    crm.setSearchOpen(false)
                    setPage(1)
                  }}
                />
              </label>
              <Select label="客户等级" value={level} onChange={(value) => { setLevel(value); setPage(1) }} options={['高价值', '重要客户', '潜力客户']} />
              <Select label="行业分类" value={trade} onChange={(value) => { setTrade(value); setPage(1) }} options={trades} />
              <Select label="所在省份" value={province} onChange={(value) => { setProvince(value); setPage(1) }} options={provinces} />
              <Select label="合作状态" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={['正常客户', '沉睡客户', '即将到期', '加购机会']} />
              <div className="cust-pop-wrap">
                <button type="button" className="cust-more" onClick={() => setMoreOpen(!moreOpen)}>
                  <SlidersHorizontal size={14} /> 更多筛选
                </button>
                {moreOpen ? (
                  <div className="cust-pop">
                    <Select label="客户来源" value={source} onChange={(value) => { setSource(value); setPage(1) }} options={sources.length ? sources : ['主动开发', '手工新增']} />
                    <Select label="合作年限" value={years} onChange={(value) => { setYears(value); setPage(1) }} options={['1', '2', '3', '4']} />
                    <button type="button" className="mic-link" onClick={() => { setSource(''); setYears(''); setPage(1) }}>清空</button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="cust-view">
              <button type="button" className={view === 'list' ? 'on' : undefined} onClick={() => setView('list')}><LayoutList size={14} /> 列表视图</button>
              <button type="button" className={view === 'card' ? 'on' : undefined} onClick={() => setView('card')}><LayoutGrid size={14} /> 卡片视图</button>
            </div>
          </div>

          {page > 1 ? (
            <div className="cust-empty">第 {page} 页没有更多演示样本。设计稿画出了 29 页，其余公司没有放进演示数据。</div>
          ) : view === 'card' ? (
            <div className="cust-cards">
              {pageRows.map((item) => (
                <button key={item.id} type="button" className={item.id === crm.selectedId ? 'cust-card on' : 'cust-card'} onClick={() => crm.openDetail(item.id)}>
                  <b>{item.name}</b>
                  {item.nameTag ? <em className={`cust-nametag ${item.nameTag}`}>{item.nameTag}</em> : null}
                  <span>{item.province} {item.city}</span>
                  <span className={`cust-level ${item.level}`}>{item.level}</span>
                  <span className={`cust-status ${item.accountStatus}`}>{statusLabel(item.accountStatus)}</span>
                  <strong>{money(item.value)}</strong>
                  <small>下次跟进 {item.nextFollow || '—'}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="mic-table-wrap">
              <table className="mic-table cust-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" aria-label="选择本页演示客户" checked={pageRows.length > 0 && pageRows.every((item) => selectedIds.includes(item.id))} onChange={(event) => toggleAll(event.target.checked)} /></th>
                    <th>公司名称</th>
                    {columns.region ? <th>地区</th> : null}
                    {columns.product ? <th>主营产品</th> : null}
                    {columns.level ? <th>客户等级</th> : null}
                    {columns.paid ? <th>历史实付</th> : null}
                    {columns.end ? <th>合同到期</th> : null}
                    {columns.last ? <th>上次跟进</th> : null}
                    {columns.next ? <th>下次跟进</th> : null}
                    {columns.status ? <th>状态</th> : null}
                    {columns.actions ? <th>操作</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan={11}>没有匹配的演示客户</td></tr>
                  ) : pageRows.map((item) => {
                    const remain = daysUntil(item.contractEnd)
                    return (
                      <tr key={item.id} className={item.id === crm.selectedId ? 'on' : undefined} onClick={() => crm.openCustomer(item.id)}>
                        <td onClick={(event) => event.stopPropagation()}>
                          <input type="checkbox" aria-label={`选择 ${item.name}`} checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds(event.target.checked ? [...selectedIds, item.id] : selectedIds.filter((id) => id !== item.id))} />
                        </td>
                        <td>
                          <button type="button" className="mic-name-btn" onClick={(event) => { event.stopPropagation(); crm.openDetail(item.id) }}>{item.name}</button>
                          {item.nameTag ? <div className={`cust-nametag ${item.nameTag}`}>{item.nameTag}</div> : null}
                        </td>
                        {columns.region ? <td>{item.province} {item.city}</td> : null}
                        {columns.product ? <td>{item.products}</td> : null}
                        {columns.level ? <td><span className={`cust-level ${item.level}`}>{item.level}</span></td> : null}
                        {columns.paid ? <td>{money(item.value)}</td> : null}
                        {columns.end ? (
                          <td className={remain != null && remain <= 60 ? 'cust-due' : undefined}>
                            <div>{item.contractEnd || '—'}</div>
                            {remain != null ? <div className="cust-due-sub">{remain}天</div> : null}
                          </td>
                        ) : null}
                        {columns.last ? <td>{item.lastFollow || '—'}</td> : null}
                        {columns.next ? <td>{item.nextFollow || '—'}</td> : null}
                        {columns.status ? <td><span className={`cust-status ${item.accountStatus}`}>{statusLabel(item.accountStatus)}</span></td> : null}
                        {columns.actions ? (
                          <td onClick={(event) => event.stopPropagation()}>
                            <div className="cust-ops">
                              <button type="button" aria-label="电话跟进" onClick={() => crm.openFollowUp(item.id, 'phone')}><Phone size={14} /></button>
                              <button type="button" aria-label="微信跟进" onClick={() => crm.openFollowUp(item.id, 'wechat')}><MessageCircle size={14} /></button>
                              <button type="button" aria-label="跟进计划" onClick={() => crm.openFollowUp(item.id, 'plan')}><Calendar size={14} /></button>
                              <button type="button" aria-label="更多" onClick={() => setMenuId(menuId === item.id ? null : item.id)}><MoreHorizontal size={14} /></button>
                              {menuId === item.id ? (
                                <div className="cust-menu">
                                  <button type="button" onClick={() => { crm.openDetail(item.id); setMenuId(null) }}>查看详情</button>
                                  <button type="button" onClick={() => { crm.openFollowUp(item.id); setMenuId(null) }}>写跟进</button>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <footer className="cust-pager">
            <span>共 {DIRECTORY_TAB_COUNTS.all} 条数据</span>
            <select aria-label="每页条数" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
            </select>
            <button type="button" aria-label="上一页" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" className={page === number ? 'on' : undefined} onClick={() => setPage(number)}>{number}</button>
            ))}
            {pageCount > 5 ? <span>…</span> : null}
            {pageCount > 5 ? (
              <button type="button" className={page === pageCount ? 'on' : undefined} onClick={() => setPage(pageCount)}>{pageCount}</button>
            ) : null}
            <button type="button" aria-label="下一页" disabled={page >= pageCount} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
            <span>前往</span>
            <input aria-label="前往页" value={jump} onChange={(event) => setJump(event.target.value)} onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              const next = Number(jump)
              if (next >= 1 && next <= pageCount) setPage(next)
            }} />
            <span>页</span>
          </footer>
        </div>

        <CustomerRail
          todos={localTodos}
          onToggleTodo={(id) => setLocalTodos((list) => list.map((item) => item.id === id ? { ...item, done: !item.done } : item))}
        />
      </section>
    </div>
  )
}

function CustomerRail({
  todos,
  onToggleTodo,
}: {
  todos: { id: string; time: string; title: string; done: boolean }[]
  onToggleTodo: (id: string) => void
}) {
  const total = DIRECTORY_LEVEL_STATS.reduce((sum, item) => sum + item.value, 0)
  let offset = 0
  const radius = 54
  const circ = 2 * Math.PI * radius

  return (
    <aside className="cust-rail">
      <section className="mic-card cust-rail-card">
        <header className="cust-rail-hd">客户统计</header>
        <div className="cust-donut-wrap">
          <svg viewBox="0 0 140 140" className="cust-donut" aria-label="客户等级分布">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#eef2f7" strokeWidth="16" />
            {DIRECTORY_LEVEL_STATS.map((item) => {
              const length = (item.value / total) * circ
              const dash = `${length} ${circ - length}`
              const node = (
                <circle
                  key={item.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="16"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                />
              )
              offset += length
              return node
            })}
            <text x="70" y="66" textAnchor="middle" fontSize="11" fill="#667085">客户结构</text>
            <text x="70" y="86" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1d2939">{DIRECTORY_TAB_COUNTS.all}</text>
          </svg>
          <ul className="cust-legend">
            {DIRECTORY_LEVEL_STATS.map((item) => (
              <li key={item.label}>
                <i style={{ background: item.color }} />
                <span>{item.label}</span>
                <b>{item.value}%</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mic-card cust-rail-card">
        <header className="cust-rail-hd">近期跟进动态</header>
        <ol className="cust-feed">
          {DIRECTORY_FEED.map((item) => (
            <li key={item.id}>
              <span className="cust-feed-dot" />
              <div>
                <div className="cust-feed-meta">{item.at} · {item.channel}</div>
                <b>{item.name}</b>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mic-card cust-rail-card">
        <header className="cust-rail-hd">我的待办（今日）</header>
        <ul className="cust-todo">
          {todos.map((item) => (
            <li key={item.id} className={item.done ? 'done' : undefined}>
              <label>
                <input type="checkbox" checked={item.done} onChange={() => onToggleTodo(item.id)} />
                <span className="time">{item.time}</span>
                <span className="title">{item.title}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

export function CustomerAdmin() {
  const crm = useCrm()
  if (crm.detailId) return <CustomerDetail customerId={crm.detailId} />
  return <CustomerDirectory />
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{label}</option>
      {options.map((option) => <option key={option} value={option}>{label === '合作年限' ? `${option}年` : option}</option>)}
    </select>
  )
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function matchQuery(customer: Customer, query: string) {
  const haystack = [customer.name, customer.contact, customer.phone, customer.products, customer.productDetail, customer.trade, customer.province, customer.city, customer.source, ...(customer.contacts ?? []).flatMap((item) => [item.name, item.phone])].join(' ')
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
}

function downloadCsv(rows: Customer[], pushToast: (message: string) => void) {
  const header = ['公司名称', '省份', '城市', '主营产品', '所属行业', '客户等级', '合作年限', '历史实付', '合同到期日', '客户状态', '上次跟进', '下次跟进']
  const lines = rows.map((item) => [item.name, item.province || '', item.city || '', item.products || '', item.trade || '', item.level || '', String(item.years || ''), String(item.value), item.contractEnd || '', item.accountStatus || '', item.lastFollow || '', item.nextFollow || ''].map(csvCell).join(','))
  const blob = new Blob([`\uFEFF${header.join(',')}\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '客户演示数据.csv'
  link.click()
  URL.revokeObjectURL(link.href)
  pushToast(`已导出 ${rows.length} 条演示客户（CSV，可用 Excel 打开）`)
}
