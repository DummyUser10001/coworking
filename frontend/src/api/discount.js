const API_URL = import.meta.env.VITE_API_URL

// ==================== ОПЕРАЦИИ СО СКИДКАМИ (требуют аутентификации) ====================

// Получить все скидки
export const getAllDiscounts = async (token) => {
  try {
    const response = await fetch(`${API_URL}/discounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch discounts')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching discounts:', error)
    throw error
  }
}

// Получить скидку по ID
export const getDiscount = async (discountId, token) => {
  try {
    const response = await fetch(`${API_URL}/discounts/${discountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch discount')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching discount:', error)
    throw error
  }
}

// Создать скидку
export const createDiscount = async (discountData, token) => {
  try {
    const response = await fetch(`${API_URL}/discounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discountData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create discount')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating discount:', error)
    throw error
  }
}

// Обновить скидку
export const updateDiscount = async (discountId, updateData, token) => {
  try {
    const response = await fetch(`${API_URL}/discounts/${discountId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update discount')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating discount:', error)
    throw error
  }
}

// Удалить скидку
export const deleteDiscount = async (discountId, token) => {
  try {
    const response = await fetch(`${API_URL}/discounts/${discountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete discount')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting discount:', error)
    throw error
  }
}

// ==================== ОБЩИЕ ОПЕРАЦИИ СО СКИДКАМИ (без аутентификации) ====================

// Получить активные скидки
export const getActiveDiscounts = async () => {
  try {
    const response = await fetch(`${API_URL}/discounts/status/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch active discounts')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching active discounts:', error)
    throw error
  }
}

// Проверить доступные скидки по критериям
export const checkDiscountAvailability = async (criteria) => {
  try {
    const { date, time, dayOfWeek } = criteria
    
    let url = `${API_URL}/discounts/check/availability?`
    const params = new URLSearchParams()
    
    if (date) params.append('date', date)
    if (time) params.append('time', time)
    if (dayOfWeek) params.append('dayOfWeek', dayOfWeek)
    
    url += params.toString()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to check discount availability')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error checking discount availability:', error)
    throw error
  }
}

// Получить скидки с фильтрацией по статусу
export const getDiscountsByStatus = async (isActive, token) => {
  try {
    let url = `${API_URL}/discounts`
    if (isActive !== undefined) {
      url += `?isActive=${isActive}`
    }

    const headers = {
      'Content-Type': 'application/json'
    }

    // Добавляем токен, если передан (для админских операций)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch discounts by status')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching discounts by status:', error)
    throw error
  }
}

// Применить скидку к бронированию (расчет суммы со скидкой)
export const applyDiscountToBooking = async (bookingData, discountId) => {
  try {
    const response = await fetch(`${API_URL}/discounts/apply/${discountId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to apply discount')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error applying discount:', error)
    throw error
  }
}

// Получить скидки для определенного дня и времени
export const getDiscountsForDateTime = async (date, time) => {
  try {
    const criteria = { date, time }
    return await checkDiscountAvailability(criteria)
  } catch (error) {
    console.error('Error getting discounts for date time:', error)
    throw error
  }
}

// Валидация данных скидки на клиенте
export const validateDiscountData = (discountData) => {
  const errors = {}

  if (!discountData.name || discountData.name.trim() === '') {
    errors.name = 'Название скидки обязательно'
  }

  if (!discountData.percentage || discountData.percentage <= 0) {
    errors.percentage = 'Размер скидки должен быть положительным числом'
  } else if (discountData.percentage > 50) {
    errors.percentage = 'Размер скидки не может превышать 50%'
  }

  if (!discountData.startDate) {
    errors.startDate = 'Дата начала обязательна'
  }

  if (!discountData.endDate) {
    errors.endDate = 'Дата окончания обязательна'
  } else if (new Date(discountData.endDate) < new Date(discountData.startDate)) {
    errors.endDate = 'Дата окончания не может быть раньше даты начала'
  }

  if (!discountData.applicableDays || discountData.applicableDays.length === 0) {
    errors.applicableDays = 'Выберите хотя бы один день недели'
  }

  if (discountData.maxDiscountAmount && discountData.maxDiscountAmount < 0) {
    errors.maxDiscountAmount = 'Максимальная сумма скидки не может быть отрицательной'
  }

  if (discountData.usageLimit && discountData.usageLimit < 0) {
    errors.usageLimit = 'Лимит использований не может быть отрицательным'
  }

  if (discountData.priority && discountData.priority < 0) {
    errors.priority = 'Приоритет не может быть отрицательным'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}