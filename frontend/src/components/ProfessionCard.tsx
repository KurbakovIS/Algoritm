import React from 'react'

type Props = {
  id: string
  title: string
  level: number
  accent: string
  subtitle: string
  description: string
  is_active: boolean
  stats?: { label: string, value: number, color: string }[]
  onPick: (id: string) => void
}

export default function ProfessionCard({ id, title, level, accent, subtitle, description, is_active, stats = [], onPick }: Props) {
  const getHeroIcon = (professionId: string) => {
    const iconMap: { [key: string]: string } = {
      'backend': '/heroes/backend-hero.svg',
      'frontend': '/heroes/frontend-hero.svg',
      'fullstack': '/heroes/fullstack-hero.svg',
      'devops': '/heroes/devops-hero.svg',
      'mobile': '/heroes/mobile-hero.svg',
      'data-ml': '/heroes/data-ml-hero.svg'
    }
    return iconMap[professionId] || '/heroes/backend-hero.svg'
  }

  const handleClick = () => {
    if (is_active) {
      onPick(id)
    }
  }

  return (
    <div 
      className={`modern-card p-6 transition-all duration-300 ${
        is_active 
          ? 'cursor-pointer hover:scale-105 hover:shadow-xl' 
          : 'cursor-not-allowed opacity-50 grayscale'
      }`}
      onClick={handleClick}
      style={{ borderTop: `4px solid ${is_active ? accent : '#6b7280'}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden" style={{ background: is_active ? accent : '#6b7280' }}>
          <img 
            src={getHeroIcon(id)} 
            alt={`${title} герой`}
            className="w-12 h-12 object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: is_active ? accent : '#6b7280' }}></div>
          <span className="text-sm font-bold text-white px-2 py-1 rounded-full" style={{ background: is_active ? accent : '#6b7280' }}>
            {level}
          </span>
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-2 font-montserrat">{title}</h3>
        <p className="text-sm font-medium text-gray-200">{subtitle}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-200 text-sm leading-relaxed">{description}</p>
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
        <div className="inline-flex items-center text-sm font-medium" style={{ color: is_active ? accent : '#6b7280' }}>
          {is_active ? 'Выбрать профессию →' : 'Недоступно'}
        </div>
      </div>
    </div>
  )
}
