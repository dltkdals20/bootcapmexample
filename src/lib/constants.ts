export const COURSE_NAME = '데이터분석 부트캠프 5기'

export const APPLICATION_STATUS_OPTIONS = ['신청완료', '신청취소'] as const
export const LEARNING_STATUS_OPTIONS = ['수강예정', '수강중', '중도탈락', '수강종료'] as const
export const COMPLETION_STATUS_OPTIONS = ['미수료', '수료완료', '수료불가'] as const
export const EMPLOYMENT_STATUS_OPTIONS = ['해당없음', '취업준비중', '취업완료', '확인필요'] as const
export const CHECK_STATUS_OPTIONS = ['정상', '중복', '확인필요', '매칭불가'] as const
export const SOURCE_CHANNEL_OPTIONS = ['네이버', '구글', '인스타그램', '유튜브', '지인추천', '기타'] as const
export const GENDER_OPTIONS = ['남', '여'] as const
export const AGE_GROUP_OPTIONS = ['20대', '30대', '40대', '50대 이상'] as const

export const DEFAULTS = {
  course_name: COURSE_NAME,
  application_status: '신청완료',
  learning_status: '수강예정',
  completion_status: '미수료',
  employment_status: '해당없음',
  check_status: '정상',
} as const

export const LEARNING_STATUS_COLORS: Record<string, string> = {
  수강예정: '#3B82F6', 수강중: '#22C55E', 중도탈락: '#EF4444', 수강종료: '#94A3B8',
}
export const EMPLOYMENT_STATUS_COLORS: Record<string, string> = {
  해당없음: '#94A3B8', 취업준비중: '#F59E0B', 취업완료: '#22C55E', 확인필요: '#F97316',
}
export const COMPLETION_STATUS_COLORS: Record<string, string> = {
  미수료: '#F59E0B', 수료완료: '#22C55E', 수료불가: '#EF4444',
}
