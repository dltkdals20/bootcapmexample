'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

interface Props {
  data: { reason: string; count: number }[]
}

const COLORS = ['#F87171', '#FB923C', '#FBBF24', '#A78BFA', '#60A5FA']

export default function DropoutReasonChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">중도탈락 이유</h3>
      {data.length === 0
        ? <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">탈락자 없음</div>
        : <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" barSize={18} margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="reason" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: number) => [`${v}명`, '인원']}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                <LabelList dataKey="count" position="right" style={{ fontSize: '11px', fill: '#475569', fontWeight: 600 }} formatter={(v: number) => `${v}명`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
    </div>
  )
}
