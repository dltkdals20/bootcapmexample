import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string; value: number; icon: LucideIcon
  iconColor: string; iconBg: string; description?: string; highlight?: boolean
}

export default function KpiCard({ label, value, icon: Icon, iconColor, iconBg, description, highlight = false }: KpiCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border p-5 flex items-start gap-4 shadow-sm', highlight ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200')}>
      <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{value.toLocaleString()}</p>
        {description && <p className="text-slate-400 text-[11px] mt-0.5">{description}</p>}
      </div>
    </div>
  )
}
