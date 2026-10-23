import type { Channel } from '@/crm/types'

/** 设计稿基准日：2026-10-23（周五） */
export const SCHEDULE_TODAY = '2026-10-23'

export type ScheduleKind = 'phone' | 'wechat' | 'visit' | 'meeting' | 'mail' | 'other'
export type SchedulePriority = '高' | '中' | '低'
export type ScheduleTag = '逾期1天' | '逾期2天' | '逾期3天' | '今天' | '明天' | '本周'

export type ScheduleItem = {
  id: string
  date: string
  time: string
  kind: ScheduleKind
  company: string
  contact: string
  title: string
  tag: ScheduleTag
  priority: SchedulePriority
  done: boolean
  level?: string
  trade?: string
  province?: string
}

export const SCHEDULE_METRICS = [
  { key: 'today', label: '今日待办', value: '8', foot: '较昨日', delta: '-2', tone: 'orange', up: false, icon: 'list' },
  { key: 'overdue', label: '逾期任务', value: '6', foot: '需要尽快处理', delta: '', tone: 'red', up: false, icon: 'clock' },
  { key: 'week', label: '本周计划', value: '24', foot: '较上周', delta: '+20%', tone: 'blue', up: true, icon: 'calendar' },
  { key: 'done', label: '已完成', value: '12', foot: '完成率 60%', delta: '', tone: 'green', up: true, icon: 'check', footTone: 'green' },
  { key: 'visit', label: '上门拜访', value: '3', foot: '今日安排', delta: '', tone: 'violet', up: true, icon: 'user' },
  { key: 'phone', label: '电话沟通', value: '4', foot: '今日安排', delta: '', tone: 'cyan', up: true, icon: 'phone' },
  { key: 'wechat', label: '微信沟通', value: '5', foot: '今日安排', delta: '', tone: 'teal', up: true, icon: 'wechat' },
  { key: 'meet', label: '会议/邮件', value: '2', foot: '今日安排', delta: '', tone: 'pink', up: true, icon: 'mail' },
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

export const SCHEDULE_DOT_DAYS: { day: number; color: string }[] = [
  { day: 8, color: '#2f6bff' },
  { day: 10, color: '#12b76a' },
  { day: 14, color: '#f79009' },
  { day: 16, color: '#2f6bff' },
  { day: 18, color: '#7a5af8' },
  { day: 20, color: '#12b76a' },
  { day: 21, color: '#f04438' },
  { day: 22, color: '#2f6bff' },
  { day: 23, color: '#2f6bff' },
  { day: 24, color: '#12b76a' },
  { day: 26, color: '#f79009' },
  { day: 27, color: '#2f6bff' },
  { day: 28, color: '#7a5af8' },
  { day: 30, color: '#12b76a' },
]

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: 's1', date: '2026-10-23', time: '09:30', kind: 'phone',
    company: '宁波优来特进出口有限公司', contact: '史总', title: '电话沟通续约方案',
    tag: '逾期1天', priority: '高', done: false, level: '高价值', trade: '环保设备', province: '浙江',
  },
  {
    id: 's2', date: '2026-10-23', time: '11:00', kind: 'wechat',
    company: '慈溪长城制刷有限公司', contact: '王经理', title: '微信发送新品报价',
    tag: '今天', priority: '中', done: false, level: '重要客户', trade: '办公用品', province: '浙江',
  },
  {
    id: 's3', date: '2026-10-23', time: '14:30', kind: 'visit',
    company: '杭州优创五金有限公司', contact: '李总', title: '上门拜访工厂考察',
    tag: '今天', priority: '高', done: false, level: '重要客户', trade: '五金制品', province: '浙江',
  },
  {
    id: 's4', date: '2026-10-23', time: '16:00', kind: 'mail',
    company: '苏州精丰机械有限公司', contact: '赵经理', title: '发送唤醒方案邮件',
    tag: '今天', priority: '低', done: true, level: '潜力客户', trade: '工业机械', province: '江苏',
  },
  {
    id: 's5', date: '2026-10-23', time: '17:00', kind: 'phone',
    company: '温州瑞丰电材有限公司', contact: '陈总', title: '确认合同续签条款',
    tag: '今天', priority: '中', done: false, level: '重要客户', trade: '电工电材', province: '浙江',
  },
  {
    id: 's6', date: '2026-10-24', time: '10:00', kind: 'meeting',
    company: '青岛海明机械设备有限公司', contact: '周总', title: '线上会议评审加购方案',
    tag: '明天', priority: '高', done: false, level: '重要客户', trade: '机械设备', province: '山东',
  },
  {
    id: 's7', date: '2026-10-24', time: '15:00', kind: 'wechat',
    company: '宁波正律电子有限公司', contact: '刘经理', title: '微信跟进样品测试',
    tag: '明天', priority: '中', done: false, level: '高价值', trade: '电子电工', province: '浙江',
  },
  {
    id: 's8', date: '2026-10-24', time: '16:30', kind: 'visit',
    company: '台州宏中塑料有限公司', contact: '黄总', title: '拜访沟通包装材料订单',
    tag: '明天', priority: '低', done: false, level: '潜力客户', trade: '包装材料', province: '浙江',
  },
  {
    id: 's9', date: '2026-10-26', time: '09:00', kind: 'phone',
    company: '深圳市宏达电子科技有限公司', contact: '吴经理', title: '电话唤醒沉睡客户',
    tag: '本周', priority: '中', done: false, level: '潜力客户', trade: '智能硬件', province: '广东',
  },
]

export const SCHEDULE_WEEK_BARS = [
  { label: '周一', value: 5, weekend: false },
  { label: '周二', value: 8, weekend: false },
  { label: '周三', value: 6, weekend: false },
  { label: '周四', value: 7, weekend: false },
  { label: '周五', value: 8, weekend: false, active: true },
  { label: '周六', value: 4, weekend: true },
  { label: '周日', value: 3, weekend: true },
]

export const SCHEDULE_CHANNEL_BARS = [
  { label: '电话', value: 4, color: '#2f6bff' },
  { label: '微信', value: 5, color: '#12b76a' },
  { label: '拜访', value: 3, color: '#f79009' },
  { label: '邮件', value: 2, color: '#ee46bc' },
  { label: '会议', value: 1, color: '#7a5af8' },
  { label: '其他', value: 1, color: '#98a2b3' },
]

export const SCHEDULE_OVERDUE = [
  { id: 'o1', company: '东莞华兴五金制品有限公司', contact: '张总', title: '电话唤醒沉睡客户', overdue: '逾期3天' },
  { id: 'o2', company: '深圳市宏达电子科技有限公司', contact: '吴经理', title: '发送重新合作方案', overdue: '逾期2天' },
  { id: 'o3', company: '苏州精丰机械有限公司', contact: '赵经理', title: '跟进邮件回复', overdue: '逾期2天' },
  { id: 'o4', company: '宁波优来特进出口有限公司', contact: '史总', title: '确认续约报价', overdue: '逾期1天' },
]

export const SCHEDULE_DONE_TODAY = {
  done: 3,
  progress: 3,
  todo: 1,
  overdue: 1,
  total: 8,
  percents: { done: 38, progress: 37, todo: 12, overdue: 13 },
}

export const SCHEDULE_WEEK_TOTAL = 41

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
