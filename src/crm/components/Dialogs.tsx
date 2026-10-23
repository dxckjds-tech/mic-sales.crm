import { useEffect, useState, type FormEvent } from 'react'
import { formatFollowStamp, money } from '@/crm/data'
import { useCrm } from '@/crm/crm-context'
import type { Channel, Priority } from '@/crm/types'
import { ChannelIcon, findCustomer } from '@/crm/components/bits'

const FOLLOW_CHANNELS: { id: Channel; label: string }[] = [
  { id: 'phone', label: '电话沟通' },
  { id: 'wechat', label: '微信沟通' },
  { id: 'visit', label: '拜访记录' },
  { id: 'mail', label: '发送邮件' },
  { id: 'plan', label: '方案沟通' },
]

const TASK_CHANNELS: { id: Channel; label: string }[] = [
  ...FOLLOW_CHANNELS,
  { id: 'quote', label: '发送报价' },
]

export function CustomerDrawer() {
  const crm = useCrm()
  if (crm.nav === 'customers') return null
  const customer = crm.selectedId ? findCustomer(crm.customers, crm.selectedId) : undefined
  if (!customer) return null
  const history = crm.followUps.filter((item) => item.customerId === customer.id)
  const tasks = crm.todos.filter((item) => item.customerId === customer.id)
  return (
    <div className="mic-mask" onMouseDown={() => crm.closeCustomer()}>
      <aside className="mic-drawer" role="dialog" aria-label="客户详情" data-testid="customer-detail" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mic-drawer-hd">
          <div>
            <div className="mic-unfinished">演示数据</div>
            <h3>{customer.name}</h3>
          </div>
          <button type="button" className="mic-x" aria-label="关闭客户详情" onClick={crm.closeCustomer}>×</button>
        </div>
        <p className="mic-note">联系人、电话和合同编号是演示占位，不是真实联系方式。</p>
        <div className="mic-meta">
          <div><span>联系人</span><b>{customer.contact}</b></div>
          <div><span>电话</span><b>{customer.phone}</b></div>
          <div><span>行业</span><b>{customer.industry}</b></div>
          <div><span>标签</span><b>{customer.tags.join('、')}</b></div>
          <div><span>合同编号</span><b>{customer.contractNo}</b></div>
          <div><span>客户价值</span><b>{money(customer.value)}</b></div>
          <div><span>剩余天数</span><b>{customer.daysLeft}天</b></div>
          <div><span>状态</span><b>{customer.status}</b></div>
        </div>
        <button type="button" className="mic-primary" onClick={() => crm.openFollowUp(customer.id)}>写跟进</button>
        <h4 style={{ margin: '16px 0 8px' }}>跟进记录</h4>
        <div className="mic-feed">
          {history.length === 0 ? <p className="mic-note">还没有跟进。</p> : null}
          {history.map((item) => (
            <div key={item.id} className={item.fresh ? 'mic-feed-row mic-fresh' : 'mic-feed-row'}>
              <ChannelIcon channel={item.channel} />
              <div>
                <div className="mic-time">{item.atLabel}</div>
                <div className="mic-feed-text">{item.summary}</div>
              </div>
            </div>
          ))}
        </div>
        <h4 style={{ margin: '16px 0 8px' }}>相关待办</h4>
        {tasks.length === 0 ? <p className="mic-note">没有待办。</p> : null}
        {tasks.map((task) => (
          <div key={task.id} className="mic-note">{task.done ? '已完成' : task.time} · {task.title}</div>
        ))}
      </aside>
    </div>
  )
}

export function FollowUpForm() {
  const crm = useCrm()
  const [customerId, setCustomerId] = useState('')
  const [channel, setChannel] = useState<Channel | ''>('')
  const [when, setWhen] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!crm.followOpen) return
    setCustomerId(crm.followCustomerId)
    setChannel(crm.followChannel)
    setWhen('')
    setContent('')
    setErrors({})
  }, [crm.followOpen, crm.followCustomerId, crm.followChannel])

  if (!crm.followOpen) return null

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!customerId) next.customerId = '请选择客户'
    if (!channel) next.channel = '请选择跟进方式'
    if (!when) next.when = '请填写跟进时间'
    if (content.trim().length < 4) next.content = '请填写跟进内容（至少 4 个字）'
    setErrors(next)
    if (Object.keys(next).length) return
    crm.saveFollowUp({
      customerId,
      channel: channel as Channel,
      summary: content.trim(),
      atLabel: formatFollowStamp(when),
    })
  }

  return (
    <div className="mic-mask" onMouseDown={crm.closeFollowUp}>
      <form className="mic-dialog mic-form" data-testid="followup-form" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="mic-dialog-hd">
          <div>
            <div className="mic-unfinished">演示数据</div>
            <h3>快速跟进</h3>
          </div>
          <button type="button" className="mic-x" aria-label="关闭" onClick={crm.closeFollowUp}>×</button>
        </div>
        <p className="mic-note">保存后只写在本页，会出现在最近跟进和客户详情里。</p>
        <label className={errors.customerId ? 'bad' : undefined}>
          客户
          <select data-testid="followup-customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">请选择</option>
            {crm.customers.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.customerId ? <span className="mic-err" role="alert">{errors.customerId}</span> : null}
        </label>
        <label className={errors.channel ? 'bad' : undefined}>
          跟进方式
          <select data-testid="followup-channel" value={channel} onChange={(event) => setChannel(event.target.value as Channel | '')}>
            <option value="">请选择</option>
            {FOLLOW_CHANNELS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          {errors.channel ? <span className="mic-err" role="alert">{errors.channel}</span> : null}
        </label>
        <label className={errors.when ? 'bad' : undefined}>
          跟进时间
          <input data-testid="followup-time" type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} />
          {errors.when ? <span className="mic-err" role="alert">{errors.when}</span> : null}
        </label>
        <label className={errors.content ? 'bad' : undefined}>
          跟进内容
          <textarea data-testid="followup-content" value={content} placeholder="写清楚这次沟通了什么" onChange={(event) => setContent(event.target.value)} />
          {errors.content ? <span className="mic-err" role="alert">{errors.content}</span> : null}
        </label>
        <div className="mic-form-actions">
          <button type="button" className="mic-plain" onClick={crm.closeFollowUp}>取消</button>
          <button type="submit" className="mic-primary" data-testid="followup-submit">保存跟进</button>
        </div>
      </form>
    </div>
  )
}

export function CustomerForm() {
  const crm = useCrm()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!crm.customerFormOpen) return
    setName('')
    setContact('')
    setPhone('')
    setIndustry('')
    setTags('')
    setErrors({})
  }, [crm.customerFormOpen])

  if (!crm.customerFormOpen) return null

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = '请填写客户名称（至少 2 个字）'
    if (!contact.trim()) next.contact = '请填写联系人'
    if (phone.trim().length < 4) next.phone = '请填写电话或演示号码'
    setErrors(next)
    if (Object.keys(next).length) return
    crm.saveCustomer({ name, contact, phone, industry, tags })
  }

  return (
    <div className="mic-mask" onMouseDown={crm.closeCustomerForm}>
      <form className="mic-dialog mic-form" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="mic-dialog-hd">
          <div>
            <div className="mic-unfinished">仅演示</div>
            <h3>新增客户</h3>
          </div>
          <button type="button" className="mic-x" aria-label="关闭" onClick={crm.closeCustomerForm}>×</button>
        </div>
        <p className="mic-note">不会提交到制造网或任何外部系统。保存后可在搜索和客户管理里看到。</p>
        <label className={errors.name ? 'bad' : undefined}>
          客户名称
          <input value={name} onChange={(event) => setName(event.target.value)} />
          {errors.name ? <span className="mic-err" role="alert">{errors.name}</span> : null}
        </label>
        <label className={errors.contact ? 'bad' : undefined}>
          联系人
          <input value={contact} onChange={(event) => setContact(event.target.value)} />
          {errors.contact ? <span className="mic-err" role="alert">{errors.contact}</span> : null}
        </label>
        <label className={errors.phone ? 'bad' : undefined}>
          电话
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          {errors.phone ? <span className="mic-err" role="alert">{errors.phone}</span> : null}
        </label>
        <label>
          行业
          <input value={industry} onChange={(event) => setIndustry(event.target.value)} />
        </label>
        <label>
          标签
          <input value={tags} placeholder="用逗号分隔" onChange={(event) => setTags(event.target.value)} />
        </label>
        <div className="mic-form-actions">
          <button type="button" className="mic-plain" onClick={crm.closeCustomerForm}>取消</button>
          <button type="submit" className="mic-primary">保存客户</button>
        </div>
      </form>
    </div>
  )
}

export function TaskForm() {
  const crm = useCrm()
  const [customerId, setCustomerId] = useState('')
  const [priority, setPriority] = useState<Priority>('中')
  const [channel, setChannel] = useState<Channel>('phone')
  const [time, setTime] = useState('09:30')
  const [title, setTitle] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!crm.taskFormOpen) return
    setCustomerId('')
    setPriority('中')
    setChannel('phone')
    setTime('09:30')
    setTitle('')
    setErrors({})
  }, [crm.taskFormOpen])

  if (!crm.taskFormOpen) return null

  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!customerId) next.customerId = '请选择客户'
    if (title.trim().length < 2) next.title = '请填写待办内容'
    if (!/^\d{2}:\d{2}$/.test(time)) next.time = '时间格式应为 09:30'
    setErrors(next)
    if (Object.keys(next).length) return
    crm.saveTask({ customerId, priority, channel, title, time })
  }

  return (
    <div className="mic-mask" onMouseDown={crm.closeTaskForm}>
      <form className="mic-dialog mic-form" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="mic-dialog-hd">
          <div>
            <div className="mic-unfinished">仅演示</div>
            <h3>添加任务</h3>
          </div>
          <button type="button" className="mic-x" aria-label="关闭" onClick={crm.closeTaskForm}>×</button>
        </div>
        <label className={errors.customerId ? 'bad' : undefined}>
          客户
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">请选择</option>
            {crm.customers.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {errors.customerId ? <span className="mic-err" role="alert">{errors.customerId}</span> : null}
        </label>
        <label>
          优先级
          <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </label>
        <label>
          方式
          <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)}>
            {TASK_CHANNELS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className={errors.time ? 'bad' : undefined}>
          时间
          <input value={time} onChange={(event) => setTime(event.target.value)} />
          {errors.time ? <span className="mic-err" role="alert">{errors.time}</span> : null}
        </label>
        <label className={errors.title ? 'bad' : undefined}>
          待办内容
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
          {errors.title ? <span className="mic-err" role="alert">{errors.title}</span> : null}
        </label>
        <div className="mic-form-actions">
          <button type="button" className="mic-plain" onClick={crm.closeTaskForm}>取消</button>
          <button type="submit" className="mic-primary">保存任务</button>
        </div>
      </form>
    </div>
  )
}

export function Toast() {
  const crm = useCrm()
  if (!crm.toast) return null
  return <div className="mic-toast" role="status" data-testid="toast">{crm.toast}</div>
}
