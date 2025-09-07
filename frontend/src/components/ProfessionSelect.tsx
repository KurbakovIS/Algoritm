import ProfessionCard from './ProfessionCard'

const CARDS = [
  { id: 'backend',   title: 'Backend',   level: 3, accent: '#2aa84a', subtitle: 'Серверный Разработчик', description: 'Создаёте серверную логику, API и базы данных.' },
  { id: 'frontend',  title: 'Frontend',  level: 3, accent: '#ff7b00', subtitle: 'Фронтенд Разработчик', description: 'Создаёте интерфейсы и отличный UX.' },
  { id: 'fullstack', title: 'Fullstack', level: 5, accent: '#7b5cff', subtitle: 'Универсальный Разработчик', description: 'От фронта до бэка — полный стек.' },
  { id: 'devops',    title: 'DevOps',    level: 5, accent: '#00b2ff', subtitle: 'Инженер Инфраструктуры', description: 'CI/CD, контейнеры и стабильность.' },
  { id: 'mobile',    title: 'Mobile',    level: 4, accent: '#ff3b7f', subtitle: 'Мобильный Разработчик', description: 'iOS/Android и мобильный UX.' },
  { id: 'data-ml',   title: 'Data/ML',   level: 7, accent: '#f2b705', subtitle: 'Инженер Данных и ИИ', description: 'ML-модели и инсайты из данных.' },
]

export default function ProfessionSelect({ open, onClose, onPick }: { open: boolean, onClose: () => void, onPick: (id: string) => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-6xl mx-auto">
        <div className="modern-card p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Выберите профессию</h2>
          <p className="text-gray-600 text-center mb-8">Выберите направление развития, которое вас интересует</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CARDS.map(c => (
              <ProfessionCard key={c.id} {...c} onPick={onPick} />
            ))}
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={onClose} 
              className="glass px-6 py-3 text-white hover:bg-white/10 transition-colors rounded-lg"
            >
              Выбрать позже
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
