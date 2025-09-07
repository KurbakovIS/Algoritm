import { createContext, useContext, useEffect, useState } from 'react'
import { Auth } from './api'

type User = { id: number, email: string, role: string, xp: number, badges: string[] }

type AppState = {
  user: User | null
  setUser: (u: User | null) => void
  logout: () => void
}

const Ctx = createContext<AppState>({ user: null, setUser: () => {}, logout: () => {} })

export function AppProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => { (async () => {
    try { const me = await Auth.me(); setUser(me) } catch {}
  })() }, [])
  function logout() {
    try { localStorage.removeItem('token'); localStorage.removeItem('profession') } catch {}
    setUser(null)
  }
  return <Ctx.Provider value={{ user, setUser, logout }}>{children}</Ctx.Provider>
}

export function useApp() { return useContext(Ctx) }
