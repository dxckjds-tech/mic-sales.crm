import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, Crown, TrendingUp, UserRound, Users, Wallet } from 'lucide-react'
import building from '@/assets/crm/hero-building.png'
import { FUNNEL_LAST, FUNNEL_MONTH, KPI_ITEMS, SEGMENT_COUNTS, TREND_MONTHS, TREND_SERIES, TREND_TABS, money, shanghaiDateLine } from '@/crm/data'
import { useCrm } from '@/crm/crm-context'
import type { Segment } from '@/crm/types'
import { ChannelIcon, CompanyMark, findCustomer } from '@/crm/components/bits'

const KPI_ICONS = {
  total: Users,
  vip: Crown,
  sleep: UserRound,
  due: CalendarClock,
  addon: TrendingUp,
  forecast: Wallet,
} as const

export function Workbench() {
  const crm = useCrm()
  const recentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (crm.followUps[0]?.fresh) recentRef.current?.scrollIntoView({ block: 'center' })
  }, [crm.followUps])

  return (
    <div>
      <section className="mic-hero">
        <div>
          <h1>早上好，张晓丽！</h1>
          <p>
            {shanghaiDateLine()}
            <br />
            持续跟进，深耕客户，创造更多合作机会！
          </p>
        </div>
        <img className="mic-hero-art" src={building} alt="" />
        <div className="mic-quote">
          <i aria-hidden="true">“</i>
          <div>
            好的客户经营
            <br />
            是持续的专业服务
            <br />
            而不是一次性的成交
          </div>
          <i aria-hidden="true">”</i>
        </div>
      </section>

      <section className="mic-kpis" aria-label="客户指标">
        {KPI_ITEMS.map((item) => {
          const Icon = KPI_ICONS[item.key]
          return (
            <article key={item.key} className="mic-card mic-kpi">
              <div className={`mic-kpi-icon ${item.tone}`}>
                <Icon size={18} />
              </div>
              <div className="mic-kpi-copy">
                <em>{item.label}</em>
                <div className="mic-kpi-num">
                  <b>{item.value}</b>
                  <span className="mic-up">↑ {item.delta}</span>
                </div>
                <small>{item.foot}</small>
              </div>
            </article>
          )
        })}
      </section>

      <section className="mic-charts">
        <TrendCard />
        <FunnelCard />
        <PerformanceCard />
      </section>

      <section className="mic-bottom">
        <TodoCard />
        <KeyCustomerCard />
        <FollowCard rootRef={recentRef} />
      </section>
    </div>
  )
}

function TrendCard() {
  const crm = useCrm()
  const count = crm.trendRange === '3m' ? 3 : 7
  const added = TREND_SERIES[crm.trendTab].added.slice(-count)
  const won = TREND_SERIES[crm.trendTab].won.slice(-count)
  const months = TREND_MONTHS.slice(-count)
  const [hover, setHover] = useState<number | null>(null)
  const active = hover ?? added.length - 1

  const geometry = useMemo(() => {
    const width = 560
    const height = 196
    const pad = { l: 34, r: 12, t: 12, b: 24 }
    const innerW = width - pad.l - pad.r
    const innerH = height - pad.t - pad.b
    const xAt = (index: number) => pad.l + (added.length === 1 ? innerW / 2 : (index * innerW) / (added.length - 1))
    const yAt = (value: number) => pad.t + (1 - value / 80) * innerH
    const line = (values: number[]) => values.map((value, index) => `${index === 0 ? 'M' : 'L'}${xAt(index).toFixed(1)},${yAt(value).toFixed(1)}`).join(' ')
    return { width, height, pad, xAt, yAt, addedPath: line(added), wonPath: line(won) }
  }, [added, won])

  const tipX = geometry.xAt(active)
  const tipY = Math.min(geometry.yAt(added[active] ?? 0), geometry.yAt(won[active] ?? 0))
  const boxW = 132
  const boxX = tipX + boxW + 16 > geometry.width ? tipX - boxW - 10 : tipX + 10
  const boxY = Math.max(4, tipY - 28)

  return (
    <article className="mic-card">
      <div className="mic-hd">
        <i className="mic-accent" />
        <h2>客户趋势</h2>
        <div className="mic-tabs" role="tablist" aria-label="客户趋势">
          {TREND_TABS.map((tab) => (
            <button key={tab} type="button" className={crm.trendTab === tab ? 'active' : undefined} onClick={() => crm.setTrendTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <select className="mic-select" aria-label="趋势时间范围" value={crm.trendRange} onChange={(event) => crm.setTrendRange(event.target.value as '6m' | '3m')}>
          <option value="6m">近6个月</option>
          <option value="3m">近3个月</option>
        </select>
      </div>
      <div className="mic-legend">
        <span><i style={{ background: '#2f80ff' }} />新增客户</span>
        <span><i style={{ background: '#12b76a' }} />成交客户</span>
      </div>
      <svg className="mic-chart" viewBox={`0 0 ${geometry.width} ${geometry.height}`} role="img" aria-label={`${crm.trendTab}趋势，演示数据`}>
        {[0, 20, 40, 60, 80].map((tick) => (
          <g key={tick}>
            <line x1={geometry.pad.l} x2={geometry.width - geometry.pad.r} y1={geometry.yAt(tick)} y2={geometry.yAt(tick)} stroke="#eef2f6" />
            <text x={geometry.pad.l - 8} y={geometry.yAt(tick) + 4} textAnchor="end" fontSize="11" fill="#98a2b3">{tick}</text>
          </g>
        ))}
        <path d={geometry.addedPath} fill="none" stroke="#2f80ff" strokeWidth="2.4" />
        <path d={geometry.wonPath} fill="none" stroke="#12b76a" strokeWidth="2.4" />
        {added.map((value, index) => (
          <g key={months[index]}>
            <circle cx={geometry.xAt(index)} cy={geometry.yAt(value)} r={index === active ? 4.5 : 3.2} fill="#2f80ff" />
            <circle cx={geometry.xAt(index)} cy={geometry.yAt(won[index] ?? 0)} r={index === active ? 4.5 : 3.2} fill="#12b76a" />
            <text x={geometry.xAt(index)} y={geometry.height - 6} textAnchor="middle" fontSize="11" fill="#98a2b3">{months[index]}</text>
            <rect x={geometry.xAt(index) - 18} y={geometry.pad.t} width="36" height={geometry.height - geometry.pad.t - geometry.pad.b} fill="transparent" onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} />
          </g>
        ))}
        <g>
          <rect x={boxX} y={boxY} width={boxW} height="54" rx="6" fill="#1d2939" />
          <text x={boxX + 10} y={boxY + 16} fontSize="12" fill="#fff">{months[active]}</text>
          <circle cx={boxX + 14} cy={boxY + 30} r="3" fill="#2f80ff" />
          <text x={boxX + 22} y={boxY + 34} fontSize="11" fill="#fff">新增客户：{added[active]}</text>
          <circle cx={boxX + 14} cy={boxY + 44} r="3" fill="#12b76a" />
          <text x={boxX + 22} y={boxY + 48} fontSize="11" fill="#fff">成交客户：{won[active]}</text>
        </g>
      </svg>
    </article>
  )
}

function FunnelCard() {
  const crm = useCrm()
  const rows = crm.funnelRange === 'month' ? FUNNEL_MONTH : FUNNEL_LAST
  const bands = rows.map((row, index) => {
    const count = rows.length
    const top = index / count
    const bottom = (index + 1) / count
    const widthAt = (t: number) => 98 - t * 90
    const w1 = widthAt(top)
    const w2 = widthAt(bottom)
    const y1 = top * 100 + (index === 0 ? 0 : 1.1)
    const y2 = bottom * 100 - 1.1
    const x1 = (100 - w1) / 2
    const x2 = (100 - w2) / 2
    return { ...row, points: `${x1},${y1} ${x1 + w1},${y1} ${x2 + w2},${y2} ${x2},${y2}` }
  })

  return (
    <article className="mic-card">
      <div className="mic-hd">
        <i className="mic-accent" />
        <h2>商机漏斗</h2>
        <select className="mic-select" aria-label="漏斗时间范围" value={crm.funnelRange} onChange={(event) => crm.setFunnelRange(event.target.value as 'month' | 'last')}>
          <option value="month">本月</option>
          <option value="last">上月</option>
        </select>
      </div>
      <div className="mic-funnel">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="商机漏斗">
          {bands.map((band) => (
            <polygon key={band.label} points={band.points} fill={band.color} />
          ))}
        </svg>
        <div className="mic-funnel-rows">
          {rows.map((row) => (
            <div key={row.label}>
              <span>{row.label}</span>
              <b>{row.value}</b>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function PerformanceCard() {
  const crm = useCrm()
  const radius = 42
  const circ = 2 * Math.PI * radius
  const dash = circ * 0.68
  return (
    <article className="mic-card">
      <div className="mic-hd">
        <i className="mic-accent" />
        <h2>本月业绩</h2>
        <button type="button" className="mic-link" onClick={() => crm.setPerfOpen(true)}>查看详情 ›</button>
      </div>
      <div className="mic-perf-main">
        <svg className="mic-donut" viewBox="0 0 116 116" role="img" aria-label="完成率 68%">
          <circle cx="58" cy="58" r={radius} fill="none" stroke="#eef2f6" strokeWidth="10" />
          <circle cx="58" cy="58" r={radius} fill="none" stroke="#1677ff" strokeWidth="10" strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" transform="rotate(-90 58 58)" />
          <text x="58" y="64" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1d2939">68%</text>
        </svg>
        <div className="mic-perf-fig">
          <b>¥34.2万</b>
          <span>/ ¥50万</span>
          <div className="mic-up">较上月 ↑ 18%</div>
        </div>
      </div>
      <div className="mic-perf-stats">
        <div><b>28</b><span>已成交客户</span><em className="mic-up">↑ 27%</em></div>
        <div><b>52</b><span>新增客户</span><em className="mic-up">↑ 18%</em></div>
        <div><b>156</b><span>跟进客户</span><em className="mic-up">↑ 12%</em></div>
        <div><b>¥260万</b><span>商机金额</span><em className="mic-up">↑ 35%</em></div>
      </div>
      {crm.perfOpen ? (
        <div className="mic-mask" onClick={() => crm.setPerfOpen(false)}>
          <div className="mic-dialog" role="dialog" aria-label="本月业绩详情" onClick={(event) => event.stopPropagation()}>
            <div className="mic-dialog-hd">
              <div>
                <div className="mic-unfinished">明细尚未完成</div>
                <h3>本月业绩</h3>
              </div>
              <button type="button" className="mic-x" aria-label="关闭" onClick={() => crm.setPerfOpen(false)}>×</button>
            </div>
            <p className="lead" style={{ color: '#667085', marginTop: 0 }}>
              这里重复的是设计稿上的演示指标：成交 ¥34.2万 / 目标 ¥50万，完成率 68%。按销售、产品、区域下钻和导出都还没有做。
            </p>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function TodoCard() {
  const crm = useCrm()
  const visible = crm.todosExpanded ? crm.todos : crm.todos.slice(0, 5)
  return (
    <article className="mic-card">
      <div className="mic-hd">
        <i className="mic-accent" />
        <h2>今日待办（{crm.openTodos}）</h2>
        <button type="button" className="mic-link" onClick={() => crm.setTodosExpanded(!crm.todosExpanded)}>
          {crm.todosExpanded ? '收起' : '查看全部 ›'}
        </button>
      </div>
      <div className="mic-todo">
        {visible.map((todo) => {
          const customer = findCustomer(crm.customers, todo.customerId)
          return (
            <div key={todo.id} className={todo.done ? 'mic-todo-row done' : 'mic-todo-row'} data-testid={`todo-${todo.id}`}>
              <input className="mic-check" type="checkbox" checked={todo.done} aria-label={`完成待办 ${todo.title}`} onChange={() => crm.toggleTodo(todo.id)} />
              <span className={`mic-prio ${todo.priority}`}>{todo.priority}</span>
              <ChannelIcon channel={todo.channel} />
              <div style={{ minWidth: 0 }}>
                <button type="button" className="mic-name-btn" onClick={() => customer && crm.openCustomer(customer.id)}>
                  {customer?.name ?? '演示客户'}
                </button>
                <div className="mic-todo-sub">{todo.title}</div>
              </div>
              <span className="mic-time">{todo.time}</span>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function KeyCustomerCard() {
  const crm = useCrm()
  const tabs: Segment[] = ['即将到期', '沉睡客户', '高价值客户', '加购机会']
  const rows = crm.customers.filter((item) => item.segments.includes(crm.keyTab))
  return (
    <article className="mic-card">
      <div className="mic-hd">
        <i className="mic-accent" />
        <h2>重点客户提醒</h2>
        <button type="button" className="mic-link" onClick={() => crm.setNav('customers')}>查看全部 ›</button>
      </div>
      <div className="mic-key-tabs" role="tablist">
        {tabs.map((tab) => (
          <button key={tab} type="button" title="括号里的数字是设计稿演示汇总，表格只列出样本客户" className={crm.keyTab === tab ? 'active' : undefined} onClick={() => crm.setKeyTab(tab)}>
            {tab}（{SEGMENT_COUNTS[tab]}）
          </button>
        ))}
      </div>
      <div className="mic-table-wrap">
        <table className="mic-table">
          <thead>
            <tr>
              <th>客户名称</th>
              <th>剩余天数</th>
              <th>客户价值</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="who">
                    <CompanyMark mark={row.mark} />
                    <button type="button" className="mic-name-btn" data-testid={`customer-${row.id}`} onClick={() => crm.openCustomer(row.id)}>
                      {row.name}
                    </button>
                  </div>
                </td>
                <td className="mic-days">{row.daysLeft}天</td>
                <td>{money(row.value)}</td>
                <td><span className={`mic-tag ${row.status}`}>{row.status}</span></td>
                <td>
                  <button type="button" className="mic-follow-btn" onClick={() => crm.openFollowUp(row.id)}>跟进</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function FollowCard({ rootRef }: { rootRef: React.RefObject<HTMLElement | null> }) {
  const crm = useCrm()
  return (
    <article className="mic-card" ref={rootRef} id="recent-follow-ups" data-testid="recent-followups">
      <div className="mic-hd">
        <i className="mic-accent" />
        <h2>最近跟进记录</h2>
        <button type="button" className="mic-link" onClick={() => crm.setNav('followups')}>查看全部 ›</button>
      </div>
      <div className="mic-feed">
        {crm.followUps.slice(0, 6).map((item) => {
          const customer = findCustomer(crm.customers, item.customerId)
          return (
            <div key={item.id} className={item.fresh ? 'mic-feed-row mic-fresh' : 'mic-feed-row'} data-testid={`follow-${item.id}`}>
              <ChannelIcon channel={item.channel} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <button type="button" className="mic-name-btn" onClick={() => customer && crm.openCustomer(customer.id)}>
                    {customer?.name ?? '演示客户'}
                  </button>
                  <span className="mic-time">{item.atLabel}</span>
                </div>
                <div className="mic-feed-text">{item.summary}</div>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
