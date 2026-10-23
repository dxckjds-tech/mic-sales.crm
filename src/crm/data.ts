import type { Customer, FollowUp, Todo, TrendTab } from '@/crm/types'

/** 设计稿样本。联系方式用「演示」占位，避免被当成真实客户。 */
export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'ningbo',
    name: '宁波鑫泰进出口有限公司',
    contact: '演示联系人',
    phone: '演示号码-1001',
    industry: '进出口',
    tags: ['续约', '高价值'],
    contractNo: 'DEMO-HT-2026-018',
    value: 128000,
    daysLeft: 32,
    status: '高价值',
    segments: ['即将到期', '高价值客户'],
    mark: 'm',
  },
  {
    id: 'hangzhou',
    name: '杭州优创五金有限公司',
    contact: '演示联系人',
    phone: '演示号码-1002',
    industry: '五金',
    tags: ['加购', '即将到期'],
    contractNo: 'DEMO-HT-2026-027',
    value: 58000,
    daysLeft: 62,
    status: '即将到期',
    segments: ['即将到期', '加购机会'],
    mark: 'green',
  },
  {
    id: 'dongguan',
    name: '东莞华兴五金制品有限公司',
    contact: '演示联系人',
    phone: '演示号码-1003',
    industry: '五金',
    tags: ['即将到期'],
    contractNo: 'DEMO-HT-2026-041',
    value: 42000,
    daysLeft: 76,
    status: '即将到期',
    segments: ['即将到期'],
    mark: 'blue',
  },
  {
    id: 'taizhou',
    name: '台州宏中塑料有限公司',
    contact: '演示联系人',
    phone: '演示号码-1004',
    industry: '塑料',
    tags: ['高价值'],
    contractNo: 'DEMO-HT-2026-033',
    value: 28000,
    daysLeft: 18,
    status: '高价值',
    segments: ['即将到期', '高价值客户'],
    mark: 'orange',
  },
  {
    id: 'wenzhou',
    name: '温州瑞丰电材有限公司',
    contact: '演示联系人',
    phone: '演示号码-1005',
    industry: '电材',
    tags: ['即将到期'],
    contractNo: 'DEMO-HT-2026-052',
    value: 36000,
    daysLeft: 25,
    status: '即将到期',
    segments: ['即将到期'],
    mark: 'red',
  },
  {
    id: 'suzhou',
    name: '苏州精丰机械有限公司',
    contact: '演示联系人',
    phone: '演示号码-1006',
    industry: '机械',
    tags: ['沉睡', '加购'],
    contractNo: 'DEMO-HT-2026-019',
    value: 46000,
    daysLeft: 40,
    status: '沉睡',
    segments: ['沉睡客户', '加购机会'],
    mark: 'blue',
  },
  {
    id: 'qingdao',
    name: '青岛海明机械设备有限公司',
    contact: '演示联系人',
    phone: '演示号码-1007',
    industry: '机械',
    tags: ['沉睡', '加购'],
    contractNo: 'DEMO-HT-2026-022',
    value: 51000,
    daysLeft: 54,
    status: '加购机会',
    segments: ['沉睡客户', '加购机会'],
    mark: 'green',
  },
  {
    id: 'shenzhen',
    name: '深圳市宏达电子科技有限公司',
    contact: '演示联系人',
    phone: '演示号码-1008',
    industry: '电子',
    tags: ['沉睡'],
    contractNo: 'DEMO-HT-2026-015',
    value: 39000,
    daysLeft: 47,
    status: '沉睡',
    segments: ['沉睡客户'],
    mark: 'orange',
  },
]

export const DEMO_TODOS: Todo[] = [
  { id: 't1', customerId: 'ningbo', priority: '高', channel: 'phone', title: '电话沟通：续约方案确认', time: '09:30', done: false },
  { id: 't2', customerId: 'hangzhou', priority: '高', channel: 'visit', title: '拜访：工厂实地考察', time: '11:00', done: false },
  { id: 't3', customerId: 'suzhou', priority: '中', channel: 'wechat', title: '微信跟进：产品推广方案', time: '14:00', done: false },
  { id: 't4', customerId: 'qingdao', priority: '中', channel: 'phone', title: '电话沟通：重新确认需求', time: '15:30', done: false },
  { id: 't5', customerId: 'shenzhen', priority: '低', channel: 'quote', title: '发送报价方案', time: '16:00', done: false },
  { id: 't6', customerId: 'dongguan', priority: '中', channel: 'wechat', title: '微信跟进：确认样品反馈', time: '16:40', done: false },
  { id: 't7', customerId: 'taizhou', priority: '低', channel: 'phone', title: '电话沟通：合同条款确认', time: '17:00', done: false },
  { id: 't8', customerId: 'wenzhou', priority: '低', channel: 'mail', title: '发送资料：产品目录', time: '17:30', done: false },
]

export const DEMO_FOLLOW_UPS: FollowUp[] = [
  { id: 'f1', customerId: 'ningbo', channel: 'phone', summary: '电话沟通：客户对续约方案表示认可，近期安排工厂拜访。', atLabel: '10-22 16:30' },
  { id: 'f2', customerId: 'hangzhou', channel: 'wechat', summary: '微信沟通：已发送产品资料，客户正在评估。', atLabel: '10-21 14:20' },
  { id: 'f3', customerId: 'shenzhen', channel: 'visit', summary: '拜访记录：参观工厂，沟通后续合作方向。', atLabel: '10-20 10:00' },
  { id: 'f4', customerId: 'suzhou', channel: 'mail', summary: '发送邮件：客户表示暂不考虑，需要后续跟进。', atLabel: '10-18 11:15' },
  { id: 'f5', customerId: 'qingdao', channel: 'plan', summary: '方案沟通：对聚焦APP感兴趣，约下次会议。', atLabel: '10-17 09:40' },
]

export const TREND_TABS: TrendTab[] = ['客户总数', '在服客户', '沉睡客户', '即将到期', '加购机会']

/** 10 月点与设计稿提示一致：新增 52、成交 32。其余为同一张图的示意走势。 */
export const TREND_SERIES: Record<TrendTab, { added: number[]; won: number[] }> = {
  客户总数: { added: [14, 30, 40, 52, 38, 36, 52], won: [8, 18, 20, 30, 22, 18, 32] },
  在服客户: { added: [36, 40, 44, 48, 46, 47, 50], won: [28, 30, 32, 36, 33, 31, 35] },
  沉睡客户: { added: [18, 22, 26, 30, 34, 40, 48], won: [6, 8, 9, 12, 10, 11, 14] },
  即将到期: { added: [8, 10, 12, 11, 14, 16, 18], won: [3, 5, 6, 7, 6, 8, 9] },
  加购机会: { added: [10, 14, 18, 22, 24, 30, 36], won: [4, 6, 8, 9, 10, 12, 15] },
}

export const TREND_MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月']

export const FUNNEL_MONTH = [
  { label: '发现机会', value: 86, color: '#3B82F6' },
  { label: '确认需求', value: 64, color: '#22D3EE' },
  { label: '方案准备', value: 48, color: '#14B8A6' },
  { label: '已报价', value: 32, color: '#34D399' },
  { label: '商务谈判', value: 18, color: '#A3E635' },
  { label: '赢单', value: 12, color: '#F5B942' },
]

export const FUNNEL_LAST = [
  { label: '发现机会', value: 70, color: '#3B82F6' },
  { label: '确认需求', value: 52, color: '#22D3EE' },
  { label: '方案准备', value: 40, color: '#14B8A6' },
  { label: '已报价', value: 26, color: '#34D399' },
  { label: '商务谈判', value: 14, color: '#A3E635' },
  { label: '赢单', value: 8, color: '#F5B942' },
]

export const KPI_ITEMS = [
  { key: 'total', label: '客户总数', value: '286', delta: '12%', foot: '较上月 +30', tone: 'blue' },
  { key: 'vip', label: '高价值客户', value: '64', delta: '18%', foot: '实付 ≥ 5万', tone: 'purple' },
  { key: 'sleep', label: '沉睡客户', value: '48', delta: '5%', foot: '≥ 30天未互动', tone: 'red' },
  { key: 'due', label: '即将到期', value: '18', delta: '20%', foot: '30天内到期', tone: 'orange' },
  { key: 'addon', label: '加购机会', value: '36', delta: '28%', foot: '潜在商机', tone: 'green' },
  { key: 'forecast', label: '本月预计成交', value: '¥86.8万', delta: '18%', foot: '含续约与加购', tone: 'gold' },
] as const

export const SEGMENT_COUNTS: Record<'即将到期' | '沉睡客户' | '高价值客户' | '加购机会', number> = {
  即将到期: 18,
  沉睡客户: 48,
  高价值客户: 64,
  加购机会: 36,
}

export function money(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`
}

export function customerMatches(customer: Customer, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    customer.name,
    customer.contact,
    customer.phone,
    customer.industry,
    customer.contractNo,
    customer.province,
    customer.city,
    customer.products,
    customer.productDetail,
    customer.trade,
    customer.source,
    ...(customer.tags ?? []),
    ...(customer.contacts ?? []).flatMap((item) => [item.name, item.role, item.phone]),
  ].join(' ').toLowerCase()
  return haystack.includes(q)
}

export function shanghaiDateLine(now = new Date()) {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  }).formatToParts(now)
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return `今天是 ${pick('year')}年${pick('month')}月${pick('day')}日（${pick('weekday')}）`
}

export function formatFollowStamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}
