import { useState } from 'react'
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
    <div className="max-w-md mx-auto mt-16 p-6 wood-panel rounded-xl">
      <h2 className="text-2xl font-extrabold text-amber-200 mb-4">Добро пожаловать в Таверну Разработчика</h2>
      <div className="space-y-3">
        <input className="w-full p-3 rounded bg-black/40 border border-amber-900" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-3 rounded bg-black/40 border border-amber-900" type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} />
        {mode==='register' && (
          <select className="w-full p-3 rounded bg-black/40 border border-amber-900" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="intern">Стажёр</option>
            <option value="junior">Джуниор</option>
            <option value="middle">Мидл</option>
            <option value="senior">Сеньор</option>
            <option value="lead">Тимлид</option>
          </select>
        )}
        {err && <div className="text-red-300 text-sm">{err}</div>}
        <div className="flex gap-2">
          <button onClick={submit} className="px-4 py-2 rounded brass-bevel">{mode==='login'?'Войти':'Зарегистрироваться'}</button>
          <button onClick={()=>setMode(mode==='login'?'register':'login')} className="px-3 py-2 text-sm underline">{mode==='login'? 'Создать аккаунт' : 'Есть аккаунт? Войти'}</button>
        </div>
      </div>
    </div>
  )
}

