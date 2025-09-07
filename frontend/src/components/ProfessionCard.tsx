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
    <div className="booster-card booster-tilt booster-shine cursor-pointer" onClick={() => onPick(id)}>
      <div className="booster-border">
        <div className="booster-inner p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="gem text-xs" style={{ background: accent }}>{level}</span>
            <span className="w-2 h-2 rounded-full" style={{ background: accent }}></span>
          </div>

          <div className="text-center">
            <div className="inline-block px-4 py-1 rounded-full font-extrabold text-amber-100 mb-2" style={{ background: accent }}>{title}</div>
          </div>

          <div className="wood-panel rounded-lg p-3 mb-3">
            <div className="font-bold text-amber-200 mb-1">{subtitle}</div>
            <div className="text-sm text-amber-100/90 leading-snug">{description}</div>
          </div>

          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs text-amber-100/90">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 rounded px-2 py-1">
                  <span>{s.label}</span>
                  <span className="gem" style={{ background: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

