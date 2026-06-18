export const dynamic = 'force-dynamic'

import { Users, BookOpen, GraduationCap, TrendingUp, AlertTriangle, XCircle, CheckCircle2, Clock, UserX, Lightbulb } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Student, LearningStatus, CompletionStatus, EmploymentStatus, DailyMarketingReport } from '@/lib/types'
import KpiCard from '@/components/dashboard/KpiCard'
import LearningStatusChart from '@/components/dashboard/LearningStatusChart'
import EmploymentStatusChart from '@/components/dashboard/EmploymentStatusChart'
import GenderChart from '@/components/dashboard/GenderChart'
import AgeGroupChart from '@/components/dashboard/AgeGroupChart'
import ChannelFunnelChart from '@/components/dashboard/ChannelFunnelChart'
import DropoutReasonChart from '@/components/dashboard/DropoutReasonChart'
import NeedReviewTable from '@/components/dashboard/NeedReviewTable'
import InsightBox from '@/components/dashboard/InsightBox'
import { COURSE_NAME } from '@/lib/constants'

const AGE_GROUP_ORDER = ['10대', '20대', '30대', '40대', '50대', '60대 이상', '미입력']

function computeStats(students: Student[]) {
  const byLearningStatus = { 수강예정: 0, 수강중: 0, 중도탈락: 0, 수강종료: 0 } as Record<LearningStatus, number>
  const byCompletionStatus = { 미수료: 0, 수료완료: 0, 수료불가: 0 } as Record<CompletionStatus, number>
  const byEmploymentStatus = { 해당없음: 0, 취업준비중: 0, 취업완료: 0, 확인필요: 0 } as Record<EmploymentStatus, number>
  const channelMap: Record<string, { count: number; completed: number; employed: number }> = {}
  const genderMap: Record<string, { count: number; employed: number }> = {}
  const ageGroupMap: Record<string, { count: number; employed: number }> = {}
  const dropoutReasonMap: Record<string, number> = {}

  for (const s of students) {
    byLearningStatus[s.learning_status] = (byLearningStatus[s.learning_status] ?? 0) + 1
    byCompletionStatus[s.completion_status] = (byCompletionStatus[s.completion_status] ?? 0) + 1
    byEmploymentStatus[s.employment_status] = (byEmploymentStatus[s.employment_status] ?? 0) + 1

    const ch = s.source_channel ?? '기타'
    if (!channelMap[ch]) channelMap[ch] = { count: 0, completed: 0, employed: 0 }
    channelMap[ch].count++
    if (s.completion_status === '수료완료') channelMap[ch].completed++
    if (s.employment_status === '취업완료') channelMap[ch].employed++

    const g = s.gender ?? '미입력'
    if (!genderMap[g]) genderMap[g] = { count: 0, employed: 0 }
    genderMap[g].count++
    if (s.employment_status === '취업완료') genderMap[g].employed++

    const ag = s.age_group ?? '미입력'
    if (!ageGroupMap[ag]) ageGroupMap[ag] = { count: 0, employed: 0 }
    ageGroupMap[ag].count++
    if (s.employment_status === '취업완료') ageGroupMap[ag].employed++

    if (s.learning_status === '중도탈락' && s.dropout_reason) {
      const reason = s.dropout_reason.trim()
      dropoutReasonMap[reason] = (dropoutReasonMap[reason] ?? 0) + 1
    }
  }

  return {
    total: students.length,
    cancelCount: students.filter(s => s.application_status === '신청취소').length,
    byLearningStatus, byCompletionStatus, byEmploymentStatus,
    bySourceChannel: Object.entries(channelMap)
      .map(([channel, v]) => ({ channel, ...v }))
      .sort((a, b) => b.count - a.count),
    byGender: Object.entries(genderMap)
      .map(([gender, v]) => ({ gender, ...v }))
      .sort((a, b) => b.count - a.count),
    byAgeGroup: Object.entries(ageGroupMap)
      .map(([ageGroup, v]) => ({ ageGroup, ...v }))
      .sort((a, b) => (AGE_GROUP_ORDER.indexOf(a.ageGroup) - AGE_GROUP_ORDER.indexOf(b.ageGroup)) || a.ageGroup.localeCompare(b.ageGroup)),
    dropoutReasons: Object.entries(dropoutReasonMap)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
    needReview: students.filter(s => s.check_status !== '정상' || s.employment_status === '확인필요'),
  }
}

export default async function DashboardPage() {
  const [studentsRes, reportRes] = await Promise.all([
    supabase.from('bootcamp_students').select('*').eq('course_name', COURSE_NAME).order('created_at', { ascending: false }),
    supabase.from('daily_marketing_reports').select('*').eq('course_name', COURSE_NAME).order('report_date', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (studentsRes.error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          데이터 로드 실패: {studentsRes.error.message}
        </div>
      </div>
    )
  }

  const students = (studentsRes.data ?? []) as Student[]
  const report = reportRes.data as DailyMarketingReport | null
  const stats = computeStats(students)
  const cancelRate = stats.total > 0 ? Math.round((stats.cancelCount / stats.total) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">대시보드</h1>
        <p className="text-slate-500 text-sm mt-0.5">{COURSE_NAME} · 총 {stats.total}명</p>
      </div>

      {report?.overall_summary && (
        <div className="flex gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-blue-700 mb-1">종합 분석 · {report.report_date}</p>
            <p className="text-sm text-blue-900 leading-relaxed">{report.overall_summary}</p>
          </div>
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="전체 신청자" value={stats.total} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" highlight />
        <KpiCard label="수강중" value={stats.byLearningStatus['수강중']} icon={BookOpen} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <KpiCard label="중도탈락" value={stats.byLearningStatus['중도탈락']} icon={XCircle} iconBg="bg-red-50" iconColor="text-red-500" />
        <KpiCard label="수료완료" value={stats.byCompletionStatus['수료완료']} icon={GraduationCap} iconBg="bg-violet-50" iconColor="text-violet-600" />
        <KpiCard label="취업완료" value={stats.byEmploymentStatus['취업완료']} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <KpiCard label="수강예정" value={stats.byLearningStatus['수강예정']} icon={Clock} iconBg="bg-sky-50" iconColor="text-sky-600" />
        <KpiCard label="취업준비중" value={stats.byEmploymentStatus['취업준비중']} icon={TrendingUp} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <KpiCard label="신청취소" value={stats.cancelCount} icon={UserX} iconBg="bg-rose-50" iconColor="text-rose-500" description={`취소율 ${cancelRate}%`} />
        <KpiCard label="확인필요" value={stats.needReview.length} icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-500" description="이상 상태 포함" />
      </div>

      {/* 수강 / 취업 / 월별 추이 */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">수강 · 취업 현황</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <LearningStatusChart data={stats.byLearningStatus} />
            <InsightBox insight={report?.funnel_insight ?? null} label="수강 현황 해석" />
          </div>
          <div>
            <EmploymentStatusChart data={stats.byEmploymentStatus} />
            <InsightBox insight={report?.funnel_insight ?? null} label="취업 현황 해석" />
          </div>
        </div>
      </div>

      {/* 채널 퍼널 */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">유입경로 퍼널</p>
        <ChannelFunnelChart data={stats.bySourceChannel} />
        <InsightBox insight={report?.channel_insight ?? null} label="유입경로 해석" />
      </div>

      {/* 성별 / 연령대 / 중도탈락 이유 */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">수요 분석</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <GenderChart data={stats.byGender} />
            <InsightBox insight={report?.gender_insight ?? null} label="성별 해석" />
          </div>
          <div>
            <AgeGroupChart data={stats.byAgeGroup} />
            <InsightBox insight={report?.age_group_insight ?? null} label="연령대 해석" />
          </div>
          <div>
            <DropoutReasonChart data={stats.dropoutReasons} />
            <InsightBox insight={report?.funnel_insight ?? null} label="중도탈락 해석" />
          </div>
        </div>
      </div>

      {report?.recommended_actions && (
        <div className="flex gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 mb-1">권장 액션</p>
            <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-line">{report.recommended_actions}</p>
          </div>
        </div>
      )}

      <NeedReviewTable students={stats.needReview} />
    </div>
  )
}
