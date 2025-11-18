import React, { useState, useEffect } from 'react'
import { calculateBookingPrice } from '../../api/booking'
import PaymentModal from './PaymentModal'
import { useAuth } from '../../context/AuthContext'

const BookingPanel = ({
  selectedWorkstation,
  bookingDuration,
  onDurationChange,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  onBook,
  isWorkstationBooked,
  isRoomBookedAtTime,
  coworkingCenterId,
  calculatedPrices,
  availabilityStatus = {}
}) => {
  const { token } = useAuth()
  const [priceData, setPriceData] = useState(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [appliedDiscounts, setAppliedDiscounts] = useState([])

  const getWorkstationTypeText = (type) => {
    switch (type) {
      case 'DESK': return 'Рабочий стол'
      case 'COMPUTER_DESK': return 'Стол с компьютером'
      case 'MEETING_ROOM': return 'Переговорная комната'
      case 'CONFERENCE_ROOM': return 'Конференц-зал'
      default: return type
    }
  }

  const calculateBasePrice = (workstation) => {
    if (workstation.type === 'MEETING_ROOM' || workstation.type === 'CONFERENCE_ROOM') {
      return workstation.basePricePerHour || 1000;
    }
    
    if (workstation.type === 'DESK' || workstation.type === 'COMPUTER_DESK') {
      switch (bookingDuration) {
        case 'day': return workstation.basePricePerDay || 0
        case 'week': return workstation.basePricePerWeek || 0
        case 'month': return workstation.basePricePerMonth || 0
        default: return workstation.basePricePerDay || 0
      }
    }
    
    return 0
  }

  const getDurationText = () => {
    switch (bookingDuration) {
      case 'day': return 'день'
      case 'week': return 'неделю'
      case 'month': return 'месяц'
      default: return 'день'
    }
  }

  // Загрузка данных о стоимости при изменении параметров
  useEffect(() => {
    const fetchPriceData = async () => {
      if (!selectedWorkstation || !selectedDate) {
        setPriceData(null)
        setAppliedDiscounts([])
        return
      }
      try {
        setLoadingPrice(true)
        
        if (!token) {
          console.error('No token from AuthContext')
          setPriceData(null)
          setAppliedDiscounts([])
          return
        }
       
        let startTime = new Date(selectedDate)
        if (selectedTime && (selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM')) {
          const [hours, minutes] = selectedTime.split(':').map(Number)
          startTime.setHours(hours, minutes, 0, 0)
        } else {
          startTime.setHours(9, 0, 0, 0)
        }

        const priceResult = await calculateBookingPrice(
          selectedWorkstation.id,
          bookingDuration,
          startTime.toISOString(),
          token
        )
       
        if (priceResult && typeof priceResult.finalPrice !== 'undefined') {
          setPriceData(priceResult)
          
          // Если есть примененные скидки, загружаем их названия
          if (priceResult.discountsApplied > 0 && priceResult.appliedDiscounts) {
            setAppliedDiscounts(priceResult.appliedDiscounts)
          } else {
            setAppliedDiscounts([])
          }
        } else {
          console.error('Invalid price data structure:', priceResult)
          setPriceData(null)
          setAppliedDiscounts([])
        }
      } catch (error) {
        console.error('Error fetching price data:', error)
        setPriceData(null)
        setAppliedDiscounts([])
      } finally {
        setLoadingPrice(false)
      }
    }
    fetchPriceData()
  }, [selectedWorkstation, bookingDuration, selectedDate, selectedTime])

  // Функция для расчета времени окончания
  const calculateEndTime = () => {
    if (!selectedWorkstation || !selectedDate) return null

    const startTime = new Date(selectedDate)
    const endTime = new Date(selectedDate)

    if (selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM') {
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number)
        startTime.setHours(hours, minutes, 0, 0)
        endTime.setHours(hours + 1, minutes, 0, 0)
      } else {
        return null
      }
    } else {
      startTime.setHours(9, 0, 0, 0)
      endTime.setHours(18, 0, 0, 0)
      
      switch (bookingDuration) {
        case 'day':
          endTime.setDate(endTime.getDate() + 1)
          endTime.setHours(0, 0, 0, 0)
          break
        case 'week':
          endTime.setDate(endTime.getDate() + 7)
          endTime.setHours(0, 0, 0, 0)
          break
        case 'month':
          endTime.setMonth(endTime.getMonth() + 1)
          endTime.setHours(0, 0, 0, 0)
          break
        default:
          endTime.setDate(endTime.getDate() + 1)
          endTime.setHours(0, 0, 0, 0)
      }
    }

    return { startTime, endTime }
  }

  // Функция для отображения примененных скидок
  const renderAppliedDiscounts = () => {
    if (!priceData || priceData.discountPercentage <= 0 || appliedDiscounts.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Примененные скидки:
        </div>
        <div className="space-y-1">
          {appliedDiscounts.map((discount, index) => (
            <div key={discount.id || index} className="flex justify-between items-center text-sm">
              <span className="text-green-600 dark:text-green-400">
                {discount.name}
              </span>
              <span className="font-medium">
                -{discount.percentage}%
                {discount.discountAmount && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({discount.discountAmount}₽)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleBookClick = async () => {
    if (!selectedWorkstation || !selectedDate) {
      alert('Пожалуйста, выберите дату начала бронирования')
      return
    }
    
    if ((selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM') && !selectedTime) {
      alert('Пожалуйста, выберите время начала бронирования')
      return
    }

    if (!coworkingCenterId) {
      alert('Ошибка: не указан коворкинг-центр')
      return
    }

    if (availabilityStatus.isAvailable === false) {
      alert('К сожалению, это рабочее место стало недоступно для выбранного периода. Пожалуйста, выберите другое время или место.')
      return
    }

    const timeRange = calculateEndTime()
    if (!timeRange) {
      alert('Ошибка расчета времени бронирования')
      return
    }

    const finalPrice = priceData ? priceData.finalPrice : calculateBasePrice(selectedWorkstation)
    const basePrice = priceData ? priceData.basePrice : calculateBasePrice(selectedWorkstation)
    const discountPercentage = priceData ? priceData.discountPercentage : 0

    setBookingDetails({
      coworkingCenterId: coworkingCenterId,
      workstationId: selectedWorkstation.id,
      startTime: timeRange.startTime.toISOString(),
      endTime: timeRange.endTime.toISOString(),
      bookingDuration: bookingDuration,
      basePrice: basePrice,
      finalPrice: finalPrice,
      discountPercentage: discountPercentage,
      appliedDiscounts: appliedDiscounts,
      workstation: selectedWorkstation,
      selectedTime: selectedTime,
      priceData: priceData
    })

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (createdBooking) => {
    setShowPaymentModal(false)
    onBook(createdBooking)
  }

  const handlePaymentClose = () => {
    setShowPaymentModal(false)
    setBookingDetails(null)
  }

  if (!selectedWorkstation) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">
            Нажмите на любое доступное место на плане для бронирования
          </p>
        </div>
      </div>
    )
  }

  const isBookedAllDay = isWorkstationBooked(selectedWorkstation)
  const isTimeBooked = selectedTime && isRoomBookedAtTime && isRoomBookedAtTime(selectedWorkstation, selectedTime)

  const getAvailabilityStatus = () => {
    if (availabilityStatus.error) {
      return { text: 'Ошибка проверки доступности', color: 'text-red-600' }
    }
    
    if (availabilityStatus.isAvailable === false) {
      return { text: 'Место занято на выбранный период', color: 'text-red-600' }
    }
    
    if (availabilityStatus.isAvailable === true) {
      return { text: 'Место доступно для бронирования', color: 'text-green-600' }
    }
    
    return { text: 'Проверка доступности...', color: 'text-gray-600' }
  }

  const availability = getAvailabilityStatus()

  const getDurationOptions = () => {
    const options = []
    
    if (selectedWorkstation.type === 'DESK' || selectedWorkstation.type === 'COMPUTER_DESK') {
      options.push(
        { duration: 'day', label: 'День', price: selectedWorkstation.basePricePerDay || 0 },
        { duration: 'week', label: 'Неделя', price: selectedWorkstation.basePricePerWeek || 0 },
        { duration: 'month', label: 'Месяц', price: selectedWorkstation.basePricePerMonth || 0 }
      )
    }
    else if (selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM') {
      options.push(
        { duration: 'day', label: '1 час', price: selectedWorkstation.basePricePerHour || 0 }
      )
    }
    
    return options
  }

  const durationOptions = getDurationOptions()

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Место №{selectedWorkstation.number}
          {isBookedAllDay && (
            <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded">Занято</span>
          )}
        </h2>

        {/* Статус доступности */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className={`text-sm font-medium ${availability.color}`}>
            {availability.text}
          </p>
          {availabilityStatus.conflictingBooking && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Конфликт с бронированием: {new Date(availabilityStatus.conflictingBooking.startTime).toLocaleString('ru-RU')}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Тип:</span>
            <p className="text-gray-800 dark:text-white font-medium">
              {getWorkstationTypeText(selectedWorkstation.type)}
            </p>
          </div>

          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Вместимость:</span>
            <p className="text-gray-800 dark:text-white font-medium">
              {selectedWorkstation.capacity} {selectedWorkstation.capacity === 1 ? 'человек' : 'человек'}
            </p>
          </div>

          {(selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM') && (
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Размер:</span>
              <p className="text-gray-800 dark:text-white font-medium">
                {selectedWorkstation.width} × {selectedWorkstation.height} клеток
              </p>
            </div>
          )}
        </div>

        {/* Выбор длительности с ценами */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM' 
              ? 'Длительность бронирования:' 
              : 'Период бронирования:'}
          </label>
          <div className="space-y-2">
            {durationOptions.map(({ duration, label, price }) => (
              <button
                key={duration}
                onClick={() => onDurationChange(duration)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 cursor-pointer flex justify-between items-center ${
                  bookingDuration === duration
                    ? 'bg-[#645391] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{label}</span>
                <span className="font-semibold">{price}₽</span>
              </button>
            ))}
          </div>
        </div>

        {/* Итоговая стоимость с отображением скидок */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          {loadingPrice ? (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#645391] mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Расчет скидок...</p>
            </div>
          ) : priceData ? (
            <>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Базовая стоимость:</span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    {priceData.basePrice}₽
                  </span>
                </div>
                
                {priceData.discountPercentage > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Общая скидка:</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        -{priceData.discountAmount.toFixed(0)}₽ ({priceData.discountPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    
                    {/* Отображаем названия примененных скидок */}
                    {renderAppliedDiscounts()}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      Применено скидок: {priceData.discountsApplied}
                    </div>
                  </>
                )}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 dark:text-white font-semibold">Итоговая стоимость:</span>
                  <span className="text-2xl font-bold text-[#645391] dark:text-[#A1E1DE]">
                    {priceData.finalPrice.toFixed(0)}₽
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                  за {getDurationText()}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Итоговая стоимость:</span>
                <span className="text-2xl font-bold text-[#645391] dark:text-[#A1E1DE]">
                  {calculateBasePrice(selectedWorkstation)}₽
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                за {getDurationText()}
              </p>
            </div>
          )}
        </div>

        {/* Кнопка бронирования */}
        <button
          onClick={handleBookClick}
          disabled={!selectedDate || isBookedAllDay || isTimeBooked || 
                   ((selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM') && !selectedTime) ||
                   availabilityStatus.isAvailable === false}
          className="w-full py-4 bg-[#645391] hover:bg-[#52447a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
        >
          {isBookedAllDay ? 'Место занято' : 
           isTimeBooked ? 'Выбранное время занято' :
           availabilityStatus.isAvailable === false ? 'Недоступно для периода' :
           `Перейти к оплате ${priceData ? priceData.finalPrice.toFixed(0) : calculateBasePrice(selectedWorkstation)}₽`}
        </button>

        {isBookedAllDay && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 text-center">
              Это место уже забронировано на выбранную дату
            </p>
          </div>
        )}

        {(selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM') && !selectedTime && !isBookedAllDay && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
              Выберите время
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно оплаты */}
      {bookingDetails && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          bookingDetails={bookingDetails}
          appliedDiscounts={appliedDiscounts}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}

export default BookingPanel