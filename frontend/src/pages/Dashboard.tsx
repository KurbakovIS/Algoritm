import RoleBadge from '../components/RoleBadge'
import { useApp } from '../store'
import Avatar from '../components/Avatar'
import { useEffect, useMemo, useState } from 'react'
import { Progress } from '../api'

export default function Dashboard({ onSelect, onChangeProfession }: { onSelect: (dir: string) => void, onChangeProfession: () => void }) {
  const { user, logout } = useApp()
  const [completed, setCompleted] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => { (async () => {
    try {
      const mine = await Progress.mine()
      setCompleted(mine.filter((m: any) => m.status === 'completed').length)
      setTotal(mine.length)
    } catch {}
  })() }, [user?.id])

  const level = useMemo(() => {
    const xp = user?.xp || 0
    if (xp >= 1000) return 5
    if (xp >= 600) return 4
    if (xp >= 300) return 3
    if (xp >= 100) return 2
    return 1
  }, [user?.xp])
  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar email={user?.email || 'user'} />
          <div>
            <h1 className="text-3xl font-extrabold text-amber-200">{user?.email}</h1>
            <div className="mt-2 flex items-center gap-3">
              <RoleBadge role={user?.role || 'intern'} />
              <span className="text-amber-200/90">Уровень: {level}</span>
              <span className="text-amber-200/90">XP: {user?.xp ?? 0}</span>
            </div>
          </div>
        </div>
        <div>
          <button onClick={onChangeProfession} className="px-3 py-2 rounded brass-bevel">Сменить профессию</button>
          <button onClick={logout} className="ml-2 px-3 py-2 rounded brass-bevel">Выйти</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-3d p-4">
          <div className="text-sm text-amber-100/70">Прогресс</div>
          <div className="mt-2 font-bold text-amber-100">{completed}/{Math.max(total, completed)} тем</div>
          <div className="mt-2 h-2 bg-black/30 rounded">
            <div className="h-2 rounded bg-gradient-to-r from-tavern-brass to-tavern-glow" style={{ width: `${Math.min(100, Math.round(((completed||0)/Math.max(total||1, completed||1))*100))}%` }} />
          </div>
        </div>
        <div className="card-3d p-4">
          <div className="text-sm text-amber-100/70">Бейджи</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {user?.badges?.length ? user.badges.map((b,i)=>(
              <span key={i} className="px-2 py-1 rounded-full text-xs brass-bevel">{b}</span>
            )) : <span className="text-amber-100/70">Пока нет</span>}
          </div>
        </div>
        <div className="card-3d p-4">
          <div className="text-sm text-amber-100/70">Профессия</div>
          <div className="mt-2 font-bold text-amber-100">{(localStorage.getItem('profession')||'—')}</div>
          <button onClick={onChangeProfession} className="mt-3 px-3 py-2 rounded brass-bevel">Сменить</button>
        </div>
      </div>
      {/* Removed direction chests from Dashboard as per request */}
    </div>
  )
}
