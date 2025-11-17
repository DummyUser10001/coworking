const API_URL = import.meta.env.VITE_API_URL  // http://localhost:3001

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {  // <-- /auth добавляем
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
