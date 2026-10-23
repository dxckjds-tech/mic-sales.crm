import { useMemo, useState, type ReactNode } from 'react'
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  Flag,
  ListTodo,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Users,
  Video,
} from 'lucide-react'
import { useCrm } from '@/crm/crm-context'
import {
  SCHEDULE_CHANNEL_BARS,
  SCHEDULE_DONE_TODAY,
  SCHEDULE_DOT_DAYS,
  SCHEDULE_FILTERS,
  SCHEDULE_ITEMS,
  SCHEDULE_METRICS,
  SCHEDULE_OVERDUE,
  SCHEDULE_TODAY,
  SCHEDULE_WEEK_BARS,
  SCHEDULE_WEEK_TOTAL,
  formatScheduleDate,
  type ScheduleItem,
  type ScheduleKind,
} from '@/crm/schedule'

type ViewMode = 'day' | 'week' | 'month'

const KIND_ICON = {
  phone: Phone,
  wechat: MessageCircle,
  visit: Users,
  meeting: Video,
  mail: Mail,
  other: MoreHorizontal,
  all: ListTodo,
} as const

const METRIC_ICON = {
  list: ClipboardList,
  clock: Clock3,
  calendar: CalendarDays,
  check: CheckCircle2,
  user: Users,
  phone: Phone,
  wechat: MessageCircle,
  mail: Mail,
} as const

export function Schedule() {
  const crm = useCrm()
  const [anchor, setAnchor] = useState(SCHEDULE_TODAY)
  const [view, setView] = useState<ViewMode>('day')
  const [filter, setFilter] = useState<'all' | ScheduleKind>('all')
  const [level, setLevel] = useState('')
  const [trade, setTrade] = useState('')
  const [province, setProvince] = useState('')
  const [items, setItems] = useState(() => SCHEDULE_ITEMS.map((item) => ({ ...item })))
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(`${SCHEDULE_TODAY}T12:00:00`)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const trades = unique(items.map((item) => item.trade || ''))
  const provinces = unique(items.map((item) => item.province || ''))

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false
      if (level && item.level !== level) return false
      if (trade && item.trade !== trade) return false
      if (province && item.province !== province) return false
      if (view === 'day') {
        return item.date === anchor || item.date === addDays(anchor, 1) || item.date === '2026-10-26'
      }
      return true
    })
  }, [items, filter, level, trade, province, view, anchor])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  function toggleDone(id: string) {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
    crm.pushToast('已更新演示日程状态')
  }

  return (
    <div className="sch">
      <div className="sch-metrics">
        {SCHEDULE_METRICS.map((item) => {
          const Icon = METRIC_ICON[item.icon]
          return (
            <article key={item.key} className={`sch-metric tone-${item.tone}`}>
              <span className="sch-metric-icon" aria-hidden="true"><Icon size={16} /></span>
              <div>
                <span className="sch-metric-label">{item.label}</span>
                <b>{item.value}</b>
                <small className={'footTone' in item && item.footTone === 'green' ? 'good' : undefined}>
                  {item.foot}
                  {item.delta ? <> <em className={item.up ? 'up' : 'down'}>{item.delta}</em></> : null}
                </small>
              </div>
            </article>
          )
        })}
      </div>

      <div className="sch-board">
        <aside className="sch-left">
          <section className="mic-card sch-card">
            <header className="sch-card-hd cal">
              <button type="button" aria-label="上个月" onClick={() => setCalMonth(shiftMonth(calMonth, -1))}><ChevronLeft size={14} /></button>
              <strong>{calMonth.year}年{calMonth.month + 1}月</strong>
              <button type="button" aria-label="下个月" onClick={() => setCalMonth(shiftMonth(calMonth, 1))}><ChevronRight size={14} /></button>
              <button type="button" className="sch-cal-today" onClick={() => { setAnchor(SCHEDULE_TODAY); setCalMonth({ year: 2026, month: 9 }) }}>今天</button>
            </header>
            <MiniCalendar year={calMonth.year} month={calMonth.month} selected={anchor} onSelect={setAnchor} />
          </section>

          <section className="mic-card sch-card">
            <SectionTitle>日程筛选</SectionTitle>
            <ul className="sch-filters">
              {SCHEDULE_FILTERS.map((item) => {
                const Icon = KIND_ICON[item.id]
                const active = filter === item.id
                return (
                  <li key={item.id}>
                    <label className={active ? 'on' : undefined}>
                      <input type="checkbox" checked={active} onChange={() => setFilter(item.id)} />
                      <span className={`sch-filter-ico ${item.id}`} aria-hidden="true"><Icon size={12} /></span>
                      <span className="sch-filter-label">{item.label}</span>
                      <b className={active ? 'on' : undefined}>{item.count}</b>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="mic-card sch-card">
            <SectionTitle>客户筛选</SectionTitle>
            <div className="sch-cust-filters">
              <label>
                <span>客户等级</span>
                <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="客户等级">
                  <option value="">请选择</option>
                  <option>高价值</option>
                  <option>重要客户</option>
                  <option>潜力客户</option>
                </select>
              </label>
              <label>
                <span>行业分类</span>
                <select value={trade} onChange={(event) => setTrade(event.target.value)} aria-label="行业分类">
                  <option value="">请选择</option>
                  {trades.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>所在省份</span>
                <select value={province} onChange={(event) => setProvince(event.target.value)} aria-label="所在省份">
                  <option value="">请选择</option>
                  {provinces.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </section>
        </aside>

        <section className="mic-card sch-main">
          <div className="sch-main-hd">
            <strong>{formatScheduleDate(anchor)}</strong>
            <div className="sch-view" role="tablist" aria-label="视图">
              {([
                ['day', '日'],
                ['week', '周'],
                ['month', '月'],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={view === id} className={view === id ? 'on' : undefined} onClick={() => setView(id)}>
                  {label}
                </button>
              ))}
            </div>
            <button type="button" className="mic-primary" onClick={crm.openTaskForm}>
              <Plus size={16} /> 新增日程
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="sch-empty">没有匹配的演示日程</div>
          ) : groups.map((group) => (
            <div key={group.date} className="sch-group">
              <div className="sch-group-hd">
                <strong>{groupLabel(group.date, anchor)}</strong>
              </div>
              <ul className="sch-list">
                {group.items.map((item, index) => (
                  <ScheduleRow
                    key={item.id}
                    item={item}
                    last={index === group.items.length - 1}
                    onToggle={() => toggleDone(item.id)}
                    onPhone={() => crm.openFollowUp(undefined, 'phone')}
                    onWechat={() => crm.openFollowUp(undefined, 'wechat')}
                    onPlan={() => crm.openTaskForm()}
                  />
                ))}
              </ul>
            </div>
          ))}
        </section>

        <aside className="sch-right">
          <DoneCard />
          <ChannelCard />
          <WeekCard />
          <OverdueCard />
        </aside>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <header className="sch-sec-title"><i />{children}</header>
}

function ScheduleRow({
  item,
  last,
  onToggle,
  onPhone,
  onWechat,
  onPlan,
}: {
  item: ScheduleItem
  last: boolean
  onToggle: () => void
  onPhone: () => void
  onWechat: () => void
  onPlan: () => void
}) {
  const Icon = KIND_ICON[item.kind]
  return (
    <li className={item.done ? 'sch-row done' : 'sch-row'}>
      <label className="sch-check">
        <input type="checkbox" checked={item.done} onChange={onToggle} aria-label={`完成 ${item.company}`} />
      </label>
      <span className={`sch-timeline ${item.kind}${last ? ' last' : ''}`} aria-hidden="true">
        <i />
      </span>
      <time>{item.time}</time>
      <span className={`sch-kind ${item.kind}`} aria-hidden="true">
        <Icon size={13} />
      </span>
      <div className="sch-copy">
        <b>{item.company}</b>
        <span>{item.contact} | {item.title}</span>
      </div>
      <em className={`sch-tag ${item.tag}`}>{item.tag}</em>
      <span className={`sch-priority p-${item.priority}`}>
        <Flag size={12} /> {item.priority}
      </span>
      <div className="sch-ops">
        <button type="button" className="op phone" aria-label="电话" onClick={onPhone}><Phone size={13} /></button>
        <button type="button" className="op wechat" aria-label="微信" onClick={onWechat}><MessageCircle size={13} /></button>
        <button type="button" className="op plan" aria-label="日程" onClick={onPlan}><Calendar size={13} /></button>
        <button type="button" className="op more" aria-label="更多"><MoreHorizontal size={13} /></button>
      </div>
    </li>
  )
}

function DoneCard() {
  const data = SCHEDULE_DONE_TODAY
  const radius = 42
  const circ = 2 * Math.PI * radius
  const segs = [
    { value: data.percents.done, color: '#12b76a', label: '已完成', count: data.done },
    { value: data.percents.progress, color: '#2f6bff', label: '进行中', count: data.progress },
    { value: data.percents.todo, color: '#f79009', label: '待开始', count: data.todo },
    { value: data.percents.overdue, color: '#f04438', label: '逾期', count: data.overdue },
  ]
  let offset = 0

  return (
    <section className="mic-card sch-card">
      <SectionTitle>今日完成情况</SectionTitle>
      <div className="sch-donut-wrap">
        <svg viewBox="0 0 120 120" className="sch-donut" aria-label={`今日完成 ${data.done}/${data.total}`}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#eef2f7" strokeWidth="12" />
          {segs.map((seg) => {
            const length = (seg.value / 100) * circ
            const node = (
              <circle
                key={seg.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${length} ${circ - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 60 60)"
              />
            )
            offset += length
            return node
          })}
          <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1d2939">{data.done} / {data.total}</text>
          <text x="60" y="74" textAnchor="middle" fontSize="11" fill="#667085">已完成</text>
        </svg>
        <ul className="sch-legend">
          {segs.map((seg) => (
            <li key={seg.label}>
              <i style={{ background: seg.color }} />
              <span>{seg.label}</span>
              <em>{seg.count}</em>
              <b>{seg.value}%</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ChannelCard() {
  const max = Math.max(...SCHEDULE_CHANNEL_BARS.map((item) => item.value))
  return (
    <section className="mic-card sch-card">
      <SectionTitle>跟进方式统计 <span>(今日)</span></SectionTitle>
      <div className="sch-vbars" role="img" aria-label="跟进方式统计">
        {SCHEDULE_CHANNEL_BARS.map((item) => (
          <div key={item.label} className="sch-vbar">
            <strong>{item.value}</strong>
            <div className="sch-vbar-track">
              <i style={{ height: `${(item.value / max) * 100}%`, background: item.color }} />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function WeekCard() {
  const max = Math.max(...SCHEDULE_WEEK_BARS.map((item) => item.value))
  return (
    <section className="mic-card sch-card">
      <header className="sch-sec-title">
        <i />本周日程统计
        <span className="sch-sec-extra">共 {SCHEDULE_WEEK_TOTAL} 项</span>
      </header>
      <div className="sch-bars" role="img" aria-label="本周日程柱状图">
        {SCHEDULE_WEEK_BARS.map((item) => (
          <div key={item.label} className={`sch-bar${item.active ? ' active' : ''}${item.weekend ? ' weekend' : ''}`}>
            <strong>{item.value}</strong>
            <div className="sch-bar-fill" style={{ height: `${(item.value / max) * 100}%` }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function OverdueCard() {
  return (
    <section className="mic-card sch-card">
      <header className="sch-sec-title">
        <i />逾期任务 (6)
        <button type="button" className="mic-link sch-sec-extra">查看更多 &gt;</button>
      </header>
      <ul className="sch-overdue">
        {SCHEDULE_OVERDUE.map((item) => (
          <li key={item.id}>
            <span className="sch-overdue-icon" aria-hidden="true"><CircleAlert size={14} /></span>
            <div>
              <b>{item.company}</b>
              <span>{item.title} | {item.contact}</span>
            </div>
            <em>{item.overdue}</em>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MiniCalendar({
  year,
  month,
  selected,
  onSelect,
}: {
  year: number
  month: number
  selected: string
  onSelect: (iso: string) => void
}) {
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const selectedDay = selected.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
    ? Number(selected.slice(8, 10))
    : -1
  const dots = Object.fromEntries(SCHEDULE_DOT_DAYS.map((item) => [item.day, item.color]))

  return (
    <div className="sch-cal">
      <div className="sch-cal-week">
        {['日', '一', '二', '三', '四', '五', '六'].map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className="sch-cal-grid">
        {cells.map((day, index) => {
          if (!day) return <span key={`e-${index}`} />
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const color = year === 2026 && month === 9 ? dots[day] : undefined
          const isToday = iso === SCHEDULE_TODAY
          const isSelected = day === selectedDay
          const weekend = index % 7 === 0 || index % 7 === 6
          return (
            <button
              key={iso}
              type="button"
              className={[isSelected || isToday ? 'on' : '', color ? 'dot' : '', weekend ? 'wk' : ''].filter(Boolean).join(' ') || undefined}
              style={color && !(isSelected || isToday) ? { ['--dot' as string]: color } : undefined}
              onClick={() => onSelect(iso)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function groupByDate(items: ScheduleItem[]) {
  const map = new Map<string, ScheduleItem[]>()
  items.forEach((item) => {
    const list = map.get(item.date) ?? []
    list.push(item)
    map.set(item.date, list)
  })
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => ({ date, items: rows.slice().sort((a, b) => a.time.localeCompare(b.time)) }))
}

function groupLabel(date: string, anchor: string) {
  if (date === SCHEDULE_TODAY || date === anchor) return `今天 ${formatScheduleDate(date)}`
  if (date === addDays(SCHEDULE_TODAY, 1) || date === addDays(anchor, 1)) return `明天 ${formatScheduleDate(date)}`
  return formatScheduleDate(date)
}

function addDays(iso: string, delta: number) {
  const date = new Date(`${iso}T12:00:00`)
  date.setDate(date.getDate() + delta)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function shiftMonth(value: { year: number; month: number }, delta: number) {
  const date = new Date(value.year, value.month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}
