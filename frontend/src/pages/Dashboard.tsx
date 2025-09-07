import React from 'react'
import RoleBadge from '../components/RoleBadge'
import { useApp } from '../store'
import Avatar from '../components/Avatar'
import { useEffect, useMemo, useState } from 'react'
import { Progress, Roadmap } from '../api'

export default function Dashboard({ onSelect, onChangeProfession }: { onSelect: (dir: string) => void, onChangeProfession: () => void }) {
  const { user } = useApp()
  const [completed, setCompleted] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { (async () => {
    try {
      setLoading(true)
      setError(null)
      const mine = await Progress.mine()
      setCompleted(mine.filter((m: any) => m.status === 'completed').length)
      // Получаем общее количество узлов из всех направлений
      const allNodes = await Roadmap.getTree()
      setTotal(allNodes.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  })() }, [user?.id])

  const level = useMemo(() => {
    const xp = user?.xp || 0
    if (xp >= 1000) return 5
    if (xp >= 600) return 4
    if (xp >= 300) return 3
    if (xp >= 100) return 2
    return 1
  }, [user?.xp])
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="modern-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="modern-card p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h2>
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="modern-btn px-4 py-2"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="modern-card p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar email={user?.email || 'user'} />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{level}</span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{user?.email}</h1>
            <div className="flex items-center gap-4 mb-4">
              <RoleBadge role={user?.role || 'intern'} />
              <span className="text-white">Уровень {level}</span>
              <span className="text-white">•</span>
              <span className="text-white">{user?.xp ?? 0} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">Профессия:</span>
              <span className="text-sm font-medium text-white">{(localStorage.getItem('profession')||'Не выбрана')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="modern-card p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">{completed}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Завершено</h3>
          <p className="text-sm text-white">из {total} тем</p>
        </div>

        <div className="modern-card p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">{user?.badges?.length || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Достижения</h3>
          <p className="text-sm text-white">получено бейджей</p>
        </div>

        <div className="modern-card p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">{user?.xp ?? 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Опыт</h3>
          <p className="text-sm text-white">накоплено XP</p>
        </div>

        <div className="modern-card p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">{Math.round(((completed||0)/Math.max(total||1, completed||1))*100)}%</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Прогресс</h3>
          <p className="text-sm text-white">общего пути</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="modern-card p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Прогресс обучения</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Общий прогресс</span>
            <span className="text-white font-semibold">{completed}/{total} тем</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
              style={{ width: `${Math.min(100, Math.round(((completed||0)/(total||1))*100))}%` }} 
            >
              <span className="text-white text-xs font-medium">
                {Math.round(((completed||0)/(total||1))*100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="modern-card p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Достижения</h2>
        <div className="flex flex-wrap gap-3">
          {user?.badges?.length ? user.badges.map((b,i)=>(
            <div key={i} className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium">{b}</span>
            </div>
          )) : (
            <div className="text-center w-full py-8">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-white">Пока нет достижений</p>
              <p className="text-sm text-white">Продолжайте обучение, чтобы получить первые бейджи!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="modern-card p-8 text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-white mb-2">Карьерный роадмап</h3>
          <p className="text-white mb-6">Следуйте по пути от джуна до сеньора</p>
          <button 
            onClick={() => onSelect('career')} 
            className="modern-btn px-6 py-3"
          >
            Открыть роадмап
          </button>
        </div>

        <div className="modern-card p-8 text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-xl font-bold text-white mb-2">Настройки профиля</h3>
          <p className="text-white mb-6">Измените профессию и настройки</p>
          <button 
            onClick={onChangeProfession} 
            className="glass px-6 py-3 text-white hover:bg-white/10 transition-colors rounded-lg"
          >
            Изменить профессию
          </button>
        </div>
      </div>
    </div>
  )
}
