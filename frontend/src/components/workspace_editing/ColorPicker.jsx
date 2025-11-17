// frontend\src\components\workspace_editing\ColorPicker.jsx
import React, { useState, useEffect, useRef } from 'react'

const ColorPicker = ({ color, onChange }) => {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef(null)
  
  // Совсем разные цвета из разных палитр
  const presetColors = [
    '#3B82F6', // Синий
    '#EF4444', // Красный
    '#10B981', // Зеленый
    '#F59E0B', // Оранжевый
    '#8B5CF6', // Фиолетовый
    '#EC4899', // Розовый
    '#06B6D4', // Бирюзовый
    '#84CC16', // Лаймовый
    '#F97316', // Терракотовый
    '#6366F1', // Индиго
    '#DC2626', // Темно-красный
    '#EA580C', // Тыквенный
    '#D97706', // Янтарный
    '#65A30D', // Оливковый
    '#16A34A', // Изумрудный
    '#059669', // Темно-зеленый
    '#0D9488', // Бирюзово-зеленый
    '#0891B2', // Голубой
    '#0284C7', // Темно-синий
    '#7C3AED'  // Темно-фиолетовый
  ]

  // Закрытие пикера при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={pickerRef}>
      {/* Квадратик цвета - кнопка для открытия пикера */}
      <button
        className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-500 shadow-sm hover:scale-110 transition-transform cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
        title="Изменить цвет"
      />
      
      {/* Выпадающий color picker */}
      {showPicker && (
        <div className="absolute left-0 top-8 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 w-48">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((presetColor, index) => (
              <button
                key={index}
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor)
                  setShowPicker(false)
                }}
                title={presetColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPicker