// frontend\src\components\map_editing\CoworkingModal.jsx
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Настройка иконки маркера
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Функция для получения адреса по координатам
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`
    )
    
    if (!response.ok) {
      throw new Error('Ошибка при получении адреса')
    }
    
    const data = await response.json()
    
    if (data && data.display_name) {
      return data.display_name
    }
    
    return null
  } catch (error) {
    console.error('Error fetching address:', error)
    return null
  }
}

// Компонент для обработки кликов по карте с автоматическим определением адреса
const LocationMarker = ({ onLocationSelect, currentPosition }) => {
  const [position, setPosition] = useState(currentPosition)

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng
      setPosition(e.latlng)
      
      // Получаем адрес по координатам
      const address = await getAddressFromCoordinates(lat, lng)
      onLocationSelect(lat, lng, address)
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  )
}

const CoworkingModal = ({ isOpen, onClose, onSave, editingSpace = null }) => {
  // Встроенные функции для работы с amenities
  const getAllAmenities = () => {
    return ['WIFI', 'PARKING', 'COFFEE', 'TEA', 'SNACKS', 'LOCKERS']
  }

  const getAmenityName = (amenity) => {
    const amenityNames = {
      'WIFI': 'Wi-Fi',
      'PARKING': 'Парковка',
      'COFFEE': 'Кофе',
      'TEA': 'Чай',
      'SNACKS': 'Снеки',
      'LOCKERS': 'Локеры'
    }
    return amenityNames[amenity] || amenity
  }

  const [formData, setFormData] = useState({
    address: '',
    latitude: 54.734768,
    longitude: 55.957838,
    phone: '',
    email: '',
    openingTime: '09:00',
    closingTime: '18:00',
    amenities: [],
    isActive: true
  })

  const [showMap, setShowMap] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const [locationSelected, setLocationSelected] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  const availableAmenities = getAllAmenities()

  useEffect(() => {
    if (editingSpace) {
      setFormData({
        address: editingSpace.address || '',
        latitude: editingSpace.latitude || 54.734768,
        longitude: editingSpace.longitude || 55.957838,
        phone: editingSpace.phone || '',
        email: editingSpace.email || '',
        openingTime: editingSpace.openingTime || '09:00',
        closingTime: editingSpace.closingTime || '18:00',
        amenities: editingSpace.amenities || [],
        isActive: editingSpace.isActive ?? true
      })
      setLocationSelected(true)
    } else {
      setFormData({
        address: '',
        latitude: 54.734768,
        longitude: 55.957838,
        phone: '',
        email: '',
        openingTime: '09:00',
        closingTime: '18:00',
        amenities: [],
        isActive: true
      })
      setLocationSelected(false)
    }
    setMapKey(prev => prev + 1)
  }, [editingSpace, isOpen])

  // Обработчик выбора местоположения на карте
  const handleLocationSelect = async (lat, lng, address = null) => {
    setIsLoadingAddress(true)
    
    // Если адрес не передан, пытаемся получить его
    let resolvedAddress = address
    if (!resolvedAddress) {
      resolvedAddress = await getAddressFromCoordinates(lat, lng)
    }
    
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: resolvedAddress || prev.address
    }))
    setLocationSelected(true)
    setShowMap(false)
    setIsLoadingAddress(false)
    
    // Показываем уведомление, если адрес не найден
    if (!resolvedAddress) {
      setTimeout(() => {
        alert('Не удалось автоматически определить адрес. Пожалуйста, введите его вручную.')
      }, 500)
    }
  }

  // Добавление/удаление удобства
  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!locationSelected && !editingSpace) {
      alert('Пожалуйста, выберите местоположение на карте')
      return
    }
    if (!formData.address.trim()) {
      alert('Пожалуйста, введите адрес')
      return
    }
    onSave(formData)
  }

  const openMapModal = () => {
    setShowMap(true)
  }

  const closeMapModal = () => {
    setShowMap(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Основное модальное окно */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {editingSpace ? 'Редактирование коворкинг-центра' : 'Создание нового коворкинг-центра'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Адрес *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#645391]"
                placeholder="г. Уфа, ул. Примерная, 123"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Выберите местоположение на карте для автоматического определения адреса
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={openMapModal}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  locationSelected 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${isLoadingAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoadingAddress}
              >
                {isLoadingAddress ? (
                  'Определение адреса...'
                ) : locationSelected ? (
                  <>
                    ✅ Местоположение выбрано
                    <br />
                    <span className="text-xs opacity-90">
                      Широта: {formData.latitude.toFixed(6)}, Долгота: {formData.longitude.toFixed(6)}
                    </span>
                  </>
                ) : (
                  '📍 Выбрать местоположение на карте'
                )}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {locationSelected 
                  ? 'Местоположение установлено. Нажмите для изменения'
                  : 'Нажмите чтобы выбрать местоположение на карте. Адрес определится автоматически'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время открытия *
                </label>
                <input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, openingTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#645391]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Время закрытия *
                </label>
                <input
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, closingTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#645391]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Телефон
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#645391]"
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#645391]"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Удобства
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-[#645391] focus:ring-[#645391]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {getAmenityName(amenity)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-[#645391] rounded focus:ring-[#645391]"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Коворкинг-центр активен
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg font-medium transition-all"
              >
                {editingSpace ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Модальное окно с картой - должно быть под основным окном */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Выберите местоположение на карте
              </h3>
              <button
                onClick={closeMapModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Кликните на карте в нужном месте. Адрес определится автоматически.
              </p>
              {locationSelected && (
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                  Текущие координаты: Широта: {formData.latitude.toFixed(6)}, Долгота: {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="flex-1 rounded-lg overflow-hidden">
              <MapContainer
                key={mapKey}
                center={[formData.latitude, formData.longitude]}
                zoom={13}
                scrollWheelZoom
                className="w-full h-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker 
                  onLocationSelect={handleLocationSelect}
                  currentPosition={locationSelected ? [formData.latitude, formData.longitude] : null}
                />
              </MapContainer>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={closeMapModal}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CoworkingModal