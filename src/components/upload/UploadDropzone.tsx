'use client'
import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

async function downloadTemplate() {
  const XLSX = await import('xlsx')
  const headers = ['신청ID','이름','연락처','성별','나이','연령대','신청일','신청과정','유입경로']
  const sample = [
    ['APP-001','홍길동','010-1234-5678','남',25,'20대','2024-11-01','데이터분석 부트캠프 5기','네이버'],
    ['APP-002','김민지','010-9876-5432','여',32,'30대','2024-11-02','데이터분석 부트캠프 5기','인스타그램'],
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample])
  ws['!cols'] = headers.map(() => ({ wch: 20 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '신청자')
  XLSX.writeFile(wb, '신청자_업로드_템플릿.xlsx')
}

export default function UploadDropzone({ onFileSelect, loading }: { onFileSelect: (f: File) => void; loading?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['xlsx','xls'].includes(ext)) { alert('.xlsx 또는 .xls 파일만 업로드할 수 있습니다.'); return }
    onFileSelect(file)
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        className={cn('relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer py-14 px-8 text-center',
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50',
          loading && 'pointer-events-none opacity-60')}
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50">
          <FileSpreadsheet className="w-7 h-7 text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">파일을 여기에 드래그하거나 클릭하여 선택하세요</p>
          <p className="text-xs text-slate-400">Excel 파일 (.xlsx, .xls) 지원</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium">
          <Upload className="w-3.5 h-3.5" />파일 선택
        </span>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div>
          <p className="text-sm font-medium text-slate-700">업로드 템플릿이 필요하신가요?</p>
          <p className="text-xs text-slate-400 mt-0.5">올바른 컬럼 구조가 포함된 샘플 엑셀 파일입니다.</p>
        </div>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 h-8 px-3 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-white transition-colors flex-shrink-0">
          <Download className="w-3.5 h-3.5" />템플릿 다운로드
        </button>
      </div>
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-xs font-semibold text-amber-800 mb-1.5">필수 컬럼 안내</p>
        <div className="grid grid-cols-3 gap-1">
          {[['이름','필수'],['연락처','필수'],['신청ID','선택'],['성별','선택'],['나이','선택'],['연령대','나이 있으면 자동'],['신청일','선택'],['신청과정','기본값 자동'],['유입경로','선택']].map(([col,note]) => (
            <div key={col} className="flex items-center gap-1">
              <span className="text-xs text-amber-900 font-medium">{col}</span>
              <span className="text-[10px] text-amber-600">({note})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
