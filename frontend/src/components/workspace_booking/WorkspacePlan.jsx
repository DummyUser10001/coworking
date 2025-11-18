// frontend\src\components\workspace_booking\WorkspacePlan.jsx
import React from 'react'
import { ImArrowRight } from "react-icons/im";

const WorkspacePlan = ({
  floor,
  colors,
  selectedWorkstation,
  onWorkstationSelect,
  selectedDate,
  bookings,
  isWorkstationBooked,
  customLegend = false
}) => {
  if (!floor) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">Данные этажа не загружены</p>
      </div>
    )
  }

  const workstations = floor.workstations || []
  const landmarks = floor.landmarks || []
  const width = floor.width || 12
  const height = floor.height || 10

  const getRoomBorders = (x, y, room) => {
    if (!room) return { top: false, right: false, bottom: false, left: false }
   
    const roomWidth = room.width || 1
    const roomHeight = room.height || 1
   
    const borders = {
      top: y === room.y,
      right: x === room.x + roomWidth - 1,
      bottom: y === room.y + roomHeight - 1,
      left: x === room.x
    }
   
    return borders
  }

  const getWorkstationTypeText = (type) => {
    switch (type) {
      case 'DESK': return 'Рабочий стол'
      case 'COMPUTER_DESK': return 'Стол с компьютером'
      case 'MEETING_ROOM': return 'Переговорная'
      case 'CONFERENCE_ROOM': return 'Конференц-зал'
      default: return type
    }
  }

  const getRoomForCell = (x, y) => {
    return workstations.find(ws =>
      ws && (ws.type === 'MEETING_ROOM' || ws.type === 'CONFERENCE_ROOM') &&
      x >= ws.x && x < ws.x + (ws.width || 1) &&
      y >= ws.y && y < ws.y + (ws.height || 1)
    )
  }

  const getWorkstationForCell = (x, y) => {
    return workstations.find(ws =>
      ws && (ws.type === 'DESK' || ws.type === 'COMPUTER_DESK') &&
      ws.x === x && ws.y === y
    )
  }

  const getLandmarkForCell = (x, y) => {
    return landmarks.find(l => l && l.x === x && l.y === y)
  }

  const availableWorkstations = workstations.filter(ws => !isWorkstationBooked(ws))
  const totalWorkstations = workstations.length

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Этаж {floor.level}</h3>
      </div>

      {/* Внутри основного grid-контейнера */}
      <div
        className="relative mx-auto"
        style={{
          width: 'max-content',
          height: 'max-content',
        }}
      >
        {/* Фоновый grid для пустых ячеек и рабочих столов */}
        <div
          className="grid gap-0 border-2 border-gray-300 dark:border-gray-600"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            maxWidth: 'max-content',
          }}
        >
          {Array.from({ length: height }).map((_, y) =>
            Array.from({ length: width }).map((_, x) => {
              const room = getRoomForCell(x, y)
              const workstation = getWorkstationForCell(x, y)
              const landmark = getLandmarkForCell(x, y)

              // Если ячейка принадлежит комнате — пропускаем (комната будет отрисована отдельно)
              if (room) return <div key={`${x}-${y}`} className="w-12 h-12" />

              return (
                <div
                  key={`${x}-${y}`}
                  className="w-12 h-12 flex items-center justify-center relative"
                >
                  {workstation && (
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center text-white text-xs font-medium transition-all relative ${
                        selectedWorkstation?.id === workstation.id ? 'ring-4 ring-[#645391] ring-opacity-50' : ''
                      }`}
                      style={{
                        backgroundColor: isWorkstationBooked(workstation)
                          ? '#991B1B'
                          : colors[workstation.type],
                        cursor: isWorkstationBooked(workstation) ? 'not-allowed' : 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isWorkstationBooked(workstation)) onWorkstationSelect(workstation)
                      }}
                      title={`${getWorkstationTypeText(workstation.type)} №${workstation.number} - ${
                        isWorkstationBooked(workstation) ? 'Занято' : 'Свободно'
                      }`}
                    >
                      {workstation.number}
                    </div>
                  )}
                  {landmark && (
                    <div className="w-10 h-10 rounded flex items-center justify-center cursor-default">
                      {landmark.type === 'ENTRANCE' ? (
                        <ImArrowRight 
                          className="w-6 h-6 text-green-600 dark:text-green-400"
                          style={{ transform: `rotate(${landmark.rotation || 0}deg)` }}
                        />
                      ) : (
                        <div className="w-7 h-7 bg-yellow-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-[10px] font-black text-white tracking-tight">WC</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* === ОТРИСОВКА КОМНАТ ПОВЕРХ GRID === */}
        {workstations
          .filter(ws => ws.type === 'MEETING_ROOM' || ws.type === 'CONFERENCE_ROOM')
          .map(room => {
            const isRoomBookedAllDay = isWorkstationBooked(room)
            const roomWidth = room.width || 1
            const roomHeight = room.height || 1

            return (
              <div
                key={room.id}
                className="absolute z-10 cursor-pointer"
                style={{
                  left: `${room.x * 48}px`,  // 48px = w-12 (3rem)
                  top: `${room.y * 48}px`,
                  width: `${roomWidth * 48}px`,
                  height: `${roomHeight * 48}px`,
                  backgroundColor: isRoomBookedAllDay
                    ? '#991B1B'
                    : `${colors[room.type] || '#CCCCCC'}40`,
                  border: `2px solid ${isRoomBookedAllDay ? '#DC2626' : colors[room.type] || '#000000'}`,
                  cursor: isRoomBookedAllDay ? 'not-allowed' : 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isRoomBookedAllDay) onWorkstationSelect(room)
                }}
              >
                <div
                  className={`absolute top-1 left-1 text-xs font-bold z-20 ${
                    isRoomBookedAllDay ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {room.number}
                </div>
              </div>
            )
          })}
      </div>

      {/* ЛЕГЕНДА */}
      <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 text-center">
          Обозначения:
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.DESK }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">Рабочие столы</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.COMPUTER_DESK }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">Столы с компьютером</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.MEETING_ROOM }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">Переговорные</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.CONFERENCE_ROOM }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">Конференц-залы</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ImArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Вход/выход</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-600 rounded-full" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Туалет</span>
              </div>
              {/* Убираем значок "Занято" если customLegend=true */}
              {!customLegend && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-red-800" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Занято (весь день)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}

export default WorkspacePlan