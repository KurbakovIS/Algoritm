import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './store'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import RoadmapPage from './pages/Roadmap'
import Topic from './pages/Topic'
import ProfessionSelect from './components/ProfessionSelect'
import Navigation from './components/Navigation'
import DashboardRoute from './components/DashboardRoute'
import RoadmapRoute from './components/RoadmapRoute'
import TopicRoute from './components/TopicRoute'
import { User } from './api'

function Shell() {
  const { user, isLoading } = useApp()
  const [profOpen, setProfOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Open profession selection on first login
    if (user) {
      const prof = localStorage.getItem('profession')
      if (!prof) {
        setProfOpen(true)
      }
    }
  }, [user])

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
    
    setProfOpen(false)
    navigate(`/roadmap/${id}`)
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
    return (
      <Routes>
        <Route path="/login" element={<Login onSuccess={() => navigate('/dashboard')} />} />
        <Route path="*" element={<Home onLogin={() => navigate('/login')} />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation onOpenProfessionSelect={() => setProfOpen(true)} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home onLogin={() => navigate('/login')} isAuthenticated={true} />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/roadmap/:direction" element={<RoadmapRoute />} />
          <Route path="/topic/:id" element={<TopicRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ProfessionSelect 
          open={profOpen} 
          onClose={() => setProfOpen(false)} 
          onPick={pickProfession} 
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <Shell />
      </AppProvider>
    </Router>
  )
}
