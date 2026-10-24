import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  ChartNoAxesCombined,
  ChevronDown,
  Download,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Settings,
  Sparkles,
  Target,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import logo from './assets/crm/logo-mark.png'
import avatar from './assets/crm/avatar.png'
import './customers.css'
import './analytics.css'

type Range = 'month' | 'quarter' | 'year'

const NAV = [
  { label: '工作台', href: '/dashboard.html' },
  { label: '客户中心', href: '/customers.html' },
  { label: '待办日程', href: '' },
  { label: '数据分析', href: '/analytics.html' },
  { label: '商机管理', href: '' },
  { label: '营销工具', href: '' },
  { label: '系统设置', href: '' },
] as const

const NAV_ICONS = [LayoutDashboard, Users, CalendarCheck, ChartNoAxesCombined, Target, MessagesSquare, Settings]

const RANGE_COPY: Record<Range, string> = {
  month: '本月',
  quarter: '本季',
  year: '本年',
}

const KPI_BY_RANGE: Record<Range, { label: string; value: string; delta: string; up: boolean; foot: string; tone: string }[]> = {
  month: [
    { label: '成交金额', value: '¥86.8万', delta: '+18%', up: true, foot: '含续约与加购', tone: 'blue' },
    { label: '新增客户', value: '52', delta: '+12%', up: true, foot: '较上月 +6 家', tone: 'violet' },
    { label: '续约率', value: '78%', delta: '+5%', up: true, foot: '到期客户 18 家', tone: 'green' },
    { label: '跟进覆盖', value: '86%', delta: '-3%', up: false, foot: '本月活跃客户', tone: 'cyan' },
    { label: '商机转化', value: '14%', delta: '+2%', up: true, foot: '漏斗赢单 12 单', tone: 'orange' },
    { label: '客单价', value: '¥1.67万', delta: '+8%', up: true, foot: '成交客户均值', tone: 'gold' },
  ],
  quarter: [
    { label: '成交金额', value: '¥246万', delta: '+21%', up: true, foot: 'Q3 累计成交', tone: 'blue' },
    { label: '新增客户', value: '146', delta: '+9%', up: true, foot: '较上季 +12 家', tone: 'violet' },
    { label: '续约率', value: '74%', delta: '+3%', up: true, foot: '到期客户 52 家', tone: 'green' },
    { label: '跟进覆盖', value: '81%', delta: '+1%', up: true, foot: '季度活跃客户', tone: 'cyan' },
    { label: '商机转化', value: '13%', delta: '+1%', up: true, foot: '漏斗赢单 34 单', tone: 'orange' },
    { label: '客单价', value: '¥1.68万', delta: '+6%', up: true, foot: '成交客户均值', tone: 'gold' },
  ],
  year: [
    { label: '成交金额', value: '¥918万', delta: '+16%', up: true, foot: '年度累计成交', tone: 'blue' },
    { label: '新增客户', value: '486', delta: '+11%', up: true, foot: '较去年 +48 家', tone: 'violet' },
    { label: '续约率', value: '72%', delta: '+4%', up: true, foot: '到期客户 186 家', tone: 'green' },
    { label: '跟进覆盖', value: '79%', delta: '-1%', up: false, foot: '年度活跃客户', tone: 'cyan' },
    { label: '商机转化', value: '12%', delta: '+2%', up: true, foot: '漏斗赢单 118 单', tone: 'orange' },
    { label: '客单价', value: '¥1.89万', delta: '+7%', up: true, foot: '成交客户均值', tone: 'gold' },
  ],
}

const TREND_BY_RANGE: Record<Range, { labels: string[]; revenue: number[]; renew: number[] }> = {
  month: {
    labels: ['第1周', '第2周', '第3周', '第4周'],
    revenue: [16, 22, 19, 29.8],
    renew: [8, 11, 10, 14],
  },
  quarter: {
    labels: ['7月', '8月', '9月'],
    revenue: [72, 81, 93],
    renew: [28, 32, 36],
  },
  year: {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'],
    revenue: [58, 62, 70, 74, 78, 82, 72, 81, 93, 86.8],
    renew: [18, 20, 24, 26, 28, 30, 28, 32, 36, 34],
  },
}

const FUNNEL = [
  { label: '发现机会', value: 86, color: '#0868ff' },
  { label: '确认需求', value: 64, color: '#3b8cff' },
  { label: '方案准备', value: 48, color: '#00bd98' },
  { label: '已报价', value: 32, color: '#34d399' },
  { label: '商务谈判', value: 18, color: '#ffb21a' },
  { label: '赢单', value: 12, color: '#f79009' },
]

const STRUCTURE = [
  ['高价值客户', 64, '#0868ff'],
  ['重要客户', 98, '#00bd98'],
  ['潜力客户', 76, '#ffb21a'],
  ['一般客户', 48, '#8a5dff'],
] as const

const REGIONS = [
  ['浙江', 68, 238],
  ['广东', 42, 146],
  ['江苏', 28, 92],
  ['山东', 18, 64],
  ['上海', 12, 48],
] as const

const RANKING = [
  { name: '宁波优来特进出口有限公司', amount: 158000, stage: '续约推进', trend: '+12%' },
  { name: '宁波正律电子有限公司', amount: 120000, stage: '正常合作', trend: '+8%' },
  { name: '慈溪长城制刷有限公司', amount: 86000, stage: '加购意向', trend: '+15%' },
  { name: '青岛海明机械设备有限公司', amount: 76000, stage: '方案报价', trend: '+6%' },
  { name: '温州瑞丰电材有限公司', amount: 68000, stage: '即将到期', trend: '-3%' },
]

const INSIGHTS = [
  { tone: 'blue', title: '续约窗口集中', body: '未来 30 天有 18 家客户到期，建议本周优先跟进浙江高价值客户。' },
  { tone: 'green', title: '加购机会升温', body: '聚焦 APP / 精点投相关商机转化提升 2 个点，可沉淀行业案例加速推进。' },
  { tone: 'orange', title: '沉睡客户回流', body: '48 家沉睡客户中 12 家近两周有互动，适合安排盘活拜访与再报价。' },
]

function TrendChart({ labels, revenue, renew }: { labels: string[]; revenue: number[]; renew: number[] }) {
  const geometry = useMemo(() => {
    const width = 640
    const height = 240
    const pad = { l: 40, r: 16, t: 18, b: 32 }
    const innerW = width - pad.l - pad.r
    const innerH = height - pad.t - pad.b
    const max = Math.max(...revenue, ...renew, 1)
    const xAt = (index: number) => pad.l + (labels.length === 1 ? innerW / 2 : (index * innerW) / (labels.length - 1))
    const yAt = (value: number) => pad.t + (1 - value / max) * innerH
    const path = (values: number[]) => values.map((value, index) => `${index === 0 ? 'M' : 'L'}${xAt(index).toFixed(1)},${yAt(value).toFixed(1)}`).join(' ')
    const area = `${path(revenue)} L${xAt(revenue.length - 1).toFixed(1)},${(pad.t + innerH).toFixed(1)} L${xAt(0).toFixed(1)},${(pad.t + innerH).toFixed(1)} Z`
    return { width, height, pad, max, xAt, yAt, revenuePath: path(revenue), renewPath: path(renew), area }
  }, [labels, revenue, renew])

  return (
    <svg className="an-trend" viewBox={`0 0 ${geometry.width} ${geometry.height}`} role="img" aria-label="业绩趋势图">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = geometry.pad.t + (1 - ratio) * (geometry.height - geometry.pad.t - geometry.pad.b)
        return <line key={ratio} x1={geometry.pad.l} x2={geometry.width - geometry.pad.r} y1={y} y2={y} className="an-grid" />
      })}
      <path d={geometry.area} className="an-area" />
      <path d={geometry.revenuePath} className="an-line revenue" />
      <path d={geometry.renewPath} className="an-line renew" />
      {revenue.map((value, index) => (
        <circle key={`r-${index}`} cx={geometry.xAt(index)} cy={geometry.yAt(value)} r="3.5" className="an-dot revenue" />
      ))}
      {renew.map((value, index) => (
        <circle key={`n-${index}`} cx={geometry.xAt(index)} cy={geometry.yAt(value)} r="3.5" className="an-dot renew" />
      ))}
      {labels.map((label, index) => (
        <text key={label} x={geometry.xAt(index)} y={geometry.height - 10} textAnchor="middle" className="an-axis">
          {label}
        </text>
      ))}
    </svg>
  )
}

function StructureDonut({ items }: { items: readonly (readonly [string, number, string])[] }) {
  const total = items.reduce((sum, [, value]) => sum + value, 0)
  let cursor = 0
  const gradient = items
    .map(([, value, color]) => {
      const start = (cursor / total) * 100
      cursor += value
      const end = (cursor / total) * 100
      return `${color} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="donut-layout an-donut">
      <div className="donut" style={{ background: `conic-gradient(${gradient})` }} role="img" aria-label="客户结构分布">
        <div>
          <strong>{total}</strong>
          <small>在服客户</small>
        </div>
      </div>
      <ul>
        {items.map(([label, value, color]) => (
          <li key={label}>
            <i style={{ background: color }} />
            <span>{label}</span>
            <b>{value}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  const [range, setRange] = useState<Range>('month')
  const [mobile, setMobile] = useState(false)
  const [toast, setToast] = useState('')
  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const kpis = KPI_BY_RANGE[range]
  const trend = TREND_BY_RANGE[range]
  const funnelMax = FUNNEL[0].value

  return (
    <div className="customer-app analytics-page">
      {mobile ? <button className="nav-mask" aria-label="关闭导航" onClick={() => setMobile(false)} /> : null}

      <aside className={`customer-sidebar${mobile ? ' open' : ''}`}>
        <a className="brand" href="/dashboard.html">
          <img src={logo} alt="MIC" />
          <div>
            <strong>MIC Sales CRM</strong>
            <small>中国制造网 · 个人销售管理系统</small>
          </div>
        </a>
        <nav>
          {NAV.map((item, index) => {
            const Icon = NAV_ICONS[index]
            return (
              <button
                key={item.label}
                type="button"
                className={index === 3 ? 'active' : undefined}
                onClick={() => {
                  setMobile(false)
                  if (item.href) location.assign(item.href)
                  else notify(`${item.label}模块尚未接入`)
                }}
              >
                <Icon size={21} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-building" aria-hidden="true" />
        <footer>
          <span>专业 · 高效 · 可靠 · 成长</span>
          <button type="button" aria-label="收起导航" onClick={() => setMobile(false)}>
            <Menu size={20} />
          </button>
        </footer>
      </aside>

      <main className="customer-main">
        <header className="page-header">
          <div className="page-title">
            <button type="button" className="mobile-menu icon-button" aria-label="打开导航" onClick={() => setMobile(true)}>
              <Menu />
            </button>
            <div>
              <h1>数据分析</h1>
              <p>洞察成交表现 · 掌握客户结构 · 锁定续约与加购机会</p>
            </div>
          </div>
          <div className="header-tools an-tools">
            <div className="an-range" role="tablist" aria-label="统计周期">
              {(Object.keys(RANGE_COPY) as Range[]).map((key) => (
                <button key={key} type="button" role="tab" aria-selected={range === key} className={range === key ? 'active' : undefined} onClick={() => setRange(key)}>
                  {RANGE_COPY[key]}
                </button>
              ))}
            </div>
            <button type="button" className="primary" onClick={() => notify('报表导出尚未接入，当前为演示界面')}>
              <Download size={18} />
              导出报表
            </button>
            <button type="button" className="icon-button notification" aria-label="通知" onClick={() => notify('暂无新通知，12 为设计演示数字')}>
              <Bell />
              <sup>12</sup>
            </button>
            <button type="button" className="icon-button help" aria-label="帮助" onClick={() => notify('可切换本月 / 本季 / 本年查看演示指标。')}>
              <HelpCircle />
            </button>
            <button type="button" className="account" aria-label="账号菜单" onClick={() => notify('当前使用演示账号，登录服务尚未接入')}>
              <img src={avatar} alt="张晓丽" />
              <ChevronDown size={17} />
            </button>
          </div>
        </header>

        <section className="an-kpis" aria-label="核心指标">
          {kpis.map((item) => (
            <article key={item.label} className={`an-kpi tone-${item.tone}`}>
              <div className="an-kpi-top">
                <span>{item.label}</span>
                <em className={item.up ? 'up' : 'down'}>
                  {item.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {item.delta}
                </em>
              </div>
              <strong>{item.value}</strong>
              <small>{item.foot}</small>
            </article>
          ))}
        </section>

        <section className="an-main">
          <article className="panel an-panel">
            <div className="an-panel-hd">
              <h2>业绩趋势</h2>
              <div className="an-legend">
                <span><i className="revenue" />成交金额（万）</span>
                <span><i className="renew" />续约金额（万）</span>
              </div>
            </div>
            <TrendChart labels={trend.labels} revenue={trend.revenue} renew={trend.renew} />
          </article>

          <article className="panel an-panel">
            <div className="an-panel-hd">
              <h2>商机漏斗</h2>
              <small>本月 · 转化率 {(FUNNEL[FUNNEL.length - 1].value / FUNNEL[0].value * 100).toFixed(0)}%</small>
            </div>
            <div className="an-funnel">
              {FUNNEL.map((item, index) => {
                const width = 42 + (item.value / funnelMax) * 58
                const next = FUNNEL[index + 1]
                const rate = next ? `${Math.round((next.value / item.value) * 100)}%` : '赢单'
                return (
                  <div key={item.label} className="an-funnel-row">
                    <span>{item.label}</span>
                    <div className="an-funnel-track">
                      <b style={{ width: `${width}%`, background: item.color }}>{item.value}</b>
                    </div>
                    <em>{rate}</em>
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        <section className="an-secondary">
          <article className="panel an-panel">
            <div className="an-panel-hd">
              <h2>客户结构</h2>
              <small>按客户等级</small>
            </div>
            <StructureDonut items={STRUCTURE} />
          </article>

          <article className="panel an-panel">
            <div className="an-panel-hd">
              <h2>地区贡献</h2>
              <small>成交金额 TOP5</small>
            </div>
            <div className="an-regions">
              {REGIONS.map(([name, count, amount], index) => (
                <button key={name} type="button" onClick={() => notify(`已记录「${name}」筛选意向，地区下钻尚未接入`)}>
                  <i>{index + 1}</i>
                  <b>{name}</b>
                  <span className="an-region-bar"><span style={{ width: `${(amount / REGIONS[0][2]) * 100}%` }} /></span>
                  <em>{count} 家</em>
                  <strong>¥{amount}万</strong>
                </button>
              ))}
            </div>
          </article>

          <article className="panel an-panel an-rank-panel">
            <div className="an-panel-hd">
              <h2>客户贡献榜</h2>
              <button type="button" className="an-link" onClick={() => location.assign('/customers.html')}>
                查看客户中心 →
              </button>
            </div>
            <div className="an-rank-table">
              <div className="an-rank-head">
                <span>客户</span>
                <span>历史实付</span>
                <span>阶段</span>
                <span>环比</span>
              </div>
              {RANKING.map((item, index) => (
                <div key={item.name} className="an-rank-row">
                  <span>
                    <i>{index + 1}</i>
                    <button type="button" onClick={() => location.assign('/detail.html?id=youlaite')}>{item.name}</button>
                  </span>
                  <strong>¥{item.amount.toLocaleString('zh-CN')}</strong>
                  <em>{item.stage}</em>
                  <b className={item.trend.startsWith('-') ? 'down' : 'up'}>{item.trend}</b>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="an-insights panel">
          <div className="an-panel-hd">
            <h2><Sparkles size={16} /> 经营洞察</h2>
            <small>基于演示样本生成，不代表真实业务</small>
          </div>
          <div className="an-insight-grid">
            {INSIGHTS.map((item) => (
              <article key={item.title} className={`tone-${item.tone}`}>
                <b>{item.title}</b>
                <p>{item.body}</p>
              </article>
            ))}
            <article className="an-goal">
              <Wallet size={18} />
              <div>
                <b>本月目标完成 68%</b>
                <p>已完成 ¥34.2万 / 目标 ¥50万，距离目标还差 ¥15.8万。</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
