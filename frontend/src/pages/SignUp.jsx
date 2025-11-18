// frontend/src/pages/SignUp.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth.js'
import { useAuth } from '../context/AuthContext'

const SignUp = ({ theme, setTheme }) => {
  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    try {
      const data = await registerUser(form)
      await login(data.token)  // ← И ТУТ ТОЖЕ await !!!
      navigate('/profile')
    } catch (err) {
      setError('Ошибка регистрации: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Регистрация
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                    Фамилия
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Иванов"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                    Имя
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Иван"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                    Отчество
                  </label>
                  <input
                    name="middleName"
                    type="text"
                    value={form.middleName}
                    onChange={handleChange}
                    placeholder="Иванович"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                  Пароль
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
                  Подтвердите пароль
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent transition-all text-gray-800 dark:text-white cursor-text"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Зарегистрироваться
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-center text-gray-600 dark:text-gray-300">
                Уже есть аккаунт?{' '}
                <Link 
                  to="/signin" 
                  className="text-[#645391] dark:text-[#A1E1DE] font-semibold hover:underline cursor-pointer"
                >
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
