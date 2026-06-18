import Link from 'next/link'
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, UploadCloud } from 'lucide-react'

interface ImportResult { success: number; failed: number; errors: string[] }

export default function ResultSummary({ result, totalRows, onReset }: { result: ImportResult; totalRows: number; onReset: () => void }) {
  const allSuccess = result.failed === 0
  const rate = totalRows > 0 ? Math.round((result.success / totalRows) * 100) : 0
  return (
    <div className="space-y-5">
      <div className={`rounded-xl border p-5 flex items-center gap-4 ${allSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        {allSuccess ? <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" /> : <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />}
        <div>
          <p className={`text-base font-bold ${allSuccess ? 'text-emerald-800' : 'text-amber-800'}`}>{allSuccess ? `${result.success}건 모두 저장 완료되었습니다.` : `${result.success}건 저장 완료, ${result.failed}건 실패`}</p>
          <p className={`text-sm mt-0.5 ${allSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>전체 {totalRows}건 중 저장 성공률 {rate}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
          <div><p className="text-xs text-slate-500">저장 성공</p><p className="text-2xl font-bold text-slate-900 tabular-nums">{result.success}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${result.failed > 0 ? 'bg-red-50' : 'bg-slate-50'}`}><XCircle className={`w-5 h-5 ${result.failed > 0 ? 'text-red-500' : 'text-slate-300'}`} /></div>
          <div><p className="text-xs text-slate-500">저장 실패</p><p className={`text-2xl font-bold tabular-nums ${result.failed > 0 ? 'text-red-600' : 'text-slate-300'}`}>{result.failed}</p></div>
        </div>
      </div>
      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-red-700">오류 상세</p>
          <ul className="space-y-1">{result.errors.map((e, i) => <li key={i} className="text-xs text-red-600">• {e}</li>)}</ul>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={onReset} className="flex items-center gap-1.5 h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"><UploadCloud className="w-4 h-4" />추가 업로드</button>
        <Link href="/students" className="flex items-center gap-1.5 h-9 px-5 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">교육생 목록 확인<ArrowRight className="w-4 h-4" /></Link>
        <Link href="/dashboard" className="flex items-center gap-1.5 h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">대시보드</Link>
      </div>
    </div>
  )
}
