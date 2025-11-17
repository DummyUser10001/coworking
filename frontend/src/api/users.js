// frontend/src/api/users.js
const API_URL = import.meta.env.VITE_API_URL

// Получить всех пользователей
export const getAllUsers = async (token) => {
  const response = await fetch(`${API_URL}/users`, {
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch users')
  }
  return response.json()
}

// Получить только менеджеров
export const getManagers = async (token) => {
  const response = await fetch(`${API_URL}/users/managers`, {
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch managers')
  }
  return response.json()
}

// Получить только клиентов
export const getClients = async (token) => {
  const response = await fetch(`${API_URL}/users/clients`, {
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch clients')
  }
  return response.json()
}

// Создать пользователя
export const createUser = async (userData, token) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(userData)
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to create user')
  }
  return response.json()
}

// Обновить пользователя
export const updateUser = async (userId, userData, token) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(userData)
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to update user')
  }
  return response.json()
}

// Удалить пользователя
export const deleteUser = async (userId, token) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    }
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to delete user')
  }
  return response.status === 204 ? { success: true } : response.json()
}

// Сбросить пароль пользователя
export const resetUserPassword = async (userId, newPassword, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/password`, {
    method: 'PATCH',
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ newPassword })
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to reset password')
  }
  return response.json()
}

// Вспомогательные функции
export const getUserRoles = () => ['CLIENT', 'MANAGER', 'ADMIN']

export const getRoleNames = () => ({
  CLIENT: 'Клиент',
  MANAGER: 'Менеджер', 
  ADMIN: 'Администратор'
})

// frontend/src/api/users.js

export const validateUserData = (data) => {
  const errors = {}
  
  if (!data.email?.trim()) errors.email = 'Email обязателен'
  
  // Пароль обязателен ТОЛЬКО при создании нового пользователя (когда нет id)
  if (!data.id && !data.password?.trim()) {
    errors.password = 'Пароль обязателен'
  }
  
  if (!data.firstName?.trim()) errors.firstName = 'Имя обязательно'
  if (!data.lastName?.trim()) errors.lastName = 'Фамилия обязательна'

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (data.email && !emailRegex.test(data.email)) {
    errors.email = 'Некорректный формат email'
  }

  // Валидация пароля (только для новых пользователей)
  if (!data.id && data.password && data.password.length < 6) {
    errors.password = 'Пароль должен быть не менее 6 символов'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}