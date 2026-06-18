'use client'
import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Copy, Filter } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { ImportRow } from '@/lib/excel/transform'

export default function PreviewTable({ rows, fileName }: { rows: ImportRow[]; fileName: string }) {
  const [showIssuesOnly, setShowIssuesOnly] = useState(false)
  const normal = rows.filter((r) => r.check_status === '정상')
  const duplicate = rows.filter((r) => r.check_status === '중복')
  const needReview = rows.filter((r) => r.check_status === '확인필요')
  const displayed = showIssuesOnly ? rows.filter((r) => r.check_status !== '정상') : rows

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{fileName}</span>
          <span className="text-xs text-slate-400">· 총 {rows.length}행</span>
        </div>
        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs font-semibold text-emerald-700 tabular-nums">{normal.length}</span><span className="text-xs text-slate-400">정상</span></div>
          {duplicate.length > 0 && <div className="flex items-center gap-1"><Copy className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs font-semibold text-amber-700 tabular-nums">{duplicate.length}</span><span className="text-xs text-slate-400">중복</span></div>}
          {needReview.length > 0 && <div className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-orange-500" /><span className="text-xs font-semibold text-orange-700 tabular-nums">{needReview.length}</span><span className="text-xs text-slate-400">확인필요</span></div>}
          {(duplicate.length + needReview.length) > 0 && (
            <button onClick={() => setShowIssuesOnly((v) => !v)} className={`flex items-center gap-1.5 h-7 px-3 text-xs rounded-full border transition-colors ${showIssuesOnly ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <Filter className="w-3 h-3" />{showIssuesOnly ? '전체 보기' : '이슈만 보기'}
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['행','이름','연락처','성별','나이/연령대','신청일','유입경로','확인상태','이슈'].map((h,i) => (
                  <th key={i} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayed.map((row) => (
                <tr key={row._rowIndex} className={row.check_status !== '정상' ? 'bg-orange-50/40 hover:bg-orange-50/70' : 'hover:bg-slate-50/50'}>
                  <td className="px-3 py-2.5 text-center text-xs text-slate-400 tabular-nums">{row._rowIndex}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">{row.name}</td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap font-mono text-xs">{row.phone ?? <span className="text-red-400">미입력</span>}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.gender ?? '-'}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{row.age ? `${row.age}세` : '-'}{row.age_group && <span className="text-slate-400 ml-1">({row.age_group})</span>}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap text-xs">{formatDate(row.applied_at)}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{row.source_channel ?? '-'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge status={row.check_status} size="sm" /></td>
                  <td className="px-3 py-2.5 text-xs text-orange-600">{row._warnings.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayed.length === 0 && <div className="flex items-center justify-center py-10 text-slate-400 text-sm">표시할 행이 없습니다.</div>}
        <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-400">{showIssuesOnly ? `이슈 ${displayed.length}건 (전체 ${rows.length}건)` : `전체 ${rows.length}건`}</div>
      </div>
    </div>
  )
}
