'use client'
import { Search, X } from 'lucide-react'
import { APPLICATION_STATUS_OPTIONS, LEARNING_STATUS_OPTIONS, COMPLETION_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS, CHECK_STATUS_OPTIONS, SOURCE_CHANNEL_OPTIONS } from '@/lib/constants'
import type { StudentFilters } from '@/lib/types'
import { cn } from '@/lib/utils'

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn('h-8 px-2 pr-7 text-xs rounded-lg border bg-white appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', value ? 'border-blue-400 text-blue-700 font-medium' : 'border-slate-200 text-slate-600')}>
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function FilterBar({ filters, onChange }: { filters: StudentFilters; onChange: (f: StudentFilters) => void }) {
  const update = (key: keyof StudentFilters) => (val: string) => onChange({ ...filters, [key]: val })
  const isFiltered = Object.values(filters).some((v) => v !== '')
  const reset = () => onChange({ application_status:'', learning_status:'', completion_status:'', employment_status:'', check_status:'', source_channel:'', search:'' })
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input type="text" placeholder="이름, 전화번호 검색" value={filters.search} onChange={(e) => update('search')(e.target.value)} className="h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48" />
      </div>
      <SelectFilter label="신청상태" value={filters.application_status} options={APPLICATION_STATUS_OPTIONS} onChange={update('application_status')} />
      <SelectFilter label="수강상태" value={filters.learning_status} options={LEARNING_STATUS_OPTIONS} onChange={update('learning_status')} />
      <SelectFilter label="수료상태" value={filters.completion_status} options={COMPLETION_STATUS_OPTIONS} onChange={update('completion_status')} />
      <SelectFilter label="취업상태" value={filters.employment_status} options={EMPLOYMENT_STATUS_OPTIONS} onChange={update('employment_status')} />
      <SelectFilter label="유입경로" value={filters.source_channel} options={SOURCE_CHANNEL_OPTIONS} onChange={update('source_channel')} />
      <SelectFilter label="확인상태" value={filters.check_status} options={CHECK_STATUS_OPTIONS} onChange={update('check_status')} />
      {isFiltered && (
        <button onClick={reset} className="flex items-center gap-1 h-8 px-3 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          <X className="w-3 h-3" />초기화
        </button>
      )}
    </div>
  )
}
