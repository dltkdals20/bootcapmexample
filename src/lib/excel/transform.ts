import type { RawExcelRow } from './parser'
import type { StudentInsert, CheckStatus } from '@/lib/types'
import { DEFAULTS } from '@/lib/constants'

export interface ImportRow extends StudentInsert {
  _rowIndex: number
  _warnings: string[]
}

export function normalizePhone(raw: unknown): string | null {
  if (!raw) return null
  const str = String(raw).trim()
  if (!str) return null
  const digits = str.replace(/\D/g, '')
  const d = digits.startsWith('82') && digits.length === 12 ? '0' + digits.slice(2) : digits
  if (d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`
  if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`
  return str
}

export function computeAgeGroup(age: number): string {
  if (age < 20) return '10대'
  if (age < 30) return '20대'
  if (age < 40) return '30대'
  if (age < 50) return '40대'
  return '50대 이상'
}

function normalizeDate(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null
    return value.toISOString().split('T')[0]
  }
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0]
    return null
  }
  if (typeof value === 'string') {
    const str = value.trim()
    if (!str) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
    const m = str.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})/)
    if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`
    const d = new Date(str)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  }
  return null
}

export function transformRows(rawRows: RawExcelRow[]): ImportRow[] {
  return rawRows.map((raw, idx) => {
    const warnings: string[] = []
    const name = String(raw.name ?? '').trim()
    const phone = normalizePhone(raw.phone)
    const ageRaw = raw.age
    const ageNum = ageRaw !== undefined && ageRaw !== '' ? Number(ageRaw) : null
    const ageGroup = String(raw.age_group ?? '').trim() ||
      (ageNum && !isNaN(ageNum) ? computeAgeGroup(ageNum) : null)

    let checkStatus: CheckStatus = DEFAULTS.check_status
    if (!name) { warnings.push('이름 누락'); checkStatus = '확인필요' }
    if (!phone) { warnings.push('연락처 누락'); checkStatus = '확인필요' }

    return {
      application_id: String(raw.application_id ?? '').trim() || null,
      student_id: null,
      name: name || '(이름 없음)',
      phone,
      gender: String(raw.gender ?? '').trim() || null,
      age: ageNum && !isNaN(ageNum) ? ageNum : null,
      age_group: ageGroup,
      applied_at: normalizeDate(raw.applied_at),
      course_name: String(raw.course_name ?? '').trim() || DEFAULTS.course_name,
      source_channel: String(raw.source_channel ?? '').trim() || null,
      application_status: DEFAULTS.application_status,
      learning_status: DEFAULTS.learning_status,
      completion_status: DEFAULTS.completion_status,
      employment_status: DEFAULTS.employment_status,
      dropout_date: null, dropout_reason: null, completed_at: null,
      company_name: null, employed_at: null, job_title: null,
      check_status: checkStatus,
      notes: warnings.length > 0 ? `[업로드 오류] ${warnings.join(', ')}` : null,
      _rowIndex: idx + 2,
      _warnings: warnings,
    } satisfies ImportRow
  })
}

export function markDuplicates(rows: ImportRow[], existingPhones: Set<string>): ImportRow[] {
  const seenInBatch = new Set<string>()
  return rows.map((row) => {
    if (!row.phone) return row
    const isDbDuplicate = existingPhones.has(row.phone)
    const isBatchDuplicate = seenInBatch.has(row.phone)
    seenInBatch.add(row.phone)
    if (isDbDuplicate || isBatchDuplicate) {
      const reason = isDbDuplicate ? 'DB 중복' : '파일 내 중복'
      return {
        ...row,
        check_status: '중복' as CheckStatus,
        _warnings: [...row._warnings, reason],
        notes: `[중복] ${reason}`,
      }
    }
    return row
  })
}
