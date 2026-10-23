import type { AccountStatus, Customer, CustomerContact, CustomerLevel, CustomerPlan, Mark } from '@/crm/types'

type Seed = {
  id: string
  name: string
  province: string
  city: string
  products: string
  productDetail?: string
  trade: string
  level: CustomerLevel
  years: number
  paid: number
  contractEnd: string
  accountStatus: AccountStatus
  nextFollow: string
  lastFollow?: string
  nameTag?: string
  source?: string
  website?: string
  mark: Mark
  contacts?: CustomerContact[]
  plans?: CustomerPlan[]
  /** 需要跟进页签样本 */
  needsFollow?: boolean
}

function row(seed: Seed): Customer {
  const status = seed.accountStatus === '沉睡客户' ? '沉睡' : seed.accountStatus === '正常客户' ? '高价值' : seed.accountStatus
  return {
    id: seed.id,
    name: seed.name,
    contact: seed.contacts?.[0]?.name ?? '',
    phone: seed.contacts?.[0]?.phone ?? '',
    industry: seed.trade,
    tags: [seed.level, seed.accountStatus],
    contractNo: `DEMO-${seed.id.toUpperCase()}`,
    value: seed.paid,
    daysLeft: 0,
    status,
    segments: [],
    mark: seed.mark,
    directory: true,
    province: seed.province,
    city: seed.city,
    products: seed.products,
    productDetail: seed.productDetail ?? seed.products,
    trade: seed.trade,
    level: seed.level,
    years: seed.years,
    contractEnd: seed.contractEnd,
    accountStatus: seed.accountStatus,
    nextFollow: seed.nextFollow,
    lastFollow: seed.lastFollow,
    source: seed.source ?? '',
    website: seed.website ?? '',
    nameTag: seed.nameTag,
    contacts: seed.contacts ?? [],
    plans: seed.plans ?? [],
    needsFollow: seed.needsFollow,
  }
}

/** 客户管理页设计稿上的 10 条样本。电话是打码占位，不是真实号码。 */
export const DIRECTORY_CUSTOMERS: Customer[] = [
  row({
    id: 'youlaite',
    name: '宁波优来特进出口有限公司',
    province: '浙江',
    city: '宁波',
    products: '净水器',
    productDetail: '净水器、RO系统、滤芯',
    trade: '环保设备',
    level: '高价值',
    years: 3,
    paid: 158000,
    contractEnd: '2026-12-15',
    accountStatus: '即将到期',
    nextFollow: '10-25',
    lastFollow: '10-18 电话',
    nameTag: '重点客户',
    source: '主动开发',
    website: '-',
    mark: 'blue',
    needsFollow: true,
    contacts: [
      { id: 'c-shi', name: '史总', role: '总经理', phone: '138-****-8888' },
      { id: 'c-wang', name: '王经理', role: '业务负责人', phone: '136-****-6666' },
    ],
    plans: [{ id: 'p-youlaite', at: '10-25 10:00', text: '电话沟通续约方案\n讨论精品报+聚焦APP增购', done: false }],
  }),
  row({
    id: 'cixi-brush',
    name: '慈溪长城制刷有限公司',
    province: '浙江',
    city: '慈溪',
    products: '文具',
    trade: '办公用品',
    level: '重要客户',
    years: 2,
    paid: 86000,
    contractEnd: '2027-03-20',
    accountStatus: '正常客户',
    nextFollow: '10-24',
    lastFollow: '10-20 微信',
    mark: 'green',
    needsFollow: true,
  }),
  row({
    id: 'ningbo-zhenglv',
    name: '宁波正律电子有限公司',
    province: '浙江',
    city: '宁波',
    products: '电子元器件',
    trade: '电子电工',
    level: '高价值',
    years: 4,
    paid: 120000,
    contractEnd: '2026-11-30',
    accountStatus: '即将到期',
    nextFollow: '10-22',
    lastFollow: '10-19 拜访',
    nameTag: '近期跟进',
    mark: 'orange',
    needsFollow: true,
  }),
  row({
    id: 'dir-hangzhou',
    name: '杭州优创五金有限公司',
    province: '浙江',
    city: '杭州',
    products: '五金工具',
    trade: '五金制品',
    level: '重要客户',
    years: 2,
    paid: 58000,
    contractEnd: '2027-05-18',
    accountStatus: '正常客户',
    nextFollow: '10-28',
    lastFollow: '10-16 电话',
    mark: 'blue',
  }),
  row({
    id: 'dir-suzhou',
    name: '苏州精丰机械有限公司',
    province: '江苏',
    city: '苏州',
    products: '机械设备',
    trade: '工业机械',
    level: '潜力客户',
    years: 1,
    paid: 36000,
    contractEnd: '2026-08-20',
    accountStatus: '沉睡客户',
    nextFollow: '10-30',
    lastFollow: '09-12 邮件',
    nameTag: '沉睡提醒',
    mark: 'red',
  }),
  row({
    id: 'dir-qingdao',
    name: '青岛海明机械设备有限公司',
    province: '山东',
    city: '青岛',
    products: '工程机械',
    trade: '机械设备',
    level: '重要客户',
    years: 3,
    paid: 76000,
    contractEnd: '2027-01-10',
    accountStatus: '加购机会',
    nextFollow: '10-26',
    lastFollow: '10-15 微信',
    mark: 'green',
  }),
  row({
    id: 'dir-shenzhen',
    name: '深圳市宏达电子科技有限公司',
    province: '广东',
    city: '深圳',
    products: '电子产品',
    trade: '智能硬件',
    level: '潜力客户',
    years: 2,
    paid: 42000,
    contractEnd: '2026-09-15',
    accountStatus: '沉睡客户',
    nextFollow: '10-29',
    lastFollow: '09-28 电话',
    mark: 'orange',
  }),
  row({
    id: 'dir-wenzhou',
    name: '温州瑞丰电材有限公司',
    province: '浙江',
    city: '温州',
    products: '电线电缆',
    trade: '电工电材',
    level: '重要客户',
    years: 2,
    paid: 68000,
    contractEnd: '2026-12-05',
    accountStatus: '即将到期',
    nextFollow: '10-23',
    lastFollow: '10-17 拜访',
    mark: 'blue',
    needsFollow: true,
  }),
  row({
    id: 'dir-taizhou',
    name: '台州宏中塑料有限公司',
    province: '浙江',
    city: '台州',
    products: '塑料制品',
    trade: '包装材料',
    level: '潜力客户',
    years: 1,
    paid: 28000,
    contractEnd: '2027-04-12',
    accountStatus: '正常客户',
    nextFollow: '10-27',
    lastFollow: '10-14 微信',
    mark: 'green',
  }),
  row({
    id: 'dir-dongguan',
    name: '东莞华兴五金制品有限公司',
    province: '广东',
    city: '东莞',
    products: '五金制品',
    trade: '金属加工',
    level: '潜力客户',
    years: 1,
    paid: 32000,
    contractEnd: '2026-10-18',
    accountStatus: '沉睡客户',
    nextFollow: '10-31',
    lastFollow: '09-05 电话',
    mark: 'red',
  }),
]

/** 客户中心页签与指标卡上的设计稿汇总数字 */
export const DIRECTORY_TAB_COUNTS = {
  all: 286,
  follow: 24,
  reactivate: 48,
  opportunity: 36,
  highValue: 64,
  dueSoon: 18,
  dormant: 48,
  addonValue: 260000,
} as const

export const DIRECTORY_LEVEL_STATS = [
  { label: '高价值客户', value: 22, color: '#f04438' },
  { label: '重要客户', value: 30, color: '#2f6bff' },
  { label: '潜力客户', value: 24, color: '#12b76a' },
  { label: '普通客户', value: 17, color: '#f79009' },
  { label: '沉睡客户', value: 7, color: '#9b8afb' },
] as const

export const DIRECTORY_FEED = [
  { id: 'df1', at: '10-22 16:30', channel: '电话', name: '宁波优来特进出口有限公司', text: '沟通续约方案，客户表示认可' },
  { id: 'df2', at: '10-21 14:20', channel: '微信', name: '慈溪长城制刷有限公司', text: '已发送新品资料，等待反馈' },
  { id: 'df3', at: '10-20 10:00', channel: '拜访', name: '杭州优创五金有限公司', text: '工厂实地考察，确认合作意向' },
  { id: 'df4', at: '10-18 11:15', channel: '邮件', name: '苏州精丰机械有限公司', text: '发送唤醒方案，约下周电话' },
] as const

export const DIRECTORY_TODAY_TODOS = [
  { id: 'dt1', time: '10:00', title: '电话沟通 · 宁波优来特', done: false },
  { id: 'dt2', time: '11:00', title: '微信沟通 · 慈溪长城制刷', done: false },
  { id: 'dt3', time: '14:30', title: '拜访客户 · 杭州优创五金', done: false },
  { id: 'dt4', time: '16:00', title: '发送方案 · 苏州精丰机械', done: true },
] as const
