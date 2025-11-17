// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserBookings, cancelBooking } from '../api/booking'
import { updateProfile, changePassword } from '../api/profile'
import WorkspacePlanModal from '../components/profile/WorkspacePlanModal'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('active')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlanBooking, setSelectedPlanBooking] = useState(null)
  
  // Состояния для редактирования профиля
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editProfileData, setEditProfileData] = useState({
    firstName: '',
    lastName: '',
    middleName: ''
  })
  
  // Состояния для смены пароля
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const navigate = useNavigate()
  const { user, token, updateUser } = useAuth()

  // Проверяем, является ли пользователь клиентом
  const isClient = user?.role === 'CLIENT'

  // Загрузка бронирований пользователя (только для клиентов)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!token) {
          setError('Требуется авторизация')
          return
        }

        // Загружаем бронирования только для клиентов
        if (isClient) {
          const userBookings = await getUserBookings(token)
          setBookings(userBookings)
        }
        
        // Устанавливаем данные для редактирования
        if (user) {
          setEditProfileData({
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName || ''
          })
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [token, user, isClient])

  // Функция для обновления профиля
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      if (!token) {
        alert('Требуется авторизация')
        return
      }

      const updatedProfile = await updateProfile(editProfileData, token)
      updateUser(updatedProfile) // Обновляем пользователя в контексте
      setIsEditingProfile(false)
      alert('Профиль успешно обновлен')
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('Ошибка при обновлении профиля: ' + err.message)
    }
  }

  // Функция для смены пароля
  const handleChangePassword = async (e) => {
    e.preventDefault()
    try {
      if (!token) {
        alert('Требуется авторизация')
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('Новый пароль и подтверждение не совпадают')
        return
      }

      if (passwordData.newPassword.length < 6) {
        alert('Новый пароль должен содержать минимум 6 символов')
        return
      }

      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, token)

      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Пароль успешно изменен')
    } catch (err) {
      console.error('Error changing password:', err)
      alert('Ошибка при изменении пароля: ' + err.message)
    }
  }

  // Функция для отмены бронирования (только для клиентов)
 const handleCancelBooking = async (bookingId, e) => {
  e.stopPropagation();
  if (!confirm('Отменить?')) return;
  try {
    const result = await cancelBooking(bookingId, token);
    setBookings(await getUserBookings(token));
    alert(result.message);
  } catch (err) {
    alert('Ошибка: ' + err.message);
  }
};

  // Функция для просмотра плана (только для клиентов)
  const handleViewPlan = async (booking, event) => {
    event.stopPropagation()
    setSelectedPlanBooking(booking)
  }

  // Фильтрация бронирований по статусу (только для клиентов)
  const activeBookings = bookings.filter(booking => 
    booking.status === 'ACTIVE' && new Date(booking.endTime) > new Date()
  )

  const bookingHistory = bookings.filter(booking => 
    booking.status === 'COMPLETED' || 
    booking.status === 'CANCELLED' || 
    (booking.status === 'ACTIVE' && new Date(booking.endTime) <= new Date())
  )

  // Функция для получения информации о цене из payment
  const getBookingPriceInfo = (booking) => {
    if (booking.payment) {
      return {
        finalPrice: booking.payment.finalPrice || 0,
        basePrice: booking.payment.basePrice || 0,
        discountPercentage: booking.payment.discountPercentage || 0
      }
    }
    return {
      finalPrice: 0,
      basePrice: 0,
      discountPercentage: 0
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusText = (status, endTime) => {
    if (status === 'ACTIVE' && new Date(endTime) <= new Date()) {
      return 'Завершено'
    }
    
    switch (status) {
      case 'ACTIVE':
        return 'Активно'
      case 'COMPLETED':
        return 'Завершено'
      case 'CANCELLED':
        return 'Отменено'
      default:
        return status
    }
  }

  const getWorkstationTypeText = (type) => {
    switch (type) {
      case 'DESK': return 'Рабочий стол'
      case 'COMPUTER_DESK': return 'Стол с компьютером'
      case 'MEETING_ROOM': return 'Переговорная комната'
      case 'CONFERENCE_ROOM': return 'Конференц-зал'
      default: return type
    }
  }

  // Функция для получения информации о возврате
 // ← Замени эту функцию целиком
const getRefundInfo = (booking) => {
  if (booking.status !== 'CANCELLED' || !booking.payment) return null

  const { status, refundAmount = 0 } = booking.payment

  if (refundAmount > 0) {
    return `Возврат: ${refundAmount}₽`  // ← Универсальный кейс
  }
}

  // Функция для получения заголовка в зависимости от роли
  const getProfileTitle = () => {
    switch (user?.role) {
      case 'CLIENT':
        return 'Управление вашими бронированиями'
      case 'MANAGER':
        return 'Панель менеджера'
      case 'ADMIN':
        return 'Панель администратора'
      default:
        return 'Личный кабинет'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Личный кабинет
            </h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#645391] mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Загрузка данных...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Личный кабинет
            </h1>
            <div className="bg-red-100 dark:bg-red-900 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300 py-8">
      <div className="container mx-auto px-6">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Личный кабинет
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {getProfileTitle()}
          </p>
          {!isClient && (
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
              Роль: {user?.role === 'MANAGER' ? 'Менеджер' : 'Администратор'}
            </p>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* НАСТРОЙКИ ПРОФИЛЯ */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-8 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Настройки профиля
            </h2>

            {/* Информация о пользователе */}
            {user && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Личные данные
                </h3>

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Фамилия
                        </label>
                        <input
                          type="text"
                          value={editProfileData.lastName}
                          onChange={(e) => setEditProfileData({...editProfileData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Имя
                        </label>
                        <input
                          type="text"
                          value={editProfileData.firstName}
                          onChange={(e) => setEditProfileData({...editProfileData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Отчество
                        </label>
                        <input
                          type="text"
                          value={editProfileData.middleName}
                          onChange={(e) => setEditProfileData({...editProfileData, middleName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all cursor-pointer"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false)
                          setEditProfileData({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            middleName: user.middleName || ''
                          })
                        }}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Фамилия:</span>
                      <p className="text-gray-800 dark:text-white font-medium text-lg">{user.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Имя:</span>
                      <p className="text-gray-800 dark:text-white font-medium text-lg">{user.firstName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Отчество:</span>
                      <p className="text-gray-800 dark:text-white font-medium text-lg">{user.middleName || 'Не указано'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Email:</span>
                      <p className="text-gray-800 dark:text-white font-medium text-lg">{user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Роль:</span>
                      <p className="text-gray-800 dark:text-white font-medium text-lg">
                        {user.role === 'CLIENT' ? 'Клиент' : 
                         user.role === 'MANAGER' ? 'Менеджер' : 
                         user.role === 'ADMIN' ? 'Администратор' : user.role}
                      </p>
                    </div>
                    
                    {/* Кнопки под данными */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg font-medium transition-all cursor-pointer"
                      >
                        Редактировать профиль
                      </button>
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="px-4 py-2 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg font-medium transition-all cursor-pointer"
                      >
                        Сменить пароль
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Смена пароля */}
            {isChangingPassword && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Смена пароля
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Текущий пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      minLength="6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Подтвердите новый пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#645391] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all cursor-pointer"
                    >
                      Сменить пароль
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all cursor-pointer"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* БРОНИРОВАНИЯ - ТОЛЬКО ДЛЯ КЛИЕНТОВ */}
          {isClient && (
            <div>
              {/* Переключатель табов */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 mb-8">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all cursor-pointer ${
                    activeTab === 'active' 
                      ? 'bg-[#645391] text-white shadow-lg' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`}
                >
                  Активные бронирования ({activeBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all cursor-pointer ${
                    activeTab === 'history' 
                      ? 'bg-[#645391] text-white shadow-lg' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#645391] dark:hover:text-[#A1E1DE]'
                  }`}
                >
                  История бронирований ({bookingHistory.length})
                </button>
              </div>

              {/* Контент табов */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300">
                {activeTab === 'active' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                      Активные бронирования
                    </h2>
                    {activeBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          У вас нет активных бронирований
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeBookings.map((booking) => {
                          const priceInfo = getBookingPriceInfo(booking)
                          return (
                            <div
                              key={booking.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                    {getWorkstationTypeText(booking.workstation.type)} №{booking.workstation.number}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                                    {booking.coworkingCenter.address}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Вместимость: {booking.workstation.capacity} чел.
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                  {getStatusText(booking.status, booking.endTime)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Дата:</span>
                                  <p className="text-gray-800 dark:text-white font-medium">
                                    {formatDate(booking.startTime)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Время:</span>
                                  <p className="text-gray-800 dark:text-white font-medium">
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Стоимость:</span>
                                  <p className="text-gray-800 dark:text-white font-medium">
                                    {priceInfo.finalPrice}₽
                                    {priceInfo.discountPercentage > 0 && (
                                      <span className="text-green-600 dark:text-green-400 text-sm ml-2">
                                        -{priceInfo.discountPercentage}%
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Кнопки действий */}
                              <div className="flex space-x-3">
                                <button
                                  onClick={(e) => handleViewPlan(booking, e)}
                                  className="px-4 py-2 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg font-medium transition-all cursor-pointer"
                                >
                                  Посмотреть на плане
                                </button>
                                <button
                                  onClick={(e) => handleCancelBooking(booking.id, e)}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all cursor-pointer"
                                >
                                  Отменить бронь
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                      История бронирований
                    </h2>
                    {bookingHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                          История бронирований пуста
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookingHistory.map((booking) => {
                          const refundInfo = getRefundInfo(booking)
                          const priceInfo = getBookingPriceInfo(booking)
                          return (
                            <div
                              key={booking.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                    {getWorkstationTypeText(booking.workstation.type)} №{booking.workstation.number}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                                    {booking.coworkingCenter.address}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Вместимость: {booking.workstation.capacity} чел.
                                  </p>
                                  {refundInfo && (
                                    <p className={`text-sm ${
                                      booking.payment?.status === 'KEPT' 
                                        ? 'text-orange-600 dark:text-orange-400' 
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                      {refundInfo}
                                    </p>
                                  )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                  {getStatusText(booking.status, booking.endTime)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Дата:</span>
                                  <p className="text-gray-800 dark:text-white font-medium">
                                    {formatDate(booking.startTime)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Время:</span>
                                  <p className="text-gray-800 dark:text-white font-medium">
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Стоимость:</span>
                                  <p className="text-gray-800 dark:text-white font-medium">
                                    {priceInfo.finalPrice}₽
                                    {priceInfo.discountPercentage > 0 && (
                                      <span className="text-green-600 dark:text-green-400 text-sm ml-2">
                                        -{priceInfo.discountPercentage}%
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Кнопка для просмотра плана в истории */}
                              <div className="flex space-x-3">
                                <button
                                  onClick={(e) => handleViewPlan(booking, e)}
                                  className="px-4 py-2 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg font-medium transition-all cursor-pointer"
                                >
                                  Посмотреть на плане
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно с планом (только для клиентов) */}
      {selectedPlanBooking && isClient && (
        <WorkspacePlanModal
          booking={selectedPlanBooking}
          onClose={() => setSelectedPlanBooking(null)}
        />
      )}
    </div>
  )
}

export default Profile