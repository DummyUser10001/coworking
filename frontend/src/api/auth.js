const API_URL = import.meta.env.VITE_API_URL  // http://localhost:3001

// frontend/src/api/auth.js
export const registerUser = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    const text = await res.text()
    
    if (!res.ok) {
      // Пытаемся распарсить JSON ошибку
      try {
        const errorData = JSON.parse(text)
        throw new Error(errorData.message || 'Registration failed')
      } catch {
        throw new Error(text || 'Registration failed')
      }
    }

    return JSON.parse(text)
  } catch (err) {
    throw new Error(err.message || 'Network error during registration')
  }
}

export const loginUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}
