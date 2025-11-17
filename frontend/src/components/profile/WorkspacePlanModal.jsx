// frontend/src/components/profile/WorkspacePlanModal.jsx
import React, { useState, useEffect } from 'react'
import { getCoworkingCenter, getFloors } from '../../api/coworking'
import { getWorkstations } from '../../api/workspace'
import { getColorSettings } from '../../api/colors'
import WorkspacePlan from '../workspace_booking/WorkspacePlan'

const WorkspacePlanModal = ({ booking, onClose }) => {
  const [colors, setColors] = useState({
    DESK: '#3B82F6',
    COMPUTER_DESK: '#10B981',
    MEETING_ROOM: '#8B5CF6',
    CONFERENCE_ROOM: '#F59E0B'
  })
  const [selectedCoworking, setSelectedCoworking] = useState(null)
  const [floors, setFloors] = useState([])
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Функция для получения токена
  const getToken = () => {
    return localStorage.getItem('token')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = getToken()
       
        if (!token) {
          setError('Требуется авторизация')
          return
        }

        const [coworkingCenter, colorSettings, floorsData] = await Promise.all([
          getCoworkingCenter(booking.coworkingCenter.id, token),
          getColorSettings(token),
          getFloors(booking.coworkingCenter.id, token)
        ])

        if (!floorsData || floorsData.length === 0) {
          setFloors([])
          setSelectedCoworking(coworkingCenter)
          setLoading(false)
          return
        }

        const floorsWithWorkstations = await Promise.all(
          floorsData.map(async (floor) => {
            try {
              const workstations = await getWorkstations(floor.id, token)
             
              return {
                ...floor,
                workstations: workstations || [],
                landmarks: floor.landmarks || []
              }
            } catch (err) {
              console.error(`Error loading workstations for floor ${floor.id}:`, err)
              return {
                ...floor,
                workstations: [],
                landmarks: []
              }
            }
          })
        )

        // Находим этаж, на котором находится забронированное рабочее место
        const targetFloorIndex = floorsWithWorkstations.findIndex(floor =>
          floor.workstations.some(ws => ws.id === booking.workstation.id)
        )

        setSelectedCoworking(coworkingCenter)
        setFloors(floorsWithWorkstations)
        setCurrentFloorIndex(targetFloorIndex >= 0 ? targetFloorIndex : 0)

        if (colorSettings && colorSettings.workstations) {
          setColors(prevColors => ({
            ...prevColors,
            ...colorSettings.workstations
          }))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Ошибка загрузки данных планировки')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [booking])

  const currentFloor = floors[currentFloorIndex] || null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            План коворкинг-центра
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#645391] mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Загрузка плана...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {selectedCoworking?.address}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ваше забронированное место выделено на плане
                </p>
              </div>

              {/* Селектор этажей - ОСТАВЛЯЕМ ТОЛЬКО ЭТУ ИНТЕРАКТИВНОСТЬ */}
              {floors.length > 1 && (
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-2">
                    {floors.map((floor, index) => (
                      <button
                        key={floor.id}
                        onClick={() => setCurrentFloorIndex(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentFloorIndex === index
                            ? 'bg-[#645391] text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Этаж {floor.level}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* План этажа - ПОЛНОСТЬЮ НЕИНТЕРАКТИВНЫЙ */}
            {currentFloor ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 pointer-events-none">
                <WorkspacePlan
                  floor={currentFloor}
                  colors={colors}
                  selectedWorkstation={booking.workstation}
                  onWorkstationSelect={null}
                  selectedDate={new Date(booking.startTime)}
                  bookings={[booking]}
                  isWorkstationBooked={() => false}
                  getRoomBookedTimes={() => []}
                  isViewMode={true}
                  customLegend={true}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">Этаж не найден</p>
              </div>
            )}

            {/* Информация о бронировании */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Ваше забронированное место:
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                {booking.workstation.type === 'DESK' ? 'Рабочий стол' :
                 booking.workstation.type === 'COMPUTER_DESK' ? 'Стол с компьютером' :
                 booking.workstation.type === 'MEETING_ROOM' ? 'Переговорная комната' : 'Конференц-зал'} 
                №{booking.workstation.number}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspacePlanModal