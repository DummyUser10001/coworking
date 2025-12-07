
const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include', 
    ...options
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || `Ошибка запроса: ${res.status}`)
  }

  return res.json()
}
