import React, { useState, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ru } from 'date-fns/locale'

const CalendarPanel = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  selectedWorkstation,
  bookings,
  isRoomBookedAtTime,
  getRoomBookedTimes,
  coworkingCenter,
}) => {
  // -----------------------------------------------------------------
  // 1. Динамический график работы
  // -----------------------------------------------------------------
  const openingTime = coworkingCenter?.openingTime || '09:00'
  const closingTime = coworkingCenter?.closingTime || '18:00'

  const [openH] = openingTime.split(':').map(Number)
  const [closeH] = closingTime.split(':').map(Number)

  const availableTimes = []
  for (let h = openH; h < closeH; h++) {
    availableTimes.push(`${h.toString().padStart(2, '0')}:00`)
  }

  // -----------------------------------------------------------------
  // 2. Проверка - отключать сегодня после закрытия
  // -----------------------------------------------------------------
  const isTodayDisabled = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Если текущее время позже времени закрытия, отключаем сегодня
    if (currentHour > closeH || (currentHour === closeH && currentMinute > 0)) {
      return true
    }
    
    return false
  }, [closeH])

  const minDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (isTodayDisabled) {
      // Если сегодня уже поздно, минимальная дата - завтра
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }
    
    return today
  }, [isTodayDisabled])

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isTimePassed = (time) => {
    if (!selectedDate || !isToday(selectedDate)) return false

    const [hour, minute] = time.split(':').map(Number)
    const now = new Date()
    const target = new Date(selectedDate)
    target.setHours(hour, minute, 0, 0)
    return target < now
  }

  // -----------------------------------------------------------------
  // 3. Кастомный заголовок
  // -----------------------------------------------------------------
  const CustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => {
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
    return (
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer text-gray-600 dark:text-gray-300 font-bold text-lg disabled:opacity-50"
        >
          ‹
        </button>

        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
          {monthNames[date.getMonth()]} {date.getFullYear()}
        </h4>

        <button
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer text-gray-600 dark:text-gray-300 font-bold text-lg disabled:opacity-50"
        >
          ›
        </button>
      </div>
    )
  }

  // -----------------------------------------------------------------
  // 4. Забронированные времена для выбранной комнаты
  // -----------------------------------------------------------------
  const bookedTimes =
    selectedWorkstation &&
    (selectedWorkstation.type === 'MEETING_ROOM' ||
      selectedWorkstation.type === 'CONFERENCE_ROOM')
      ? getRoomBookedTimes(selectedWorkstation)
      : []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Выбор даты и времени
        </h3>
      </div>

      {/* Информация о доступности сегодня */}
      {isTodayDisabled && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-200 text-center">
            Бронирование на сегодня недоступно после {closingTime}
          </p>
        </div>
      )}

      {/* Календарь */}
      <div className="mb-6 w-full">
        <DatePicker
          selected={selectedDate}
          onChange={onDateChange}
          locale={ru}
          dateFormat="dd.MM.yyyy"
          minDate={minDate}
          inline
          renderCustomHeader={CustomHeader}
          dayClassName={(date) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isTodayDate = date.toDateString() === today.toDateString()
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
            const isPast = date < minDate
            
            let dayClass = "h-10 w-10 flex items-center justify-center rounded-lg cursor-pointer transition-all font-medium mx-auto"

            if (isSelected) {
              dayClass += " bg-[#645391] text-white"
            } else if (isTodayDate && !isTodayDisabled) {
              dayClass += " bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
            } else if (isPast) {
              dayClass += " text-gray-400 dark:text-gray-500 cursor-not-allowed"
            } else {
              dayClass += " text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }
            return dayClass
          }}
          wrapperClassName="w-full"
          calendarClassName="react-datepicker-custom !border-0 !shadow-none bg-transparent w-full"
        />
      </div>

      {/* Время – только для комнат */}
      {selectedDate &&
        selectedWorkstation &&
        (selectedWorkstation.type === 'MEETING_ROOM' ||
          selectedWorkstation.type === 'CONFERENCE_ROOM') && (
          <div className="border-t dark:border-gray-600 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Время начала:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableTimes.map((time) => {
                const isBooked = isRoomBookedAtTime(selectedWorkstation, time)
                const isPassed = isTimePassed(time)
                const isSelected = selectedTime === time
                const disabled = isBooked || isPassed

                let timeClass = "py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer"

                if (isSelected) {
                  timeClass += " bg-[#645391] text-white shadow-lg"
                } else if (isBooked) {
                  timeClass += " bg-red-500 text-white cursor-not-allowed"
                } else if (isPassed) {
                  timeClass += " bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                } else {
                  timeClass += " bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                }

                return (
                  <button
                    key={time}
                    onClick={() => !disabled && onTimeChange(time)}
                    disabled={disabled}
                    className={timeClass}
                    title={
                      isBooked
                        ? 'Это время уже занято'
                        : isPassed
                        ? 'Время уже прошло'
                        : ''
                    }
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </div>
        )}

      {/* Часы работы */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
          Часы работы: {openingTime} – {closingTime}
        </p>
      </div>

      {/* Стили для react-datepicker */}
      <style>{`
        .react-datepicker-custom {
          width: 100% !important;
          border: none !important;
          background: transparent !important;
          font-family: inherit !important;
        }
        .react-datepicker-custom .react-datepicker__month-container { width: 100% !important; }
        .react-datepicker-custom .react-datepicker__header { background: transparent !important; border: none !important; padding: 0 !important; }
        .react-datepicker-custom .react-datepicker__day-names { display: flex !important; justify-content: space-around !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        .react-datepicker-custom .react-datepicker__day-name { color: #6b7280 !important; font-weight: 500 !important; font-size: 0.875rem !important; width: 2.5rem !important; margin: 0 !important; padding: 0.5rem 0 !important; }
        .react-datepicker-custom .react-datepicker__month { margin: 0 !important; width: 100% !important; }
        .react-datepicker-custom .react-datepicker__week { display: flex !important; justify-content: space-around !important; width: 100% !important; }
        .react-datepicker-custom .react-datepicker__day { width: 2.5rem !important; height: 2.5rem !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 0.5rem !important; transition: all 0.2s ease-in-out !important; }
        .react-datepicker-custom .react-datepicker__day--keyboard-selected { background-color: transparent !important; color: inherit !important; }
        .react-datepicker-custom .react-datepicker__day--outside-month { visibility: hidden !important; }
        .react-datepicker-custom .react-datepicker__day--selected { background-color: #645391 !important; color: white !important; }
        .react-datepicker-custom .react-datepicker__day--today { background-color: #dbeafe !important; color: #1e40af !important; }
        .react-datepicker-custom .react-datepicker__day:hover:not(.react-datepicker__day--selected):not(.react-datepicker__day--disabled) { background-color: #f3f4f6 !important; }
        .react-datepicker-custom .react-datepicker__day--selected:hover { background-color: #645391 !important; }
        .react-datepicker-custom .react-datepicker__day--disabled { color: #d1d5db !important; cursor: not-allowed !important; }
        .dark .react-datepicker-custom .react-datepicker__day-name { color: #9ca3af !important; }
        .dark .react-datepicker-custom .react-datepicker__day { color: white !important; }
        .dark .react-datepicker-custom .react-datepicker__day--today { background-color: #1e3a8a !important; color: #dbeafe !important; }
        .dark .react-datepicker-custom .react-datepicker__day:hover:not(.react-datepicker__day--selected):not(.react-datepicker__day--disabled) { background-color: #374151 !important; color: white !important; }
        .dark .react-datepicker-custom .react-datepicker__day--selected:hover { background-color: #645391 !important; color: white !important; }
        .dark .react-datepicker-custom .react-datepicker__day--disabled { color: #4b5563 !important; }
        .dark .react-datepicker-custom .react-datepicker__day--outside-month { color: transparent !important; }
      `}</style>
    </div>
  )
}

export default CalendarPanel