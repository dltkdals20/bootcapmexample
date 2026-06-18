# 부트캠프 교육생 관리 시스템

데이터분석 부트캠프 5기 교육생의 신청 → 수강 → 취업까지 전주기를 관리하는 내부 운영 도구입니다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v3 |
| DB / BaaS | Supabase (PostgreSQL) |
| 차트 | Recharts |
| 엑셀 파싱 | xlsx |
| 아이콘 | lucide-react |
| 경로 | `/Users/eunji/bootcamp` |

---

## 실행 방법

```bash
# 1. 의존성 설치
cd /Users/eunji/bootcamp
npm install

# 2. 환경변수 설정
# .env.local 파일에 Supabase URL과 ANON KEY 입력

# 3. Supabase 테이블 생성
# supabase/schema.sql 전체를 Supabase SQL Editor에서 실행

# 4. (선택) 샘플 데이터 삽입
# supabase/seed.sql 실행 → 교육생 20명 생성

# 5. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## 환경변수

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 화면 구성

| URL | 화면 | 설명 |
|-----|------|------|
| `/dashboard` | 대시보드 | KPI 8개 + 차트 3개 + 확인필요 테이블 |
| `/students` | 교육생 목록 | 전체 목록, 6종 필터, 이름/전화 검색 |
| `/students/new` | 교육생 추가 | 전체 필드 입력 폼 |
| `/students/[id]/edit` | 교육생 수정 | 상태값 드롭다운 포함 |
| `/upload` | 엑셀 업로드 | 파일 선택 → 미리보기 → DB 저장 |

---

## 폴더 구조

```
src/
├── app/
│   ├── layout.tsx                  # 루트 레이아웃 (Sidebar 포함)
│   ├── page.tsx                    # /dashboard 리다이렉트
│   ├── dashboard/page.tsx          # 대시보드 (서버 컴포넌트)
│   ├── students/
│   │   ├── page.tsx                # 목록 (클라이언트 컴포넌트)
│   │   ├── new/page.tsx            # 추가
│   │   └── [id]/edit/page.tsx      # 수정
│   ├── upload/page.tsx             # 엑셀 업로드
│   └── api/import/route.ts         # 배치 저장 API
├── components/
│   ├── layout/Sidebar.tsx
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   ├── LearningStatusChart.tsx
│   │   ├── EmploymentStatusChart.tsx
│   │   ├── SourceChannelChart.tsx
│   │   └── NeedReviewTable.tsx
│   ├── students/
│   │   ├── StudentTable.tsx
│   │   ├── StudentForm.tsx
│   │   └── FilterBar.tsx
│   ├── upload/
│   │   ├── UploadDropzone.tsx
│   │   ├── PreviewTable.tsx
│   │   └── ResultSummary.tsx
│   └── ui/StatusBadge.tsx
└── lib/
    ├── types.ts
    ├── constants.ts
    ├── supabase.ts
    ├── utils.ts
    └── excel/
        ├── parser.ts               # xlsx 파싱 + 한글 헤더 매핑
        └── transform.ts            # 전화번호 정규화, 중복 마킹
supabase/
├── schema.sql                      # 테이블 + 인덱스 + 트리거 + RLS
└── seed.sql                        # 샘플 데이터 20명
```

---

## DB 테이블

테이블 1개: `bootcamp_students`

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | PK, 자동 생성 |
| `student_id` | TEXT UNIQUE | STU-001 형식 내부 학번 |
| `name` | TEXT NOT NULL | 이름 |
| `phone` | TEXT | 연락처 (010-0000-0000 정규화) |
| `application_status` | TEXT | 신청완료 / 신청취소 |
| `learning_status` | TEXT | 수강예정 / 수강중 / 중도탈락 / 수강종료 |
| `completion_status` | TEXT | 미수료 / 수료완료 / 수료불가 |
| `employment_status` | TEXT | 해당없음 / 취업준비중 / 취업완료 / 확인필요 |
| `check_status` | TEXT | 정상 / 중복 / 확인필요 / 매칭불가 |

### RLS 정책 (현재: Phase 1 MVP)

```
Phase 1 (현재)  — anon 전체 허용 (인증 없이 운영)
Phase 2         — authenticated만 허용 (Supabase Auth 도입 후)
Phase 3         — 이메일 도메인 제한 (@yourcompany.com)
Phase 4         — 역할 기반 (admin / viewer)
```

---

## 엑셀 업로드 스펙

### 지원 컬럼 (한글 헤더)

| 엑셀 헤더 | DB 컬럼 | 필수 |
|-----------|---------|------|
| 신청ID | `application_id` | 선택 |
| 이름 | `name` | **필수** |
| 연락처 | `phone` | **필수** |
| 성별 | `gender` | 선택 |
| 나이 | `age` | 선택 |
| 연령대 | `age_group` | 선택 (나이 있으면 자동) |
| 신청일 | `applied_at` | 선택 |
| 신청과정 | `course_name` | 선택 (기본값 자동) |
| 유입경로 | `source_channel` | 선택 |

### 처리 규칙

- 전화번호 → `010-0000-0000` 형식으로 자동 정규화
- 나이 있고 연령대 없으면 → 연령대 자동 생성 (24 → 20대)
- 이름 또는 연락처 없음 → `check_status = 확인필요`
- DB에 동일 연락처 존재 → `check_status = 중복`
- 파일 내 동일 연락처 중복 → `check_status = 중복`
- 미리보기 확인 후 "DB에 저장" 버튼으로만 저장

---

## 다음 단계 (예정)

### 3단계: 중도탈락자 / 수료자 / 취업자 업로드
- 엑셀 업로드 페이지에 업로드 유형 탭 추가
- `learning_status`, `completion_status`, `employment_status` 일괄 업데이트

### 4단계: OpenAI API 연동
- 교육생 메모 자동 분류
- 취업 가능성 예측 코멘트 생성
- 확장 포인트: `src/app/api/ai/route.ts`

### 5단계: Hermes 자동 리포트
- 주간/월간 현황 리포트 자동 생성
- 슬랙 / 이메일 발송 연동

### 6단계: 로그인 도입 (Phase 2 RLS)
- Supabase Auth 이메일/비밀번호
- `supabase/schema.sql` Phase 2 주석 해제
- `src/app/login/page.tsx` 추가

---

## 트러블슈팅

### macOS Sequoia com.apple.provenance 오류
Desktop 폴더에서 Node.js `process.cwd()` EPERM 오류 발생.  
프로젝트를 `~/Desktop/` 밖(`~/bootcamp/`)으로 이동하여 해결.

### Supabase 환경변수 없이 빌드 오류
`createClient()` 초기화를 lazy 방식으로 변경 (함수 내부에서 호출).  
`NEXT_PUBLIC_SUPABASE_URL`에 placeholder 기본값 설정으로 빌드 통과.
