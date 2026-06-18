import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { StudentInsert } from '@/lib/types'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
  )
}

async function getNextStudentIdStart(): Promise<number> {
  const supabase = getSupabase()
  const { data } = await supabase.from('bootcamp_students').select('student_id').not('student_id', 'is', null)
  let max = 0
  for (const row of data ?? []) {
    const match = (row.student_id as string)?.match(/(\d+)$/)
    if (match) max = Math.max(max, parseInt(match[1], 10))
  }
  return max + 1
}

export async function POST(request: NextRequest) {
  let body: { rows: StudentInsert[] }
  try { body = await request.json() } catch { return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 }) }

  const { rows } = body
  if (!Array.isArray(rows) || rows.length === 0) return NextResponse.json({ error: '저장할 데이터가 없습니다.' }, { status: 400 })

  const supabase = getSupabase()
  const nextNum = await getNextStudentIdStart()
  let counter = 0
  const rowsWithIds = rows.map((row) => ({
    ...row,
    student_id: row.student_id?.trim() || `STU-${String(nextNum + counter++).padStart(3, '0')}`,
  }))

  const BATCH = 50
  let success = 0, failed = 0
  const errors: string[] = []

  for (let i = 0; i < rowsWithIds.length; i += BATCH) {
    const batch = rowsWithIds.slice(i, i + BATCH)
    const { data, error } = await supabase.from('bootcamp_students').insert(batch).select('id')
    if (error) { failed += batch.length; errors.push(`행 ${i+1}~${i+batch.length}: ${error.message}`) }
    else success += data?.length ?? 0
  }

  return NextResponse.json({ success, failed, errors })
}
