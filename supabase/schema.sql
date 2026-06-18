-- ================================================================
-- 부트캠프 교육생 관리 시스템 — Supabase 초기 설정
-- 실행 순서: 이 파일 전체를 Supabase SQL Editor에 붙여넣고 실행
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- 0. 사전 준비
-- ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────────
-- 1. 메인 테이블
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bootcamp_students (
  -- 식별자
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id     TEXT,                          -- 원본 신청 ID (엑셀 업로드 기준)
  student_id         TEXT        UNIQUE,            -- 내부 학생 번호 (STU-001 형식)

  -- 개인 정보
  name               TEXT        NOT NULL,
  phone              TEXT,
  gender             TEXT,
  age                INTEGER     CHECK (age > 0 AND age < 120),
  age_group          TEXT,

  -- 신청 정보
  applied_at         DATE,
  course_name        TEXT        NOT NULL DEFAULT '데이터분석 부트캠프 5기',
  source_channel     TEXT,

  -- 상태값 (모두 NOT NULL + DEFAULT + CHECK)
  application_status TEXT        NOT NULL DEFAULT '신청완료'
                                 CHECK (application_status IN ('신청완료', '신청취소')),

  learning_status    TEXT        NOT NULL DEFAULT '수강예정'
                                 CHECK (learning_status IN ('수강예정', '수강중', '중도탈락', '수강종료')),

  completion_status  TEXT        NOT NULL DEFAULT '미수료'
                                 CHECK (completion_status IN ('미수료', '수료완료', '수료불가')),

  employment_status  TEXT        NOT NULL DEFAULT '해당없음'
                                 CHECK (employment_status IN ('해당없음', '취업준비중', '취업완료', '확인필요')),

  check_status       TEXT        NOT NULL DEFAULT '정상'
                                 CHECK (check_status IN ('정상', '중복', '확인필요', '매칭불가')),

  -- 중도탈락 상세
  dropout_date       DATE,
  dropout_reason     TEXT,

  -- 수료 상세
  completed_at       DATE,

  -- 취업 상세
  company_name       TEXT,
  employed_at        DATE,
  job_title          TEXT,

  -- 기타
  notes              TEXT,

  -- 감사 로그
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bootcamp_students IS '부트캠프 교육생 신청 ~ 취업 전주기 관리 테이블';
COMMENT ON COLUMN bootcamp_students.student_id IS 'STU-001 형식의 내부 학번';
COMMENT ON COLUMN bootcamp_students.check_status IS '데이터 품질: 정상/중복/확인필요/매칭불가';


-- ────────────────────────────────────────────────────────────────
-- 2. 인덱스 (자주 쓰는 필터/조인 컬럼)
-- ────────────────────────────────────────────────────────────────

-- 과정별 조회 (모든 쿼리의 기본 필터)
CREATE INDEX IF NOT EXISTS idx_bs_course_name
  ON bootcamp_students (course_name);

-- 상태별 필터 (대시보드, 목록 필터)
CREATE INDEX IF NOT EXISTS idx_bs_learning_status
  ON bootcamp_students (learning_status);

CREATE INDEX IF NOT EXISTS idx_bs_employment_status
  ON bootcamp_students (employment_status);

CREATE INDEX IF NOT EXISTS idx_bs_check_status
  ON bootcamp_students (check_status);

CREATE INDEX IF NOT EXISTS idx_bs_completion_status
  ON bootcamp_students (completion_status);

-- 연락처 (중복 체크 — 엑셀 업로드 시 매번 조회)
CREATE INDEX IF NOT EXISTS idx_bs_phone
  ON bootcamp_students (phone)
  WHERE phone IS NOT NULL;

-- 날짜 범위 조회
CREATE INDEX IF NOT EXISTS idx_bs_applied_at
  ON bootcamp_students (applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_bs_created_at
  ON bootcamp_students (created_at DESC);

-- 복합 인덱스: 과정 + 수강상태 (가장 많이 쓰이는 조합)
CREATE INDEX IF NOT EXISTS idx_bs_course_learning
  ON bootcamp_students (course_name, learning_status);

-- 복합 인덱스: 과정 + 취업상태 (대시보드 집계)
CREATE INDEX IF NOT EXISTS idx_bs_course_employment
  ON bootcamp_students (course_name, employment_status);


-- ────────────────────────────────────────────────────────────────
-- 3. updated_at 자동 갱신 트리거
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bootcamp_students_updated_at ON bootcamp_students;
CREATE TRIGGER trg_bootcamp_students_updated_at
  BEFORE UPDATE ON bootcamp_students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ────────────────────────────────────────────────────────────────
-- 4. Row Level Security
-- ────────────────────────────────────────────────────────────────
ALTER TABLE bootcamp_students ENABLE ROW LEVEL SECURITY;

-- service_role(서버사이드)은 RLS를 자동 우회 → 별도 정책 불필요

-- ──────────────────────────────────────
-- [Phase 1] MVP — 인증 없이 운영 (지금)
-- anon 키로 브라우저에서 직접 접근 허용
-- 내부망/VPN 환경이거나 빠르게 MVP 검증할 때 사용
-- ──────────────────────────────────────
CREATE POLICY "mvp_anon_select" ON bootcamp_students
  FOR SELECT TO anon USING (true);

CREATE POLICY "mvp_anon_insert" ON bootcamp_students
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "mvp_anon_update" ON bootcamp_students
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "mvp_anon_delete" ON bootcamp_students
  FOR DELETE TO anon USING (true);


-- ──────────────────────────────────────
-- [Phase 2] 인증 도입 후 교체할 정책
-- Supabase Auth (이메일/비밀번호) 세팅 후 아래 주석 해제,
-- 위 Phase 1 정책 4개는 DROP
--
-- 방법: Supabase Dashboard > Auth > Users 에서 계정 생성
--       앱에서 supabase.auth.signInWithPassword() 호출
-- ──────────────────────────────────────

-- -- Phase 1 정책 제거
-- DROP POLICY IF EXISTS "mvp_anon_select" ON bootcamp_students;
-- DROP POLICY IF EXISTS "mvp_anon_insert" ON bootcamp_students;
-- DROP POLICY IF EXISTS "mvp_anon_update" ON bootcamp_students;
-- DROP POLICY IF EXISTS "mvp_anon_delete" ON bootcamp_students;

-- -- 로그인한 사용자 전체 허용 (역할 구분 없이 단순하게)
-- CREATE POLICY "auth_all_operations" ON bootcamp_students
--   FOR ALL TO authenticated
--   USING (true)
--   WITH CHECK (true);


-- ──────────────────────────────────────
-- [Phase 3] 이메일 도메인 제한 (보안 강화)
-- 특정 회사 이메일(@company.com)만 접근 허용
-- ──────────────────────────────────────

-- -- DROP POLICY IF EXISTS "auth_all_operations" ON bootcamp_students;

-- -- 특정 도메인만 허용
-- CREATE POLICY "auth_domain_only" ON bootcamp_students
--   FOR ALL TO authenticated
--   USING (
--     auth.email() LIKE '%@yourcompany.com'
--   )
--   WITH CHECK (
--     auth.email() LIKE '%@yourcompany.com'
--   );


-- ──────────────────────────────────────
-- [Phase 4] 역할 기반 접근 제어 (RBAC)
-- admin: 전체 권한 / viewer: 조회만
-- user_metadata에 role 필드 사용
-- ──────────────────────────────────────

-- -- 관리자: 전체 CRUD
-- CREATE POLICY "rbac_admin_all" ON bootcamp_students
--   FOR ALL TO authenticated
--   USING (
--     (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
--   )
--   WITH CHECK (
--     (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
--   );

-- -- 뷰어: 읽기 전용
-- CREATE POLICY "rbac_viewer_select" ON bootcamp_students
--   FOR SELECT TO authenticated
--   USING (
--     (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'viewer')
--   );


-- ────────────────────────────────────────────────────────────────
-- 5. 현재 RLS 정책 확인용 뷰 (옵션)
-- ────────────────────────────────────────────────────────────────
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'bootcamp_students';
