import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, User } from '@/services'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token')
      const saved = localStorage.getItem('user')
      if (saved) setUser(JSON.parse(saved))
      if (token) {
        try {
          const { data } = await authService.me()
          setUser(data.data)
          localStorage.setItem('user', JSON.stringify(data.data))
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email: string, password: string, remember = false) => {
    const { data } = await authService.login({ email, password, remember })
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('csrf_token', data.data.csrf_token)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    setUser(data.data.user)
    toast.success('Welcome back!')
  }

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authService.register({ name, email, password })
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('csrf_token', data.data.csrf_token)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    setUser(data.data.user)
    toast.success('Account created successfully!')
  }

  const logout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    localStorage.removeItem('token')
    localStorage.removeItem('csrf_token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out')
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      updateUser: setUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
