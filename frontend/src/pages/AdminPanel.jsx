// frontend/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getManagers, getClients } from '../api/users'
import { getAllBookings } from '../api/booking'
import { getAllCoworkingCenters } from '../api/coworking'
import { getAllDiscounts } from '../api/discount'
import { getInventoryStats } from '../api/inventory'

const AdminPanel = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    managers: 0,
    clients: 0,
    bookings: 0,
    coworkingCenters: 0,
    discounts: 0,
    inventory: {
      totalItems: 0,
      availableItems: 0,
      reservedItems: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Получаем данные параллельно
        const [managers, clients, bookings, coworkingCenters, discounts, inventoryStats] = await Promise.all([
          getManagers(token),
          getClients(token),
          getAllBookings(token),
          getAllCoworkingCenters(token),
          getAllDiscounts(token),
          getInventoryStats(token)
        ])

        setStats({
          managers: managers.length,
          clients: clients.length,
          bookings: bookings.length,
          coworkingCenters: coworkingCenters.length,
          discounts: discounts.length,
          inventory: {
            totalItems: inventoryStats.totalItems || 0,
            availableItems: inventoryStats.availableItems || 0,
            reservedItems: inventoryStats.reservedItems || 0
          }
        })

      } catch (err) {
        console.error('Error fetching admin stats:', err)
        setError('Ошибка загрузки статистики: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка статистики...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Панель администратора
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Общая статистика
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Карточки со статистикой */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {/* Менеджеры */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Менеджеры
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {stats.managers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Клиенты */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Клиенты
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {stats.clients}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Бронирования */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Бронирования
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {stats.bookings}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Коворкинг-центры */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Коворкинг-центры
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                  {stats.coworkingCenters}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительная статистика */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Скидки */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Активные скидки
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">Всего скидок в системе</span>
              <span className="text-2xl font-bold text-[#645391] dark:text-[#A1E1DE]">
                {stats.discounts}
              </span>
            </div>
          </div>

          {/* Инвентарь */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Статистика инвентаря
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300">Всего единиц</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {stats.inventory.totalItems}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <span className="text-green-600 dark:text-green-300">Доступно</span>
                <span className="font-semibold text-green-600 dark:text-green-300">
                  {stats.inventory.availableItems}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <span className="text-blue-600 dark:text-blue-300">Зарезервировано</span>
                <span className="font-semibold text-blue-600 dark:text-blue-300">
                  {stats.inventory.reservedItems}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel