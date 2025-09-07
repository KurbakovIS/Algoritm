import React from 'react'

type Props = {
  id: string
  title: string
  level: number
  accent: string
  subtitle: string
  description: string
  stats?: { label: string, value: number, color: string }[]
  onPick: (id: string) => void
}

export default function ProfessionCard({ id, title, level, accent, subtitle, description, stats = [], onPick }: Props) {
  return (
    <div 
      className="modern-card p-6 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl" 
      onClick={() => onPick(id)}
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: accent }}>
          {level}
        </div>
        <div className="w-3 h-3 rounded-full" style={{ background: accent }}></div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm font-medium text-gray-600">{subtitle}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">{s.label}</span>
              <span className="font-bold text-white px-2 py-1 rounded-full text-xs" style={{ background: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <div className="inline-flex items-center text-sm font-medium" style={{ color: accent }}>
          Выбрать профессию →
        </div>
      </div>
    </div>
  )
}
