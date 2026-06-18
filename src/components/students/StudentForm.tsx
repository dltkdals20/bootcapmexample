'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { APPLICATION_STATUS_OPTIONS, LEARNING_STATUS_OPTIONS, COMPLETION_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS, CHECK_STATUS_OPTIONS, SOURCE_CHANNEL_OPTIONS, GENDER_OPTIONS, AGE_GROUP_OPTIONS, DEFAULTS } from '@/lib/constants'
import type { Student, StudentInsert } from '@/lib/types'
import { cn } from '@/lib/utils'

const inputCls = 'w-full h-9 px-3 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400'
const selectCls = cn(inputCls, 'cursor-pointer')

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

export default function StudentForm({ student, mode }: { student?: Student; mode: 'create' | 'edit' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<StudentInsert>({
    application_id: student?.application_id ?? null,
    student_id: student?.student_id ?? null,
    name: student?.name ?? '',
    phone: student?.phone ?? null,
    gender: student?.gender ?? null,
    age: student?.age ?? null,
    age_group: student?.age_group ?? null,
    applied_at: student?.applied_at ?? null,
    course_name: student?.course_name ?? DEFAULTS.course_name,
    source_channel: student?.source_channel ?? null,
    application_status: student?.application_status ?? DEFAULTS.application_status,
    learning_status: student?.learning_status ?? DEFAULTS.learning_status,
    completion_status: student?.completion_status ?? DEFAULTS.completion_status,
    employment_status: student?.employment_status ?? DEFAULTS.employment_status,
    dropout_date: student?.dropout_date ?? null,
    dropout_reason: student?.dropout_reason ?? null,
    completed_at: student?.completed_at ?? null,
    company_name: student?.company_name ?? null,
    employed_at: student?.employed_at ?? null,
    job_title: student?.job_title ?? null,
    check_status: student?.check_status ?? DEFAULTS.check_status,
    notes: student?.notes ?? null,
  })

  const set = (key: keyof StudentInsert) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? (e.target.value ? Number(e.target.value) : null) : (e.target.value || null)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { setError('이름은 필수 입력 항목입니다.'); return }
    setLoading(true); setError(null)
    const { error: dbError } = mode === 'create'
      ? await supabase.from('bootcamp_students').insert([{ ...form, name: form.name! }])
      : await supabase.from('bootcamp_students').update({ ...form, name: form.name! }).eq('id', student!.id)
    setLoading(false)
    if (dbError) { setError(dbError.message); return }
    router.push('/students'); router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">기본 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="이름" required><input className={inputCls} value={form.name ?? ''} onChange={set('name')} placeholder="홍길동" /></Field>
          <Field label="연락처"><input className={inputCls} value={form.phone ?? ''} onChange={set('phone')} placeholder="010-0000-0000" /></Field>
          <Field label="성별"><select className={selectCls} value={form.gender ?? ''} onChange={set('gender')}><option value="">선택</option>{GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}</select></Field>
          <Field label="나이"><input type="number" className={inputCls} value={form.age ?? ''} onChange={set('age')} min={15} max={80} placeholder="25" /></Field>
          <Field label="연령대"><select className={selectCls} value={form.age_group ?? ''} onChange={set('age_group')}><option value="">선택</option>{AGE_GROUP_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}</select></Field>
          <Field label="신청일"><input type="date" className={inputCls} value={form.applied_at ?? ''} onChange={set('applied_at')} /></Field>
          <Field label="유입경로"><select className={selectCls} value={form.source_channel ?? ''} onChange={set('source_channel')}><option value="">선택</option>{SOURCE_CHANNEL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="신청 ID"><input className={inputCls} value={form.application_id ?? ''} onChange={set('application_id')} placeholder="APP-001" /></Field>
          <Field label="학생 ID"><input className={inputCls} value={form.student_id ?? ''} onChange={set('student_id')} placeholder="STU-001" /></Field>
        </div>
      </section>
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">상태 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="신청상태"><select className={selectCls} value={form.application_status} onChange={set('application_status')}>{APPLICATION_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="수강상태"><select className={selectCls} value={form.learning_status} onChange={set('learning_status')}>{LEARNING_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="수료상태"><select className={selectCls} value={form.completion_status} onChange={set('completion_status')}>{COMPLETION_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="취업상태"><select className={selectCls} value={form.employment_status} onChange={set('employment_status')}>{EMPLOYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="확인상태"><select className={selectCls} value={form.check_status} onChange={set('check_status')}>{CHECK_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
        </div>
        {form.learning_status === '중도탈락' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Field label="탈락일"><input type="date" className={inputCls} value={form.dropout_date ?? ''} onChange={set('dropout_date')} /></Field>
            <Field label="탈락 사유"><input className={inputCls} value={form.dropout_reason ?? ''} onChange={set('dropout_reason')} placeholder="개인 사정 등" /></Field>
          </div>
        )}
        {form.completion_status === '수료완료' && (
          <div className="pt-2 border-t border-slate-100">
            <Field label="수료일"><input type="date" className={inputCls} value={form.completed_at ?? ''} onChange={set('completed_at')} /></Field>
          </div>
        )}
        {form.employment_status === '취업완료' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <Field label="회사명"><input className={inputCls} value={form.company_name ?? ''} onChange={set('company_name')} placeholder="(주)데이터코리아" /></Field>
            <Field label="직무"><input className={inputCls} value={form.job_title ?? ''} onChange={set('job_title')} placeholder="데이터 분석가" /></Field>
            <Field label="취업일"><input type="date" className={inputCls} value={form.employed_at ?? ''} onChange={set('employed_at')} /></Field>
          </div>
        )}
      </section>
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">메모</h2>
        <textarea className={cn(inputCls, 'h-24 resize-none py-2')} value={form.notes ?? ''} onChange={set('notes')} placeholder="추가 메모 사항을 입력하세요." />
      </section>
      <div className="flex items-center gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="h-9 px-5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">취소</button>
        <button type="submit" disabled={loading} className="h-9 px-5 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? '저장 중...' : mode === 'create' ? '교육생 등록' : '수정 저장'}
        </button>
      </div>
    </form>
  )
}
