'use client'

import Link from 'next/link'
import { Calendar, Users, ExternalLink, Pencil, Trash2, Clock, Tag } from 'lucide-react'
import type { BootcampCourse } from '@/lib/types'
import { RECRUITMENT_STATUS_LABELS, RECRUITMENT_STATUS_COLORS, COURSE_EMPLOYMENT_LABELS } from '@/lib/constants'

interface CourseCardProps {
  course: BootcampCourse
  onDelete: (id: string) => void
}

function StatusBadge({ status }: { status: string }) {
  const label = RECRUITMENT_STATUS_LABELS[status] ?? status
  const color = RECRUITMENT_STATUS_COLORS[status] ?? '#94A3B8'
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
      <span className="text-slate-400 text-xs w-16 flex-shrink-0">{label}</span>
      <span className="text-slate-700 text-xs leading-snug">{value}</span>
    </div>
  )
}

export default function CourseCard({ course, onDelete }: CourseCardProps) {
  const enrollmentRatio = course.capacity > 0 ? course.current_enrollment / course.capacity : 0
  const ageRange = course.min_age && course.max_age
    ? `${course.min_age}~${course.max_age}세`
    : course.min_age ? `${course.min_age}세 이상`
    : course.max_age ? `${course.max_age}세 이하`
    : null

  const handleDelete = () => {
    if (!confirm(`"${course.course_name}" 과정을 삭제하시겠습니까?`)) return
    onDelete(course.id)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                <Tag className="w-2.5 h-2.5" />{course.category}
              </span>
              <StatusBadge status={course.recruitment_status} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">{course.course_name}</h3>
          </div>
        </div>

        <div className="space-y-1.5">
          <InfoRow icon={Calendar} label="시작일" value={course.start_date} />
          <InfoRow icon={Clock} label="기간" value={course.training_period} />
          <InfoRow icon={Calendar} label="일정" value={course.class_schedule} />
          {ageRange && <InfoRow icon={Users} label="연령" value={ageRange} />}
          <InfoRow icon={Users} label="지원자격" value={COURSE_EMPLOYMENT_LABELS[course.employment_status] ?? course.employment_status} />
          {course.eligibility_note && <InfoRow icon={Users} label="자격비고" value={course.eligibility_note} />}
          {course.support_info && <InfoRow icon={Tag} label="지원금" value={course.support_info} />}
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>신청현황</span>
            <span className="font-semibold text-slate-700">{course.current_enrollment}<span className="font-normal text-slate-400"> / {course.capacity}명</span></span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(enrollmentRatio * 100, 100)}%`,
                backgroundColor: enrollmentRatio >= 1 ? '#EF4444' : enrollmentRatio >= 0.8 ? '#F59E0B' : '#22C55E',
              }}
            />
          </div>
        </div>

        {course.notes && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 border-t border-slate-50 pt-2">{course.notes}</p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        {course.course_url
          ? <a href={course.course_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"><ExternalLink className="w-3 h-3" />상세보기</a>
          : <span />}
        <div className="flex items-center gap-1">
          <Link href={`/courses/${course.id}/edit`} className="flex items-center gap-1 h-7 px-2.5 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <Pencil className="w-3 h-3" />수정
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-1 h-7 px-2.5 text-xs rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3 h-3" />삭제
          </button>
        </div>
      </div>
    </div>
  )
}
