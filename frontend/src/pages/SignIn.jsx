// frontend/src/pages/SignIn.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth.js'
import { useAuth } from '../context/AuthContext'

const SignIn = ({ theme, setTheme }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const data = await loginUser({ email, password })
      await login(data.token)  // ← ДОБАВИТЬ await !!!
      navigate('/profile')
    } catch (err) {
      setError('Ошибка входа: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Вход в аккаунт
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Войти
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-center text-gray-600 dark:text-gray-300">
                Еще нет аккаунта?{' '}
                <Link 
                  to="/signup" 
                  className="text-[#645391] dark:text-[#A1E1DE] font-semibold hover:underline cursor-pointer"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
