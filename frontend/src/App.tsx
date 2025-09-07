import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './store'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RoadmapPage from './pages/Roadmap'
import Topic from './pages/Topic'
import ProfessionSelect from './components/ProfessionSelect'

function Shell() {
  const { user } = useApp()
  const [view, setView] = useState<'dashboard'|'roadmap'|'topic'>('dashboard')
  const [direction, setDirection] = useState<string>('frontend')
  const [topicId, setTopicId] = useState<number | null>(null)
  const [profOpen, setProfOpen] = useState(false)

  useEffect(() => {
    if (!user) setView('dashboard')
  }, [user])

  useEffect(() => {
    // Open profession selection on first login
    if (user) {
      const prof = localStorage.getItem('profession')
      if (!prof) setProfOpen(true)
    }
  }, [user])

  function pickProfession(id: string) {
    localStorage.setItem('profession', id)
    // Map profession to direction names used by backend
    const map: Record<string, string> = {
      backend: 'backend', frontend: 'frontend', devops: 'devops',
      fullstack: 'frontend', mobile: 'frontend', 'data-ml': 'backend'
    }
    const dir = map[id] || 'frontend'
    setDirection(dir)
    setProfOpen(false)
    setView('roadmap')
  }

  if (!user) return <Login onSuccess={() => setView('dashboard')} />

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <nav className="flex items-center justify-between mb-6">
          <div className="text-2xl font-black text-amber-200">Tavern Roadmap</div>
          <div className="space-x-2">
            <button onClick={()=>setView('dashboard')} className="px-3 py-1 rounded brass-bevel">ЛК</button>
            <button onClick={()=>setView('roadmap')} className="px-3 py-1 rounded brass-bevel">Карта</button>
            <button onClick={()=>setProfOpen(true)} className="px-3 py-1 rounded brass-bevel">Сменить профессию</button>
          </div>
        </nav>
        {view==='dashboard' && <Dashboard onSelect={(dir)=>{ setDirection(dir); setView('roadmap') }} onChangeProfession={()=>setProfOpen(true)} />}
        {view==='roadmap' && <RoadmapPage direction={direction} onOpen={(id)=>{ setTopicId(id); setView('topic') }} />}
        {view==='topic' && topicId!=null && <Topic id={topicId} onBack={()=>setView('roadmap')} />}
        <ProfessionSelect open={profOpen} onClose={()=>setProfOpen(false)} onPick={pickProfession} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
