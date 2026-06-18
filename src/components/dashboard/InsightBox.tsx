import { Lightbulb } from 'lucide-react'

interface InsightBoxProps {
  insight: string | null
  label?: string
}

export default function InsightBox({ insight, label = 'AI 해석' }: InsightBoxProps) {
  if (!insight) return null

  return (
    <div className="mt-3 flex gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <div>
        <p className="text-xs font-medium text-blue-600 mb-0.5">{label}</p>
        <p className="text-xs text-blue-800 leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}
