'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Student, StudentFilters } from '@/lib/types'
import { COURSE_NAME } from '@/lib/constants'
import FilterBar from '@/components/students/FilterBar'
import StudentTable from '@/components/students/StudentTable'

const DEFAULT_FILTERS: StudentFilters = { application_status:'', learning_status:'', completion_status:'', employment_status:'', check_status:'', source_channel:'', search:'' }

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS)

  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase.from('bootcamp_students').select('*').eq('course_name', COURSE_NAME).order('created_at', { ascending: false })
    setStudents((data ?? []) as Student[])
    setLoading(false)
  }

  useEffect(() => { fetchStudents() }, [])

  const filtered = useMemo(() => students.filter((s) => {
    if (filters.application_status && s.application_status !== filters.application_status) return false
    if (filters.learning_status && s.learning_status !== filters.learning_status) return false
    if (filters.completion_status && s.completion_status !== filters.completion_status) return false
    if (filters.employment_status && s.employment_status !== filters.employment_status) return false
    if (filters.check_status && s.check_status !== filters.check_status) return false
    if (filters.source_channel && s.source_channel !== filters.source_channel) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!s.name.toLowerCase().includes(q) && !(s.phone ?? '').includes(q)) return false
    }
    return true
  }), [students, filters])

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('bootcamp_students').delete().eq('id', id)
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">교육생 목록</h1>
          <p className="text-slate-500 text-sm mt-0.5">{COURSE_NAME}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStudents} className="flex items-center gap-1.5 h-9 px-3 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"><RefreshCw className="w-3.5 h-3.5" />새로고침</button>
          <Link href="/students/new" className="flex items-center gap-1.5 h-9 px-4 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" />교육생 추가</Link>
        </div>
      </div>
      <FilterBar filters={filters} onChange={setFilters} />
      {loading
        ? <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center py-16"><div className="flex items-center gap-2 text-slate-400 text-sm"><RefreshCw className="w-4 h-4 animate-spin" />불러오는 중...</div></div>
        : <StudentTable students={filtered} onDelete={handleDelete} />}
    </div>
  )
}
