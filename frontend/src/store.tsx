import React, { createContext, useContext, useEffect, useState } from 'react'
import { Auth } from './api'

type User = { id: number, email: string, role: string, xp: number, badges: string[] }

type AppState = {
  user: User | null
  setUser: (u: User | null) => void
  logout: () => void
  isLoading: boolean
}

const Ctx = createContext<AppState>({ user: null, setUser: () => {}, logout: () => {}, isLoading: true })

export function AppProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => { 
    (async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }
      
      try { 
        const me = await Auth.me()
        setUser(me) 
      } catch (error) {
        // Токен недействителен, очищаем его
        localStorage.removeItem('token')
        localStorage.removeItem('profession')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })() 
  }, [])
  
  function logout() {
    try { 
      localStorage.removeItem('token')
      localStorage.removeItem('profession') 
    } catch {}
    setUser(null)
  }
  
  return <Ctx.Provider value={{ user, setUser, logout, isLoading }}>{children}</Ctx.Provider>
}

export function useApp() { return useContext(Ctx) }
