'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { BootcampCourse, RecruitmentStatus } from '@/lib/types'
import { RECRUITMENT_STATUS_OPTIONS, RECRUITMENT_STATUS_LABELS, RECRUITMENT_STATUS_COLORS } from '@/lib/constants'
import CourseCard from '@/components/courses/CourseCard'

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: '', label: '전체' },
  ...RECRUITMENT_STATUS_OPTIONS.map((s) => ({ value: s, label: RECRUITMENT_STATUS_LABELS[s] })),
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<BootcampCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const fetchCourses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bootcamp_courses')
      .select('*')
      .order('start_date', { ascending: false })
    setCourses((data ?? []) as BootcampCourse[])
    setLoading(false)
  }

  useEffect(() => { fetchCourses() }, [])

  const filtered = useMemo(() => courses.filter((c) => {
    if (statusFilter && c.recruitment_status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.course_name.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) return false
    }
    return true
  }), [courses, statusFilter, search])

  const handleDelete = async (id: string) => {
    await supabase.from('bootcamp_courses').delete().eq('id', id)
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { '': courses.length }
    for (const s of RECRUITMENT_STATUS_OPTIONS) {
      counts[s] = courses.filter((c) => c.recruitment_status === s).length
    }
    return counts
  }, [courses])

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">과정 관리</h1>
          <p className="text-slate-500 text-sm mt-0.5">부트캠프 과정 목록 및 모집현황</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCourses} className="flex items-center gap-1.5 h-9 px-3 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />새로고침
          </button>
          <Link href="/courses/new" className="flex items-center gap-1.5 h-9 px-4 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />과정 추가
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {STATUS_TABS.map(({ value, label }) => {
            const color = value ? RECRUITMENT_STATUS_COLORS[value] : undefined
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === value
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {color && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                )}
                {label}
                <span className={`text-[10px] font-semibold ${statusFilter === value ? 'text-slate-500' : 'text-slate-400'}`}>
                  {countByStatus[value] ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            className="w-full h-9 pl-8 pr-3 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
            placeholder="과정명, 카테고리 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />불러오는 중...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-sm">과정이 없습니다.</p>
          <Link href="/courses/new" className="mt-3 text-sm text-blue-600 hover:underline">+ 과정 추가하기</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
