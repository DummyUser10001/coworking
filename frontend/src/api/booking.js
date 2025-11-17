const API_URL = import.meta.env.VITE_API_URL

// ==================== КЛИЕНТСКИЕ ОПЕРАЦИИ (требуют аутентификации) ====================

// Создать бронирование с проверкой доступности
export const createBooking = async (bookingData, token) => {
  try {
    // Сначала проверяем доступность
    const availabilityCheck = await checkAvailability(
      bookingData.workstationId,
      bookingData.startTime,
      bookingData.endTime,
      token
    )
    
    if (!availabilityCheck.isAvailable) {
      throw new Error('Workstation is not available for the selected period')
    }

    // Если доступно, создаем бронирование
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create booking')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

// Получить бронирования пользователя
export const getUserBookings = async (token) => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching bookings:', error)
    throw error
  }
}

// Получить конкретное бронирование
export const getBooking = async (bookingId, token) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch booking')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching booking:', error)
    throw error
  }
}

// Отменить бронирование (универсальный роут - для клиентов и менеджеров)
export const cancelBooking = async (bookingId, token) => {
  const r = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Failed');
  const data = await r.json();

  const amount = data.refund?.refundAmount ?? 0;
  data.message = amount > 0
    ? (data.cancelledBy === 'manager'
        ? `Отменено менеджером. Возврат ${amount}₽.`
        : `Отменено. Возврат ${amount}₽ (3–5 дней).`)
    : 'Отменено. Возврат не предусмотрен.';

  return data;
};

// Проверить доступность рабочего места с улучшенной обработкой ошибок
export const checkAvailability = async (workstationId, startTime, endTime, token, excludeBookingId = null) => {
  try {
    // Улучшенная валидация дат
    if (!workstationId) {
      throw new Error('Workstation ID is required')
    }
    
    if (!startTime || !endTime) {
      throw new Error('Start time and end time are required')
    }

    const start = new Date(startTime)
    const end = new Date(endTime)
    
    // Проверка валидности дат
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format')
    }
    
    if (start >= end) {
      throw new Error('End time must be after start time')
    }

    let url = `${API_URL}/bookings/check-availability/${workstationId}?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
    
    if (excludeBookingId) {
      url += `&excludeBookingId=${excludeBookingId}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to check availability')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error checking availability:', error)
    throw error
  }
}

// Проверить доступность для длительных периодов (неделя/месяц)
export const checkExtendedAvailability = async (workstationId, startDate, duration, token) => {
  try {
    const start = new Date(startDate)
    let end = new Date(start)
    
    switch (duration) {
      case 'day':
        end.setDate(end.getDate() + 1)
        break
      case 'week':
        end.setDate(end.getDate() + 7)
        break
      case 'month':
        end.setMonth(end.getMonth() + 1)
        break
      default:
        end.setDate(end.getDate() + 1)
    }

    return await checkAvailability(workstationId, start.toISOString(), end.toISOString(), token)
  } catch (error) {
    console.error('Error checking extended availability:', error)
    throw error
  }
}

// Обновить бронирование
export const updateBooking = async (bookingId, updateData, token) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update booking')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

// Рассчитать стоимость со скидками
// Рассчитать стоимость со скидками
export const calculateBookingPrice = async (workstationId, bookingDuration, startTime, token) => {
  try {
    // Валидация входных данных
    if (!workstationId || !bookingDuration) {
      throw new Error('Workstation ID and booking duration are required');
    }

    if (!token) {
      throw new Error('Authentication token is required');
    }

    const response = await fetch(`${API_URL}/bookings/calculate-price`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workstationId,
        bookingDuration,
        startTime
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Если ошибка "Invalid base price", возвращаем базовую цену без скидок
      if (errorData.error === 'Invalid base price') {
        console.warn('Invalid base price for workstation, returning base price without discounts');
        // Здесь мы вернем базовую цену позже, после получения информации о рабочем месте
        throw new Error('INVALID_BASE_PRICE');
      }
      
      throw new Error(errorData.error || 'Failed to calculate price');
    }
    
    const data = await response.json();
    console.log('Price calculation response:', data);
    
    // Дополнительная проверка структуры ответа
    if (!data || typeof data.finalPrice === 'undefined') {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error calculating booking price:', error);
    
    // Если ошибка связана с невалидной базовой ценой, пробуем получить базовую цену другим способом
    if (error.message === 'INVALID_BASE_PRICE') {
      // Мы обработаем это в компоненте
      throw error;
    }
    
    throw new Error(error.message || 'Failed to calculate price');
  }
}
// ==================== ОПЕРАЦИИ ДЛЯ АДМИНИСТРАТОРОВ КОВОРКИНГ-ЦЕНТРОВ ====================

// Получить бронирования для коворкинг-центра на определенную дату
export const getBookingsByCoworkingAndDate = async (coworkingCenterId, date, token) => {
  try {
    const response = await fetch(
      `${API_URL}/bookings/coworking/${coworkingCenterId}?date=${date}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching bookings by coworking and date:', error)
    throw error
  }
}

// Получить все бронирования для коворкинг-центра
export const getBookingsByCoworking = async (coworkingCenterId, token) => {
  try {
    const response = await fetch(
      `${API_URL}/bookings/coworking/${coworkingCenterId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching bookings by coworking:', error)
    throw error
  }
}

// Получить бронирования конкретного рабочего места
export const getWorkstationBookings = async (coworkingCenterId, workstationId, startDate, endDate, token) => {
  try {
    let url = `${API_URL}/bookings/coworking/${coworkingCenterId}/workstation/${workstationId}`
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch workstation bookings')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching workstation bookings:', error)
    throw error
  }
}

// Получить все бронирования (для менеджеров/админов)
export const getAllBookings = async (token) => {
  try {
    const response = await fetch(`${API_URL}/bookings/admin/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch all bookings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};