import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

const normalizeAuthResponse = (data) => ({
  token: data?.access_token || data?.token || null,
  user: data?.data || data?.user || null,
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount.
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        void error
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        setToken(null)
        setUser(null)
      }
    }
    setLoading(false)
  }, [token])

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials)
    const { token: newToken, user: userData } = normalizeAuthResponse(res.data)

    if (!newToken || !userData) {
      throw new Error('Unexpected login response from server.')
    }

    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))

    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    const { token: newToken, user: userData } = normalizeAuthResponse(res.data)

    if (!newToken || !userData) {
      throw new Error('Unexpected register response from server.')
    }

    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))

    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      void error
    }

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
