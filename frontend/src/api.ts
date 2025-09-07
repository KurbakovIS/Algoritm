const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(opts.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
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
}

export const Progress = {
  update(node_id: number, status: 'not_started'|'in_progress'|'completed', score = 0) {
    return api('/progress/update', { method: 'POST', body: JSON.stringify({ node_id, status, score }) })
  },
  mine() { return api('/progress/mine') }
}
