// frontend/src/pages/DiscountsEditing.jsx
import React, { useState, useEffect } from 'react'
import { 
  getAllDiscounts, 
  createDiscount, 
  updateDiscount, 
  deleteDiscount,
  validateDiscountData 
} from '../api/discount.js'
import { useAuth } from '../context/AuthContext'

const DiscountsEditing = () => {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    percentage: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    applicableDays: [],
    applicableHours: '',
    isActive: true,
    priority: 0
  })

  const { token } = useAuth()
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  // Загрузка скидок
  const loadDiscounts = async () => {
    try {
      setLoading(true)
      setError('')
      
      const discountsData = await getAllDiscounts(token)
      setDiscounts(discountsData)
    } catch (err) {
      console.error('Error loading discounts:', err)
      setError('Не удалось загрузить скидки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiscounts()
  }, [token])

  const handleEdit = (discount) => {
    setEditingDiscount(discount)
    setFormData({
      name: discount.name,
      description: discount.description || '',
      percentage: discount.percentage,
      maxDiscountAmount: discount.maxDiscountAmount || '',
      usageLimit: discount.usageLimit || '',
      startDate: discount.startDate.split('T')[0],
      endDate: discount.endDate.split('T')[0],
      applicableDays: discount.applicableDays || [],
      applicableHours: discount.applicableHours || '',
      isActive: discount.isActive,
      priority: discount.priority
    })
    setShowModal(true)
  }

  const handleDelete = async (discountId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту скидку?')) {
      try {
        await deleteDiscount(discountId, token)
        await loadDiscounts()
        alert('Скидка успешно удалена!')
      } catch (err) {
        console.error('Error deleting discount:', err)
        alert('Не удалось удалить скидку')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Валидация на клиенте
    const validation = validateDiscountData(formData)
    if (!validation.isValid) {
      alert('Пожалуйста, исправьте ошибки в форме: ' + Object.values(validation.errors).join(', '))
      return
    }

    try {
      const discountData = {
        name: formData.name,
        description: formData.description,
        percentage: parseFloat(formData.percentage),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        applicableDays: formData.applicableDays,
        applicableHours: formData.applicableHours,
        isActive: formData.isActive,
        priority: parseInt(formData.priority)
      }

      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, discountData, token)
        alert('Скидка обновлена!')
      } else {
        await createDiscount(discountData, token)
        alert('Скидка создана!')
      }

      setShowModal(false)
      setEditingDiscount(null)
      setFormData({
        name: '',
        description: '',
        percentage: '',
        maxDiscountAmount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        applicableDays: [],
        applicableHours: '',
        isActive: true,
        priority: 0
      })

      await loadDiscounts()
    } catch (err) {
      console.error('Error saving discount:', err)
      alert(err.message || 'Не удалось сохранить скидку')
    }
  }
  
  const handleDayToggle = (day) => {
    const newDays = formData.applicableDays.includes(day)
      ? formData.applicableDays.filter(d => d !== day)
      : [...formData.applicableDays, day]
    setFormData({ ...formData, applicableDays: newDays })
  }

  const getDayName = (day) => {
    const dayNames = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье'
    }
    return dayNames[day]
  }

  const formatLimit = (limit) => {
    return limit ? `${limit} раз` : 'Отсутствует'
  }

  const formatMaxAmount = (amount) => {
    return amount ? `до ${amount}₽` : 'Отсутствует'
  }

  const formatTimeRange = (hours) => {
    return hours ? hours : 'Весь день'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка скидок...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Управление скидками
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Создавайте и редактируйте скидочные предложения
          </p>
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
              setEditingDiscount(null)
              setFormData({
                name: '',
                description: '',
                percentage: '',
                maxDiscountAmount: '',
                usageLimit: '',
                startDate: '',
                endDate: '',
                applicableDays: [],
                applicableHours: '',
                isActive: true,
                priority: 0
              })
              setShowModal(true)
            }}
            className="px-6 py-3 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            + Добавить скидку
          </button>
        </div>

        {/* Таблица скидок */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          {discounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Скидки еще не добавлены
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Название</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Размер</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Лимит суммы</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Лимит использований</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Период</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Время</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Статус</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {discount.name}
                          </div>
                          {discount.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {discount.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#645391] dark:text-[#A1E1DE] text-lg">
                          {discount.percentage}%
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm ${
                          discount.maxDiscountAmount 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-500 dark:text-gray-400 italic'
                        }`}>
                          {formatMaxAmount(discount.maxDiscountAmount)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm ${
                          discount.usageLimit 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-500 dark:text-gray-400 italic'
                        }`}>
                          {formatLimit(discount.usageLimit)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTimeRange(discount.applicableHours)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {discount.applicableDays.length === 7 ? 'Ежедневно' : `${discount.applicableDays.length} дней/нед`}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          discount.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {discount.isActive ? 'Активна' : 'Неактивна'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(discount)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingDiscount ? 'Редактирование скидки' : 'Новая скидка'}
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
                      Название скидки *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Размер скидки (%) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="50"
                      step="0.1"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Макс. сумма скидки (₽)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Оставьте пустым - лимит отсутствует"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Если пусто - ограничения нет
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Лимит использований
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Оставьте пустым - лимит отсутствует"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Если пусто - ограничения нет
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Дата начала *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Дата окончания *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Временной интервал
                  </label>
                  <input
                    type="text"
                    placeholder="09:00-18:00 (оставьте пустым для всего дня)"
                    value={formData.applicableHours}
                    onChange={(e) => setFormData({ ...formData, applicableHours: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Формат: ЧЧ:ММ-ЧЧ:ММ (например: 09:00-18:00). Если пусто - весь день.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Дни недели
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.applicableDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          className="rounded border-gray-300 text-[#645391] focus:ring-[#645391]"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{getDayName(day)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Приоритет
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Чем выше число, тем выше приоритет
                    </p>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-[#645391] focus:ring-[#645391]"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Активная скидка</span>
                    </label>
                  </div>
                </div>

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
                    {editingDiscount ? 'Сохранить' : 'Создать'}
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

export default DiscountsEditing