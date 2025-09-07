import React, { useEffect, useState } from 'react'
import { AppProvider, useApp } from './store'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import RoadmapPage from './pages/Roadmap'
import Topic from './pages/Topic'
import ProfessionSelect from './components/ProfessionSelect'
import { User } from './api'

function Shell() {
  const { user, logout, isLoading } = useApp()
  const [view, setView] = useState<'home'|'login'|'dashboard'|'roadmap'|'topic'>('home')
  const [direction, setDirection] = useState<string>('frontend')
  const [topicId, setTopicId] = useState<number | null>(null)
  const [profOpen, setProfOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weather, setWeather] = useState<{temp: number, condition: string} | null>(null)

  useEffect(() => {
    if (!user) setView('home')
  }, [user])

  useEffect(() => {
    // Open profession selection on first login
    if (user) {
      const prof = localStorage.getItem('profession')
      if (!prof) {
        setProfOpen(true)
      } else {
        // Устанавливаем направление на основе профессии пользователя
        setDirection(prof)
      }
    }
  }, [user])

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Симуляция погоды (в реальном проекте можно подключить API)
  useEffect(() => {
    const conditions = ['☀️ Солнечно', '⛅ Облачно', '🌧️ Дождь', '❄️ Снег']
    setWeather({
      temp: Math.floor(Math.random() * 15) + 5,
      condition: conditions[Math.floor(Math.random() * conditions.length)]
    })
  }, [])

  async function pickProfession(id: string) {
    try {
      // Сохраняем профессию в API
      await User.updateSettings({ profession: id })
      localStorage.setItem('profession', id)
    } catch (err) {
      console.error('Ошибка сохранения профессии:', err)
      // Fallback к localStorage
      localStorage.setItem('profession', id)
    }
    
    // Устанавливаем направление роадмапа в зависимости от профессии
    setDirection(id)
    setProfOpen(false)
    setView('roadmap')
  }

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (view === 'login') {
      return <Login onSuccess={() => setView('dashboard')} />
    }
    return <Home onLogin={() => setView('login')} />
  }

  return (
    <div className="min-h-screen">
      {/* Modern Navigation */}
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setView('home')}
                className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity cursor-pointer"
              >
                DevAcademy
              </button>
              <span className="text-white/60 text-sm">Портал развития разработчиков</span>
              <div className="hidden md:flex items-center space-x-4 text-sm text-white/80 ml-6">
                <div className="flex items-center space-x-2">
                  <span>🕐</span>
                  <span>{currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {weather && (
                  <div className="flex items-center space-x-2">
                    <span>{weather.condition}</span>
                    <span>{weather.temp}°C</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>{currentTime.toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={()=>setView('dashboard')} 
                className="modern-btn px-4 py-2 text-sm"
              >
                Личный кабинет
              </button>
              <button 
                onClick={()=>{ setDirection('career'); setView('roadmap') }} 
                className="modern-btn px-4 py-2 text-sm"
              >
                Роадмап
              </button>
              <button 
                onClick={()=>setProfOpen(true)} 
                className="glass px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors rounded-lg"
              >
                Профессия
              </button>
              <button 
                onClick={logout} 
                className="glass px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors rounded-lg"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {view==='home' && <Home onLogin={() => setView('login')} isAuthenticated={true} />}
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
