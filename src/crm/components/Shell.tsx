import { useEffect, useRef } from 'react'
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Download,
  FileStack,
  Flame,
  LayoutDashboard,
  Menu,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react'
import logo from '@/assets/crm/logo-mark.png'
import avatar from '@/assets/crm/avatar.png'
import cityscape from '@/assets/crm/sidebar-city.png'
import { customerMatches } from '@/crm/data'
import { useCrm } from '@/crm/crm-context'
import type { NavId } from '@/crm/types'
import { CustomerDrawer, CustomerForm, FollowUpForm, TaskForm, Toast } from '@/crm/components/Dialogs'
import { ModulePage } from '@/crm/components/Pages'
import { Workbench } from '@/crm/components/Workbench'

type NavItem = { id: NavId; label: string; icon: typeof LayoutDashboard }

/** 客户详情设计稿侧栏（10 项） */
const DETAIL_NAV: NavItem[] = [
  { id: 'workbench', label: '工作台', icon: LayoutDashboard },
  { id: 'customers', label: '客户管理', icon: Users },
  { id: 'followups', label: '跟进管理', icon: CalendarDays },
  { id: 'reactivate', label: '客户盘活', icon: Flame },
  { id: 'renewal', label: '续约管理', icon: RefreshCw },
  { id: 'addon', label: '加购商机', icon: BriefcaseBusiness },
  { id: 'reports', label: '数据报表', icon: PieChart },
  { id: 'ai', label: 'AI销售助手', icon: Bot },
  { id: 'files', label: '文件中心', icon: FileStack },
  { id: 'settings', label: '系统设置', icon: Settings },
]

/** 待办日程页沿用的精简侧栏 */
const SCHEDULE_NAV: NavItem[] = [
  { id: 'workbench', label: '工作台', icon: LayoutDashboard },
  { id: 'customers', label: '客户中心', icon: Users },
  { id: 'followups', label: '待办日程', icon: CalendarDays },
  { id: 'reports', label: '数据分析', icon: PieChart },
  { id: 'settings', label: '系统设置', icon: Settings },
]

const DEFAULT_NAV: NavItem[] = [
  { id: 'workbench', label: '工作台', icon: LayoutDashboard },
  { id: 'customers', label: '客户中心', icon: Users },
  { id: 'followups', label: '待办日程', icon: CalendarDays },
  { id: 'reports', label: '数据分析', icon: PieChart },
  { id: 'settings', label: '系统设置', icon: Settings },
]

export function GoalCard() {
  const radius = 22
  const circ = 2 * Math.PI * radius
  return (
    <div className="mic-goal">
      <div className="mic-goal-title"><Sparkles size={12} /> 本月目标</div>
      <div className="mic-goal-row">
        <svg viewBox="0 0 64 64" aria-label="本月目标完成 68%">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="6" />
          <circle cx="32" cy="32" r={radius} fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray={`${circ * 0.68} ${circ}`} strokeLinecap="round" transform="rotate(-90 32 32)" />
          <text x="32" y="36" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">68%</text>
        </svg>
        <div>
          <b>¥50万</b>
          <span>本月目标</span>
        </div>
      </div>
      <div className="mic-goal-foot">已完成 ¥34.2万</div>
    </div>
  )
}

export function Shell() {
  const crm = useCrm()
  const searchRef = useRef<HTMLInputElement>(null)
  const hits = crm.search.trim() ? crm.customers.filter((item) => customerMatches(item, crm.search)) : []
  const detailChrome = Boolean(crm.detailId) || crm.nav === 'customers'
  const scheduleChrome = crm.nav === 'followups' && !crm.detailId
  const navItems = detailChrome ? DETAIL_NAV : scheduleChrome ? SCHEDULE_NAV : DEFAULT_NAV
  const hideDemo = detailChrome || scheduleChrome

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
        crm.setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        crm.setSearchOpen(false)
        crm.setNoticeOpen(false)
        crm.setUserOpen(false)
        crm.setMobileNav(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [crm])

  return (
    <div className={`mic-app${detailChrome ? ' mic-detail-chrome' : ''}`}>
      {crm.mobileNav ? <button className="mic-scrim" aria-label="关闭导航" onClick={() => crm.setMobileNav(false)} /> : null}
      <aside className={crm.mobileNav ? 'mic-side open' : 'mic-side'} onMouseDown={() => crm.setSearchOpen(false)}>
        <div className="mic-brand">
          <img src={logo} alt="" />
          <div>
            <strong>MIC Sales CRM</strong>
            <span>中国制造网·个人销售管理系统</span>
          </div>
        </div>
        {hideDemo ? null : <div className="mic-demo-pill">演示数据</div>}
        <nav className="mic-nav" aria-label="主导航">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={crm.nav === item.id ? 'active' : undefined}
              onClick={() => {
                if (item.id !== 'customers') crm.closeDetail()
                crm.setNav(item.id)
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        {detailChrome || scheduleChrome ? (
          <>
            <GoalCard />
            {detailChrome ? <img className="mic-side-city" src={cityscape} alt="" aria-hidden="true" /> : null}
          </>
        ) : (
          <div className="mic-side-user">
            <img src={avatar} alt="" />
            <div className="grow">
              <strong>张晓丽</strong>
              <span>客户经理</span>
            </div>
            <button type="button" className="mic-side-more" aria-label="账号菜单尚未开放" title="账号菜单尚未开放" onClick={() => crm.setUserOpen(true)}>
              <Menu size={16} />
            </button>
          </div>
        )}
      </aside>
      <div className="mic-body">
        <header className="mic-top">
          <button type="button" className="mic-menu mic-icon-btn" aria-label="打开导航" onClick={() => crm.setMobileNav(true)}>
            <Menu size={18} />
          </button>
          <div className="mic-top-brand">
            <img src={logo} alt="" />
            <span>MIC</span>
          </div>
          <div className="mic-search">
            <Search className="mic-search-icon" size={16} />
            <input
              ref={searchRef}
              data-testid="crm-search"
              value={crm.search}
              placeholder={detailChrome
                ? '搜索公司名称、联系人、电话、微信、主营产品、行业等...'
                : scheduleChrome
                  ? '搜索公司名称、联系人、电话、微信、主营产品、行业、地区...'
                  : '搜索客户名称、联系人、电话、行业、标签、合同编号...'}
              aria-label="搜索演示客户"
              onChange={(event) => crm.setSearch(event.target.value)}
              onFocus={() => crm.setSearchOpen(true)}
            />
            {hideDemo ? null : <span className="mic-kbd">⌘K</span>}
            {crm.searchOpen && crm.search.trim() ? (
              <div className="mic-suggest" data-testid="search-results">
                {hits.length === 0 ? <div className="empty">没有匹配的演示客户</div> : null}
                {hits.map((item) => (
                  <button key={item.id} type="button" onClick={() => (crm.nav === 'customers' ? crm.openDetail(item.id) : crm.openCustomer(item.id))}>
                    <span>
                      <b>{item.name}</b>
                      <span>
                        {item.contact} · {item.phone} · {item.industry} · {item.contractNo}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mic-actions">
            <button type="button" className="mic-primary" onClick={crm.openCustomerForm}>
              <Plus size={16} />
              新增客户
            </button>
            {detailChrome || scheduleChrome ? (
              <>
                <button type="button" className="mic-ghost" onClick={() => detailChrome ? crm.importCustomerView() : crm.pushToast('日程导入尚未接入（演示）')}>
                  <Upload size={16} />
                  <span>导入Excel</span>
                </button>
                <button type="button" className="mic-ghost" onClick={() => detailChrome ? crm.exportCustomerView() : crm.pushToast('日程导出尚未接入（演示）')}>
                  <Download size={16} />
                  <span>导出Excel</span>
                </button>
              </>
            ) : (
              <>
                <button type="button" className="mic-ghost" data-testid="open-followup" onClick={() => crm.openFollowUp()}>
                  <Zap size={16} />
                  <span>快速跟进</span>
                </button>
                <button type="button" className="mic-ghost" onClick={crm.openTaskForm}>
                  <CalendarPlus size={16} />
                  <span>添加任务</span>
                </button>
              </>
            )}
            <button
              type="button"
              className="mic-icon-btn"
              aria-label="通知，演示徽章 12"
              onClick={() => {
                crm.setNoticeOpen(!crm.noticeOpen)
                crm.setUserOpen(false)
              }}
            >
              <Bell size={18} />
              <span className="mic-badge">12</span>
            </button>
            <button
              type="button"
              className="mic-user"
              onClick={() => {
                crm.setUserOpen(!crm.userOpen)
                crm.setNoticeOpen(false)
              }}
            >
              <img className="mic-avatar" src={avatar} alt="" />
              <span>
                <strong>张晓丽</strong>
                <span>客户经理</span>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
          {crm.noticeOpen ? (
            <div className="mic-pop" role="dialog" aria-label="通知">
              <h3>通知中心尚未完成</h3>
              <p>徽章上的 12 是设计稿演示数字。这里没有接入消息、审批或到期提醒。</p>
            </div>
          ) : null}
          {crm.userOpen ? (
            <div className="mic-pop" role="dialog" aria-label="账号">
              <h3>演示账号</h3>
              <p>当前身份是设计稿中的张晓丽 / 客户经理。登录、权限和退出都还没有做。</p>
            </div>
          ) : null}
        </header>
        <main className="mic-scroll" onMouseDown={() => crm.setSearchOpen(false)}>
          {hideDemo ? null : (
            <div className="mic-banner">
              <b>演示数据</b>
              <span>客户名称、指标和跟进都来自设计稿样本，不是真实客户，也不会提交到任何平台。</span>
            </div>
          )}
          {crm.nav === 'workbench' ? <Workbench /> : <ModulePage />}
        </main>
      </div>
      <CustomerDrawer />
      <FollowUpForm />
      <CustomerForm />
      <TaskForm />
      <Toast />
    </div>
  )
}
