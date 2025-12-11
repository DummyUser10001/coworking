import React, { useState, useEffect } from 'react'
import { 
  getAllInventory,
  getInventoryByWorkstation,
  updateInventoryWorkstation,
  getInventoryTypes,
  getInventoryTypeNames,
  updateInventoryQuantity,
  getAvailableInventory
} from '../../api/inventory'

const WorkstationModal = ({ workstation, onSave, onClose, onDelete, token }) => {
  const [formData, setFormData] = useState({
    number: '',
    type: '',
    capacity: '',
    basePricePerHour: '',
    basePricePerDay: '',
    basePricePerWeek: '',
    basePricePerMonth: '',
    width: 1,
    height: 1
  })
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('properties')
  const [allInventory, setAllInventory] = useState([])
  const [roomInventory, setRoomInventory] = useState([])
  const [availableInventory, setAvailableInventory] = useState([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [inventoryError, setInventoryError] = useState('')
  const [showAddInventory, setShowAddInventory] = useState(false)

  const isRoom = workstation?.type === 'MEETING_ROOM' || workstation?.type === 'CONFERENCE_ROOM'
  const isDesk = workstation?.type === 'DESK' || workstation?.type === 'COMPUTER_DESK'
  const inventoryTypes = getInventoryTypes()
  const typeNames = getInventoryTypeNames()

  // Определяем ширину в зависимости от активной вкладки
  const modalWidth = activeTab === 'inventory' && isRoom 
    ? 'w-11/12 max-w-5xl' 
    : 'w-96'

  useEffect(() => {
    if (workstation) {
      setFormData({
        number: workstation.number || '',
        type: workstation.type || '',
        capacity: workstation.capacity || '',
        basePricePerHour: workstation.basePricePerHour || '',
        basePricePerDay: workstation.basePricePerDay || '',
        basePricePerWeek: workstation.basePricePerWeek || '',
        basePricePerMonth: workstation.basePricePerMonth || '',
        width: workstation.width || 1,
        height: workstation.height || 1
      })

      if (isRoom) {
        loadInventory()
      }
    }
  }, [workstation])

  const loadInventory = async () => {
    try {
      setInventoryLoading(true)
      
      // Параллельно загружаем все данные
      const [allItems, roomItems, availableItems] = await Promise.all([
        getAllInventory(token),
        getInventoryByWorkstation(workstation.id, token),
        getAvailableInventory(token)
      ])
      
      setAllInventory(allItems)
      setRoomInventory(roomItems)
      setAvailableInventory(availableItems)
      
    } catch (err) {
      setInventoryError('Ошибка загрузки инвентаря: ' + err.message)
    } finally {
      setInventoryLoading(false)
    }
  }

  // Добавить инвентарь в комнату
  const handleAddInventory = async (inventoryItem) => {
    try {
      // Проверяем, есть ли свободные единицы
      if (inventoryItem.reservedQuantity >= inventoryItem.totalQuantity) {
        setInventoryError('Нет свободных единиц этого инвентаря')
        return
      }

      const newReservedQuantity = inventoryItem.reservedQuantity + 1
      
      // Сначала обновляем количество, затем привязываем к рабочему месту
      await updateInventoryQuantity(
        inventoryItem.id, 
        inventoryItem.totalQuantity, 
        newReservedQuantity, 
        token
      )
      await updateInventoryWorkstation(inventoryItem.id, workstation.id, token)
      
      // Обновляем состояние
      const updatedItem = {
        ...inventoryItem,
        workstationId: workstation.id,
        reservedQuantity: newReservedQuantity
      }
      
      // Добавляем в комнатный инвентарь
      const updatedRoomInventory = [...roomInventory, updatedItem]
      
      // Обновляем общий список
      const updatedAllInventory = allInventory.map(item =>
        item.id === inventoryItem.id ? updatedItem : item
      )
      
      // Обновляем доступный инвентарь
      const newAvailableQty = updatedItem.totalQuantity - newReservedQuantity
      if (newAvailableQty <= 0) {
        // Если после добавления не осталось доступных единиц, убираем из списка доступных
        const updatedAvailableInventory = availableInventory.filter(item => item.id !== inventoryItem.id)
        setAvailableInventory(updatedAvailableInventory)
      } else {
        // Иначе обновляем количество в доступных
        const updatedAvailableInventory = availableInventory.map(item =>
          item.id === inventoryItem.id ? updatedItem : item
        )
        setAvailableInventory(updatedAvailableInventory)
      }

      setAllInventory(updatedAllInventory)
      setRoomInventory(updatedRoomInventory)
      
    } catch (err) {
      setInventoryError('Ошибка добавления инвентаря: ' + err.message)
    }
  }

  // Убрать инвентарь из комнаты
  const handleRemoveInventory = async (inventoryItem) => {
    try {
      // Устанавливаем reservedQuantity в 0 и убираем привязку к рабочему месту
      await updateInventoryQuantity(
        inventoryItem.id, 
        inventoryItem.totalQuantity, 
        0, 
        token
      )
      await updateInventoryWorkstation(inventoryItem.id, null, token)
      
      // Обновляем состояние
      const updatedItem = {
        ...inventoryItem,
        workstationId: null,
        reservedQuantity: 0
      }
      
      // Убираем из комнатного инвентаря
      const updatedRoomInventory = roomInventory.filter(item => item.id !== inventoryItem.id)
      
      // Обновляем общий список
      const updatedAllInventory = allInventory.map(item =>
        item.id === inventoryItem.id ? updatedItem : item
      )
      
      // Добавляем в доступный инвентарь (теперь все единицы доступны)
      const isAlreadyInAvailable = availableInventory.some(item => item.id === inventoryItem.id)
      if (!isAlreadyInAvailable) {
        const updatedAvailableInventory = [...availableInventory, updatedItem]
        setAvailableInventory(updatedAvailableInventory)
      } else {
        const updatedAvailableInventory = availableInventory.map(item =>
          item.id === inventoryItem.id ? updatedItem : item
        )
        setAvailableInventory(updatedAvailableInventory)
      }
      
      setAllInventory(updatedAllInventory)
      setRoomInventory(updatedRoomInventory)
      
    } catch (err) {
      setInventoryError('Ошибка удаления инвентаря: ' + err.message)
    }
  }

  // Функция для увеличения занятого количества (ТОЛЬКО для инвентаря в этой комнате)
  const handleIncreaseReserved = async (inventoryItem) => {
    try {
      // Проверяем, можно ли увеличить
      if (inventoryItem.reservedQuantity >= inventoryItem.totalQuantity) {
        setInventoryError('Нельзя увеличить: все единицы уже заняты')
        return
      }

      const newReservedQuantity = inventoryItem.reservedQuantity + 1
      
      await updateInventoryQuantity(
        inventoryItem.id, 
        inventoryItem.totalQuantity, 
        newReservedQuantity, 
        token
      )
      
      // Обновляем состояние
      const updatedItem = {
        ...inventoryItem,
        reservedQuantity: newReservedQuantity
      }
      
      const updatedRoomInventory = roomInventory.map(item =>
        item.id === inventoryItem.id ? updatedItem : item
      )
      
      const updatedAllInventory = allInventory.map(item =>
        item.id === inventoryItem.id ? updatedItem : item
      )
      
      // Обновляем доступный инвентарь
      const newAvailableQty = updatedItem.totalQuantity - newReservedQuantity
      if (newAvailableQty <= 0) {
        // Если не осталось доступных, убираем из списка доступных
        const updatedAvailableInventory = availableInventory.filter(item => item.id !== inventoryItem.id)
        setAvailableInventory(updatedAvailableInventory)
      } else {
        // Иначе обновляем количество в доступных
        const updatedAvailableInventory = availableInventory.map(item =>
          item.id === inventoryItem.id ? updatedItem : item
        )
        setAvailableInventory(updatedAvailableInventory)
      }
      
      setRoomInventory(updatedRoomInventory)
      setAllInventory(updatedAllInventory)
      
    } catch (err) {
      setInventoryError('Ошибка обновления количества: ' + err.message)
    }
  }

  // Функция для уменьшения занятого количества (ТОЛЬКО для инвентаря в этой комнате)
  const handleDecreaseReserved = async (inventoryItem) => {
    try {
      // Проверяем, можно ли уменьшить
      if (inventoryItem.reservedQuantity <= 0) {
        setInventoryError('Нельзя уменьшить: занятое количество уже 0')
        return
      }

      const newReservedQuantity = inventoryItem.reservedQuantity - 1
      
      await updateInventoryQuantity(
        inventoryItem.id, 
        inventoryItem.totalQuantity, 
        newReservedQuantity, 
        token
      )
      
      // Обновляем состояние
      const updatedItem = {
        ...inventoryItem,
        reservedQuantity: newReservedQuantity
      }
      
      // Если после уменьшения стало 0 - полностью убираем из комнаты
      if (newReservedQuantity === 0) {
        await updateInventoryWorkstation(inventoryItem.id, null, token)
        updatedItem.workstationId = null
        
        // Убираем из комнатного инвентаря
        const updatedRoomInventory = roomInventory.filter(item => item.id !== inventoryItem.id)
        setRoomInventory(updatedRoomInventory)
      } else {
        // Иначе просто обновляем количество в комнате
        const updatedRoomInventory = roomInventory.map(item =>
          item.id === inventoryItem.id ? updatedItem : item
        )
        setRoomInventory(updatedRoomInventory)
      }
      
      // Обновляем общий список инвентаря
      const updatedAllInventory = allInventory.map(item =>
        item.id === inventoryItem.id ? updatedItem : item
      )
      setAllInventory(updatedAllInventory)
      
      // Обновляем доступный инвентарь
      const newAvailableQty = updatedItem.totalQuantity - newReservedQuantity
      if (newAvailableQty > 0) {
        const isAlreadyInAvailable = availableInventory.some(item => item.id === inventoryItem.id)
        if (!isAlreadyInAvailable) {
          // Если этого инвентаря нет в доступных, добавляем
          const updatedAvailableInventory = [...availableInventory, updatedItem]
          setAvailableInventory(updatedAvailableInventory)
        } else {
          // Если уже есть, обновляем
          const updatedAvailableInventory = availableInventory.map(item =>
            item.id === inventoryItem.id ? updatedItem : item
          )
          setAvailableInventory(updatedAvailableInventory)
        }
      } else {
        // Если не осталось доступных, убираем из списка доступных
        const updatedAvailableInventory = availableInventory.filter(item => item.id !== inventoryItem.id)
        setAvailableInventory(updatedAvailableInventory)
      }
      
    } catch (err) {
      setInventoryError('Ошибка обновления количества: ' + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // Подготавливаем данные в зависимости от типа
      const submitData = {
        ...formData,
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity),
        width: parseInt(formData.width),
        height: parseInt(formData.height)
      }

      // Для столов используем дневные/недельные/месячные цены
      if (formData.type === 'DESK' || formData.type === 'COMPUTER_DESK') {
        submitData.basePricePerDay = parseFloat(formData.basePricePerDay) || 0
        submitData.basePricePerWeek = parseFloat(formData.basePricePerWeek) || 0
        submitData.basePricePerMonth = parseFloat(formData.basePricePerMonth) || 0
        submitData.basePricePerHour = null
      }
      // Для комнат используем почасовую цену
      else if (formData.type === 'MEETING_ROOM' || formData.type === 'CONFERENCE_ROOM') {
        submitData.basePricePerHour = parseFloat(formData.basePricePerHour) || 0
        submitData.basePricePerDay = null
        submitData.basePricePerWeek = null
        submitData.basePricePerMonth = null
      }

      await onSave(submitData)
    } catch (err) {
      if (err.message.includes('number') || err.message.includes('уже существует')) {
        setError('Рабочее место с таким номером уже существует')
      } else {
        setError('Ошибка сохранения: ' + err.message)
      }
    }
  }

  const handleTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      // Сбрасываем цены при смене типа
      basePricePerHour: '',
      basePricePerDay: '',
      basePricePerWeek: '',
      basePricePerMonth: ''
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${modalWidth} max-h-[90vh] overflow-y-auto`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {workstation?.id ? 'Редактирование рабочего места' : 'Создание рабочего места'}
        </h3>
        
        {/* Табы для комнат */}
        {isRoom && workstation?.id && (
          <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'properties'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              Свойства
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'inventory'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              Инвентарь ({roomInventory.length})
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {inventoryError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {inventoryError}
          </div>
        )}

        {(activeTab === 'properties' || !isRoom) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Номер места *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.number}
                onChange={(e) => setFormData({...formData, number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Тип *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="">Выберите тип</option>
                <option value="DESK">Стол</option>
                <option value="COMPUTER_DESK">Компьютерный стол</option>
                <option value="MEETING_ROOM">Переговорная</option>
                <option value="CONFERENCE_ROOM">Конференц-зал</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Ширина *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.width}
                  onChange={(e) => setFormData({...formData, width: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Высота *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Вместимость *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
              />
            </div>


            {(formData.type === 'MEETING_ROOM' || formData.type === 'CONFERENCE_ROOM') && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Цена за час *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.basePricePerHour}
                  onChange={(e) => setFormData({...formData, basePricePerHour: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Введите почасовую цену"
                />
              </div>
            )}

            {(formData.type === 'DESK' || formData.type === 'COMPUTER_DESK') && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Цена за день *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.basePricePerDay}
                  onChange={(e) => setFormData({...formData, basePricePerDay: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Цена за неделю *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.basePricePerWeek}
                  onChange={(e) => setFormData({...formData, basePricePerWeek: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Цена за месяц *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.basePricePerMonth}
                  onChange={(e) => setFormData({...formData, basePricePerMonth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              {workstation?.id && (
                <button
                  type="button"
                  onClick={() => onDelete(workstation.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md dark:text-red-400 dark:hover:bg-red-900"
                >
                  Удалить
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </form>
        )}

 
        {activeTab === 'inventory' && isRoom && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Управление инвентарем</h4>
              <button
                type="button"
                onClick={() => setShowAddInventory(!showAddInventory)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                {showAddInventory ? 'Скрыть доступный инвентарь' : 'Показать доступный инвентарь'}
              </button>
            </div>


            <div>
              <h5 className="font-medium mb-3 text-gray-800 dark:text-gray-100">
                Инвентарь в комнате ({roomInventory.length})
              </h5>
              {inventoryLoading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Загрузка инвентаря...</p>
              ) : roomInventory.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">В комнате нет инвентаря</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Нажмите "Добавить инвентарь" чтобы добавить оборудование
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-600 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Тип
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Описание
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Всего
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Занято
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Доступно
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {roomInventory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-gray-900 dark:text-gray-200">
                                {typeNames[item.type] || item.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                              {item.description || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="text-gray-900 dark:text-gray-200 font-medium">
                                {item.totalQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleDecreaseReserved(item)}
                                  disabled={item.reservedQuantity <= 0}
                                  className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                                >
                                  -
                                </button>
                                <span className={`min-w-8 text-center font-medium ${
                                  item.reservedQuantity > 0 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {item.reservedQuantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleIncreaseReserved(item)}
                                  disabled={item.reservedQuantity >= item.totalQuantity}
                                  className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`font-medium ${
                                (item.totalQuantity - item.reservedQuantity) > 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {item.totalQuantity - item.reservedQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                type="button"
                                onClick={() => handleRemoveInventory(item)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                Убрать
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Доступный инвентарь (показывается только при нажатии на кнопку) */}
            {showAddInventory && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-800 dark:text-gray-100">
                    Доступный инвентарь ({availableInventory.length})
                  </h5>
                </div>
                {availableInventory.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">Нет доступного инвентаря</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Весь инвентарь уже распределен по комнатам или все единицы заняты
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-600 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Тип
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Описание
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Всего
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Занято
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Доступно
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {availableInventory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-4 py-3 text-sm">
                                <span className="font-medium text-gray-900 dark:text-gray-200">
                                  {typeNames[item.type] || item.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                                {item.description || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="text-gray-900 dark:text-gray-200 font-medium">
                                  {item.totalQuantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                  {item.reservedQuantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`font-medium ${
                                  (item.totalQuantity - item.reservedQuantity) > 0 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {item.totalQuantity - item.reservedQuantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  type="button"
                                  onClick={() => handleAddInventory(item)}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                >
                                  Добавить
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Назад к свойствам
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkstationModal