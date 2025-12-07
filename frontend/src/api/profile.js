
const API_URL = import.meta.env.VITE_API_URL

// Получить данные профиля пользователя
export const getProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch profile')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

// Обновить данные профиля
export const updateProfile = async (profileData, token) => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update profile')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

// Изменить пароль
export const changePassword = async (passwordData, token) => {
  try {
    const response = await fetch(`${API_URL}/profile/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to change password')
    }

    return await response.json()
  } catch (error) {
    console.error('Error changing password:', error)
    throw error
  }
}