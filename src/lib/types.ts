export type ApplicationStatus = '신청완료' | '신청취소'
export type LearningStatus = '수강예정' | '수강중' | '중도탈락' | '수강종료'
export type CompletionStatus = '미수료' | '수료완료' | '수료불가'
export type EmploymentStatus = '해당없음' | '취업준비중' | '취업완료' | '확인필요'
export type CheckStatus = '정상' | '중복' | '확인필요' | '매칭불가'

export interface Student {
  id: string
  application_id: string | null
  student_id: string | null
  name: string
  phone: string | null
  gender: string | null
  age: number | null
  age_group: string | null
  applied_at: string | null
  course_name: string
  source_channel: string | null
  application_status: ApplicationStatus
  learning_status: LearningStatus
  completion_status: CompletionStatus
  employment_status: EmploymentStatus
  dropout_date: string | null
  dropout_reason: string | null
  completed_at: string | null
  company_name: string | null
  employed_at: string | null
  job_title: string | null
  check_status: CheckStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>
export type StudentUpdate = Partial<StudentInsert>

export interface StudentFilters {
  application_status: string
  learning_status: string
  completion_status: string
  employment_status: string
  check_status: string
  source_channel: string
  search: string
}

export interface DailyMarketingReport {
  id: string
  report_date: string
  course_name: string | null
  overall_summary: string | null
  channel_insight: string | null
  age_group_insight: string | null
  gender_insight: string | null
  funnel_insight: string | null
  recommended_actions: string | null
  created_at: string | null
}

export interface DashboardStats {
  total: number
  byLearningStatus: Record<LearningStatus, number>
  byCompletionStatus: Record<CompletionStatus, number>
  byEmploymentStatus: Record<EmploymentStatus, number>
  bySourceChannel: Array<{ channel: string; count: number; employed: number }>
  needReview: Student[]
}
