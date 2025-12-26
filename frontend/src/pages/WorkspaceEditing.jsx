import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FloorManager from '../components/workspace_editing/FloorManager'
import ToolPanel from '../components/workspace_editing/ToolPanel'
import FloorGrid from '../components/workspace_editing/FloorGrid'
import WorkstationModal from '../components/workspace_editing/WorkstationModal'
import { 
  getCoworkingCenter,
  getFloors, 
  createFloor, 
  updateFloor, 
  deleteFloor
} from '../api/coworking.js'
import {
  createWorkstation,
  updateWorkstation,
  deleteWorkstation,
  createLandmark,
  updateLandmark,
  deleteLandmark,
  getWorkstations
} from '../api/workspace.js'
import {
  getColorSettings,
  updateColorSettings
} from '../api/colors.js'
import { useAuth } from '../context/AuthContext'

const WorkspaceEditing = ({ theme }) => {
  const [colors, setColors] = useState({
    DESK: '#3B82F6',
    COMPUTER_DESK: '#10B981',
    MEETING_ROOM: '#8B5CF6',
    CONFERENCE_ROOM: '#F59E0B'
  })
  const [selectedCoworking, setSelectedCoworking] = useState(null)
  const [floors, setFloors] = useState([])
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0)
  const [selectedTool, setSelectedTool] = useState(null)
  const [editingWorkstation, setEditingWorkstation] = useState(null)
  const [editingLandmark, setEditingLandmark] = useState(null)
  const [roomSelection, setRoomSelection] = useState({ start: null, end: null, selecting: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { coworkingId } = location.state || {}
  const { token } = useAuth()

  const currentFloor = floors[currentFloorIndex] || floors[0]

  const getNextWorkstationNumber = async () => {
    try {
      const floorWorkstations = await getWorkstations(currentFloor.id, token)
      const maxNumber = floorWorkstations.reduce((max, ws) => Math.max(max, ws.number || 0), 0)
      return maxNumber + 1
    } catch (error) {
      console.error('Error getting next workstation number:', error)
      return 1
    }
  }

  const showError = (errorMessage) => {
    setError(errorMessage)
    setShowErrorModal(true)
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false)
    setError(null)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!token) {
          navigate('/signin')
          return
        }

        if (!coworkingId) {
          setError('Не выбран коворкинг-центр для редактирования')
          setShowErrorModal(true)
          setLoading(false)
          return
        }

        const [coworkingCenter, colorSettings, floorsData] = await Promise.all([
          getCoworkingCenter(coworkingId, token),
          getColorSettings(token),
          getFloors(coworkingId, token)
        ])

        setSelectedCoworking(coworkingCenter)
        setFloors(floorsData)

        if (colorSettings && colorSettings.workstations) {
          setColors(prevColors => ({
            ...prevColors,
            ...colorSettings.workstations
          }))
        }
      } catch (err) {
        setError('Ошибка загрузки данных: ' + err.message)
        setShowErrorModal(true)
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [coworkingId, navigate, token])

  useEffect(() => {
    if (currentFloorIndex >= floors.length) {
      setCurrentFloorIndex(Math.max(0, floors.length - 1))
    }
  }, [floors, currentFloorIndex])

  useEffect(() => {
    if (selectedTool !== 'ROOM' && roomSelection.selecting) {
      setRoomSelection({ start: null, end: null, selecting: false })
    }
  }, [selectedTool, roomSelection.selecting])

  const canPlaceRoom = (startX, startY, endX, endY) => {
    if (!currentFloor) return false

    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)
    
    const width = maxX - minX + 1
    const height = maxY - minY + 1
    if (width < 2 || height < 2) {
      alert('Комната должна быть минимум 2x2 клетки')
      return false
    }
    
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x < 0 || x >= currentFloor.width || y < 0 || y >= currentFloor.height) {
          alert('Комната выходит за границы этажа')
          return false
        }
        
        const existingWorkstation = currentFloor.workstations?.find(ws => {
          if (!ws) return false
          if (ws.type === 'MEETING_ROOM' || ws.type === 'CONFERENCE_ROOM') {
            return x >= ws.x && x < ws.x + (ws.width || 1) && 
                   y >= ws.y && y < ws.y + (ws.height || 1)
          } else {
            return ws.x === x && ws.y === y
          }
        })

        const existingLandmark = currentFloor.landmarks?.find(l => 
          l && l.x === x && l.y === y
        )
        
        if (existingWorkstation || existingLandmark) {
          alert('Область пересекается с существующим объектом')
          return false
        }
      }
    }
    
    return true
  }

  const updateFloorWorkstations = (workstations) => {
    const updatedFloors = [...floors]
    if (updatedFloors[currentFloorIndex]) {
      updatedFloors[currentFloorIndex] = {
        ...currentFloor,
        workstations: workstations
      }
      setFloors(updatedFloors)
    }
  }

  const updateFloorLandmarks = (landmarks) => {
    const updatedFloors = [...floors]
    if (updatedFloors[currentFloorIndex]) {
      updatedFloors[currentFloorIndex] = {
        ...currentFloor,
        landmarks: landmarks
      }
      setFloors(updatedFloors)
    }
  }

  const handleColorChange = async (type, color) => {
    try {
      const newColors = { ...colors, [type]: color }
      setColors(newColors)
      await updateColorSettings({ workstations: newColors }, token)
    } catch (err) {
      showError('Ошибка сохранения цвета: ' + err.message)
      console.error('Error updating color:', err)
    }
  }

  const cancelRoomConstruction = () => {
    if (roomSelection.selecting) {
      setRoomSelection({ start: null, end: null, selecting: false })
    }
  }

  const handleCellClick = async (x, y) => {
    if (!currentFloor || selectedTool === 'SELECT' || selectedTool === 'ROOM') return

    try {
      const nextNumber = await getNextWorkstationNumber()
      
      console.log('Creating workstation at:', { x, y })
      
      // Определяем данные в зависимости от типа
      let workstationData = {
        floorId: currentFloor.id,
        number: nextNumber,
        type: selectedTool,
        x: x,
        y: y,
        width: 1,
        height: 1,
        capacity: 1
      }

      // Добавляем цены в зависимости от типа
      if (selectedTool === 'DESK' || selectedTool === 'COMPUTER_DESK') {
        workstationData.basePricePerDay = 500
        workstationData.basePricePerWeek = 2500
        workstationData.basePricePerMonth = 8000
        workstationData.basePricePerHour = null
      } else if (selectedTool === 'MEETING_ROOM' || selectedTool === 'CONFERENCE_ROOM') {
        workstationData.basePricePerHour = selectedTool === 'MEETING_ROOM' ? 1500 : 3000
        workstationData.basePricePerDay = null
        workstationData.basePricePerWeek = null
        workstationData.basePricePerMonth = null
      }
      
      const newWorkstation = await createWorkstation(workstationData, token)

      const updatedWorkstations = [...(currentFloor.workstations || []), newWorkstation]
      updateFloorWorkstations(updatedWorkstations)
    } catch (err) {
      if (err.message.includes('номером уже существует')) {
        showError('Ошибка: рабочее место с таким номером уже существует')
      } else {
        showError('Ошибка создания рабочего места: ' + err.message)
      }
      console.error('Error creating workstation:', err)
    }
  }

  const handleDeleteWorkstation = async (workstationId) => {
    try {
      await deleteWorkstation(workstationId, token)
      const updatedWorkstations = currentFloor.workstations.filter(ws => ws.id !== workstationId)
      updateFloorWorkstations(updatedWorkstations)
      setEditingWorkstation(null)
    } catch (err) {
      showError('Ошибка удаления рабочего места: место забронировано клиентом')
      console.error('Error deleting workstation:', err)
    }
  }

  const addNewFloor = async () => {
    try {
      const newFloor = await createFloor({
        level: floors.length + 1,
        width: 12,
        height: 10,
        coworkingCenterId: coworkingId
      }, token)

      setFloors(prev => [...prev, newFloor])
      setCurrentFloorIndex(floors.length)
    } catch (err) {
      showError('Ошибка создания этажа: ' + err.message)
      console.error('Error creating floor:', err)
    }
  }

  const handleDeleteFloor = async (index) => {
    if (floors.length > 1) {
      try {
        const floorToDelete = floors[index]
        await deleteFloor(floorToDelete.id, token)
        
        const updatedFloors = floors.filter((_, i) => i !== index)
        setFloors(updatedFloors)
        const newIndex = Math.min(index, updatedFloors.length - 1)
        setCurrentFloorIndex(newIndex)
      } catch (err) {
        showError('Ошибка удаления этажа: ' + err.message)
        console.error('Error deleting floor:', err)
      }
    }
  }

  const updateFloorDimensions = async (width, height) => {
    try {
      const currentWorkstations = currentFloor.workstations || []
      const currentLandmarks = currentFloor.landmarks || []
      
      const updatedFloor = await updateFloor(currentFloor.id, { width, height }, token)
      
      const updatedFloorWithContent = {
        ...updatedFloor,
        workstations: currentWorkstations,
        landmarks: currentLandmarks
      }
      
      const updatedFloors = [...floors]
      updatedFloors[currentFloorIndex] = updatedFloorWithContent
      setFloors(updatedFloors)
    } catch (err) {
      showError('Ошибка обновления размеров этажа: ' + err.message)
      console.error('Error updating floor dimensions:', err)
    }
  }

  const handleRoomCreation = async (start, end, roomType = selectedTool) => {
    if (!currentFloor) return

    if (!canPlaceRoom(start.x, start.y, end.x, end.y)) {
      return
    }

    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)

    try {
      const nextNumber = await getNextWorkstationNumber()
      
      const newRoom = await createWorkstation({
        floorId: currentFloor.id,
        number: nextNumber,
        type: roomType,
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        capacity: (maxX - minX + 1) * (maxY - minY + 1) * 2,
        basePricePerHour: roomType === 'MEETING_ROOM' ? 1500 : 3000,
        basePricePerDay: null,
        basePricePerWeek: null,
        basePricePerMonth: null
      }, token)

      const updatedWorkstations = [...(currentFloor.workstations || []), newRoom]
      updateFloorWorkstations(updatedWorkstations)
      setRoomSelection({ start: null, end: null, selecting: false })
    } catch (err) {
      if (err.message.includes('номером уже существует')) {
        showError('Ошибка: рабочее место с таким номером уже существует')
      } else {
        showError('Ошибка создания комнаты: ' + err.message)
      }
      console.error('Error creating room:', err)
    }
  }

  const handleLandmarkClick = (landmark) => {
    setEditingLandmark(landmark)
  }

  const handleAddLandmark = async (x, y, type) => {
    if (!currentFloor) return

    console.log('Adding landmark - Tool:', selectedTool, 'Type:', type, 'at:', x, y)

    const isCellOccupied = currentFloor.workstations?.some(ws => 
      (ws.type === 'MEETING_ROOM' || ws.type === 'CONFERENCE_ROOM'
        ? x >= ws.x && x < ws.x + (ws.width || 1) && y >= ws.y && y < ws.y + (ws.height || 1)
        : ws.x === x && ws.y === y
      )
    ) || currentFloor.landmarks?.some(l => l && l.x === x && l.y === y)

    if (isCellOccupied) {
      alert('Клетка уже занята другим объектом')
      return
    }

    try {
      // Определяем название в зависимости от типа
      const name = type === 'ENTRANCE' ? "Вход/выход" : "Туалет"
      
      const landmarkData = {
        floorId: currentFloor.id,
        type: type,
        x: x,
        y: y,
        name: name,
        rotation: type === 'ENTRANCE' ? 0 : 0
      }

      console.log('Sending landmark data:', landmarkData)
      
      const newLandmark = await createLandmark(landmarkData, token)

      console.log('Landmark created:', newLandmark)

      const updatedLandmarks = [...(currentFloor.landmarks || []), newLandmark]
      updateFloorLandmarks(updatedLandmarks)
      
    } catch (err) {
      console.error('Full error details:', err)
      showError('Ошибка создания ориентира: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Загрузка планировки...
          </h1>
        </div>
      </div>
    )
  }

  if (floors.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Нет этажей для {selectedCoworking?.address}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Создайте первый этаж для начала работы с планировкой
          </p>
          <button
            onClick={addNewFloor}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Создать первый этаж
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#EAB7A1] via-white to-[#A1E1DE] dark:from-gray-900 dark:via-gray-800 dark:to-[#645391] transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Редактирование планировки
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            {selectedCoworking?.address}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Этаж {currentFloor?.level || 'Неизвестный этаж'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="space-y-6 sticky top-6">
              <FloorManager
                floors={floors}
                currentFloorIndex={currentFloorIndex}
                onFloorSelect={setCurrentFloorIndex}
                onAddFloor={addNewFloor}
                onDeleteFloor={handleDeleteFloor}
              />
              
              {currentFloor && (
                <ToolPanel
                  selectedTool={selectedTool}
                  onToolSelect={setSelectedTool}
                  colors={colors}
                  onColorChange={handleColorChange}
                  roomSelection={roomSelection}
                  currentFloor={currentFloor}
                  onFloorDimensionsChange={updateFloorDimensions}
                  landmarks={currentFloor.landmarks || []}
                  onLandmarkClick={handleLandmarkClick}
                  onAddLandmark={handleAddLandmark}
                  onCancelRoomConstruction={cancelRoomConstruction}
                />
              )}
            </div>
          </div>

          <div className="lg:w-3/4">
            {currentFloor ? (
              <FloorGrid
                floor={currentFloor}
                colors={colors}
                selectedTool={selectedTool}
                roomSelection={roomSelection}
                onRoomSelectionChange={setRoomSelection}
                onRoomCreate={handleRoomCreation}
                onCellClick={handleCellClick}
                onWorkstationClick={setEditingWorkstation}
                onLandmarkClick={handleLandmarkClick}
                onAddLandmark={handleAddLandmark}
                onCancelRoomConstruction={cancelRoomConstruction}
              />
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  Этаж не найден
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Модальное окно редактирования рабочего места */}
        {editingWorkstation && (
          <WorkstationModal
            workstation={editingWorkstation}
            onSave={async (updatedWorkstation) => {
              try {
                const savedWorkstation = await updateWorkstation(
                  editingWorkstation.id, 
                  updatedWorkstation, 
                  token
                )
                
                const updatedWorkstations = currentFloor.workstations.map(ws =>
                  ws.id === editingWorkstation.id ? savedWorkstation : ws
                )
                updateFloorWorkstations(updatedWorkstations)
                setEditingWorkstation(null)
              } catch (err) {
                if (err.message.includes('номером уже существует')) {
                  showError('Ошибка: рабочее место с таким номером уже существует')
                } else {
                  showError('Ошибка сохранения рабочего места: ' + err.message)
                }
                console.error('Error saving workstation:', err)
              }
            }}
            onClose={() => setEditingWorkstation(null)}
            onDelete={handleDeleteWorkstation}
            token={token}
          />
        )}

        {/* Модальное окно редактирования ориентира */}
        {editingLandmark && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">
                {editingLandmark.type === 'ENTRANCE' 
                  ? 'Редактирование входа/выхода' 
                  : 'Редактирование туалета'
                }
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название</label>
                  <input
                    type="text"
                    value={editingLandmark.name || ''}
                    onChange={(e) => setEditingLandmark({...editingLandmark, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder={editingLandmark.type === 'ENTRANCE' ? "Вход/выход" : "Туалет"}
                  />
                </div>
                
                {/* Показывать поворот только для входа/выхода */}
                {editingLandmark.type === 'ENTRANCE' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Поворот стрелки</label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setEditingLandmark({...editingLandmark, rotation: 0})}
                        className={`p-2 border rounded ${editingLandmark.rotation === 0 ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                      >
                        →
                      </button>
                      <button
                        onClick={() => setEditingLandmark({...editingLandmark, rotation: 90})}
                        className={`p-2 border rounded ${editingLandmark.rotation === 90 ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => setEditingLandmark({...editingLandmark, rotation: 180})}
                        className={`p-2 border rounded ${editingLandmark.rotation === 180 ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setEditingLandmark({...editingLandmark, rotation: 270})}
                        className={`p-2 border rounded ${editingLandmark.rotation === 270 ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Информация о типе ориентира */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Тип: <span className="font-medium">
                      {editingLandmark.type === 'ENTRANCE' ? 'Вход/выход' : 'Туалет'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {editingLandmark.type === 'ENTRANCE' 
                      ? 'Отображается как стрелка направления' 
                      : 'Отображается как знак WC'
                    }
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={async () => {
                    try {
                      await deleteLandmark(editingLandmark.id, token)
                      const updatedLandmarks = (currentFloor.landmarks || []).filter(l => l.id !== editingLandmark.id)
                      updateFloorLandmarks(updatedLandmarks)
                      setEditingLandmark(null)
                    } catch (err) {
                      showError('Ошибка удаления ориентира: ' + err.message)
                      console.error('Error deleting landmark:', err)
                    }
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md dark:hover:bg-red-900"
                >
                  Удалить
                </button>
                <button
                  onClick={() => setEditingLandmark(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    try {
                      const savedLandmark = await updateLandmark(editingLandmark.id, editingLandmark, token)
                      const updatedLandmarks = (currentFloor.landmarks || []).map(l =>
                        l.id === editingLandmark.id ? savedLandmark : l
                      )
                      updateFloorLandmarks(updatedLandmarks)
                      setEditingLandmark(null)
                    } catch (err) {
                      showError('Ошибка сохранения ориентира: ' + err.message)
                      console.error('Error saving landmark:', err)
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Модальное окно ошибок */}
        {showErrorModal && error && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-auto animate-in fade-in zoom-in duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  Ошибка
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {error}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseErrorModal}
                    className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspaceEditing