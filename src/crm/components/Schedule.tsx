import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flag,
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
  other: CalendarDays,
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
        {SCHEDULE_METRICS.map((item) => (
          <article key={item.key} className={`sch-metric tone-${item.tone}`}>
            <i aria-hidden="true" />
            <div>
              <span>{item.label}</span>
              <b>{item.value}</b>
              <small>
                {item.delta ? <em className={item.up ? 'up' : 'down'}>{item.delta}</em> : null}
                {item.foot}
              </small>
            </div>
          </article>
        ))}
      </div>

      <div className="sch-board">
        <aside className="sch-left">
          <section className="mic-card sch-card">
            <header className="sch-card-hd">
              <button type="button" aria-label="上个月" onClick={() => setCalMonth(shiftMonth(calMonth, -1))}><ChevronLeft size={14} /></button>
              <strong>{calMonth.year}年{calMonth.month + 1}月</strong>
              <button type="button" aria-label="下个月" onClick={() => setCalMonth(shiftMonth(calMonth, 1))}><ChevronRight size={14} /></button>
            </header>
            <MiniCalendar
              year={calMonth.year}
              month={calMonth.month}
              selected={anchor}
              onSelect={setAnchor}
            />
          </section>

          <section className="mic-card sch-card">
            <header className="sch-card-hd plain">日程筛选</header>
            <ul className="sch-filters">
              {SCHEDULE_FILTERS.map((item) => (
                <li key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={filter === item.id}
                      onChange={() => setFilter(item.id)}
                    />
                    <span>{item.label}</span>
                    <b>{item.count}</b>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="mic-card sch-card">
            <header className="sch-card-hd plain">客户筛选</header>
            <div className="sch-cust-filters">
              <select aria-label="客户等级" value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="">客户等级</option>
                <option>高价值</option>
                <option>重要客户</option>
                <option>潜力客户</option>
              </select>
              <select aria-label="行业分类" value={trade} onChange={(event) => setTrade(event.target.value)}>
                <option value="">行业分类</option>
                {trades.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select aria-label="所在省份" value={province} onChange={(event) => setProvince(event.target.value)}>
                <option value="">所在省份</option>
                {provinces.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
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
                <span>{group.items.length} 项</span>
              </div>
              <ul className="sch-list">
                {group.items.map((item) => (
                  <ScheduleRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleDone(item.id)}
                    onPhone={() => crm.openFollowUp(undefined, 'phone')}
                    onWechat={() => crm.openFollowUp(undefined, 'wechat')}
                    onPlan={() => crm.openTaskForm()}
                  />
                ))}
              </ul>
            </div>
          ))}
          {view !== 'day' ? (
            <p className="mic-note sch-note">周/月视图目前仍按列表展示演示日程，网格排期尚未接入。</p>
          ) : null}
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

function ScheduleRow({
  item,
  onToggle,
  onPhone,
  onWechat,
  onPlan,
}: {
  item: ScheduleItem
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
      <time>{item.time}</time>
      <span className={`sch-kind ${item.kind}`} aria-hidden="true">
        <Icon size={13} />
      </span>
      <span className={`sch-avatar tone-${item.kind}`} aria-hidden="true">{item.avatar}</span>
      <div className="sch-copy">
        <b>{item.company}</b>
        <span>{item.contact} ｜ {item.title}</span>
      </div>
      <em className={`sch-tag ${item.tag}`}>{item.tag}</em>
      <span className={`sch-priority p-${item.priority}`}>
        <Flag size={12} /> {item.priority}
      </span>
      <div className="sch-ops">
        <button type="button" aria-label="电话" onClick={onPhone}><Phone size={14} /></button>
        <button type="button" aria-label="微信" onClick={onWechat}><MessageCircle size={14} /></button>
        <button type="button" aria-label="日程" onClick={onPlan}><Calendar size={14} /></button>
        <button type="button" aria-label="更多"><MoreHorizontal size={14} /></button>
      </div>
    </li>
  )
}

function DoneCard() {
  const { done, progress, todo, overdue, centerLabel, centerValue } = SCHEDULE_DONE_TODAY
  const radius = 42
  const circ = 2 * Math.PI * radius
  const segs = [
    { value: done, color: '#12b76a' },
    { value: progress, color: '#2f6bff' },
    { value: todo, color: '#f79009' },
    { value: overdue, color: '#f04438' },
  ]
  let offset = 0

  return (
    <section className="mic-card sch-card">
      <header className="sch-card-hd plain">今日完成情况</header>
      <div className="sch-donut-wrap">
        <svg viewBox="0 0 120 120" className="sch-donut" aria-label="今日完成情况">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#eef2f7" strokeWidth="12" />
          {segs.map((seg) => {
            const length = (seg.value / 100) * circ
            const node = (
              <circle
                key={seg.color}
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
          <text x="60" y="56" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1d2939">{centerValue}</text>
          <text x="60" y="74" textAnchor="middle" fontSize="11" fill="#667085">{centerLabel}</text>
        </svg>
        <ul className="sch-legend">
          <li><i style={{ background: '#12b76a' }} />已完成 <b>{done}%</b></li>
          <li><i style={{ background: '#2f6bff' }} />进行中 <b>{progress}%</b></li>
          <li><i style={{ background: '#f79009' }} />待开始 <b>{todo}%</b></li>
          <li><i style={{ background: '#f04438' }} />逾期 <b>{overdue}%</b></li>
        </ul>
      </div>
    </section>
  )
}

function ChannelCard() {
  const max = Math.max(...SCHEDULE_CHANNEL_BARS.map((item) => item.value))
  return (
    <section className="mic-card sch-card">
      <header className="sch-card-hd plain">跟进方式统计</header>
      <div className="sch-channel-bars">
        {SCHEDULE_CHANNEL_BARS.map((item) => (
          <div key={item.label} className="sch-channel-row">
            <span>{item.label}</span>
            <div className="sch-channel-track">
              <i style={{ width: `${(item.value / max) * 100}%`, background: item.color }} />
            </div>
            <b>{item.value}</b>
          </div>
        ))}
      </div>
    </section>
  )
}

function WeekCard() {
  const max = Math.max(...SCHEDULE_WEEK_BARS.map((item) => item.value))
  const total = SCHEDULE_WEEK_BARS.reduce((sum, item) => sum + item.value, 0)
  return (
    <section className="mic-card sch-card">
      <header className="sch-card-hd plain">本周日程统计 <span>共 {total} 项</span></header>
      <div className="sch-bars" role="img" aria-label="本周日程柱状图">
        {SCHEDULE_WEEK_BARS.map((item) => (
          <div key={item.label} className="sch-bar">
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
      <header className="sch-card-hd plain">
        逾期任务
        <button type="button" className="mic-link">查看更多 ›</button>
      </header>
      <ul className="sch-overdue">
        {SCHEDULE_OVERDUE.map((item) => (
          <li key={item.id}>
            <AlertCircle size={16} className="sch-overdue-icon" aria-hidden="true" />
            <div>
              <b>{item.company}</b>
              <span>{item.contact} · {item.title}</span>
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

  return (
    <div className="sch-cal">
      <div className="sch-cal-week">
        {['日', '一', '二', '三', '四', '五', '六'].map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className="sch-cal-grid">
        {cells.map((day, index) => {
          if (!day) return <span key={`e-${index}`} />
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasDot = year === 2026 && month === 9 && SCHEDULE_DOT_DAYS.includes(day)
          const isToday = iso === SCHEDULE_TODAY
          const isSelected = day === selectedDay
          return (
            <button
              key={iso}
              type="button"
              className={[isSelected || isToday ? 'on' : '', hasDot ? 'dot' : ''].filter(Boolean).join(' ') || undefined}
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
