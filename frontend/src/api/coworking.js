
const API_URL = import.meta.env.VITE_API_URL



// Получить все активные коворкинг-центры (для пользователей)
export const getCoworkingCenters = async (token) => {
  const res = await fetch(`${API_URL}/coworking-centers`, {
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

  return await res.json()
}

// Получить все коворкинг-центры (включая неактивные - для админки)
export const getAllCoworkingCenters = async (token) => {
  const res = await fetch(`${API_URL}/coworking-centers/admin/all`, {
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

  return await res.json()
}

// Получить конкретный коворкинг-центр
export const getCoworkingCenter = async (id, token) => {
  const res = await fetch(`${API_URL}/coworking-centers/${id}`, {
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

  return await res.json()
}

// Создать коворкинг-центр
export const createCoworkingCenter = async (centerData, token) => {
  const res = await fetch(`${API_URL}/coworking-centers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(centerData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Обновить коворкинг-центр
export const updateCoworkingCenter = async (id, centerData, token) => {
  const res = await fetch(`${API_URL}/coworking-centers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(centerData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Удалить коворкинг-центр
export const deleteCoworkingCenter = async (id, token) => {
  const res = await fetch(`${API_URL}/coworking-centers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return res.status === 204 ? {} : await res.json()
}

// этажи

// Получить все этажи (с фильтрацией по коворкинг-центру)
export const getFloors = async (coworkingCenterId = null, token) => {
  const url = coworkingCenterId 
    ? `${API_URL}/floors?coworkingCenterId=${coworkingCenterId}`
    : `${API_URL}/floors`

  const res = await fetch(url, {
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

  return await res.json()
}

// Получить конкретный этаж
export const getFloor = async (id, token) => {
  const res = await fetch(`${API_URL}/floors/${id}`, {
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

  return await res.json()
}

// Создать этаж
export const createFloor = async (floorData, token) => {
  const res = await fetch(`${API_URL}/floors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(floorData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Обновить этаж
export const updateFloor = async (id, floorData, token) => {
  const res = await fetch(`${API_URL}/floors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(floorData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Удалить этаж
export const deleteFloor = async (id, token) => {
  const res = await fetch(`${API_URL}/floors/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return res.status === 204 ? {} : await res.json()
}