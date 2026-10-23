import { Calendar, CalendarCheck, FileText, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { Channel, Customer, Mark } from '@/crm/types'

const ICONS = {
  phone: Phone,
  wechat: MessageCircle,
  visit: MapPin,
  mail: Mail,
  meeting: Calendar,
  plan: FileText,
  quote: CalendarCheck,
} as const

export function ChannelIcon({ channel }: { channel: Channel }) {
  const Icon = ICONS[channel]
  return (
    <span className={`mic-ch ${channel}`} aria-hidden="true">
      <Icon size={14} />
    </span>
  )
}

const MARK_LETTER: Record<Mark, string> = {
  m: 'M',
  green: '优',
  blue: '华',
  orange: '宏',
  red: '瑞',
}

export function CompanyMark({ mark }: { mark: Mark }) {
  return (
    <span className={`mic-mark ${mark}`} title="演示标识">
      {MARK_LETTER[mark]}
    </span>
  )
}

export function findCustomer(customers: Customer[], id: string) {
  return customers.find((item) => item.id === id)
}
