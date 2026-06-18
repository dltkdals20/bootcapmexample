'use client'
import { useState } from 'react'
import { CheckCircle2, RefreshCw, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { parseExcelFile } from '@/lib/excel/parser'
import { transformRows, markDuplicates, type ImportRow } from '@/lib/excel/transform'
import UploadDropzone from '@/components/upload/UploadDropzone'
import PreviewTable from '@/components/upload/PreviewTable'
import ResultSummary from '@/components/upload/ResultSummary'
import { COURSE_NAME } from '@/lib/constants'

type Step = 'idle' | 'parsing' | 'previewing' | 'saving' | 'done'
interface ImportResult { success: number; failed: number; errors: string[] }

const STEPS = [{ label: '파일 선택' }, { label: '미리보기' }, { label: '저장 완료' }]

function StepIndicator({ step }: { step: Step }) {
  const cur = step === 'idle' || step === 'parsing' ? 0 : step === 'previewing' || step === 'saving' ? 1 : 2
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${i < cur ? 'bg-blue-600 text-white' : i === cur ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'}`}>
              {i < cur ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === cur ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`w-12 h-px mx-3 ${i < cur ? 'bg-blue-400' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  )
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>('idle')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileSelect = async (file: File) => {
    setStep('parsing'); setParseError(null)
    try {
      const { rows: rawRows, missingHeaders } = await parseExcelFile(file)
      if (rawRows.length === 0) { setParseError('파일에서 데이터를 찾을 수 없습니다.'); setStep('idle'); return }
      if (missingHeaders.length > 0) { setParseError(`필수 컬럼 누락: [${missingHeaders.join(', ')}]`); setStep('idle'); return }

      const transformed = transformRows(rawRows)
      const { data: existing } = await supabase.from('bootcamp_students').select('phone').eq('course_name', COURSE_NAME).not('phone', 'is', null)
      const existingPhones = new Set((existing ?? []).map((r) => r.phone as string).filter(Boolean))
      const markedRows = markDuplicates(transformed, existingPhones)

      setRows(markedRows); setFileName(file.name); setStep('previewing')
    } catch (err) {
      setParseError(`파싱 오류: ${err instanceof Error ? err.message : String(err)}`); setStep('idle')
    }
  }

  const handleSave = async () => {
    setStep('saving')
    const payload = rows.map(({ _rowIndex: _r, _warnings: _w, ...rest }) => rest)
    const res = await fetch('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows: payload }) })
    setResult(res.ok ? await res.json() : { success: 0, failed: rows.length, errors: ['서버 오류'] })
    setStep('done')
  }

  const reset = () => { setStep('idle'); setRows([]); setFileName(''); setParseError(null); setResult(null) }
  const issueCount = rows.filter((r) => r.check_status !== '정상').length

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">신청자 엑셀 업로드</h1>
          <p className="text-slate-500 text-sm mt-0.5">{COURSE_NAME}</p>
        </div>
        <StepIndicator step={step} />
      </div>
      {parseError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{parseError}</div>}
      {(step === 'idle' || step === 'parsing') && <UploadDropzone onFileSelect={handleFileSelect} loading={step === 'parsing'} />}
      {step === 'parsing' && <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-sm"><RefreshCw className="w-4 h-4 animate-spin" />파일 파싱 중...</div>}
      {step === 'previewing' && (
        <>
          <PreviewTable rows={rows} fileName={fileName} />
          {issueCount > 0 && (
            <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <div className="text-sm text-amber-800"><strong>{issueCount}건</strong>의 이슈가 있습니다. 이슈 행은 check_status가 설정된 상태로 저장됩니다.</div>
            </div>
          )}
          <div className="flex items-center gap-3 justify-between">
            <button onClick={reset} className="h-9 px-4 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">← 다시 선택</button>
            <button onClick={handleSave} className="flex items-center gap-2 h-9 px-6 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"><Save className="w-4 h-4" />DB에 저장 ({rows.length}건)</button>
          </div>
        </>
      )}
      {step === 'saving' && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-700 font-medium">Supabase에 저장 중...</p>
        </div>
      )}
      {step === 'done' && result && <ResultSummary result={result} totalRows={rows.length} onReset={reset} />}
    </div>
  )
}
