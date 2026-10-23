import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Calendar, ChevronLeft, ChevronRight, LayoutGrid, LayoutList, MessageCircle, MoreHorizontal, Pencil, Phone, Plus, Search, Settings2, SlidersHorizontal, Star, X } from 'lucide-react'
import { CustomerDetail } from '@/crm/components/CustomerDetail'
import { money } from '@/crm/data'
import { DIRECTORY_TAB_COUNTS } from '@/crm/directory'
import { useCrm } from '@/crm/crm-context'
import type { AccountStatus, Customer, CustomerLevel } from '@/crm/types'

type TabId = 'all' | AccountStatus | '高价值客户'
type ColumnKey = 'region' | 'product' | 'level' | 'years' | 'paid' | 'end' | 'status' | 'next' | 'actions'

const COLUMN_LABELS: { key: ColumnKey; label: string }[] = [
  { key: 'region', label: '地区' },
  { key: 'product', label: '主营产品 / 行业' },
  { key: 'level', label: '客户等级' },
  { key: 'years', label: '合作年限' },
  { key: 'paid', label: '历史实付' },
  { key: 'end', label: '合同到期日' },
  { key: 'status', label: '客户状态' },
  { key: 'next', label: '下次跟进' },
  { key: 'actions', label: '操作' },
]

const TABS: { id: TabId; label: string; count: number }[] = [
  { id: 'all', label: '全部客户', count: DIRECTORY_TAB_COUNTS.all },
  { id: '正常客户', label: '正常客户', count: DIRECTORY_TAB_COUNTS.正常客户 },
  { id: '沉睡客户', label: '沉睡客户', count: DIRECTORY_TAB_COUNTS.沉睡客户 },
  { id: '即将到期', label: '即将到期', count: DIRECTORY_TAB_COUNTS.即将到期 },
  { id: '高价值客户', label: '高价值客户', count: DIRECTORY_TAB_COUNTS.高价值客户 },
  { id: '加购机会', label: '加购机会', count: DIRECTORY_TAB_COUNTS.加购机会 },
]

function warnDate(value: string) {
  return Boolean(value) && value < '2027-01-01'
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
  const [city, setCity] = useState('')
  const [source, setSource] = useState('')
  const [years, setYears] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
    region: true, product: true, level: true, years: true, paid: true, end: true, status: true, next: true, actions: true,
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [jump, setJump] = useState('1')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [menuId, setMenuId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [detailTab, setDetailTab] = useState<'info' | 'follow' | 'deal' | 'contract'>('info')

  const trades = unique(directory.map((item) => item.trade || ''))
  const provinces = unique(directory.map((item) => item.province || ''))
  const cities = unique(directory.filter((item) => !province || item.province === province).map((item) => item.city || ''))
  const sources = unique(directory.map((item) => item.source || '').filter(Boolean))

  const filtered = useMemo(() => {
    const query = crm.search.trim()
    return directory.filter((item) => {
      if (query && !matchQuery(item, query)) return false
      if (tab === '高价值客户' && item.level !== '高价值') return false
      if (tab !== 'all' && tab !== '高价值客户' && item.accountStatus !== tab) return false
      if (status && item.accountStatus !== status) return false
      if (level && item.level !== level) return false
      if (trade && item.trade !== trade) return false
      if (province && item.province !== province) return false
      if (city && item.city !== city) return false
      if (source && item.source !== source) return false
      if (years && String(item.years) !== years) return false
      return true
    })
  }, [directory, crm.search, tab, status, level, trade, province, city, source, years])

  const pageCount = Math.max(1, Math.ceil(286 / pageSize))
  const pageRows = page === 1 ? filtered.slice(0, pageSize) : []
  const selected = directory.find((item) => item.id === crm.selectedId) ?? crm.customers.find((item) => item.id === crm.selectedId)

  const opened = useRef(false)
  useEffect(() => {
    if (opened.current) return
    opened.current = true
    if (window.matchMedia('(min-width: 900px)').matches) crm.openCustomer('youlaite')
  }, [crm])

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
      <section className="cust-board">
        <div className="mic-card cust-main">
          <div className="cust-filters">
            <label className="cust-search">
              <Search size={14} />
              <input
                value={crm.search}
                placeholder="搜索公司名称、联系人、电话、微信、主营产品、行业..."
                aria-label="筛选演示客户"
                onChange={(event) => {
                  crm.setSearch(event.target.value)
                  crm.setSearchOpen(false)
                  setPage(1)
                }}
              />
            </label>
            <Select label="客户状态" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={['正常客户', '沉睡客户', '即将到期', '加购机会']} />
            <Select label="客户等级" value={level} onChange={(value) => { setLevel(value); setPage(1) }} options={['高价值', '重要客户', '潜力客户']} />
            <Select label="行业分类" value={trade} onChange={(value) => { setTrade(value); setPage(1) }} options={trades} />
            <Select label="所在省份" value={province} onChange={(value) => { setProvince(value); setCity(''); setPage(1) }} options={provinces} />
            <Select label="所在城市" value={city} onChange={(value) => { setCity(value); setPage(1) }} options={cities} />
            <div className="cust-pop-wrap">
              <button type="button" className="cust-more" onClick={() => { setMoreOpen(!moreOpen); setFieldsOpen(false) }}>
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

          <div className="cust-tabs">
            <div className="mic-key-tabs" role="tablist">
              {TABS.map((item) => (
                <button key={item.id} type="button" className={tab === item.id ? 'active' : undefined} onClick={() => { setTab(item.id); setPage(1) }}>
                  {item.label}（{item.count}）
                </button>
              ))}
            </div>
            <div className="cust-view">
              <button type="button" className={view === 'list' ? 'on' : undefined} onClick={() => setView('list')}><LayoutList size={14} /> 列表</button>
              <button type="button" className={view === 'card' ? 'on' : undefined} onClick={() => setView('card')}><LayoutGrid size={14} /> 卡片</button>
              <div className="cust-pop-wrap">
                <button type="button" className="cust-more" onClick={() => { setFieldsOpen(!fieldsOpen); setMoreOpen(false) }}><Settings2 size={14} /> 字段设置</button>
                {fieldsOpen ? (
                  <div className="cust-pop">
                    {COLUMN_LABELS.map((column) => (
                      <label key={column.key} className="cust-check">
                        <input type="checkbox" checked={columns[column.key]} onChange={(event) => setColumns({ ...columns, [column.key]: event.target.checked })} />
                        {column.label}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <p className="mic-note">页签上的 286 等数字是设计稿汇总。表格只有这 10 条演示样本，电话均为打码占位。</p>

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
                  <span className={`cust-status ${item.accountStatus}`}>{item.accountStatus}</span>
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
                    {columns.product ? <th>主营产品 / 行业</th> : null}
                    {columns.level ? <th>客户等级</th> : null}
                    {columns.years ? <th>合作年限</th> : null}
                    {columns.paid ? <th>历史实付</th> : null}
                    {columns.end ? <th>合同到期日</th> : null}
                    {columns.status ? <th>客户状态</th> : null}
                    {columns.next ? <th>下次跟进</th> : null}
                    {columns.actions ? <th>操作</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan={11}>没有匹配的演示客户</td></tr>
                  ) : pageRows.map((item) => (
                    <tr key={item.id} className={item.id === crm.selectedId ? 'on' : undefined} onClick={() => { crm.openCustomer(item.id); setDetailTab('info'); setEditing(false) }}>
                      <td onClick={(event) => event.stopPropagation()}>
                        <input type="checkbox" aria-label={`选择 ${item.name}`} checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds(event.target.checked ? [...selectedIds, item.id] : selectedIds.filter((id) => id !== item.id))} />
                      </td>
                      <td>
                        <button type="button" className="mic-name-btn" onClick={(event) => { event.stopPropagation(); crm.openDetail(item.id) }}>{item.name}</button>
                        {item.nameTag ? <div className={`cust-nametag ${item.nameTag}`}>{item.nameTag}</div> : null}
                      </td>
                      {columns.region ? <td>{item.province} {item.city}</td> : null}
                      {columns.product ? <td><div>{item.products}</div><div className="cust-sub">{item.trade}</div></td> : null}
                      {columns.level ? <td><span className={`cust-level ${item.level}`}>{item.level}</span></td> : null}
                      {columns.years ? <td>{item.years}年</td> : null}
                      {columns.paid ? <td>{money(item.value)}</td> : null}
                      {columns.end ? <td className={warnDate(item.contractEnd || '') ? 'cust-due' : undefined}>{item.contractEnd || '—'}</td> : null}
                      {columns.status ? <td><span className={`cust-status ${item.accountStatus}`}>{item.accountStatus}</span></td> : null}
                      {columns.next ? <td>{item.nextFollow || '—'}</td> : null}
                      {columns.actions ? (
                        <td onClick={(event) => event.stopPropagation()}>
                          <div className="cust-ops">
                            <button type="button" aria-label="电话跟进" onClick={() => crm.openFollowUp(item.id, 'phone')}><Phone size={14} /></button>
                            <button type="button" aria-label="微信跟进" onClick={() => crm.openFollowUp(item.id, 'wechat')}><MessageCircle size={14} /></button>
                            <button type="button" aria-label="跟进计划" onClick={() => { crm.openCustomer(item.id); setPlanOpen(true); setDetailTab('info') }}><Calendar size={14} /></button>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="cust-pager">
            <span>共 286 条数据</span>
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
        {selected ? (
          <Detail
            customer={selected}
            tab={detailTab}
            setTab={setDetailTab}
            editing={editing}
            setEditing={setEditing}
            contactOpen={contactOpen}
            setContactOpen={setContactOpen}
            planOpen={planOpen}
            setPlanOpen={setPlanOpen}
          />
        ) : null}
      </section>
    </div>
  )
}

export function CustomerAdmin() {
  const crm = useCrm()
  if (crm.detailId) return <CustomerDetail customerId={crm.detailId} />
  return <CustomerDirectory />
}

function Detail({
  customer, tab, setTab, editing, setEditing, contactOpen, setContactOpen, planOpen, setPlanOpen,
}: {
  customer: Customer
  tab: 'info' | 'follow' | 'deal' | 'contract'
  setTab: (tab: 'info' | 'follow' | 'deal' | 'contract') => void
  editing: boolean
  setEditing: (open: boolean) => void
  contactOpen: boolean
  setContactOpen: (open: boolean) => void
  planOpen: boolean
  setPlanOpen: (open: boolean) => void
}) {
  const crm = useCrm()
  const follows = crm.followUps.filter((item) => item.customerId === customer.id)
  return (
    <aside className="mic-card cust-detail" data-testid="customer-detail">
      <header>
        <span className="cust-logo">A</span>
        <div>
          <b>{customer.name}</b>
          <em className={`cust-level ${customer.level}`}>{levelLabel(customer.level)}</em>
        </div>
        <button type="button" className={customer.starred ? 'cust-star on' : 'cust-star'} aria-label="标星" onClick={() => crm.patchCustomer(customer.id, { starred: !customer.starred })}><Star size={16} fill={customer.starred ? 'currentColor' : 'none'} /></button>
        <button type="button" className="cd-open" onClick={() => crm.openDetail(customer.id)}>完整档案</button>
        <button type="button" className="mic-x" aria-label="关闭详情" onClick={crm.closeCustomer}><X size={16} /></button>
      </header>
      <div className="cust-detail-tabs">
        {([['info', '客户信息'], ['follow', '跟进记录'], ['deal', '商机机会'], ['contract', '合同服务']] as const).map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'active' : undefined} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'info' ? (
        <>
          <div className="cust-sec-hd"><i />基本信息 <button type="button" onClick={() => setEditing(!editing)}><Pencil size={12} /> {editing ? '取消' : '编辑'}</button></div>
          {editing ? <EditForm customer={customer} onClose={() => setEditing(false)} /> : <InfoList customer={customer} />}
          <div className="cust-sec-hd"><i />联系人信息 <button type="button" onClick={() => setContactOpen(!contactOpen)}><Plus size={12} /> 新增联系人</button></div>
          {contactOpen ? <ContactForm customerId={customer.id} onClose={() => setContactOpen(false)} /> : null}
          {(customer.contacts ?? []).length === 0 ? <p className="mic-note">设计稿没有给出这位客户的联系人。</p> : null}
          {(customer.contacts ?? []).map((person) => (
            <div key={person.id} className="cust-person">
              <span>{person.name.slice(0, 1)}</span>
              <div><b>{person.name}</b><small>{person.role}</small></div>
              <em>{person.phone}</em>
              <button type="button" aria-label={`电话联系${person.name}`} onClick={() => crm.openFollowUp(customer.id, 'phone')}><Phone size={13} /></button>
              <button type="button" aria-label={`微信联系${person.name}`} onClick={() => crm.openFollowUp(customer.id, 'wechat')}><MessageCircle size={13} /></button>
            </div>
          ))}
          <div className="cust-sec-hd"><i />跟进计划 <button type="button" onClick={() => setPlanOpen(!planOpen)}><Plus size={12} /> 新增跟进</button></div>
          {planOpen ? <PlanForm customerId={customer.id} onClose={() => setPlanOpen(false)} /> : null}
          {(customer.plans ?? []).map((plan) => (
            <label key={plan.id} className="cust-plan">
              <input type="checkbox" checked={plan.done} onChange={() => crm.patchCustomer(customer.id, { plans: (customer.plans ?? []).map((item) => item.id === plan.id ? { ...item, done: !item.done } : item) })} />
              <span><b>{plan.at}</b><small>{plan.text}</small></span>
            </label>
          ))}
        </>
      ) : null}
      {tab === 'follow' ? (
        <div className="mic-feed">
          <button type="button" className="mic-primary" onClick={() => crm.openFollowUp(customer.id)}>写跟进</button>
          {follows.length === 0 ? <p className="mic-note">还没有跟进。保存后会出现在这里，也会进入工作台的最近跟进。</p> : null}
          {follows.map((item) => (
            <div key={item.id} className={item.fresh ? 'mic-feed-row mic-fresh' : 'mic-feed-row'}>
              <div><div className="mic-time">{item.atLabel}</div><div className="mic-feed-text">{item.summary}</div></div>
            </div>
          ))}
        </div>
      ) : null}
      {tab === 'deal' ? (
        <p className="mic-note">商机报价和赢单流程还没有做。{customer.accountStatus === '加购机会' ? '这条样本在设计稿里标成了加购机会。' : '这位客户的设计稿没有单独的商机明细。'}</p>
      ) : null}
      {tab === 'contract' ? (
        <div>
          <p className="mic-note">合同正文、回款和电子签还没有做。下面只重复设计稿里的到期信息。</p>
          <div className="mic-meta">
            <div><span>合同到期</span><b>{customer.contractEnd || '—'}</b></div>
            <div><span>历史实付</span><b>{money(customer.value)}</b></div>
            <div><span>合同编号</span><b>{customer.contractNo}</b></div>
            <div><span>客户状态</span><b>{customer.accountStatus || customer.status}</b></div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function InfoList({ customer }: { customer: Customer }) {
  const remain = customer.id === 'youlaite' ? '51天' : ''
  const rows = [
    ['公司名称', customer.name],
    ['所在地区', `${customer.province || '—'} ${customer.city || ''}`.trim()],
    ['主营产品', customer.productDetail || customer.products || '—'],
    ['所属行业', customer.trade || '—'],
    ['客户等级', levelLabel(customer.level)],
    ['合作年限', customer.years ? `${customer.years}年` : '—'],
    ['历史实付', money(customer.value)],
    ['合同到期日', customer.contractEnd ? `${customer.contractEnd}${remain ? `（${remain}）` : ''}` : '—'],
    ['客户状态', customer.accountStatus || '—'],
    ['客户来源', customer.source || '—'],
    ['公司官网', customer.website || '—'],
  ]
  return (
    <dl className="cust-info">
      {rows.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd className={infoClass(label, value)}>{value}</dd></div>
      ))}
    </dl>
  )
}

function EditForm({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const crm = useCrm()
  const [name, setName] = useState(customer.name)
  const [province, setProvince] = useState(customer.province ?? '')
  const [city, setCity] = useState(customer.city ?? '')
  const [products, setProducts] = useState(customer.productDetail || customer.products || '')
  const [trade, setTrade] = useState(customer.trade ?? '')
  const [level, setLevel] = useState<CustomerLevel>(customer.level ?? '重要客户')
  const [years, setYears] = useState(String(customer.years ?? 1))
  const [paid, setPaid] = useState(String(customer.value))
  const [contractEnd, setContractEnd] = useState(customer.contractEnd ?? '')
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(customer.accountStatus ?? '正常客户')
  const [source, setSource] = useState(customer.source ?? '')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) return setError('请填写公司名称（至少 2 个字）')
    const amount = Number(paid)
    if (Number.isNaN(amount) || amount < 0) return setError('历史实付需要是数字')
    crm.patchCustomer(customer.id, {
      name: name.trim(),
      province: province.trim(),
      city: city.trim(),
      products: products.trim(),
      productDetail: products.trim(),
      trade: trade.trim(),
      industry: trade.trim(),
      level,
      years: Number(years) || 1,
      value: amount,
      contractEnd,
      accountStatus,
      source: source.trim(),
    })
    crm.pushToast('客户资料已更新（仅演示数据）')
    onClose()
  }

  return (
    <form className="cust-edit" onSubmit={submit}>
      <input value={name} aria-label="公司名称" onChange={(event) => setName(event.target.value)} />
      <input value={province} aria-label="省份" placeholder="省份" onChange={(event) => setProvince(event.target.value)} />
      <input value={city} aria-label="城市" placeholder="城市" onChange={(event) => setCity(event.target.value)} />
      <input value={products} aria-label="主营产品" placeholder="主营产品" onChange={(event) => setProducts(event.target.value)} />
      <input value={trade} aria-label="所属行业" placeholder="所属行业" onChange={(event) => setTrade(event.target.value)} />
      <select aria-label="客户等级" value={level} onChange={(event) => setLevel(event.target.value as CustomerLevel)}>
        <option>高价值</option><option>重要客户</option><option>潜力客户</option>
      </select>
      <input value={years} aria-label="合作年限" onChange={(event) => setYears(event.target.value)} />
      <input value={paid} aria-label="历史实付" onChange={(event) => setPaid(event.target.value)} />
      <input type="date" aria-label="合同到期日" value={contractEnd} onChange={(event) => setContractEnd(event.target.value)} />
      <select aria-label="客户状态" value={accountStatus} onChange={(event) => setAccountStatus(event.target.value as AccountStatus)}>
        <option>正常客户</option><option>沉睡客户</option><option>即将到期</option><option>加购机会</option>
      </select>
      <input value={source} aria-label="客户来源" placeholder="客户来源" onChange={(event) => setSource(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <button type="submit" className="mic-primary">保存</button>
    </form>
  )
}

function ContactForm({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const crm = useCrm()
  const customer = crm.customers.find((item) => item.id === customerId)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !role.trim() || phone.trim().length < 4) return setError('请填写姓名、职务和电话')
    crm.patchCustomer(customerId, {
      contacts: [...(customer?.contacts ?? []), { id: `ct-${Date.now().toString(36)}`, name: name.trim(), role: role.trim(), phone: phone.trim() }],
    })
    crm.pushToast('联系人已加入演示资料')
    onClose()
  }
  return (
    <form className="cust-edit" onSubmit={submit}>
      <input value={name} placeholder="姓名" aria-label="联系人姓名" onChange={(event) => setName(event.target.value)} />
      <input value={role} placeholder="职务" aria-label="联系人职务" onChange={(event) => setRole(event.target.value)} />
      <input value={phone} placeholder="电话（可打码）" aria-label="联系人电话" onChange={(event) => setPhone(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <button type="submit" className="mic-primary">保存联系人</button>
    </form>
  )
}

function PlanForm({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const crm = useCrm()
  const customer = crm.customers.find((item) => item.id === customerId)
  const [at, setAt] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!at.trim() || text.trim().length < 2) return setError('请填写时间和跟进内容')
    crm.patchCustomer(customerId, {
      plans: [...(customer?.plans ?? []), { id: `pl-${Date.now().toString(36)}`, at: at.trim(), text: text.trim(), done: false }],
      nextFollow: at.trim().slice(0, 5),
    })
    crm.pushToast('跟进计划已加入（演示数据）')
    onClose()
  }
  return (
    <form className="cust-edit" onSubmit={submit}>
      <input value={at} placeholder="10-26 15:00" aria-label="计划时间" onChange={(event) => setAt(event.target.value)} />
      <textarea value={text} placeholder="这次要沟通什么" aria-label="计划内容" onChange={(event) => setText(event.target.value)} />
      {error ? <span className="mic-err" role="alert">{error}</span> : null}
      <button type="submit" className="mic-primary">保存计划</button>
    </form>
  )
}

function levelLabel(level?: string) {
  if (!level) return '—'
  return level.endsWith('客户') ? level : `${level}客户`
}

function infoClass(label: string, value: string) {
  if (label === '历史实付' || label === '合同到期日') return 'hot'
  if (label === '客户等级') return 'level'
  if (label === '客户状态') return `status ${value}`
  return undefined
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
  const header = ['公司名称', '省份', '城市', '主营产品', '所属行业', '客户等级', '合作年限', '历史实付', '合同到期日', '客户状态', '下次跟进']
  const lines = rows.map((item) => [item.name, item.province || '', item.city || '', item.products || '', item.trade || '', item.level || '', String(item.years || ''), String(item.value), item.contractEnd || '', item.accountStatus || '', item.nextFollow || ''].map(csvCell).join(','))
  const blob = new Blob([`\uFEFF${header.join(',')}\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '客户演示数据.csv'
  link.click()
  URL.revokeObjectURL(link.href)
  pushToast(`已导出 ${rows.length} 条演示客户（CSV，可用 Excel 打开）`)
}
