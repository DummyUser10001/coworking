// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { getProfile } from '../api/profile'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Загрузка данных пользователя при изменении токена
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await getProfile(token)
          setUser(userData)
        } catch (error) {
          console.error('Error loading user:', error)
          // Если токен невалидный, удаляем его
          logout()
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}