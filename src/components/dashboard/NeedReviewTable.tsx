import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { Student } from '@/lib/types'
import { AlertCircle } from 'lucide-react'

export default function NeedReviewTable({ students }: { students: Student[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-800">확인 필요 교육생</h3>
          <span className="text-xs text-slate-400">({students.length}명)</span>
        </div>
        <Link href="/students?check_status=확인필요" className="text-xs text-blue-600 hover:text-blue-700 font-medium">전체 보기</Link>
      </div>
      {students.length === 0
        ? <div className="flex items-center justify-center py-10 text-slate-400 text-sm">확인 필요 교육생이 없습니다.</div>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['이름','수강상태','취업상태','확인상태','비고','신청일',''].map((h,i) => (
                    <th key={i} className="text-left px-5 py-3 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.learning_status} /></td>
                    <td className="px-5 py-3"><StatusBadge status={s.employment_status} /></td>
                    <td className="px-5 py-3"><StatusBadge status={s.check_status} /></td>
                    <td className="px-5 py-3 text-slate-500 text-xs max-w-[160px] truncate">{s.notes ?? '-'}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(s.applied_at)}</td>
                    <td className="px-5 py-3"><Link href={`/students/${s.id}/edit`} className="text-xs text-blue-600 hover:text-blue-700 font-medium">수정</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
    </div>
  )
}
