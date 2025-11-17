const API_URL = import.meta.env.VITE_API_URL

// ===== РАБОЧИЕ МЕСТА =====

// Получить все рабочие места (с фильтрацией по этажу)
export const getWorkstations = async (floorId = null, token) => {
  const url = floorId 
    ? `${API_URL}/workstations?floorId=${floorId}`
    : `${API_URL}/workstations`

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

// Получить конкретное рабочее место
export const getWorkstation = async (id, token) => {
  const res = await fetch(`${API_URL}/workstations/${id}`, {
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

// Создать рабочее место
export const createWorkstation = async (workstationData, token) => {
  const res = await fetch(`${API_URL}/workstations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(workstationData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Обновить рабочее место
export const updateWorkstation = async (id, workstationData, token) => {
  const res = await fetch(`${API_URL}/workstations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(workstationData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Удалить рабочее место
export const deleteWorkstation = async (id, token) => {
  const res = await fetch(`${API_URL}/workstations/${id}`, {
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

// ===== ОРИЕНТИРЫ =====

// Получить все ориентиры (с фильтрацией по этажу)
export const getLandmarks = async (floorId = null, token) => {
  const url = floorId 
    ? `${API_URL}/landmarks?floorId=${floorId}`
    : `${API_URL}/landmarks`

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

// Получить конкретный ориентир
export const getLandmark = async (id, token) => {
  const res = await fetch(`${API_URL}/landmarks/${id}`, {
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

// Создать ориентир
export const createLandmark = async (landmarkData, token) => {
  const res = await fetch(`${API_URL}/landmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(landmarkData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Обновить ориентир
export const updateLandmark = async (id, landmarkData, token) => {
  const res = await fetch(`${API_URL}/landmarks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(landmarkData)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return await res.json()
}

// Удалить ориентир
export const deleteLandmark = async (id, token) => {
  const res = await fetch(`${API_URL}/landmarks/${id}`, {
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
