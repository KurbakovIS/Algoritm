const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(opts.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  
  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers })
    
    if (!res.ok) {
      let errorMessage = 'Произошла ошибка'
      try {
        const errorData = await res.json()
        errorMessage = errorData.detail || errorMessage
      } catch {
        errorMessage = await res.text() || errorMessage
      }
      
      // Handle specific error codes
      if (res.status === 401) {
        // Clear invalid token but don't reload automatically
        localStorage.removeItem('token')
        localStorage.removeItem('profession')
        // Let the calling code handle the 401 error
      }
      
      throw new Error(errorMessage)
    }
    
    return res.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Ошибка сети')
  }
}

export const Auth = {
  async login(email: string, password: string) {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem('token', data.access_token)
    return data
  },
  async register(email: string, password: string, role: string) {
    return api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) })
  },
  async me() {
    return api('/auth/me')
  }
}

export const Roadmap = {
  getTree() { return api('/roadmap/') },
  getRoadmap() { return api('/roadmap/') }, // Алиас для совместимости
  async byDirection(direction: string) { 
    return api(`/roadmap/directions/${direction}`) 
  },
  async getNode(id: number) { 
    return api(`/roadmap/node/${id}`) 
  }
}

export const Progress = {
  update(node_id: number, status: 'not_started'|'in_progress'|'completed', score = 0) {
    return api('/progress/update', { method: 'POST', body: JSON.stringify({ node_id, status, score }) })
  },
  mine() { return api('/progress/mine') }
}

export const Team = {
  getStats() { return api('/team/stats') },
  getProfessions() { return api('/team/professions') }
}

export const Corporate = {
  getDashboard() { return api('/corporate/dashboard') }
}

export const User = {
  getSettings() { return api('/user/settings') },
  updateSettings(settings: { profession?: string, preferences?: any }) {
    return api('/user/settings', { method: 'POST', body: JSON.stringify(settings) })
  }
}
