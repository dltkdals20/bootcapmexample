'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { RECRUITMENT_STATUS_OPTIONS, RECRUITMENT_STATUS_LABELS, COURSE_EMPLOYMENT_OPTIONS, COURSE_EMPLOYMENT_LABELS } from '@/lib/constants'
import type { BootcampCourse, BootcampCourseInsert } from '@/lib/types'
import { cn } from '@/lib/utils'

const inputCls = 'w-full h-9 px-3 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400'
const selectCls = cn(inputCls, 'cursor-pointer')

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const EMPTY_FORM: BootcampCourseInsert = {
  course_name: '',
  category: '',
  start_date: '',
  training_period: null,
  min_age: null,
  max_age: null,
  employment_status: 'unemployed_only',
  eligibility_note: null,
  capacity: 20,
  current_enrollment: 0,
  recruitment_status: 'open',
  support_info: null,
  course_url: null,
  notes: null,
  class_schedule: null,
}

export default function CourseForm({ course, mode }: { course?: BootcampCourse; mode: 'create' | 'edit' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<BootcampCourseInsert>({
    course_name: course?.course_name ?? '',
    category: course?.category ?? '',
    start_date: course?.start_date ?? '',
    training_period: course?.training_period ?? null,
    min_age: course?.min_age ?? null,
    max_age: course?.max_age ?? null,
    employment_status: course?.employment_status ?? 'unemployed_only',
    eligibility_note: course?.eligibility_note ?? null,
    capacity: course?.capacity ?? 20,
    current_enrollment: course?.current_enrollment ?? 0,
    recruitment_status: course?.recruitment_status ?? 'open',
    support_info: course?.support_info ?? null,
    course_url: course?.course_url ?? null,
    notes: course?.notes ?? null,
    class_schedule: course?.class_schedule ?? null,
  })

  const set = (key: keyof BootcampCourseInsert) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number'
      ? (e.target.value ? Number(e.target.value) : null)
      : (e.target.value || null)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.course_name?.trim()) { setError('과정명은 필수 항목입니다.'); return }
    if (!form.category?.trim()) { setError('카테고리는 필수 항목입니다.'); return }
    if (!form.start_date) { setError('시작일은 필수 항목입니다.'); return }
    if (!form.capacity || form.capacity <= 0) { setError('모집정원은 1명 이상이어야 합니다.'); return }

    setLoading(true); setError(null)
    const payload = {
      ...form,
      course_name: form.course_name!,
      category: form.category!,
      start_date: form.start_date!,
      capacity: form.capacity!,
    }
    const { error: dbError } = mode === 'create'
      ? await supabase.from('bootcamp_courses').insert([payload])
      : await supabase.from('bootcamp_courses').update(payload).eq('id', course!.id)
    setLoading(false)
    if (dbError) { setError(dbError.message); return }
    router.push('/courses'); router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">기본 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="과정명" required>
            <input className={inputCls} value={form.course_name ?? ''} onChange={set('course_name')} placeholder="데이터분석 부트캠프 6기" />
          </Field>
          <Field label="카테고리" required>
            <input className={inputCls} value={form.category ?? ''} onChange={set('category')} placeholder="데이터분석" />
          </Field>
          <Field label="시작일" required>
            <input type="date" className={inputCls} value={form.start_date ?? ''} onChange={set('start_date')} />
          </Field>
          <Field label="교육기간">
            <input className={inputCls} value={form.training_period ?? ''} onChange={set('training_period')} placeholder="3개월 (12주)" />
          </Field>
          <Field label="수업일정">
            <input className={inputCls} value={form.class_schedule ?? ''} onChange={set('class_schedule')} placeholder="월~금 09:00~18:00" />
          </Field>
          <Field label="모집현황">
            <select className={selectCls} value={form.recruitment_status} onChange={set('recruitment_status')}>
              {RECRUITMENT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{RECRUITMENT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">모집 조건</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="모집정원" required>
            <input type="number" className={inputCls} value={form.capacity ?? ''} onChange={set('capacity')} min={1} max={9999} placeholder="20" />
          </Field>
          <Field label="현재신청인원">
            <input type="number" className={inputCls} value={form.current_enrollment ?? ''} onChange={set('current_enrollment')} min={0} placeholder="0" />
          </Field>
          <Field label="지원자격">
            <select className={selectCls} value={form.employment_status} onChange={set('employment_status')}>
              {COURSE_EMPLOYMENT_OPTIONS.map((s) => (
                <option key={s} value={s}>{COURSE_EMPLOYMENT_LABELS[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="최소나이">
            <input type="number" className={inputCls} value={form.min_age ?? ''} onChange={set('min_age')} min={0} max={99} placeholder="미입력 시 제한없음" />
          </Field>
          <Field label="최대나이">
            <input type="number" className={inputCls} value={form.max_age ?? ''} onChange={set('max_age')} min={0} max={99} placeholder="미입력 시 제한없음" />
          </Field>
          <Field label="자격조건 비고">
            <input className={inputCls} value={form.eligibility_note ?? ''} onChange={set('eligibility_note')} placeholder="예: 비전공자 우대" />
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">지원 및 링크</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="지원금/혜택">
            <input className={inputCls} value={form.support_info ?? ''} onChange={set('support_info')} placeholder="국민내일배움카드 지원 가능" />
          </Field>
          <Field label="과정 URL">
            <input type="url" className={inputCls} value={form.course_url ?? ''} onChange={set('course_url')} placeholder="https://example.com/course" />
          </Field>
        </div>
        <Field label="메모">
          <textarea
            className={cn(inputCls, 'h-20 resize-none py-2')}
            value={form.notes ?? ''}
            onChange={set('notes')}
            placeholder="추가 메모 사항"
          />
        </Field>
      </section>

      <div className="flex items-center gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="h-9 px-5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">취소</button>
        <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? '저장 중...' : mode === 'create' ? '과정 등록' : '수정 저장'}
        </button>
      </div>
    </form>
  )
}
