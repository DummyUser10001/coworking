import React, { useState, useEffect } from 'react'
import { ImArrowRight } from "react-icons/im"

const FloorGrid = ({
  floor,
  colors,
  selectedTool,
  onRoomCreate,
  onCellClick,
  onWorkstationClick,
  onLandmarkClick,
  onAddLandmark,
  onCancelRoomConstruction
}) => {
  const [selection, setSelection] = useState({ start: null, end: null, selecting: false })
  const [hoverCell, setHoverCell] = useState(null)

  useEffect(() => {
    if (!['MEETING_ROOM', 'CONFERENCE_ROOM'].includes(selectedTool) && selection.selecting) {
      setSelection({ start: null, end: null, selecting: false })
      setHoverCell(null)
      onCancelRoomConstruction()
    }
  }, [selectedTool, selection.selecting, onCancelRoomConstruction])

  if (!floor) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">Данные этажа не загружены</p>
      </div>
    )
  }

  const isCellOccupied = (x, y, ignoreRoomId = null) => {
    const workstations = floor.workstations || []
    const landmarks = floor.landmarks || []

    const hasWorkstation = workstations.some(ws =>
      ws && (ws.type === 'DESK' || ws.type === 'COMPUTER_DESK') && ws.x === x && ws.y === y
    )
    if (hasWorkstation) return true

    const hasRoom = workstations.some(ws =>
      ws &&
      (ws.type === 'MEETING_ROOM' || ws.type === 'CONFERENCE_ROOM') &&
      ws.id !== ignoreRoomId &&
      x >= ws.x && x < ws.x + (ws.width || 1) &&
      y >= ws.y && y < ws.y + (ws.height || 1)
    )
    if (hasRoom) return true

    return landmarks.some(l => l && l.x === x && l.y === y)
  }

  const getRoomBorders = (x, y, room) => {
    if (!room) return { top: false, right: false, bottom: false, left: false }
    
    const borders = {
      top: y === room.y,
      right: x === room.x + (room.width || 1) - 1,
      bottom: y === room.y + (room.height || 1) - 1,
      left: x === room.x
    }
    
    return borders
  }

// frontend\src\components\workspace_editing\FloorGrid.jsx
// frontend\src\components\workspace_editing\FloorGrid.jsx
const handleCellClick = (x, y, event) => {
  if (event.button === 2) {
    event.preventDefault()
    if (selection.selecting) {
      setSelection({ start: null, end: null, selecting: false })
      setHoverCell(null)
      onCancelRoomConstruction()
    }
    return
  }

  if (event.button !== 0) return

  // Обработка ориентиров - УПРОЩЕННАЯ И ИСПРАВЛЕННАЯ ВЕРСИЯ
  if (selectedTool === 'LANDMARK_ENTRANCE') {
    if (isCellOccupied(x, y)) {
      alert('Клетка уже занята')
      return
    }
    console.log('Creating ENTRANCE landmark at:', x, y) // ДЛЯ ОТЛАДКИ
    onAddLandmark(x, y, 'ENTRANCE')
    return
  }

  if (selectedTool === 'LANDMARK_TOILET') {
    if (isCellOccupied(x, y)) {
      alert('Клетка уже занята')
      return
    }
    console.log('Creating TOILET landmark at:', x, y) // ДЛЯ ОТЛАДКИ
    onAddLandmark(x, y, 'TOILET')
    return
  }

  // ... остальной код для рабочих мест и комнат

    if (['MEETING_ROOM', 'CONFERENCE_ROOM'].includes(selectedTool)) {
      if (!selection.selecting) {
        setSelection({ start: { x, y }, end: null, selecting: true })
        setHoverCell({ x, y })
      } else {
        const end = { x, y }
        setSelection(prev => ({ ...prev, end }))

        setTimeout(() => {
          onRoomCreate(selection.start, end, selectedTool)
          setSelection({ start: null, end: null, selecting: false })
          setHoverCell(null)
        }, 10)
      }
      return
    }

    if (['DESK', 'COMPUTER_DESK'].includes(selectedTool)) {
      if (isCellOccupied(x, y)) {
        alert('Клетка уже занята')
        return
      }
      onCellClick(x, y)
    }
  }

  const handleCellHover = (x, y) => {
    if (['MEETING_ROOM', 'CONFERENCE_ROOM'].includes(selectedTool) && selection.selecting) {
      setHoverCell({ x, y })
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (selection.selecting) {
      setSelection({ start: null, end: null, selecting: false })
      setHoverCell(null)
      onCancelRoomConstruction()
    }
  }

  const getSelectionBounds = (start, end) => {
    if (!start || !end) return null
    return {
      minX: Math.min(start.x, end.x),
      maxX: Math.max(start.x, end.x),
      minY: Math.min(start.y, end.y),
      maxY: Math.max(start.y, end.y)
    }
  }

  const effectiveEnd = selection.selecting
    ? (hoverCell || selection.end || selection.start)
    : null

  const previewBounds = selection.selecting && selection.start && effectiveEnd
    ? getSelectionBounds(selection.start, effectiveEnd)
    : null

  const isInPreview = (x, y) => {
    if (!previewBounds) return false
    return x >= previewBounds.minX && x <= previewBounds.maxX && y >= previewBounds.minY && y <= previewBounds.maxY
  }

  const isPreviewBorder = (x, y) => {
    if (!previewBounds) return false
    return (
      x === previewBounds.minX || x === previewBounds.maxX ||
      y === previewBounds.minY || y === previewBounds.maxY
    )
  }

  const getRoomForCell = (x, y) => {
    return (floor.workstations || []).find(ws =>
      (ws.type === 'MEETING_ROOM' || ws.type === 'CONFERENCE_ROOM') &&
      x >= ws.x && x < ws.x + (ws.width || 1) &&
      y >= ws.y && y < ws.y + (ws.height || 1)
    )
  }

  const getWorkstationForCell = (x, y) => {
    return (floor.workstations || []).find(ws =>
      (ws.type === 'DESK' || ws.type === 'COMPUTER_DESK') && ws.x === x && ws.y === y
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg" onContextMenu={handleContextMenu}>
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Этаж {floor.level}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Размер: {floor.width} × {floor.height}</p>
      </div>

      <div
        className="grid gap-0 mx-auto"
        style={{ gridTemplateColumns: `repeat(${floor.width}, minmax(0, 1fr))`, maxWidth: 'max-content' }}
      >
        {Array.from({ length: floor.height }).map((_, y) =>
          Array.from({ length: floor.width }).map((_, x) => {
            const room = getRoomForCell(x, y)
            const workstation = getWorkstationForCell(x, y)
            const landmark = (floor.landmarks || []).find(l => l.x === x && l.y === y)
            const roomBorders = getRoomBorders(x, y, room)

            const inPreview = isInPreview(x, y)
            const isBorder = isPreviewBorder(x, y)

            let cellClass = "w-12 h-12 border border-gray-300 dark:border-gray-600 flex items-center justify-center relative"
            if (workstation || landmark || room) {
              cellClass += " cursor-pointer"
            } else {
              cellClass += " hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            }

            let bg = 'transparent'
            if (room) {
              bg = (colors[room.type] || '#CCCCCC') + '40'
            }

            return (
              <div
                key={`${x}-${y}`}
                className={cellClass}
                onClick={(e) => handleCellClick(x, y, e)}
                onMouseEnter={() => handleCellHover(x, y)}
                style={{ backgroundColor: bg }}
              >
                {/* ПРЕДПРОСМОТР КОМНАТЫ */}
                {inPreview && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ 
                        backgroundColor: (colors[selectedTool] || '#3B82F6') + '30'
                      }}
                    />
                    {isBorder && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ 
                          borderTop: y === previewBounds.minY ? `2px solid ${colors[selectedTool] || '#3B82F6'}` : 'none',
                          borderRight: x === previewBounds.maxX ? `2px solid ${colors[selectedTool] || '#3B82F6'}` : 'none',
                          borderBottom: y === previewBounds.maxY ? `2px solid ${colors[selectedTool] || '#3B82F6'}` : 'none',
                          borderLeft: x === previewBounds.minX ? `2px solid ${colors[selectedTool] || '#3B82F6'}` : 'none'
                        }}
                      />
                    )}
                  </>
                )}

                {/* ГРАНИЦЫ СУЩЕСТВУЮЩИХ КОМНАТ */}
                {room && (
                  <>
                    <div
                      className="absolute inset-0 cursor-pointer z-10"
                      onClick={(e) => { e.stopPropagation(); onWorkstationClick(room) }}
                    >
                      {/* Отображаем номер комнаты только в левом верхнем углу */}
                      {x === room.x && y === room.y && (
                        <div className="absolute top-1 left-1 text-xs font-bold text-gray-800 dark:text-gray-200 z-20">
                          {room.number}
                        </div>
                      )}
                    </div>
                    
                    {/* Рамка комнаты */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderTop: roomBorders.top ? `2px solid ${colors[room.type] || '#000000'}` : 'none',
                        borderRight: roomBorders.right ? `2px solid ${colors[room.type] || '#000000'}` : 'none',
                        borderBottom: roomBorders.bottom ? `2px solid ${colors[room.type] || '#000000'}` : 'none',
                        borderLeft: roomBorders.left ? `2px solid ${colors[room.type] || '#000000'}` : 'none'
                      }}
                    />
                  </>
                )}

                {/* РАБОЧИЕ МЕСТА */}
                {workstation && (
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center text-white text-xs font-medium`}
                    style={{ backgroundColor: colors[workstation.type] }}
                    onClick={(e) => { e.stopPropagation(); onWorkstationClick(workstation) }}
                  >
                    {workstation.number}
                  </div>
                )}

                {/* ОРИЕНТИРЫ */}
                {landmark && (
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); onLandmarkClick(landmark) }}
                  >
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

      {selection.selecting && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-center">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Выделите область. ПКМ или Esc — отмена
          </p>
        </div>
      )}
    </div>
  )
}

export default FloorGrid