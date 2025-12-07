// frontend\src\pages\MapEditing.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  getAllCoworkingCenters, 
  createCoworkingCenter, 
  updateCoworkingCenter, 
  deleteCoworkingCenter 
} from '../api/coworking'
import CoworkingModal from '../components/map_editing/CoworkingModal'
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

// Компонент для плавного центрирования карты
const FlyToSelected = ({ selectedSpace }) => {
  const map = useMap()
  useEffect(() => {
    if (selectedSpace) {
      map.flyTo([selectedSpace.latitude, selectedSpace.longitude], 15, { duration: 1.5 })
    }
  }, [selectedSpace, map])
  return null
}

// Функция для перевода amenities на русский
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

const MapEditing = () => {
  const [coworkingSpaces, setCoworkingSpaces] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSpace, setEditingSpace] = useState(null)
  const navigate = useNavigate()
  const { token } = useAuth()

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const fetchCoworkingCenters = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const centers = await getAllCoworkingCenters(token) 
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

  // Создание нового коворкинг-центра
  const handleCreate = async (formData) => {
    try {
      setError(null)
      const newCenter = await createCoworkingCenter(formData, token)
      
      setCoworkingSpaces(prev => [...prev, newCenter])
      setSelectedSpace(newCenter)
    } catch (err) {
      setError('Ошибка создания коворкинг-центра: ' + err.message)
    }
  }

  // Обновление коворкинг-центра
  const handleUpdate = async (formData) => {
    try {
      setError(null)
      const updatedCenter = await updateCoworkingCenter(editingSpace.id, formData, token)
      
      setCoworkingSpaces(prev => 
        prev.map(space => space.id === editingSpace.id ? updatedCenter : space)
      )
      setSelectedSpace(updatedCenter)
    } catch (err) {
      setError('Ошибка обновления коворкинг-центра: ' + err.message)
    }
  }

  // Удаление коворкинг-центра
  const handleDelete = async (spaceId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот коворкинг-центр?')) {
      try {
        setError(null)
        await deleteCoworkingCenter(spaceId, token)
        
        setCoworkingSpaces(prev => prev.filter(space => space.id !== spaceId))
        if (selectedSpace?.id === spaceId) {
          setSelectedSpace(null)
        }
      } catch (err) {
        setError('Ошибка удаления коворкинг-центра: ' + err.message)
      }
    }
  }

  // Начало редактирования
  const startEditing = (space) => {
    setEditingSpace(space)
    setIsModalOpen(true)
  }

  // Открытие модального окна создания
  const openCreateModal = () => {
    setEditingSpace(null)
    setIsModalOpen(true)
  }

  // Закрытие модального окна
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSpace(null)
  }

  // Сохранение данных из модального окна
  const handleSave = (formData) => {
    if (editingSpace) {
      handleUpdate(formData)
    } else {
      handleCreate(formData)
    }
    closeModal()
  }

  // Переход к редактированию планировки
  const navigateToWorkspaceEditing = (coworkingId) => {
    navigate('/editing', { state: { coworkingId } })
  }

  const filteredSpaces = coworkingSpaces.filter(space =>
    space.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
        <div className="container mx-auto px-6 py-12">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Управление коворкинг-центрами
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Основной блок с картой и списком */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Карта */}
<div className="lg:w-2/3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 h-[600px] relative z-0">
  <MapContainer
    center={mapCenter}
    zoom={13}
    scrollWheelZoom
    className="w-full h-full rounded-xl"
    style={{ zIndex: 0 }}
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
        eventHandlers={{ click: () => setSelectedSpace(space) }}
      >
      </Marker>
    ))}
    {selectedSpace && <FlyToSelected selectedSpace={selectedSpace} />}
  </MapContainer>
</div>

            {/* Список коворкингов */}
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
                      onClick={() => setSelectedSpace(space)}
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            space.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {space.isActive ? 'Активен' : 'Неактивен'}
                          </span>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigateToWorkspaceEditing(space.id)
                            }}
                            className="px-3 py-1 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg font-medium text-sm transition-all"
                          >
                            Планировка
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(space)
                            }}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all"
                          >
                            Редакт.
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(space.id)
                            }}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Кнопка создания внизу списка */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={openCreateModal}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
                >
                  + Создать новый коворкинг-центр
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно создания/редактирования */}
      {isModalOpen && (
        <CoworkingModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          editingSpace={editingSpace}
        />
      )}
    </>
  )
}

export default MapEditing