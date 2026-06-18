'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts'
import { EMPLOYMENT_STATUS_COLORS } from '@/lib/constants'
import type { EmploymentStatus } from '@/lib/types'

export default function EmploymentStatusChart({ data }: { data: Record<EmploymentStatus, number> }) {
  const chartData = (Object.entries(data) as [EmploymentStatus, number][]).filter(([,c]) => c > 0).map(([name, value]) => ({ name, value }))
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">취업 상태별 인원</h3>
      {chartData.length === 0
        ? <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">데이터 없음</div>
        : <ResponsiveContainer width="100%" height={200}>
            <PieChart margin={{ top: 20, bottom: 0, left: 0, right: 0 }}>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${value}명`} labelLine={false}>
                {chartData.map((e) => <Cell key={e.name} fill={EMPLOYMENT_STATUS_COLORS[e.name] ?? '#94a3b8'} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v: number, n: string) => [`${v}명`, n]} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '11px', color: '#64748b' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>}
    </div>
  )
}
