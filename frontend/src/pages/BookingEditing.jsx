// frontend/src/pages/BookingEditing.jsx
import React, { useState, useEffect } from 'react'
import { getAllBookings, cancelBooking } from '../api/booking.js'
import { useAuth } from '../context/AuthContext'

const BookingEditing = () => {
  const [bookings, setBookings] = useState([])
  const [coworkingCenters, setCoworkingCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const [filters, setFilters] = useState({
    coworkingCenterId: '',
    status: 'all',
    workstationType: 'all'
  })

  const { token, user } = useAuth()

  // Загрузка коворкинг-центров
  const loadCoworkingCenters = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coworking-centers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCoworkingCenters(data)
      }
    } catch (err) {
      console.error('Error loading coworking centers:', err)
    }
  }

  // Загрузка ВСЕХ бронирований (один раз)
  const loadAllBookings = async () => {
    try {
      setLoading(true)
      setError('')

      if (!token || !['MANAGER', 'ADMIN'].includes(user?.role)) {
        setError('Доступ запрещен')
        return
      }

      const bookingsData = await getAllBookings(token)
      bookingsData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      setBookings(bookingsData)
    } catch (err) {
      setError('Не удалось загрузить бронирования')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && ['MANAGER', 'ADMIN'].includes(user?.role)) {
      loadCoworkingCenters()
      loadAllBookings()
    } else {
      setError('Доступ запрещен')
      setLoading(false)
    }
  }, [token, user]) // ← Только один раз!

  // Отмена бронирования
  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    try {
      setCancelling(true)
      setError('')

      const result = await cancelBooking(selectedBooking.id, token)
      await loadAllBookings() // Обновляем всё

      const refund = result.refund?.refundAmount ?? 0
      setSuccess(refund > 0 ? `Возврат ${refund}₽.` : 'Возврат не предусмотрен.')
      setShowCancelModal(false)
      setSelectedBooking(null)
    } catch (err) {
      setError(err.message || 'Ошибка отмены')
    } finally {
      setCancelling(false)
    }
  }

  const openCancelDialog = (booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
  }

  // Утилиты
  const formatDate = (date) => new Date(date).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const translateWorkstationType = (type) => {
    const map = {
      DESK: 'Стол',
      COMPUTER_DESK: 'Комп. стол',
      MEETING_ROOM: 'Переговорная',
      CONFERENCE_ROOM: 'Конференц-зал'
    }
    return map[type] || type
  }

  const getFullName = (u) => {
    if (!u) return '—'
    const parts = []
    if (u.lastName) parts.push(u.lastName)
    if (u.firstName) parts.push(u.firstName)
    if (u.middleName) parts.push(u.middleName)
    return parts.join(' ') || u.email
  }

  // Цвета
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-700 dark:text-green-400'
      case 'COMPLETED': return 'text-blue-700 dark:text-blue-400'
      case 'CANCELLED': return 'text-red-700 dark:text-red-400'
      default: return 'text-gray-700 dark:text-gray-400'
    }
  }

  const getPaymentColor = (payment) => {
    if (!payment) return 'text-gray-500 dark:text-gray-400 italic'
    if (payment.refundAmount > 0) return 'text-blue-700 dark:text-blue-400'
    return payment.status === 'REFUNDED' ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'
  }

  const getPaymentText = (payment) => {
    if (!payment) return 'Не оплачено'
    if (payment.refundAmount > 0) return `Возврат ${payment.refundAmount}₽`
    return payment.status === 'REFUNDED' ? 'Возврат' : 'Оплачено'
  }

  const getStatusText = (status) => {
    return status === 'ACTIVE' ? 'Активно' : status === 'COMPLETED' ? 'Завершено' : 'Отменено'
  }

  // Маппинг адресов
  const centerMap = Object.fromEntries(
    coworkingCenters.map(c => [c.id, c.address])
  )

  // ФИЛЬТРАЦИЯ НА ФРОНТЕНДЕ
  const filteredBookings = bookings.filter(b => {
    if (filters.coworkingCenterId && b.coworkingCenterId !== filters.coworkingCenterId) return false
    if (filters.status !== 'all' && b.status !== filters.status) return false
    if (filters.workstationType !== 'all' && b.workstation?.type !== filters.workstationType) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка бронирований...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Управление бронированиями
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Просмотр и отмена бронирований
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Фильтры */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Коворкинг-центр
              </label>
              <select
                value={filters.coworkingCenterId}
                onChange={(e) => setFilters({ ...filters, coworkingCenterId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391]"
              >
                <option value="">Все коворкинги</option>
                {coworkingCenters.map(c => (
                  <option key={c.id} value={c.id}>{c.address}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391]"
              >
                <option value="all">Все</option>
                <option value="ACTIVE">Активные</option>
                <option value="COMPLETED">Завершенные</option>
                <option value="CANCELLED">Отмененные</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип места
              </label>
              <select
                value={filters.workstationType}
                onChange={(e) => setFilters({ ...filters, workstationType: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391]"
              >
                <option value="all">Все типы</option>
                <option value="DESK">Стол</option>
                <option value="COMPUTER_DESK">Комп. стол</option>
                <option value="MEETING_ROOM">Переговорная</option>
                <option value="CONFERENCE_ROOM">Конференц-зал</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadAllBookings}
                className="w-full px-6 py-3 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                Обновить
              </button>
            </div>
          </div>
        </div>

        {/* Таблица */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Бронирования не найдены
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">ФИО</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Коворкинг</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Место</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Период</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Цена</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Статус</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Оплата</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => {
                    const price = b.payment?.finalPrice || 0
                    const discount = b.payment?.discountPercentage || 0

                    return (
                      <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {getFullName(b.user)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{b.user?.email}</td>
                        <td className="py-4 px-4 font-medium text-gray-800 dark:text-white">
                          {centerMap[b.coworkingCenterId] || '—'}
                        </td>
                        <td className="py-4 px-4">
                          {translateWorkstationType(b.workstation?.type)} №{b.workstation?.number}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(b.startTime)} — {formatDate(b.endTime)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#645391] dark:text-[#A1E1DE] text-lg">
                            {price}₽
                          </div>
                          {discount > 0 && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              -{discount}%
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-sm font-medium ${getStatusColor(b.status)}`}>
                            {getStatusText(b.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-sm font-medium ${getPaymentColor(b.payment)}`}>
                            {getPaymentText(b.payment)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {b.status === 'ACTIVE' && (
                            <button
                              onClick={() => openCancelDialog(b)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                            >
                              Отменить
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Модалка отмены */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Отмена бронирования
                </h2>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  disabled={cancelling}
                >
                  X
                </button>
              </div>

              <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-sm">
                <div><strong>ФИО:</strong> {getFullName(selectedBooking.user)}</div>
                <div><strong>Email:</strong> {selectedBooking.user?.email}</div>
                <div><strong>Коворкинг:</strong> {centerMap[selectedBooking.coworkingCenterId] || '—'}</div>
                <div><strong>Место:</strong> {translateWorkstationType(selectedBooking.workstation?.type)} №{selectedBooking.workstation?.number}</div>
                <div><strong>Период:</strong> {formatDate(selectedBooking.startTime)} — {formatDate(selectedBooking.endTime)}</div>
                <div className="font-bold text-red-600 dark:text-red-400">
                  <strong>Возврат:</strong> {selectedBooking.payment?.refundAmount ?? selectedBooking.payment?.finalPrice ?? 0}₽
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {cancelling ? 'Отмена...' : 'Отменить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingEditing