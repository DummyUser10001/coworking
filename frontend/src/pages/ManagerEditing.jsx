// frontend/src/pages/ManagerEditing.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getManagers, 
  createUser, 
  updateUser, 
  deleteUser,
  validateUserData
} from '../api/users.js'
import { useAuth } from '../context/AuthContext'

const ManagerEditing = () => {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    middleName: ''
  })

  const { token, user } = useAuth()
  const navigate = useNavigate()

  // Загрузка данных
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!token) {
        setError('Требуется авторизация')
        return
      }

      // Дополнительная проверка роли перед загрузкой данных
      if (user?.role !== 'ADMIN') {
        setError('Доступ запрещен')
        return
      }

      const managersData = await getManagers(token)
      setManagers(managersData)
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Не загружаем данные если пользователь не админ
    if (user?.role !== 'ADMIN') {
      return
    }
    
    loadData()
  }, [token, user])

  const handleEdit = (manager) => {
    setEditingUser(manager)
    setFormData({
      email: manager.email,
      password: '', // Пароль не показываем при редактировании
      firstName: manager.firstName,
      lastName: manager.lastName,
      middleName: manager.middleName || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого менеджера?')) {
      try {
        if (!token) {
          alert('Требуется авторизация')
          return
        }

        // Не позволяем удалить самого себя
        if (userId === user.id) {
          alert('Нельзя удалить свой собственный аккаунт')
          return
        }

        await deleteUser(userId, token)
        await loadData()
      } catch (err) {
        console.error('Error deleting manager:', err)
        alert(err.message || 'Не удалось удалить менеджера')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      alert('Требуется авторизация')
      return
    }

    // Дополнительная проверка роли
    if (user?.role !== 'ADMIN') {
      alert('Доступ запрещен')
      return
    }

    // Валидация на клиенте
    const validation = validateUserData({
      ...formData,
      // Для редактирования пароль не обязателен
      password: editingUser ? '' : formData.password,
      role: 'MANAGER' // Всегда MANAGER для этого компонента
    })
    
    if (!validation.isValid) {
      alert('Пожалуйста, исправьте ошибки в форме: ' + Object.values(validation.errors).join(', '))
      return
    }

    try {
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || null,
        role: 'MANAGER' // Всегда создаем/обновляем как менеджера
      }

      // Добавляем пароль только при создании нового пользователя
      if (!editingUser) {
        userData.password = formData.password
      }

      setShowModal(false)
      setEditingUser(null)
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        middleName: ''
      })

      await loadData()
    } catch (err) {
      console.error('Error saving manager:', err)
      alert(err.message || 'Не удалось сохранить менеджера')
    }
  }

  const getFullName = (user) => {
    return `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка менеджеров...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Управление менеджерами
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Кнопка добавления */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setEditingUser(null)
              setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                middleName: ''
              })
              setShowModal(true)
            }}
            className="px-6 py-3 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            + Добавить менеджера
          </button>
        </div>

        {/* Таблица менеджеров */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          {managers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Менеджеры еще не добавлены
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">ФИО</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800 dark:text-white">
                          {getFullName(manager)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600 dark:text-gray-400">
                          {manager.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(manager)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(manager.id)}
                            disabled={manager.id === user.id}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              manager.id === user.id
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingUser ? 'Редактирование менеджера' : 'Новый менеджер'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                      placeholder="Введите имя"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                      placeholder="Введите фамилию"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Отчество
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    placeholder="Введите отчество (необязательно)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    placeholder="Введите email"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Пароль *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                      placeholder="Введите пароль (мин. 6 символов)"
                      minLength="6"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold transition-colors"
                  >
                    {editingUser ? 'Сохранить' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerEditing