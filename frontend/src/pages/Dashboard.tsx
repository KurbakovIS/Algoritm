import Chest from '../components/Chest'
import RoleBadge from '../components/RoleBadge'
import { useApp } from '../store'

export default function Dashboard({ onSelect }: { onSelect: (dir: string) => void }) {
  const { user } = useApp()
  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-amber-200">Привет, {user?.email}</h1>
          <div className="mt-2 flex items-center gap-3">
            <RoleBadge role={user?.role || 'intern'} />
            <span className="text-amber-200/90">XP: {user?.xp ?? 0}</span>
            {user?.badges?.length ? <span>Бейджи: {user.badges.join(', ')}</span> : null}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { dir: 'frontend', label: 'Фронтенд' },
          { dir: 'backend', label: 'Бэкенд' },
          { dir: 'devops', label: 'Девопс' },
          { dir: 'techlead', label: 'Техлид' },
          { dir: 'architecture', label: 'Архитектура' },
          { dir: 'management', label: 'Менеджмент' }
        ].map((c) => (
          <div key={c.dir} className="flex justify-center">
            <Chest label={c.label} onOpen={() => onSelect(c.dir)} />
          </div>
        ))}
      </div>
    </div>
  )
}

