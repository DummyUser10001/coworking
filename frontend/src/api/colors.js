const API_URL = import.meta.env.VITE_API_URL

// Получить глобальные настройки цветов
export const getColorSettings = async (token) => {
  const res = await fetch(`${API_URL}/color-settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  const data = await res.json()
  
  // Возвращаем настройки как есть
  return data
}

// Обновить глобальные настройки цветов
export const updateColorSettings = async (colors, token) => {
  const res = await fetch(`${API_URL}/color-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ colors })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}