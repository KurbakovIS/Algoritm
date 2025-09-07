import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Админка роадмапа</h1>
          <p className="text-slate-300">Управление структурой роадмапа и узлами</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            to="/admin/roadmap" 
            className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-600"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Управление роадмапом</h2>
                <p className="text-slate-400 text-sm">Создание и редактирование узлов</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Создавайте родительские узлы, задачи и дополнительные элементы. 
              Управляйте блокировками и зависимостями между узлами.
            </p>
          </Link>
          
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Статистика</h2>
                <p className="text-slate-400 text-sm">Аналитика использования</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Анализ прогресса пользователей, популярные направления 
              и эффективность роадмапа.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Пользователи</h2>
                <p className="text-slate-400 text-sm">Управление пользователями</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Управление пользователями, их прогрессом и ролями. 
              Просмотр статистики по каждому пользователю.
            </p>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/admin/roadmap?action=create"
              className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-semibold">Создать узел</div>
            </Link>
            
            <Link 
              to="/admin/roadmap?action=view"
              className="bg-green-600 hover:bg-green-700 p-4 rounded-lg transition-colors text-center"
            >
              <div className="text-2xl mb-2">👁️</div>
              <div className="font-semibold">Просмотр узлов</div>
            </Link>
            
            <div className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg transition-colors text-center cursor-pointer">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Аналитика</div>
            </div>
            
            <div className="bg-red-600 hover:bg-red-700 p-4 rounded-lg transition-colors text-center cursor-pointer">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-semibold">Настройки</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
