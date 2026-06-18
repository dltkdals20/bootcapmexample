export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import StudentForm from '@/components/students/StudentForm'
import type { Student } from '@/lib/types'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase.from('bootcamp_students').select('*').eq('id', id).single()
  if (error || !data) notFound()
  const student = data as Student
  return (
    <div className="p-6 max-w-4xl space-y-5">
      <div>
        <Link href="/students" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"><ChevronLeft className="w-4 h-4" />교육생 목록</Link>
        <h1 className="text-xl font-bold text-slate-900">교육생 수정</h1>
        <p className="text-slate-500 text-sm mt-0.5">{student.name}</p>
      </div>
      <StudentForm mode="edit" student={student} />
    </div>
  )
}
