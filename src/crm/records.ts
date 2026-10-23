import type { Customer, CustomerContact } from '@/crm/types'

export type DetailChannel = 'phone' | 'wechat' | 'visit' | 'mail' | 'meeting'

export type DetailPerson = CustomerContact

export type DetailFollow = {
  id: string
  at: string
  channel: DetailChannel
  content: string
  feedback: string
  nextStep: string
  owner: string
  attachments: { id: string; name: string; size: string }[]
}

export type DetailTask = {
  id: string
  title: string
  at: string
  done: boolean
}

export type DetailContract = {
  id: string
  name: string
  amount: number
  start: string
  end: string
  note: string
}

export type DetailService = {
  id: string
  name: string
  start: string
  end: string
}

export type DetailPayment = {
  id: string
  amount: number
  paidOn: string
  confirmed: boolean
  note: string
}

export type DetailOpportunity = {
  id: string
  name: string
  amount: number
  stage: string
  feedback: string
  expectOn: string
  closed: boolean
}

export type CustomerRecord = {
  customerId: string
  name: string
  code: string
  englishName: string
  creditCode: string
  companyType: string
  foundedOn: string
  staffSize: string
  address: string
  remark: string
  products: string
  trade: string
  region: string
  source: string
  website: string
  years: number
  tags: string[]
  contacts: DetailPerson[]
  follows: DetailFollow[]
  tasks: DetailTask[]
  contracts: DetailContract[]
  services: DetailService[]
  payments: DetailPayment[]
  opportunities: DetailOpportunity[]
  gapNote: string
}

const cache = new Map<string, CustomerRecord>()
const listeners = new Set<() => void>()

export function subscribeRecords(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function readRecord(customer: Customer) {
  const current = cache.get(customer.id)
  if (current) return current
  const seeded = seedRecord(customer)
  cache.set(customer.id, seeded)
  return seeded
}

export function writeRecord(customerId: string, recipe: (record: CustomerRecord) => CustomerRecord) {
  const current = cache.get(customerId)
  if (!current) return
  cache.set(customerId, recipe(current))
  listeners.forEach((listener) => listener())
}

export function shanghaiDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function parseDay(value: string) {
  const full = value.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (full) return `${full[1]}-${full[2]}-${full[3]}`
  const short = value.match(/(?:^|\s)(\d{2})-(\d{2})(?:\s|$)/)
  if (short) return `${shanghaiDay().slice(0, 4)}-${short[1]}-${short[2]}`
  return ''
}

export function dayDiff(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00+08:00`)
  const end = Date.parse(`${to}T00:00:00+08:00`)
  return Math.round((end - start) / 86400000)
}

export function paidTotal(record: CustomerRecord) {
  return record.payments.filter((item) => item.confirmed).reduce((sum, item) => sum + item.amount, 0)
}

export function contractAmount(record: CustomerRecord) {
  return record.contracts.reduce((sum, item) => sum + item.amount, 0)
}

export function opportunityAmount(record: CustomerRecord) {
  return record.opportunities.filter((item) => !item.closed).reduce((sum, item) => sum + item.amount, 0)
}

export function latestFollowDay(record: CustomerRecord) {
  const days = record.follows.map((item) => parseDay(item.at)).filter(Boolean).sort()
  return days.at(-1) ?? ''
}

export function nextTaskDay(record: CustomerRecord) {
  const days = record.tasks.filter((item) => !item.done).map((item) => parseDay(item.at)).filter(Boolean).sort()
  return days[0] ?? ''
}

export function renewalLabel(end: string, today = shanghaiDay()) {
  if (!end) return '未填写到期日'
  const days = dayDiff(today, end)
  if (days < 0) return '已到期'
  if (days <= 60) return '即将到期'
  return '在服'
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function seedRecord(customer: Customer): CustomerRecord {
  if (customer.id === 'youlaite') return seedYoulaite(customer)
  return seedFromList(customer)
}

function seedFromList(customer: Customer): CustomerRecord {
  return {
    customerId: customer.id,
    name: customer.name,
    code: customer.contractNo,
    englishName: '',
    creditCode: '',
    companyType: '',
    foundedOn: '',
    staffSize: '',
    address: '',
    remark: '',
    products: customer.productDetail || customer.products || '',
    trade: customer.trade || customer.industry || '',
    region: `${customer.province ?? ''} ${customer.city ?? ''}`.trim(),
    source: customer.source || '',
    website: customer.website || '',
    years: customer.years ?? 0,
    tags: [...customer.tags],
    contacts: (customer.contacts ?? []).map((item) => ({ ...item })),
    follows: [],
    tasks: (customer.plans ?? []).map((item) => ({ id: item.id, title: item.text, at: item.at, done: item.done })),
    contracts: customer.contractEnd
      ? [{
          id: `contract-${customer.id}`,
          name: '客户列表中的到期记录',
          amount: 0,
          start: '',
          end: customer.contractEnd,
          note: '列表只保存了到期日和历史实付，没有合同总额，也没有分项服务。金额 0 表示这份档案里没有确认过的合同总额。',
        }]
      : [],
    services: [],
    payments: customer.value > 0
      ? [{
          id: `pay-${customer.id}`,
          amount: customer.value,
          paidOn: '',
          confirmed: true,
          note: '金额来自客户列表的历史实付。设计稿没有给出分笔付款。',
        }]
      : [],
    opportunities: [],
    gapNote: '这位客户只有列表里的字段。详情设计稿没有给出英文名、信用代码、联系人微信和商机明细，这里留空。',
  }
}

/** 详情设计稿上的宁波优来特样本。电话和地址保持打码。到期日沿用客户列表里的 2026-12-15。 */
function seedYoulaite(customer: Customer): CustomerRecord {
  return {
    customerId: customer.id,
    name: customer.name,
    code: 'MIC-2024-0001',
    englishName: 'Ningbo Unilite Import & Export Co., Ltd.',
    creditCode: '91330212********',
    companyType: '有限责任公司',
    foundedOn: '2015-06-18',
    staffSize: '50-100人',
    address: '浙江省宁波市鄞州区**路***号',
    remark: '详情设计稿写明去年实付 158,000 元、合同原价合计 374,540 元。26 项服务和 3 次付款都没有逐条列出，所以没有拆成假明细。',
    products: '净水器、RO反渗透设备、过滤器、净水配件',
    trade: '环保设备 / 水处理',
    region: '浙江 宁波',
    source: customer.source || '主动开发',
    website: customer.website || '',
    years: customer.years ?? 3,
    tags: ['高价值客户', '即将续约', '有加购需求', '外贸公司', '净水器'],
    contacts: [
      { id: 'c-shi', name: '史总', role: '总经理', phone: '138-****-8888', wechat: '****', primary: true, decision: true },
      { id: 'c-wang', name: '王经理', role: '业务负责人', phone: '136-****-6666', wechat: '****', primary: false, decision: false },
    ],
    follows: [
      { id: 'df1', at: '2026-10-22 16:30', channel: 'phone', content: '电话沟通。客户对续约方案表示认可，近期安排工厂拜访。', feedback: '认可续约方案', nextStep: '安排工厂拜访', owner: '张晓丽', attachments: [] },
      { id: 'df2', at: '2026-10-21 14:20', channel: 'wechat', content: '微信沟通。已发送产品资料，客户正在评估新增加购。', feedback: '在评估加购', nextStep: '等客户反馈', owner: '张晓丽', attachments: [] },
      { id: 'df3', at: '2026-10-20 10:00', channel: 'visit', content: '拜访。参观工厂，沟通后续合作方向，客户对聚焦 APP 有兴趣。', feedback: '对聚焦 APP 有兴趣', nextStep: '准备聚焦 APP 方案', owner: '张晓丽', attachments: [] },
      { id: 'df4', at: '2026-10-15 11:30', channel: 'mail', content: '邮件沟通。发送续约报价和对比方案。', feedback: '', nextStep: '', owner: '张晓丽', attachments: [{ id: 'a1', name: '续约方案.pdf', size: '2.3MB' }, { id: 'a2', name: '报价单.xlsx', size: '1.1MB' }] },
      { id: 'df5', at: '2026-09-28 09:40', channel: 'wechat', content: '微信沟通。客户反馈目前订单稳定，考虑增加精点投预算。', feedback: '考虑增加精点投预算', nextStep: '', owner: '张晓丽', attachments: [] },
    ],
    tasks: (customer.plans ?? []).map((item) => ({ id: item.id, title: item.text, at: item.at, done: item.done })),
    contracts: [{
      id: 'contract-youlaite',
      name: '中国制造网服务合同',
      amount: 374540,
      start: '',
      end: customer.contractEnd || '2026-12-15',
      note: '合同总额 374,540 来自详情设计稿。到期日用客户列表里的 2026-12-15。设计稿另写了 2025-09-24 至 2026-09-23，并标着还有 32 天，和列表以及今天的日期对不上，所以不采用那段日期。26 项服务没有逐项清单。',
    }],
    services: [],
    payments: [{
      id: 'pay-youlaite',
      amount: customer.value || 158000,
      paidOn: '',
      confirmed: true,
      note: '设计稿写了累计支付 3 次、合计 158,000 元，但没有每次的金额和日期，因此只记一笔已确认合计。',
    }],
    opportunities: [
      { id: 'op1', name: '聚焦APP', amount: 60000, stage: '意向沟通', feedback: '', expectOn: '2026-11-15', closed: false },
      { id: 'op2', name: '精点投', amount: 20000, stage: '方案报价', feedback: '', expectOn: '2026-11-30', closed: false },
    ],
    gapNote: '第二位联系人在详情图里写成了胡总，客户列表里是王经理、同一打码手机号。档案沿用列表里的王经理，避免同一个人两个名字。',
  }
}
