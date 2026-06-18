export interface RawExcelRow {
  application_id?: string
  name?: string
  phone?: unknown
  gender?: string
  age?: unknown
  age_group?: string
  applied_at?: unknown
  course_name?: string
  source_channel?: string
}

const HEADER_MAP: Record<string, keyof RawExcelRow> = {
  '신청ID': 'application_id', '신청 ID': 'application_id', '신청id': 'application_id',
  '이름': 'name', '성명': 'name',
  '연락처': 'phone', '전화번호': 'phone', '핸드폰': 'phone',
  '성별': 'gender',
  '나이': 'age', '연령': 'age', '나이(세)': 'age',
  '연령대': 'age_group',
  '신청일': 'applied_at', '신청일자': 'applied_at',
  '신청과정': 'course_name', '과정명': 'course_name', '수강과정': 'course_name',
  '유입경로': 'source_channel', '유입 경로': 'source_channel', '접수경로': 'source_channel',
}

export interface ParseExcelResult {
  rows: RawExcelRow[]
  detectedHeaders: string[]
  missingHeaders: string[]
}

export async function parseExcelFile(file: File): Promise<ParseExcelResult> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '', raw: true })

  if (aoa.length < 2) return { rows: [], detectedHeaders: [], missingHeaders: [] }

  const headerRow = (aoa[0] as string[]).map((h) => String(h ?? '').trim())
  const dataRows = aoa.slice(1)

  const detectedHeaders = headerRow.filter((h) => HEADER_MAP[h])
  const requiredHeaders = ['이름', '연락처']
  const missingHeaders = requiredHeaders.filter(
    (r) => !headerRow.some((h) => HEADER_MAP[h] === HEADER_MAP[r])
  )

  const rows: RawExcelRow[] = dataRows
    .filter((row) => (row as unknown[]).some((cell) => cell !== ''))
    .map((row) => {
      const cells = row as unknown[]
      const result: RawExcelRow = {}
      headerRow.forEach((header, idx) => {
        const fieldName = HEADER_MAP[header]
        if (fieldName !== undefined) result[fieldName] = cells[idx] as never
      })
      return result
    })

  return { rows, detectedHeaders, missingHeaders }
}
