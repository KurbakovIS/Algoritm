import React, { useState, useEffect } from 'react'
import { Team, Corporate } from '../api'

export default function Home({ onLogin, isAuthenticated = false }: { onLogin: () => void, isAuthenticated?: boolean }) {
  const [teamStats, setTeamStats] = useState<{
    active_developers: number
    active_projects: number
    average_experience: number
    monthly_releases: number
  } | null>(null)
  const [corporateData, setCorporateData] = useState<{
    active_tasks: number
    code_reviews: number
    daily_commits: number
    learning_modules: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка данных с бэкенда
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [teamStatsData, corporateDataData] = await Promise.all([
          Team.getStats(),
          Corporate.getDashboard()
        ])
        
        setTeamStats(teamStatsData)
        setCorporateData(corporateDataData)
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        setError('Не удалось загрузить данные')
        
        // Fallback значения
        setTeamStats({
          active_developers: 47,
          active_projects: 12,
          average_experience: 4.2,
          monthly_releases: 28
        })
        setCorporateData({
          active_tasks: 12,
          code_reviews: 5,
          daily_commits: 8,
          learning_modules: 3
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])


  return (
    <div className="min-h-screen">
      {/* Header with Logo and Login - только для неавторизованных */}
      {!isAuthenticated && (
        <div className="glass border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">DevAcademy</h1>
                  <p className="text-white/60 text-sm">Корпоративная платформа развития</p>
                </div>
              </div>
              <button 
                onClick={onLogin}
                className="modern-btn px-6 py-2 text-sm"
              >
                Войти в систему
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              Добро пожаловать в DevAcademy!
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Корпоративная платформа развития разработчиков. 
              Здесь вы найдете все необходимое для профессионального роста и успешной интеграции в команду.
            </p>
          </div>
        </div>
      </div>

      {/* Developer Dashboard Summary */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">
          Сводка для разработчика
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="modern-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-white/20 rounded w-24"></div>
                  <div className="h-6 w-6 bg-white/20 rounded"></div>
                </div>
                <div className="h-8 bg-white/20 rounded w-16 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="modern-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Активные задачи</h3>
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">
                {corporateData?.active_tasks || 0}
              </div>
              <div className="text-sm text-white/60">3 высокого приоритета</div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Code Review</h3>
                <span className="text-2xl">👀</span>
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">
                {corporateData?.code_reviews || 0}
              </div>
              <div className="text-sm text-white/60">Ожидают проверки</div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Коммиты сегодня</h3>
                <span className="text-2xl">💻</span>
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">
                {corporateData?.daily_commits || 0}
              </div>
              <div className="text-sm text-white/60">+2 к вчерашнему дню</div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Обучающие модули</h3>
                <span className="text-2xl">📚</span>
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">
                {corporateData?.learning_modules || 0}
              </div>
              <div className="text-sm text-white/60">Доступны для изучения</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">
          Быстрые действия
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="modern-card p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-3">Начать новый проект</h3>
            <p className="text-white/70 mb-4">Создать новый репозиторий и настроить окружение</p>
            <button className="modern-btn px-4 py-2 text-sm w-full">
              Создать проект
            </button>
          </div>

          <div className="modern-card p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-white mb-3">Изучить документацию</h3>
            <p className="text-white/70 mb-4">Доступ к корпоративным стандартам и гайдам</p>
            <button className="modern-btn px-4 py-2 text-sm w-full">
              Открыть документацию
            </button>
          </div>

          <div className="modern-card p-6 hover:scale-105 transition-transform cursor-pointer">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-3">Команда и менторство</h3>
            <p className="text-white/70 mb-4">Связаться с коллегами и менторами</p>
            <button className="modern-btn px-4 py-2 text-sm w-full">
              Найти ментора
            </button>
          </div>
        </div>
      </div>

      {/* Corporate Information */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">
          Корпоративная информация
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="modern-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">📊 Статистика команды</h3>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
                    <div className="h-6 bg-white/20 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Активных разработчиков</span>
                  <span className="text-xl font-bold gradient-text">
                    {teamStats?.active_developers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Проектов в разработке</span>
                  <span className="text-xl font-bold gradient-text">
                    {teamStats?.active_projects || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Средний опыт команды</span>
                  <span className="text-xl font-bold gradient-text">
                    {teamStats?.average_experience || 0} года
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Успешных релизов в месяц</span>
                  <span className="text-xl font-bold gradient-text">
                    {teamStats?.monthly_releases || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="modern-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 Цели и KPI</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80">Прогресс обучения</span>
                  <span className="text-sm text-white/60">78%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80">Выполнение задач</span>
                  <span className="text-sm text-white/60">92%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80">Code Review качество</span>
                  <span className="text-sm text-white/60">85%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & News */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">
          Последние обновления
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="modern-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">📢 Корпоративные новости</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-white font-medium">Новый релиз платформы v2.1</p>
                <p className="text-sm text-white/60">2 часа назад</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-white font-medium">Обновление корпоративных стандартов</p>
                <p className="text-sm text-white/60">1 день назад</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-white font-medium">Новые обучающие модули доступны</p>
                <p className="text-sm text-white/60">3 дня назад</p>
              </div>
            </div>
          </div>

          <div className="modern-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Достижения команды</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🥇</span>
                <div>
                  <p className="text-white font-medium">Лучшая команда месяца</p>
                  <p className="text-sm text-white/60">Frontend Team Alpha</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-white font-medium">100% Code Coverage</p>
                  <p className="text-sm text-white/60">Backend Team Beta</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="text-white font-medium">Быстрый релиз</p>
                  <p className="text-sm text-white/60">Mobile Team Gamma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="modern-card p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Готовы к продуктивной работе?
          </h2>
          <p className="text-lg text-white/80 mb-6">
            Войдите в систему, чтобы получить доступ к полному функционалу платформы
          </p>
        </div>
      </div>
    </div>
  )
}
