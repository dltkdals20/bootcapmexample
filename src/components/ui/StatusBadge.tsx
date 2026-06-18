import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  수강예정: 'bg-blue-50 text-blue-700 border-blue-200',
  수강중: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  중도탈락: 'bg-red-50 text-red-700 border-red-200',
  수강종료: 'bg-slate-100 text-slate-600 border-slate-200',
  미수료: 'bg-amber-50 text-amber-700 border-amber-200',
  수료완료: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  수료불가: 'bg-red-50 text-red-700 border-red-200',
  해당없음: 'bg-slate-100 text-slate-500 border-slate-200',
  취업준비중: 'bg-violet-50 text-violet-700 border-violet-200',
  취업완료: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  확인필요: 'bg-orange-50 text-orange-700 border-orange-200',
  신청완료: 'bg-blue-50 text-blue-700 border-blue-200',
  신청취소: 'bg-red-50 text-red-600 border-red-200',
  정상: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  중복: 'bg-amber-50 text-amber-700 border-amber-200',
  매칭불가: 'bg-red-50 text-red-700 border-red-200',
}

export default function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const styles = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      styles
    )}>
      {status}
    </span>
  )
}
