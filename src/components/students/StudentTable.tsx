'use client'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { Student } from '@/lib/types'

export default function StudentTable({ students, onDelete }: { students: Student[]; onDelete: (id: string) => void }) {
  if (students.length === 0) return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center py-16 text-slate-400 text-sm">조건에 맞는 교육생이 없습니다.</div>
  )
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['이름','연락처','성별/나이','유입경로','신청상태','수강상태','수료상태','취업상태','확인상태','신청일',''].map((h,i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{s.name}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.phone ?? '-'}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.gender ?? '-'} / {s.age ? `${s.age}세` : '-'}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.source_channel ?? '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.application_status} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.learning_status} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.completion_status} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.employment_status} /></td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.check_status} /></td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{formatDate(s.applied_at)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Link href={`/students/${s.id}/edit`} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => onDelete(s.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">총 {students.length}명</div>
    </div>
  )
}
