export type NavId =
  | 'workbench'
  | 'customers'
  | 'followups'
  | 'reactivate'
  | 'renewal'
  | 'addon'
  | 'reports'
  | 'ai'
  | 'team'
  | 'files'
  | 'settings'

export type Segment = '即将到期' | '沉睡客户' | '高价值客户' | '加购机会'

export type CustomerStatus = '高价值' | '即将到期' | '沉睡' | '加购机会'

export type CustomerLevel = '高价值' | '重要客户' | '潜力客户'

export type AccountStatus = '正常客户' | '沉睡客户' | '即将到期' | '加购机会'

export type CustomerContact = {
  id: string
  name: string
  role: string
  phone: string
  wechat?: string
  primary?: boolean
  decision?: boolean
}

export type CustomerPlan = {
  id: string
  at: string
  text: string
  done: boolean
}

export type Channel = 'phone' | 'wechat' | 'visit' | 'mail' | 'meeting' | 'plan' | 'quote'

export type Priority = '高' | '中' | '低'

export type Mark = 'm' | 'green' | 'blue' | 'orange' | 'red'

export type TrendTab = '客户总数' | '在服客户' | '沉睡客户' | '即将到期' | '加购机会'

export type Customer = {
  id: string
  name: string
  contact: string
  phone: string
  industry: string
  tags: string[]
  contractNo: string
  value: number
  daysLeft: number
  status: CustomerStatus
  segments: Segment[]
  mark: Mark
  /** 客户管理页设计稿样本。工作台样本不带这个标记。 */
  directory?: boolean
  /** 「需要跟进」页签 */
  needsFollow?: boolean
  province?: string
  city?: string
  products?: string
  productDetail?: string
  trade?: string
  level?: CustomerLevel
  years?: number
  contractEnd?: string
  accountStatus?: AccountStatus
  nextFollow?: string
  /** 上次跟进，设计稿文案如「10-18 电话」 */
  lastFollow?: string
  source?: string
  website?: string
  nameTag?: string
  contacts?: CustomerContact[]
  plans?: CustomerPlan[]
  starred?: boolean
}

export type Todo = {
  id: string
  customerId: string
  priority: Priority
  channel: Channel
  title: string
  time: string
  done: boolean
}

export type FollowUp = {
  id: string
  customerId: string
  channel: Channel
  summary: string
  atLabel: string
  fresh?: boolean
}

export type FollowUpInput = {
  customerId: string
  channel: Channel
  summary: string
  atLabel: string
}

export type CustomerActions = {
  export: () => void
  import: () => void
}

export type CustomerInput = {
  name: string
  contact: string
  phone: string
  industry: string
  tags: string
}

export type TaskInput = {
  customerId: string
  priority: Priority
  channel: Channel
  title: string
  time: string
}
