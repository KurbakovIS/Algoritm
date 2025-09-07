import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store';

interface NavigationProps {
  onOpenProfessionSelect?: () => void;
}

export default function Navigation({ onOpenProfessionSelect }: NavigationProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{temp: number, condition: string} | null>(null);

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Симуляция погоды
  useEffect(() => {
    const conditions = ['☀️ Солнечно', '⛅ Облачно', '🌧️ Дождь', '❄️ Снег'];
    setWeather({
      temp: Math.floor(Math.random() * 15) + 5,
      condition: conditions[Math.floor(Math.random() * conditions.length)]
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfessionSelect = () => {
    if (onOpenProfessionSelect) {
      onOpenProfessionSelect();
    }
  };

  if (!user) {
    return null; // Не показываем навигацию для неавторизованных пользователей
  }

  return (
    <nav className="glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
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
              onClick={() => navigate('/dashboard')} 
              className={`transition-colors ${
                location.pathname === '/dashboard' 
                  ? 'modern-btn' 
                  : 'glass text-white hover:bg-white/10'
              }`}
            >
              Личный кабинет
            </button>
            <button 
              onClick={() => navigate('/roadmap/career')} 
              className={`transition-colors ${
                location.pathname.startsWith('/roadmap') 
                  ? 'modern-btn' 
                  : 'glass text-white hover:bg-white/10'
              }`}
            >
              Роадмап
            </button>
            {user.role !== 'admin' && (
              <button 
                onClick={handleProfessionSelect} 
                className="glass text-white hover:bg-white/10 transition-colors"
              >
                Профессия
              </button>
            )}
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')} 
                className={`transition-colors ${
                  location.pathname.startsWith('/admin') 
                    ? 'modern-btn' 
                    : 'glass text-white hover:bg-white/10'
                }`}
              >
                Админка
              </button>
            )}
            <button 
              onClick={handleLogout} 
              className="glass text-white hover:bg-white/10 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
