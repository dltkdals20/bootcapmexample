'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { BootcampCourse } from '@/lib/types'
import CourseForm from '@/components/courses/CourseForm'

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<BootcampCourse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('bootcamp_courses').select('*').eq('id', id).single()
      setCourse(data as BootcampCourse | null)
      setLoading(false)
    }
    fetch()
  }, [id])

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <Link href="/courses" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3">
          <ChevronLeft className="w-4 h-4" />과정 목록으로
        </Link>
        <h1 className="text-xl font-bold text-slate-900">과정 수정</h1>
        <p className="text-slate-500 text-sm mt-0.5">{course?.course_name ?? '...'}</p>
      </div>
      {loading
        ? <div className="flex items-center gap-2 text-slate-400 text-sm py-10"><RefreshCw className="w-4 h-4 animate-spin" />불러오는 중...</div>
        : course
          ? <CourseForm course={course} mode="edit" />
          : <p className="text-slate-500 text-sm">과정을 찾을 수 없습니다.</p>}
    </div>
  )
}
