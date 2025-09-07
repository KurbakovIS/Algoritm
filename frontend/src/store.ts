import { createContext, useContext, useEffect, useState } from 'react'
import { Auth } from './api'

type User = { id: number, email: string, role: string, xp: number, badges: string[] }

type AppState = {
  user: User | null
  setUser: (u: User | null) => void
}

const Ctx = createContext<AppState>({ user: null, setUser: () => {} })

export function AppProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => { (async () => {
    try { const me = await Auth.me(); setUser(me) } catch {}
  })() }, [])
  return <Ctx.Provider value={{ user, setUser }}>{children}</Ctx.Provider>
}

export function useApp() { return useContext(Ctx) }

