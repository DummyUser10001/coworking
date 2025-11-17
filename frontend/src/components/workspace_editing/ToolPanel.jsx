// frontend\src\components\workspace_editing\ToolPanel.jsx
import React, { useEffect } from 'react'
import ColorPicker from './ColorPicker'
import assets from '../../assets/assets'

const ToolPanel = ({
  selectedTool, // Должно быть null по умолчанию
  onToolSelect,
  colors,
  onColorChange,
  roomSelection,
  currentFloor,
  onFloorDimensionsChange,
  landmarks,
  onLandmarkClick,
  onAddLandmark,
  onCancelRoomConstruction
}) => {
  const tools = [
    { type: 'DESK', label: 'Рабочий стол' },
    { type: 'COMPUTER_DESK', label: 'Стол с компьютером' },
    { type: 'MEETING_ROOM', label: 'Переговорная' },
    { type: 'CONFERENCE_ROOM', label: 'Конференц-зал' }
  ]

  const getWorkstationStats = (type) => {
    return (currentFloor.workstations || []).filter(ws => ws.type === type).length
  }

  const handleToolSelect = (toolType) => {
    // Если инструмент уже выбран - отменяем выбор
    if (selectedTool === toolType) {
      onToolSelect(null)
      if (roomSelection.selecting) {
        onCancelRoomConstruction()
      }
    } else {
      // Иначе выбираем новый инструмент
      onToolSelect(toolType)
      if (roomSelection.selecting && !['MEETING_ROOM', 'CONFERENCE_ROOM'].includes(toolType)) {
        onCancelRoomConstruction()
      }
    }
  }

// В том же файле обновить функцию handleLandmarkSelect:
const handleLandmarkSelect = (landmarkType) => {
  const toolType = `LANDMARK_${landmarkType}`
  
  console.log('Landmark tool selected:', toolType, 'landmarkType:', landmarkType)
  
  // Если этот ориентир уже выбран - отменяем выбор (только при повторном клике)
  if (selectedTool === toolType) {
    onToolSelect(null)
    if (roomSelection.selecting) {
      onCancelRoomConstruction()
    }
  } else {
    // Иначе выбираем ориентир
    onToolSelect(toolType)
    if (roomSelection.selecting) {
      onCancelRoomConstruction()
    }
  }
}

// Обновим сообщения для ориентиров
{selectedTool === 'LANDMARK_ENTRANCE' && (
  <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
    <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
      Кликните на клетку для размещения входа/выхода
    </p>
    <p className="text-xs text-blue-600 dark:text-blue-300 text-center mt-1">
      Нажмите на инструмент еще раз для отмены
    </p>
  </div>
)}

{selectedTool === 'LANDMARK_TOILET' && (
  <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
    <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
      Кликните на клетку для размещения туалета
    </p>
    <p className="text-xs text-blue-600 dark:text-blue-300 text-center mt-1">
      Нажмите на инструмент еще раз для отмены
    </p>
  </div>
)}

  // Обработка клавиши Esc для отмены строительства и снятия выбора инструмента
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        if (roomSelection.selecting) {
          onCancelRoomConstruction()
        } else if (selectedTool) {
          onToolSelect(null)
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [roomSelection.selecting, selectedTool, onCancelRoomConstruction, onToolSelect])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Инструменты
        </h2>
        {selectedTool && (
          <button
            onClick={() => onToolSelect(null)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Инструменты */}
      <div className="space-y-3 mb-6">
        {tools.map(tool => (
          <div key={tool.type} className="flex items-center space-x-3">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleToolSelect(tool.type)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleToolSelect(tool.type)
                }
              }}
              className={`flex-1 p-3 rounded-xl border-2 transition-all cursor-pointer text-left outline-none focus:ring-2 focus:ring-[#645391] focus:ring-offset-2 ${
                selectedTool === tool.type
                  ? 'border-[#645391] bg-[#645391] bg-opacity-10'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={`font-medium block ${
                    selectedTool === tool.type 
                      ? 'text-[#645391] dark:text-[#8a7bb0]' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {tool.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getWorkstationStats(tool.type)} шт.
                  </span>
                </div>
                <ColorPicker
                  color={colors[tool.type]}
                  onChange={(color) => onColorChange(tool.type, color)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ориентиры */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
          Ориентиры
        </h3>
<div className="space-y-2">
  <button
    onClick={() => handleLandmarkSelect('ENTRANCE')}
    className={`w-full p-2 rounded-lg border transition-all cursor-pointer flex items-center space-x-3 ${
      selectedTool === 'LANDMARK_ENTRANCE'
        ? 'border-[#645391] bg-[#645391] bg-opacity-10'
        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
    }`}
  >
    <img 
      src={assets.right_arrow_icon} 
      alt="Вход/выход"
      className="w-5 h-5"
    />
    <span className={selectedTool === 'LANDMARK_ENTRANCE' 
      ? 'text-[#645391] dark:text-[#8a7bb0] font-medium' 
      : 'text-gray-700 dark:text-gray-300'
    }>
      Вход/выход
    </span>
  </button>
  
  <button
    onClick={() => handleLandmarkSelect('TOILET')}
    className={`w-full p-2 rounded-lg border transition-all cursor-pointer flex items-center space-x-3 ${
      selectedTool === 'LANDMARK_TOILET'
        ? 'border-[#645391] bg-[#645391] bg-opacity-10'
        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
    }`}
  >

<div className="w-7 h-7 bg-yellow-600 rounded-full flex items-center justify-center shadow-md">
  <span className="text-[10px] font-black text-white tracking-tight">WC</span>
</div>
    <span className={selectedTool === 'LANDMARK_TOILET' 
      ? 'text-[#645391] dark:text-[#8a7bb0] font-medium' 
      : 'text-gray-700 dark:text-gray-300'
    }>
      Туалет
    </span>
  </button>
</div>

      </div>

      {['MEETING_ROOM', 'CONFERENCE_ROOM'].includes(selectedTool) && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            Выделите область для создания комнаты
          </p>
        </div>
      )}

      {selectedTool === 'LANDMARK_ENTRANCE' && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            Кликните на клетку для размещения входа/выхода
          </p>
        </div>
      )}

      {/* Сообщение о том, что инструмент не выбран */}
      {!selectedTool && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Выберите инструмент для начала работы
          </p>
        </div>
      )}

      {/* Настройки этажа */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
          Настройки этажа
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Ширина (клеток)
            </label>
            <input
              type="number"
              min="5"
              max="20"
              value={currentFloor.width}
              onChange={(e) => onFloorDimensionsChange(parseInt(e.target.value), currentFloor.height)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:border-[#645391] focus:ring-1 focus:ring-[#645391]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Высота (клеток)
            </label>
            <input
              type="number"
              min="5"
              max="20"
              value={currentFloor.height}
              onChange={(e) => onFloorDimensionsChange(currentFloor.width, parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:border-[#645391] focus:ring-1 focus:ring-[#645391]"
            />
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
          Статистика этажа
        </h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Всего мест:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {(currentFloor.workstations || []).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Столы:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {getWorkstationStats('DESK')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Компьютеры:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {getWorkstationStats('COMPUTER_DESK')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Переговорные:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {getWorkstationStats('MEETING_ROOM')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Конференц-залы:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {getWorkstationStats('CONFERENCE_ROOM')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Входы/выходы:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {(landmarks || []).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolPanel