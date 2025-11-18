// frontend/src/pages/InventoryEditing.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getAllInventory, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  validateInventoryData,
  getInventoryTypes,
  getInventoryTypeNames
} from '../api/inventory.js'
import { useAuth } from '../context/AuthContext'

const InventoryEditing = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    totalQuantity: 1
  })

  const { token, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const inventoryTypes = getInventoryTypes()
  const inventoryTypeNames = getInventoryTypeNames()

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
      if (user?.role !== 'MANAGER') {
        setError('Доступ запрещен')
        return
      }

      const inventoryData = await getAllInventory(token)
      setInventory(inventoryData)
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Не загружаем данные если пользователь не менеджер
    if (user?.role !== 'MANAGER') {
      return
    }
    
    loadData()
  }, [token, user])

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      type: item.type,
      description: item.description || '',
      totalQuantity: item.totalQuantity
    })
    setShowModal(true)
  }

  const handleDelete = async (itemId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот инвентарь?')) {
      try {
        if (!token) {
          alert('Требуется авторизация')
          return
        }
        await deleteInventoryItem(itemId, token)
        await loadData()
      } catch (err) {
        console.error('Error deleting inventory item:', err)
        alert('Не удалось удалить инвентарь')
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
    if (user?.role !== 'MANAGER') {
      alert('Доступ запрещен')
      return
    }

    // Валидация на клиенте
    const validation = validateInventoryData({
      type: formData.type,
      totalQuantity: formData.totalQuantity,
      reservedQuantity: 0
    })
    
    if (!validation.isValid) {
      alert('Пожалуйста, исправьте ошибки в форме: ' + Object.values(validation.errors).join(', '))
      return
    }

    try {
      const itemData = {
        type: formData.type,
        workstationId: null, // Всегда общий инвентарь
        description: formData.description || null,
        totalQuantity: parseInt(formData.totalQuantity),
        reservedQuantity: editingItem ? editingItem.reservedQuantity : 0
      }

      setShowModal(false)
      setEditingItem(null)
      setFormData({
        type: '',
        description: '',
        totalQuantity: 1
      })

      await loadData()
    } catch (err) {
      console.error('Error saving inventory item:', err)
      alert(err.message || 'Не удалось сохранить инвентарь')
    }
  }

  const formatType = (type) => {
    return inventoryTypeNames[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка инвентаря...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Управление инвентарем
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Создавайте и редактируйте общий инвентарь
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Доступно только для менеджеров
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
              setEditingItem(null)
              setFormData({
                type: '',
                description: '',
                totalQuantity: 1
              })
              setShowModal(true)
            }}
            className="px-6 py-3 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            + Добавить инвентарь
          </button>
        </div>

        {/* Таблица инвентаря */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          {inventory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Инвентарь еще не добавлен
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Тип</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Описание</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Общее количество</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-300 font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                          {formatType(item.type)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                          {item.description || '—'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800 dark:text-white">
                          {item.totalQuantity} шт.
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingItem ? 'Редактирование инвентаря' : 'Новый инвентарь'}
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
                      Тип инвентаря *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    >
                      <option value="">Выберите тип</option>
                      {inventoryTypes.map(type => (
                        <option key={type} value={type}>
                          {inventoryTypeNames[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Общее количество *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.totalQuantity}
                      onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 1 })}
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
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
                    placeholder="Дополнительная информация об инвентаре..."
                  />
                </div>

                {editingItem && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Внимание:</strong> При редактировании занятое количество ({editingItem.reservedQuantity} шт.) сохраняется автоматически.
                    </p>
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
                    {editingItem ? 'Сохранить' : 'Создать'}
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

export default InventoryEditing