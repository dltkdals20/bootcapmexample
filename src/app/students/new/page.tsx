import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import StudentForm from '@/components/students/StudentForm'

export default function NewStudentPage() {
  return (
    <div className="p-6 max-w-4xl space-y-5">
      <div>
        <Link href="/students" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"><ChevronLeft className="w-4 h-4" />교육생 목록</Link>
        <h1 className="text-xl font-bold text-slate-900">교육생 추가</h1>
      </div>
      <StudentForm mode="create" />
    </div>
  )
}
