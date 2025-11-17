const API_URL = import.meta.env.VITE_API_URL

// ==================== ОСНОВНЫЕ ОПЕРАЦИИ С ИНВЕНТАРЕМ ====================

export const getAllInventory = async (token) => {
  const response = await fetch(`${API_URL}/inventory-items`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch inventory')
  }
  return response.json()
}

export const getInventoryByWorkstation = async (workstationId, token) => {
  const response = await fetch(`${API_URL}/inventory-items/workstation/${workstationId}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch inventory for workstation')
  }
  return response.json()
}

export const getInventoryByType = async (type, token) => {
  const response = await fetch(`${API_URL}/inventory-items/type/${type}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch inventory by type')
  }
  return response.json()
}

export const getGeneralInventory = async (token) => {
  const response = await fetch(`${API_URL}/inventory-items/available/general`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch general inventory')
  }
  return response.json()
}

/** Доступный инвентарь (не привязан + есть свободные единицы) */
export const getAvailableInventory = async (token) => {
  try {
    const response = await fetch(`${API_URL}/inventory-items/available`, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      }
    })
    
    if (!response.ok) {
      // Если 404 - это нормально, значит нет доступного инвентаря
      if (response.status === 404) {
        console.log('No available inventory found - returning empty array')
        return []
      }
      
      // Для других ошибок бросаем исключение
      const err = await response.json()
      throw new Error(err.error || `HTTP ${response.status}: Failed to fetch available inventory`)
    }
    
    return await response.json()
    
  } catch (error) {
    console.error('Error in getAvailableInventory:', error)
    
    // Для сетевых ошибок тоже возвращаем пустой массив
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError')) {
      console.warn('Network error, returning empty inventory array')
      return []
    }
    
    throw error // Пробрасываем другие ошибки
  }
}

export const getInventoryItem = async (itemId, token) => {
  const response = await fetch(`${API_URL}/inventory-items/${itemId}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch inventory item')
  }
  return response.json()
}

export const createInventoryItem = async (itemData, token) => {
  const response = await fetch(`${API_URL}/inventory-items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workstationId: itemData.workstationId,
      type: itemData.type,
      description: itemData.description,
      totalQuantity: itemData.totalQuantity || 1,
      reservedQuantity: itemData.reservedQuantity || 0
    })
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to create inventory item')
  }
  return response.json()
}

export const updateInventoryItem = async (itemId, updateData, token) => {
  const response = await fetch(`${API_URL}/inventory-items/${itemId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to update inventory item')
  }
  return response.json()
}

export const updateInventoryQuantity = async (itemId, totalQuantity, reservedQuantity, token) => {
  const payload = {}
  if (totalQuantity !== undefined) payload.totalQuantity = totalQuantity
  if (reservedQuantity !== undefined) payload.reservedQuantity = reservedQuantity

  const response = await fetch(`${API_URL}/inventory-items/${itemId}/quantity`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to update inventory quantity')
  }
  return response.json()
}

export const updateInventoryWorkstation = async (itemId, workstationId, token) => {
  const response = await fetch(`${API_URL}/inventory-items/${itemId}/workstation`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ workstationId: workstationId || null })
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to update inventory workstation')
  }
  return response.json()
}

export const deleteInventoryItem = async (itemId, token) => {
  const response = await fetch(`${API_URL}/inventory-items/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to delete inventory item')
  }
  return response.status === 204 ? { success: true } : response.json()
}

// ==================== СТАТИСТИКА И АНАЛИТИКА ====================

export const getInventoryStats = async (token) => {
  const response = await fetch(`${API_URL}/inventory-items/stats/summary`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch inventory statistics')
  }
  return response.json()
}

export const getInventoryWithFilters = async (filters = {}, token) => {
  const params = new URLSearchParams()
  if (filters.workstationId) params.append('workstationId', filters.workstationId)
  if (filters.type) params.append('type', filters.type)

  const response = await fetch(`${API_URL}/inventory-items?${params}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch filtered inventory')
  }
  return response.json()
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

export const getInventoryTypes = () => [
  'MONITOR', 'PROJECTOR', 'WHITEBOARD', 'MICROPHONE', 'SPEAKERS', 'TABLE', 'LAPTOP'
]

export const getInventoryTypeNames = () => ({
  MONITOR: 'Монитор',
  PROJECTOR: 'Проектор',
  WHITEBOARD: 'Маркерная доска',
  MICROPHONE: 'Микрофон',
  SPEAKERS: 'Колонки',
  TABLE: 'Стол',
  LAPTOP: 'Ноутбук'
})

export const getInventoryTypeDescription = (type) => {
  const map = {
    MONITOR: 'Компьютерный монитор для отображения информации',
    PROJECTOR: 'Проекционное оборудование для презентаций',
    WHITEBOARD: 'Маркерная доска для заметок и обсуждений',
    MICROPHONE: 'Оборудование для записи звука',
    SPEAKERS: 'Акустическая система для воспроизведения звука',
    TABLE: 'Рабочий или конференционный стол',
    LAPTOP: 'Переносной компьютер для мобильной работы'
  }
  return map[type] || 'Оборудование для рабочего пространства'
}

export const validateInventoryData = (data) => {
  const errors = {}
  if (!data.type?.trim()) errors.type = 'Тип инвентаря обязателен'
  if (!data.totalQuantity || data.totalQuantity < 1) errors.totalQuantity = 'Общее количество ≥ 1'
  if (data.totalQuantity > 1000) errors.totalQuantity = 'Общее количество ≤ 1000'
  if (data.reservedQuantity < 0) errors.reservedQuantity = 'Занятое ≥ 0'
  if (data.reservedQuantity > data.totalQuantity) errors.reservedQuantity = 'Занятое ≤ общее'

  return { isValid: Object.keys(errors).length === 0, errors }
}

export const checkInventoryAvailability = async (type, qty = 1, token) => {
  const items = await getInventoryByType(type, token)
  const total = items.reduce((s, i) => s + (i.totalQuantity - i.reservedQuantity), 0)
  return {
    available: total >= qty,
    totalAvailable: total,
    required: qty,
    deficit: Math.max(0, qty - total)
  }
}

export const getWorkstationInventorySummary = async (workstationId, token) => {
  const items = await getInventoryByWorkstation(workstationId, token)
  const summary = {
    totalItems: items.length,
    totalQuantity: items.reduce((s, i) => s + i.totalQuantity, 0),
    totalReserved: items.reduce((s, i) => s + i.reservedQuantity, 0),
    availableQuantity: items.reduce((s, i) => s + (i.totalQuantity - i.reservedQuantity), 0),
    byType: items.reduce((acc, i) => {
      acc[i.type] ??= { totalQuantity: 0, reservedQuantity: 0, availableQuantity: 0 }
      acc[i.type].totalQuantity += i.totalQuantity
      acc[i.type].reservedQuantity += i.reservedQuantity
      acc[i.type].availableQuantity += i.totalQuantity - i.reservedQuantity
      return acc
    }, {})
  }
  return summary
}

export const exportInventoryToCSV = async (token) => {
  const items = await getAllInventory(token)
  const headers = ['Тип', 'Общее количество', 'Занято', 'Доступно', 'Рабочее место', 'Описание', 'ID']
  const rows = [headers.join(',')]

  const names = getInventoryTypeNames()
  items.forEach(i => {
    const avail = i.totalQuantity - i.reservedQuantity
    const row = [
      `"${names[i.type] || i.type}"`,
      i.totalQuantity,
      i.reservedQuantity,
      avail,
      `"${i.workstation ? `Стол №${i.workstation.number}` : 'Общий инвентарь'}"`,
      `"${i.description || ''}"`,
      i.id
    ]
    rows.push(row.join(','))
  })
  return rows.join('\n')
}

export const bulkUpdateInventory = async (updates, token) => {
  const results = await Promise.allSettled(
    updates.map(u => updateInventoryItem(u.id, u.data, token))
  )
  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return {
    total: updates.length,
    successful,
    failed,
    errors: results.filter(r => r.status === 'rejected').map(r => r.reason.message)
  }
}

export const searchInventory = async (term, token) => {
  const all = await getAllInventory(token)
  const lower = term.toLowerCase()
  const names = getInventoryTypeNames()
  return all.filter(i => {
    const typeName = names[i.type] || ''
    const ws = i.workstation ? `стол ${i.workstation.number}` : 'общий'
    const desc = i.description || ''
    return (
      typeName.toLowerCase().includes(lower) ||
      ws.toLowerCase().includes(lower) ||
      desc.toLowerCase().includes(lower) ||
      i.type.toLowerCase().includes(lower)
    )
  })
}