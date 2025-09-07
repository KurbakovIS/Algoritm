import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './store'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RoadmapPage from './pages/Roadmap'
import Topic from './pages/Topic'

function Shell() {
  const { user } = useApp()
  const [view, setView] = useState<'dashboard'|'roadmap'|'topic'>('dashboard')
  const [direction, setDirection] = useState<string>('frontend')
  const [topicId, setTopicId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) setView('dashboard')
  }, [user])

  if (!user) return <Login onSuccess={() => setView('dashboard')} />

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <nav className="flex items-center justify-between mb-6">
          <div className="text-2xl font-black text-amber-200">Tavern Roadmap</div>
          <div className="space-x-2">
            <button onClick={()=>setView('dashboard')} className="px-3 py-1 rounded brass-bevel">ЛК</button>
            <button onClick={()=>setView('roadmap')} className="px-3 py-1 rounded brass-bevel">Карта</button>
          </div>
        </nav>
        {view==='dashboard' && <Dashboard onSelect={(dir)=>{ setDirection(dir); setView('roadmap') }} />}
        {view==='roadmap' && <RoadmapPage direction={direction} onOpen={(id)=>{ setTopicId(id); setView('topic') }} />}
        {view==='topic' && topicId!=null && <Topic id={topicId} onBack={()=>setView('roadmap')} />}
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

