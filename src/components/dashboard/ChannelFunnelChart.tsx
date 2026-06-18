'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts'

interface Props {
  data: { channel: string; count: number; completed: number; employed: number }[]
}

const LABEL_MAP: Record<string, string> = { count: '신청', completed: '수료완료', employed: '취업완료' }

export default function ChannelFunnelChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">유입경로별 신청 → 수료 → 취업 퍼널</h3>
      <p className="text-xs text-slate-400 mb-4">채널별 3단계 전환 현황</p>
      {data.length === 0
        ? <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">데이터 없음</div>
        : <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barGap={3} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="channel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(v: number, n: string) => [`${v}명`, LABEL_MAP[n] ?? n]}
              />
              <Legend iconType="circle" iconSize={8} formatter={(v) => (
                <span style={{ fontSize: '11px', color: '#64748b' }}>{LABEL_MAP[v] ?? v}</span>
              )} />
              <Bar dataKey="count" name="count" fill="#3B82F6" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fill: '#475569', fontWeight: 600 }} formatter={(v: number) => `${v}`} />
              </Bar>
              <Bar dataKey="completed" name="completed" fill="#8B5CF6" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="completed" position="top" style={{ fontSize: '10px', fill: '#475569', fontWeight: 600 }} formatter={(v: number) => `${v}`} />
              </Bar>
              <Bar dataKey="employed" name="employed" fill="#22C55E" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="employed" position="top" style={{ fontSize: '10px', fill: '#475569', fontWeight: 600 }} formatter={(v: number) => `${v}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>}
    </div>
  )
}
