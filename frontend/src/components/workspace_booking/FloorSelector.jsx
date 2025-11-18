import React from 'react'

const FloorSelector = ({ floors, currentFloorIndex, onFloorSelect, className = '' }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">
        Выберите этаж
      </h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {floors.map((floor, index) => (
          <button
            key={floor.id}
            onClick={() => onFloorSelect(index)}
            className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              currentFloorIndex === index
                ? 'bg-[#645391] text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Этаж {floor.level}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FloorSelector