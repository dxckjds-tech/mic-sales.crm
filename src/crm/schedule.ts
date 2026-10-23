import type { Channel } from '@/crm/types'

/** 设计稿基准日：2026-10-23（周五） */
export const SCHEDULE_TODAY = '2026-10-23'

export type ScheduleKind = 'phone' | 'wechat' | 'visit' | 'meeting' | 'mail' | 'other'

export type ScheduleItem = {
  id: string
  date: string
  time: string
  kind: ScheduleKind
  company: string
  contact: string
  title: string
  tag: '逾期1天' | '逾期2天' | '逾期3天' | '今天' | '明天' | '本周'
  done: boolean
}

export const SCHEDULE_METRICS = [
  { key: 'today', label: '今日待办', value: '8', foot: '较昨日', delta: '-2', tone: 'orange', up: false },
  { key: 'overdue', label: '逾期任务', value: '6', foot: '需尽快处理', delta: '', tone: 'red', up: false },
  { key: 'week', label: '本周计划', value: '24', foot: '较上周', delta: '+20%', tone: 'blue', up: true },
  { key: 'done', label: '已完成', value: '12', foot: '完成率 60%', delta: '', tone: 'green', up: true },
  { key: 'visit', label: '上门拜访', value: '3', foot: '今日安排', delta: '', tone: 'violet', up: true },
  { key: 'phone', label: '电话沟通', value: '4', foot: '今日安排', delta: '', tone: 'cyan', up: true },
  { key: 'wechat', label: '微信沟通', value: '5', foot: '今日安排', delta: '', tone: 'teal', up: true },
] as const

export const SCHEDULE_FILTERS: { id: 'all' | ScheduleKind; label: string; count: number }[] = [
  { id: 'all', label: '全部类型', count: 24 },
  { id: 'phone', label: '电话沟通', count: 8 },
  { id: 'wechat', label: '微信沟通', count: 6 },
  { id: 'visit', label: '上门拜访', count: 3 },
  { id: 'meeting', label: '会议/拜访', count: 4 },
  { id: 'mail', label: '邮件沟通', count: 2 },
  { id: 'other', label: '其他', count: 1 },
]

/** 小日历上有日程的日期（10 月） */
export const SCHEDULE_DOT_DAYS = [8, 10, 14, 16, 18, 20, 21, 22, 23, 24, 27, 28, 30]

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: 's1',
    date: '2026-10-23',
    time: '09:30',
    kind: 'phone',
    company: '宁波优来特进出口有限公司',
    contact: '史总',
    title: '电话沟通续约方案，确认精品报增购意向',
    tag: '逾期1天',
    done: false,
  },
  {
    id: 's2',
    date: '2026-10-23',
    time: '11:00',
    kind: 'wechat',
    company: '慈溪长城制刷有限公司',
    contact: '王经理',
    title: '微信发送新品报价，跟进反馈',
    tag: '今天',
    done: false,
  },
  {
    id: 's3',
    date: '2026-10-23',
    time: '14:30',
    kind: 'visit',
    company: '杭州优创五金有限公司',
    contact: '李总',
    title: '上门拜访工厂，实地考察合作意向',
    tag: '今天',
    done: false,
  },
  {
    id: 's4',
    date: '2026-10-23',
    time: '16:00',
    kind: 'mail',
    company: '苏州精丰机械有限公司',
    contact: '赵经理',
    title: '发送唤醒方案邮件，约下周电话',
    tag: '今天',
    done: true,
  },
  {
    id: 's5',
    date: '2026-10-23',
    time: '17:00',
    kind: 'phone',
    company: '温州瑞丰电材有限公司',
    contact: '陈总',
    title: '电话确认合同到期续签条款',
    tag: '今天',
    done: false,
  },
  {
    id: 's6',
    date: '2026-10-24',
    time: '10:00',
    kind: 'meeting',
    company: '青岛海明机械设备有限公司',
    contact: '周总',
    title: '线上会议：加购方案评审',
    tag: '明天',
    done: false,
  },
  {
    id: 's7',
    date: '2026-10-24',
    time: '15:00',
    kind: 'wechat',
    company: '宁波正律电子有限公司',
    contact: '刘经理',
    title: '微信跟进样品测试结果',
    tag: '明天',
    done: false,
  },
  {
    id: 's8',
    date: '2026-10-24',
    time: '16:30',
    kind: 'visit',
    company: '台州宏中塑料有限公司',
    contact: '黄总',
    title: '拜访客户，沟通包装材料订单',
    tag: '明天',
    done: false,
  },
]

export const SCHEDULE_WEEK_BARS = [
  { label: '一', value: 5 },
  { label: '二', value: 7 },
  { label: '三', value: 4 },
  { label: '四', value: 8 },
  { label: '五', value: 9 },
  { label: '六', value: 5 },
  { label: '日', value: 3 },
]

export const SCHEDULE_OVERDUE = [
  { id: 'o1', company: '东莞华兴五金制品有限公司', title: '电话唤醒沉睡客户', overdue: '逾期3天' },
  { id: 'o2', company: '深圳市宏达电子科技有限公司', title: '发送重新合作方案', overdue: '逾期2天' },
  { id: 'o3', company: '苏州精丰机械有限公司', title: '跟进邮件回复', overdue: '逾期2天' },
  { id: 'o4', company: '宁波优来特进出口有限公司', title: '确认续约报价', overdue: '逾期1天' },
  { id: 'o5', company: '温州瑞丰电材有限公司', title: '合同条款确认电话', overdue: '逾期1天' },
]

export const SCHEDULE_DONE_TODAY = { done: 3, total: 8, pending: 5, overdue: 1, rate: 38 }

export function kindToChannel(kind: ScheduleKind): Channel {
  if (kind === 'other') return 'plan'
  return kind
}

export function formatScheduleDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y}年${m}月${d}日 (周${week})`
}
