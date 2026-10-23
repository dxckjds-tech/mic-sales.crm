import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEMO_CUSTOMERS, DEMO_FOLLOW_UPS, DEMO_TODOS } from '@/crm/data'
import { DIRECTORY_CUSTOMERS } from '@/crm/directory'
import type { Channel, Customer, CustomerActions, CustomerInput, FollowUp, FollowUpInput, NavId, Segment, TaskInput, Todo, TrendTab } from '@/crm/types'

type CrmContextValue = {
  nav: NavId
  setNav: (nav: NavId) => void
  customers: Customer[]
  todos: Todo[]
  followUps: FollowUp[]
  search: string
  setSearch: (value: string) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  selectedId: string | null
  openCustomer: (id: string) => void
  closeCustomer: () => void
  detailId: string | null
  openDetail: (id: string) => void
  closeDetail: () => void
  toggleTodo: (id: string) => void
  todosExpanded: boolean
  setTodosExpanded: (open: boolean) => void
  followOpen: boolean
  followCustomerId: string
  followChannel: Channel | ''
  openFollowUp: (customerId?: string, channel?: Channel) => void
  closeFollowUp: () => void
  saveFollowUp: (input: FollowUpInput) => void
  patchCustomer: (id: string, patch: Partial<Customer>) => void
  pushToast: (message: string) => void
  registerCustomerActions: (actions: CustomerActions | null) => void
  exportCustomerView: () => void
  importCustomerView: () => void
  customerFormOpen: boolean
  openCustomerForm: () => void
  closeCustomerForm: () => void
  saveCustomer: (input: CustomerInput) => void
  taskFormOpen: boolean
  openTaskForm: () => void
  closeTaskForm: () => void
  saveTask: (input: TaskInput) => void
  noticeOpen: boolean
  setNoticeOpen: (open: boolean) => void
  userOpen: boolean
  setUserOpen: (open: boolean) => void
  perfOpen: boolean
  setPerfOpen: (open: boolean) => void
  keyTab: Segment
  setKeyTab: (tab: Segment) => void
  trendTab: TrendTab
  setTrendTab: (tab: TrendTab) => void
  trendRange: '6m' | '3m'
  setTrendRange: (range: '6m' | '3m') => void
  funnelRange: 'month' | 'last'
  setFunnelRange: (range: 'month' | 'last') => void
  mobileNav: boolean
  setMobileNav: (open: boolean) => void
  toast: string | null
  openTodos: number
}

const CrmContext = createContext<CrmContextValue | null>(null)

export function CrmProvider({ children }: { children: ReactNode }) {
  const [nav, setNavState] = useState<NavId>('workbench')
  const [customers, setCustomers] = useState<Customer[]>([...DEMO_CUSTOMERS, ...DIRECTORY_CUSTOMERS])
  const [todos, setTodos] = useState<Todo[]>(DEMO_TODOS)
  const [followUps, setFollowUps] = useState<FollowUp[]>(DEMO_FOLLOW_UPS)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [todosExpanded, setTodosExpanded] = useState(false)
  const [followOpen, setFollowOpen] = useState(false)
  const [followCustomerId, setFollowCustomerId] = useState('')
  const [followChannel, setFollowChannel] = useState<Channel | ''>('')
  const customerActions = useRef<CustomerActions | null>(null)
  const [customerFormOpen, setCustomerFormOpen] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [perfOpen, setPerfOpen] = useState(false)
  const [keyTab, setKeyTab] = useState<Segment>('即将到期')
  const [trendTab, setTrendTab] = useState<TrendTab>('客户总数')
  const [trendRange, setTrendRange] = useState<'6m' | '3m'>('6m')
  const [funnelRange, setFunnelRange] = useState<'month' | 'last'>('month')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!followUps.some((item) => item.fresh)) return
    const timer = window.setTimeout(() => {
      setFollowUps((current) => current.map((item) => (item.fresh ? { ...item, fresh: false } : item)))
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [followUps])

  const api = useMemo<CrmContextValue>(() => {
    const openTodos = todos.filter((item) => !item.done).length
    return {
      nav,
      setNav: (next) => {
        setNavState(next)
        setDetailId(null)
        setMobileNav(false)
        setSearchOpen(false)
      },
      customers,
      todos,
      followUps,
      search,
      setSearch: (value) => {
        setSearch(value)
        setSearchOpen(true)
      },
      searchOpen,
      setSearchOpen,
      selectedId,
      openCustomer: (id) => {
        setSelectedId(id)
        setSearchOpen(false)
      },
      closeCustomer: () => setSelectedId(null),
      detailId,
      openDetail: (id) => {
        setDetailId(id)
        setSelectedId(null)
        setNavState('customers')
        setMobileNav(false)
        setSearchOpen(false)
      },
      closeDetail: () => setDetailId(null),
      toggleTodo: (id) => setTodos((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))),
      todosExpanded,
      setTodosExpanded,
      followOpen,
      followCustomerId,
      followChannel,
      openFollowUp: (customerId, channel) => {
        setFollowCustomerId(customerId ?? '')
        setFollowChannel(channel ?? '')
        setFollowOpen(true)
        setNoticeOpen(false)
        setUserOpen(false)
      },
      closeFollowUp: () => setFollowOpen(false),
      saveFollowUp: (input) => {
        setFollowUps((current) => [
          {
            id: `f-${Date.now().toString(36)}`,
            customerId: input.customerId,
            channel: input.channel,
            summary: input.summary,
            atLabel: input.atLabel,
            fresh: true,
          },
          ...current,
        ])
        setFollowOpen(false)
        setToast('跟进已保存，已出现在跟进记录（演示数据）')
      },
      patchCustomer: (id, patch) => {
        setCustomers((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
      },
      pushToast: (message) => setToast(message),
      registerCustomerActions: (actions) => {
        customerActions.current = actions
      },
      exportCustomerView: () => customerActions.current?.export(),
      importCustomerView: () => customerActions.current?.import(),
      customerFormOpen,
      openCustomerForm: () => setCustomerFormOpen(true),
      closeCustomerForm: () => setCustomerFormOpen(false),
      saveCustomer: (input) => {
        const tags = input.tags.split(/[，,\s]+/).map((item) => item.trim()).filter(Boolean)
        const customer: Customer = {
          id: `c-${Date.now().toString(36)}`,
          name: input.name.trim(),
          contact: input.contact.trim(),
          phone: input.phone.trim(),
          industry: input.industry.trim() || '未填写',
          tags: tags.length ? tags : ['演示'],
          contractNo: `DEMO-NEW-${Date.now().toString(36).toUpperCase()}`,
          value: 0,
          daysLeft: 0,
          status: '高价值',
          segments: [],
          mark: 'blue',
          directory: true,
          province: '',
          city: '',
          products: input.industry.trim(),
          trade: input.industry.trim() || '未填写',
          level: '重要客户',
          years: 1,
          contractEnd: '',
          accountStatus: '正常客户',
          nextFollow: '',
          source: '手工新增',
          website: '',
          contacts: [{ id: `ct-${Date.now().toString(36)}`, name: input.contact.trim(), role: '联系人', phone: input.phone.trim() }],
          plans: [],
        }
        setCustomers((current) => [customer, ...current])
        setCustomerFormOpen(false)
        setToast(`已加入演示客户「${customer.name}」，可在搜索和客户管理中看到`)
        setSelectedId(customer.id)
      },
      taskFormOpen,
      openTaskForm: () => setTaskFormOpen(true),
      closeTaskForm: () => setTaskFormOpen(false),
      saveTask: (input) => {
        const todo: Todo = {
          id: `t-${Date.now().toString(36)}`,
          customerId: input.customerId,
          priority: input.priority,
          channel: input.channel,
          title: input.title.trim(),
          time: input.time,
          done: false,
        }
        setTodos((current) => [todo, ...current])
        setTaskFormOpen(false)
        setTodosExpanded(true)
        setToast('待办已加入今日待办（演示数据）')
        setNavState('workbench')
      },
      noticeOpen,
      setNoticeOpen,
      userOpen,
      setUserOpen,
      perfOpen,
      setPerfOpen,
      keyTab,
      setKeyTab,
      trendTab,
      setTrendTab,
      trendRange,
      setTrendRange,
      funnelRange,
      setFunnelRange,
      mobileNav,
      setMobileNav,
      toast,
      openTodos,
    }
  }, [
    nav,
    customers,
    todos,
    followUps,
    search,
    searchOpen,
    selectedId,
    detailId,
    todosExpanded,
    followOpen,
    followCustomerId,
    followChannel,
    customerFormOpen,
    taskFormOpen,
    noticeOpen,
    userOpen,
    perfOpen,
    keyTab,
    trendTab,
    trendRange,
    funnelRange,
    mobileNav,
    toast,
  ])

  return <CrmContext.Provider value={api}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const value = useContext(CrmContext)
  if (!value) throw new Error('useCrm 必须在 CrmProvider 内使用')
  return value
}
