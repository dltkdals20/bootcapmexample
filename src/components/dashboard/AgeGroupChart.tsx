'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts'

interface Props {
  data: { ageGroup: string; count: number; employed: number }[]
}

export default function AgeGroupChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">연령대별 신청 / 취업완료</h3>
      {data.length === 0
        ? <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">데이터 없음</div>
        : <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barGap={2} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="ageGroup" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: number, n: string) => [`${v}명`, n === 'count' ? '신청' : '취업완료']}
              />
              <Legend iconType="circle" iconSize={8} formatter={(v) => (
                <span style={{ fontSize: '11px', color: '#64748b' }}>{v === 'count' ? '신청' : '취업완료'}</span>
              )} />
              <Bar dataKey="count" name="count" fill="#F59E0B" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="count" position="top" style={{ fontSize: '11px', fill: '#475569', fontWeight: 600 }} formatter={(v: number) => `${v}명`} />
              </Bar>
              <Bar dataKey="employed" name="employed" fill="#34D399" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="employed" position="top" style={{ fontSize: '11px', fill: '#475569', fontWeight: 600 }} formatter={(v: number) => `${v}명`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
    </div>
  )
}
