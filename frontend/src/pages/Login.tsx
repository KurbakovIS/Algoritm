import React, { useState } from 'react'
import { Auth } from '../api'
import { useApp } from '../store'

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('intern')
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [err, setErr] = useState('')
  const { setUser } = useApp()

  async function submit() {
    try {
      setErr('')
      if (mode === 'register') await Auth.register(email, password, role)
      await Auth.login(email, password)
      const me = await Auth.me(); setUser(me)
      onSuccess()
    } catch (e: any) {
      setErr(e.message || 'Ошибка')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">DevAcademy</h1>
          <p className="text-white/80 text-lg">Портал развития разработчиков</p>
        </div>

        {/* Login Card */}
        <div className="modern-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {mode === 'login' ? 'Вход' : 'Регистрация'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Электронная почта</label>
              <input 
                className="modern-input w-full" 
                placeholder="hero@example.com" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Пароль</label>
              <input 
                className="modern-input w-full" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
              />
            </div>
            
            {mode==='register' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Уровень</label>
                <select className="modern-input w-full" value={role} onChange={e=>setRole(e.target.value)}>
                  <option value="intern">Стажёр</option>
                  <option value="junior">Джуниор</option>
                  <option value="middle">Мидл</option>
                  <option value="senior">Сеньор</option>
                  <option value="lead">Тимлид</option>
                </select>
              </div>
            )}
            
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {err}
              </div>
            )}
            
            <button 
              onClick={submit} 
              className="modern-btn w-full py-3 text-lg"
            >
              {mode==='login'?'Войти в академию':'Зарегистрироваться'}
            </button>
            
            <div className="text-center">
              <button 
                onClick={()=>setMode(mode==='login'?'register':'login')} 
                className="text-white hover:text-gray-200 text-sm transition-colors"
              >
                {mode==='login'? 'Создать аккаунт' : 'Есть аккаунт? Войти'}
              </button>
            </div>
          </div>
        </div>

        {/* Demo notice */}
        <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            Демо-версия: используйте любые данные для входа
          </p>
        </div>
      </div>
    </div>
  )
}
