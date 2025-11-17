// frontend/src/pages/Map.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCoworkingCenters } from '../api/coworking'
import { useAuth } from '../context/AuthContext'

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

// Компонент для плавного центрирования карты на выбранный коворкинг
const FlyToSelected = ({ selectedSpace }) => {
  const map = useMap()
  useEffect(() => {
    if (selectedSpace) {
      map.flyTo([selectedSpace.latitude, selectedSpace.longitude], 15, { duration: 1.5 })
    }
  }, [selectedSpace, map])
  return null
}

const Map = () => {
  const [coworkingSpaces, setCoworkingSpaces] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { token } = useAuth()

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const fetchCoworkingCenters = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const centers = await getCoworkingCenters(token)
        setCoworkingSpaces(centers)
      } catch (err) {
        setError('Ошибка загрузки коворкинг-центров: ' + err.message)
        console.error('Error fetching coworking centers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCoworkingCenters()
  }, [token])

  const filteredSpaces = coworkingSpaces.filter(space =>
    space.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectSpace = (space) => setSelectedSpace(space)

  // Центр карты - первый коворкинг или Уфа по умолчанию
  const mapCenter = coworkingSpaces.length > 0 
    ? [coworkingSpaces[0].latitude, coworkingSpaces[0].longitude]
    : [54.734768, 55.957838] // Уфа

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка коворкинг-центров...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Поиск коворкинг-пространств
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Найдите идеальное рабочее пространство в Уфе
          </p>
        </div>

        {/* Основной блок с картой и списком */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Карта */}
          <div className="lg:w-2/3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom
              className="w-full h-full rounded-xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {filteredSpaces.map(space => (
                <Marker
                  key={space.id}
                  position={[space.latitude, space.longitude]}
                  icon={customIcon}
                  eventHandlers={{ click: () => handleSelectSpace(space) }}
                />
              ))}
              {selectedSpace && <FlyToSelected selectedSpace={selectedSpace} />}
            </MapContainer>
          </div>

          {/* Список */}
          <div className="lg:w-1/3 flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            {/* Поиск */}
            <input
              type="text"
              placeholder="Поиск по адресу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#645391] focus:border-transparent text-gray-800 dark:text-white"
            />

            {/* Список коворкингов */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {filteredSpaces.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
                  Коворкинг-пространства не найдены
                </p>
              ) : (
                filteredSpaces.map(space => (
                  <div
                    key={space.id}
                    onClick={() => handleSelectSpace(space)}
                    className={`rounded-xl p-4 cursor-pointer transition-all ${
                      selectedSpace?.id === space.id
                        ? 'border-2 border-[#645391] dark:border-[#A1E1DE]'
                        : 'border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {space.address}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {space.amenities && space.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                          {getAmenityName(amenity)}
                        </span>
                      ))}
                      {space.amenities && space.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                          +{space.amenities.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        {space.openingTime} - {space.closingTime}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate('/booking', { state: { coworkingId: space.id } })
                        }}
                        className="px-4 py-2 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg font-medium text-sm transition-all"
                      >
                        Выбрать
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Информация о выбранном коворкинге */}
{selectedSpace && (
  <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transition-all">
    <div className="flex justify-between items-start mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {selectedSpace.address}
      </h2>
      <button onClick={() => setSelectedSpace(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Левая колонка - Контактная информация */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Контактная информация</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-gray-600 dark:text-gray-300 min-w-24">Часы работы:</span>
            <span className="font-semibold text-gray-800 dark:text-white ml-2">
              {selectedSpace.openingTime} - {selectedSpace.closingTime}
            </span>
          </div>
          {selectedSpace.phone && (
            <div className="flex items-start">
              <span className="text-gray-600 dark:text-gray-300 min-w-24">Телефон:</span>
              <span className="font-semibold text-gray-800 dark:text-white ml-2">
                {selectedSpace.phone}
              </span>
            </div>
          )}
          {selectedSpace.email && (
            <div className="flex items-start">
              <span className="text-gray-600 dark:text-gray-300 min-w-24">Email:</span>
              <span className="font-semibold text-gray-800 dark:text-white ml-2">
                {selectedSpace.email}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Правая колонка - Удобства */}
            {selectedSpace.amenities && selectedSpace.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Удобства</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSpace.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                      {getAmenityName(amenity)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Кнопка бронирования */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button 
              onClick={() => navigate('/booking', { state: { coworkingId: selectedSpace.id } })}
              className="w-full py-3 bg-[#645391] hover:bg-[#52447a] text-white rounded-xl font-semibold transition-all"
            >
              Забронировать место
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Map