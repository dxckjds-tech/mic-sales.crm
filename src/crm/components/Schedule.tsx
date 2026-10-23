import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
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
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [items, setItems] = useState(() => SCHEDULE_ITEMS.map((item) => ({ ...item })))
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(`${SCHEDULE_TODAY}T12:00:00`)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false
      if (onlyOpen && item.done) return false
      if (view === 'day') return item.date === anchor || item.date === nextDay(anchor)
      return true
    })
  }, [items, filter, onlyOpen, view, anchor])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  function shiftDay(delta: number) {
    setAnchor(addDays(anchor, delta))
  }

  function toggleDone(id: string) {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
    crm.pushToast('已更新演示日程状态')
  }

  return (
    <div className="sch">
      <header className="sch-top">
        <div>
          <h1>待办日程</h1>
          <p>合理安排每日跟进计划，不错过每一位客户</p>
        </div>
        <div className="sch-top-actions">
          <button type="button" className="sch-today" onClick={() => setAnchor(SCHEDULE_TODAY)}>今天</button>
          <div className="sch-date-nav">
            <button type="button" aria-label="前一天" onClick={() => shiftDay(-1)}><ChevronLeft size={16} /></button>
            <span>{formatScheduleDate(anchor)}</span>
            <button type="button" aria-label="后一天" onClick={() => shiftDay(1)}><ChevronRight size={16} /></button>
          </div>
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
      </header>

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
              onSelect={(iso) => setAnchor(iso)}
            />
          </section>

          <section className="mic-card sch-card">
            <header className="sch-card-hd plain">日程筛选</header>
            <ul className="sch-filters">
              {SCHEDULE_FILTERS.map((item) => (
                <li key={item.id}>
                  <label>
                    <input
                      type="radio"
                      name="sch-filter"
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
        </aside>

        <section className="mic-card sch-main">
          <div className="sch-group-hd sch-main-hd">
            <strong>{formatScheduleDate(anchor)}</strong>
            <label className="sch-only">
              <input type="checkbox" checked={onlyOpen} onChange={(event) => setOnlyOpen(event.target.checked)} />
              只看未完成
            </label>
            <button type="button" className="sch-add" onClick={crm.openTaskForm}><Plus size={14} /> 新建日程</button>
          </div>
          {groups.length === 0 ? (
            <div className="sch-empty">这一天没有匹配的演示日程</div>
          ) : groups.map((group, index) => (
            <div key={group.date} className="sch-group">
              {index > 0 || group.date !== anchor ? (
                <div className="sch-group-hd">
                  <strong>{groupLabel(group.date, anchor)}</strong>
                </div>
              ) : null}
              <ul className="sch-list">
                {group.items.map((item) => (
                  <ScheduleRow key={item.id} item={item} onToggle={() => toggleDone(item.id)} />
                ))}
              </ul>
            </div>
          ))}
          {view !== 'day' ? (
            <p className="mic-note sch-note">周/月视图目前仍按列表展示演示日程，日历网格排期尚未接入。</p>
          ) : null}
        </section>

        <aside className="sch-right">
          <DoneCard />
          <WeekCard />
          <OverdueCard />
        </aside>
      </div>
    </div>
  )
}

function ScheduleRow({ item, onToggle }: { item: ScheduleItem; onToggle: () => void }) {
  const Icon = KIND_ICON[item.kind]
  return (
    <li className={item.done ? 'sch-row done' : 'sch-row'}>
      <time>{item.time}</time>
      <span className={`sch-kind ${item.kind}`} aria-hidden="true">
        <Icon size={14} />
      </span>
      <div className="sch-copy">
        <b>{item.company}</b>
        <span>{item.contact} · {item.title}</span>
      </div>
      <em className={`sch-tag ${item.tag}`}>{item.tag}</em>
      <button type="button" className={item.done ? 'sch-done on' : 'sch-done'} onClick={onToggle}>
        <Check size={14} /> {item.done ? '已完成' : '完成'}
      </button>
      <button type="button" className="sch-more" aria-label="更多"><MoreHorizontal size={16} /></button>
    </li>
  )
}

function DoneCard() {
  const { done, total, pending, overdue, rate } = SCHEDULE_DONE_TODAY
  const radius = 42
  const circ = 2 * Math.PI * radius
  const doneLen = (done / total) * circ
  const overdueLen = (overdue / total) * circ
  const pendingLen = circ - doneLen - overdueLen

  return (
    <section className="mic-card sch-card">
      <header className="sch-card-hd plain">今日完成情况</header>
      <div className="sch-donut-wrap">
        <svg viewBox="0 0 120 120" className="sch-donut" aria-label={`今日完成 ${done}/${total}`}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#eef2f7" strokeWidth="12" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#12b76a" strokeWidth="12" strokeDasharray={`${doneLen} ${circ - doneLen}`} transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f04438" strokeWidth="12" strokeDasharray={`${overdueLen} ${circ - overdueLen}`} strokeDashoffset={-doneLen} transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#2f6bff" strokeWidth="12" strokeDasharray={`${pendingLen} ${circ - pendingLen}`} strokeDashoffset={-(doneLen + overdueLen)} transform="rotate(-90 60 60)" />
          <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1d2939">{done}/{total}</text>
          <text x="60" y="74" textAnchor="middle" fontSize="11" fill="#667085">已完成</text>
        </svg>
        <ul className="sch-legend">
          <li><i style={{ background: '#2f6bff' }} />待完成 <b>{pending}</b></li>
          <li><i style={{ background: '#12b76a' }} />已完成 <b>{done}</b></li>
          <li><i style={{ background: '#f04438' }} />逾期 <b>{overdue}</b></li>
        </ul>
        <div className="sch-rate">完成率 <strong>{rate}%</strong></div>
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
        近期逾期任务
        <button type="button" className="mic-link">查看全部 ›</button>
      </header>
      <ul className="sch-overdue">
        {SCHEDULE_OVERDUE.map((item) => (
          <li key={item.id}>
            <div>
              <b>{item.company}</b>
              <span>{item.title}</span>
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
  if (date === anchor) return formatScheduleDate(date)
  if (date === nextDay(anchor) || date === addDays(SCHEDULE_TODAY, 1)) return `明天 ${formatScheduleDate(date)}`
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

function nextDay(iso: string) {
  return addDays(iso, 1)
}

function shiftMonth(value: { year: number; month: number }, delta: number) {
  const date = new Date(value.year, value.month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}
