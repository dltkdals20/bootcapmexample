'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { LEARNING_STATUS_COLORS } from '@/lib/constants'
import type { LearningStatus } from '@/lib/types'

export default function LearningStatusChart({ data }: { data: Record<LearningStatus, number> }) {
  const chartData = (Object.entries(data) as [LearningStatus, number][]).map(([status, count]) => ({ status, count }))
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">수강 상태별 인원</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v: number) => [`${v}명`, '인원']} />
          <Bar dataKey="count" radius={[4,4,0,0]}>
            {chartData.map((e) => <Cell key={e.status} fill={LEARNING_STATUS_COLORS[e.status] ?? '#94a3b8'} />)}
            <LabelList dataKey="count" position="top" style={{ fontSize: '11px', fill: '#475569', fontWeight: 600 }} formatter={(v: number) => `${v}명`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
