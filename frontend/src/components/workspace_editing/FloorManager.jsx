// frontend\src\components\workspace_editing\FloorManager.jsx
import React from 'react'

const FloorManager = ({ floors, currentFloorIndex, onFloorSelect, onAddFloor, onDeleteFloor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Этажи
        </h2>
        <button
          onClick={onAddFloor}
          className="px-3 py-1 bg-[#645391] hover:bg-[#52447a] text-white rounded-lg text-sm cursor-pointer"
        >
          + Добавить
        </button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {floors.map((floor, index) => (
          <div
            key={floor.id}
            className={`flex justify-between items-center p-2 rounded-lg cursor-pointer ${
              currentFloorIndex === index
                ? 'bg-[#645391] bg-opacity-20 border border-[#645391]'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => onFloorSelect(index)}
          >
            <span className="text-sm text-black dark:text-white">
              Этаж {floor.level}
            </span>
            {floors.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteFloor(index)
                }}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FloorManager