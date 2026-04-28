import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(true)

  // On mount — rehydrate user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser && token) {
      try { setUser(JSON.parse(storedUser)) }
      catch { logout() }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials)
    const { token: newToken, user: userData } = res.data

    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))

    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    const { token: newToken, user: userData } = res.data

    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))

    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch (_) {}

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
