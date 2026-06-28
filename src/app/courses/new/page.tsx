import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CourseForm from '@/components/courses/CourseForm'

export default function NewCoursePage() {
  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <Link href="/courses" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" />과정 목록으로
        </Link>
        <h1 className="text-xl font-bold text-slate-900">과정 추가</h1>
        <p className="text-slate-500 text-sm mt-0.5">새 부트캠프 과정을 등록합니다.</p>
      </div>
      <CourseForm mode="create" />
    </div>
  )
}
