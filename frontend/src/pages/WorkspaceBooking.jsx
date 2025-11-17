import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FloorSelector from '../components/workspace_booking/FloorSelector'
import WorkspacePlan from '../components/workspace_booking/WorkspacePlan'
import BookingPanel from '../components/workspace_booking/BookingPanel'
import CalendarPanel from '../components/workspace_booking/CalendarPanel'
import {
  getCoworkingCenter,
  getFloors
} from '../api/coworking.js'
import {
  getWorkstations
} from '../api/workspace.js'
import {
  getColorSettings
} from '../api/colors.js'
import {
  getBookingsByCoworkingAndDate,
  calculateBookingPrice,
  checkAvailability,
  createBooking // ИМПОРТИРУЕМ createBooking
} from '../api/booking.js'
import { useAuth } from '../context/AuthContext'

const WorkspaceBooking = ({ theme }) => {
  const [colors, setColors] = useState({
    DESK: '#3B82F6',
    COMPUTER_DESK: '#10B981',
    MEETING_ROOM: '#8B5CF6',
    CONFERENCE_ROOM: '#F59E0B'
  })
  const [selectedCoworking, setSelectedCoworking] = useState(null)
  const [floors, setFloors] = useState([])
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0)
  const [selectedWorkstation, setSelectedWorkstation] = useState(null)
  const [bookingDuration, setBookingDuration] = useState('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [calculatedPrices, setCalculatedPrices] = useState(null)
  const [availabilityStatus, setAvailabilityStatus] = useState({})
  const navigate = useNavigate()
  const location = useLocation()
  const { coworkingId } = location.state || {}
  const { token } = useAuth()
  const currentFloor = floors[currentFloorIndex] || null

  // -----------------------------------------------------------------
  //  Вспомогательные функции для работы с датами
  // -----------------------------------------------------------------
  
  const getDateWithoutTime = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const isSameDate = (date1, date2) => {
    return getDateWithoutTime(date1).getTime() === getDateWithoutTime(date2).getTime()
  }

  // -----------------------------------------------------------------
  //  Загрузка данных
  // -----------------------------------------------------------------
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
          setError('Не выбран коворкинг-центр для бронирования')
          setLoading(false)
          return
        }

        const [coworkingCenter, colorSettings, floorsData] = await Promise.all([
          getCoworkingCenter(coworkingId, token),
          getColorSettings(token),
          getFloors(coworkingId, token)
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
              return { ...floor, workstations: [], landmarks: [] }
            }
          })
        )

        setSelectedCoworking(coworkingCenter)
        setFloors(floorsWithWorkstations)

        if (colorSettings && colorSettings.workstations) {
          setColors(prev => ({ ...prev, ...colorSettings.workstations }))
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Ошибка загрузки данных: ' + (err.message || 'Неизвестная ошибка'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [coworkingId, navigate, token])

  // -----------------------------------------------------------------
  //  Загрузка броней
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedCoworking || !selectedDate) return
      try {
        if (!token) return
        
        const dateString = selectedDate.toLocaleDateString('ru-RU').split('.').reverse().join('-')
        const bookingsData = await getBookingsByCoworkingAndDate(
          selectedCoworking.id,
          dateString,
          token
        )
        setBookings(bookingsData)
      } catch (err) {
        console.error('Error fetching bookings:', err)
      }
    }
    fetchBookings()
  }, [selectedCoworking, selectedDate, token])

  // -----------------------------------------------------------------
  //  Проверка доступности при изменении параметров бронирования
  // -----------------------------------------------------------------
  useEffect(() => {
    const checkWorkstationAvailability = async () => {
      if (!selectedWorkstation || !selectedDate) {
        setAvailabilityStatus({})
        return
      }

      try {
        const startTime = new Date(selectedDate)
        const endTime = new Date(selectedDate)

        // Устанавливаем время начала и окончания в зависимости от типа рабочего места и длительности
        if (selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM') {
          if (selectedTime) {
            const [hours, minutes] = selectedTime.split(':').map(Number)
            startTime.setHours(hours, minutes, 0, 0)
            endTime.setHours(hours + 1, minutes, 0, 0) // 1 час для комнат
          } else {
            // Если время не выбрано, используем рабочий день
            startTime.setHours(9, 0, 0, 0)
            endTime.setHours(18, 0, 0, 0)
          }
        } else {
          // Для столов устанавливаем период в зависимости от длительности
          startTime.setHours(0, 0, 0, 0)
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

        const availability = await checkAvailability(
          selectedWorkstation.id,
          startTime.toISOString(),
          endTime.toISOString(),
          token
        )

        setAvailabilityStatus({
          isAvailable: availability.isAvailable,
          conflictingBooking: availability.conflictingBooking,
          checkedAt: new Date()
        })

      } catch (error) {
        console.error('Error checking availability:', error)
        setAvailabilityStatus({
          isAvailable: false,
          error: 'Ошибка проверки доступности',
          checkedAt: new Date()
        })
      }
    }

    checkWorkstationAvailability()
  }, [selectedWorkstation, selectedDate, selectedTime, bookingDuration, token])

  // -----------------------------------------------------------------
  //  Переключение этажей
  // -----------------------------------------------------------------
  useEffect(() => {
    if (floors.length > 0 && currentFloorIndex >= floors.length) {
      setCurrentFloorIndex(0)
    }
  }, [floors, currentFloorIndex])

  // -----------------------------------------------------------------
  //  Расчёт цены
  // -----------------------------------------------------------------
  useEffect(() => {
    const calculatePrices = async () => {
      if (!selectedWorkstation || !selectedDate) return
      try {
        if (!token) return
        let startTime = new Date(selectedDate)
        if (selectedTime && (selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM')) {
          const [hours, minutes] = selectedTime.split(':').map(Number)
          startTime.setHours(hours, minutes, 0, 0)
        } else {
          startTime.setHours(9, 0, 0, 0)
        }
        const priceData = await calculateBookingPrice(
          selectedWorkstation.id,
          bookingDuration,
          startTime.toISOString(),
          token
        )
        setCalculatedPrices(priceData)
      } catch (error) {
        console.error('Error calculating prices:', error)
      }
    }
    calculatePrices()
  }, [selectedWorkstation, bookingDuration, selectedDate, selectedTime, token])

  // -----------------------------------------------------------------
  //  Бронирование - ОБНОВЛЕННАЯ ФУНКЦИЯ
  // -----------------------------------------------------------------
  const handleBook = async (createdBooking = null) => {
    try {
      if (createdBooking) {
        setSelectedWorkstation(null)
        setSelectedTime('')
        setCalculatedPrices(null)
        setAvailabilityStatus({})

        if (token && selectedCoworking) {
          const dateString = selectedDate.toLocaleDateString('ru-RU').split('.').reverse().join('-')
          const bookingsData = await getBookingsByCoworkingAndDate(
            selectedCoworking.id,
            dateString,
            token
          )
          setBookings(bookingsData)
        }
        return
      }

      if (!token) throw new Error('Требуется авторизация')

      // Проверяем доступность перед бронированием
      if (!availabilityStatus.isAvailable) {
        alert('К сожалению, это рабочее место стало недоступно для выбранного периода. Пожалуйста, выберите другое время или место.')
        return
      }

      let startTime = new Date(selectedDate)
      let endTime = new Date(selectedDate)

      if (selectedTime && (selectedWorkstation.type === 'MEETING_ROOM' || selectedWorkstation.type === 'CONFERENCE_ROOM')) {
        const [hours, minutes] = selectedTime.split(':').map(Number)
        startTime.setHours(hours, minutes, 0, 0)
        endTime.setHours(hours + 1, minutes, 0, 0)
      } else {
        startTime.setHours(9, 0, 0, 0)
        endTime.setHours(18, 0, 0, 0)
        
        // Для длительных бронирований столов устанавливаем правильный endTime
        if (selectedWorkstation.type === 'DESK' || selectedWorkstation.type === 'COMPUTER_DESK') {
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
          }
        }
      }

      // Создаем бронирование через API
      const bookingData = {
        coworkingCenterId: selectedCoworking.id,
        workstationId: selectedWorkstation.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookingDuration: bookingDuration,
        basePrice: calculatedPrices ? calculatedPrices.basePrice : calculateBasePrice(selectedWorkstation),
        discountPercentage: calculatedPrices ? calculatedPrices.discountPercentage : 0,
        finalPrice: calculatedPrices ? calculatedPrices.finalPrice : calculateBasePrice(selectedWorkstation)
      }

      console.log('Creating booking with data:', bookingData)

      const newBooking = await createBooking(bookingData, token)
      
      alert(`Бронирование места №${selectedWorkstation.number} успешно!\nДата: ${selectedDate.toLocaleDateString('ru-RU')}\nТип: ${bookingDuration}\nСтоимость: ${bookingData.finalPrice.toFixed(0)}₽`)

      setSelectedWorkstation(null)
      setSelectedTime('')
      setCalculatedPrices(null)
      setAvailabilityStatus({})

      // Обновляем список бронирований
      const dateString = selectedDate.toLocaleDateString('ru-RU').split('.').reverse().join('-')
      const bookingsData = await getBookingsByCoworkingAndDate(
        selectedCoworking.id,
        dateString,
        token
      )
      setBookings(bookingsData)

    } catch (error) {
      console.error('Error during booking:', error)
      alert('Ошибка при бронировании: ' + error.message)
    }
  }

  const calculateBasePrice = (workstation) => {
    switch (bookingDuration) {
      case 'day': return workstation.basePricePerDay
      case 'week': return workstation.basePricePerWeek
      case 'month': return workstation.basePricePerMonth
      default: return workstation.basePricePerDay
    }
  }

  // -----------------------------------------------------------------
  //  Проверка занятости
  // -----------------------------------------------------------------
  const isWorkstationBooked = (workstation) => {
    if (!selectedDate || !workstation || !bookings.length) return false
    
    const selectedDateUTC = getDateWithoutTime(selectedDate)
    
    const workstationBookings = bookings.filter(booking => {
      if (booking.workstation.id !== workstation.id || booking.status !== 'ACTIVE') return false
      
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      
      const bookingStartUTC = getDateWithoutTime(bookingStart)
      const bookingEndUTC = getDateWithoutTime(bookingEnd)
      
      return selectedDateUTC >= bookingStartUTC && selectedDateUTC <= bookingEndUTC
    })
    
    // Для комнат (MEETING_ROOM, CONFERENCE_ROOM) проверяем занятость на весь день
    if (workstation.type === 'MEETING_ROOM' || workstation.type === 'CONFERENCE_ROOM') {
      if (workstationBookings.length === 0) return false
      
      const openingTime = selectedCoworking?.openingTime || '09:00'
      const closingTime = selectedCoworking?.closingTime || '18:00'
      const [openHour, openMinute] = openingTime.split(':').map(Number)
      const [closeHour, closeMinute] = closingTime.split(':').map(Number)
      
      const workDayStart = openHour * 60 + openMinute
      const workDayEnd = closeHour * 60 + closeMinute
      const totalMinutes = workDayEnd - workDayStart
      const occupied = new Array(totalMinutes).fill(false)
      
      workstationBookings.forEach(booking => {
        const start = new Date(booking.startTime)
        const end = new Date(booking.endTime)
        
        if (isSameDate(start, selectedDate)) {
          const bookingStartMinutes = start.getHours() * 60 + start.getMinutes()
          const bookingEndMinutes = end.getHours() * 60 + end.getMinutes()
          
          const startInWorkDay = Math.max(bookingStartMinutes, workDayStart)
          const endInWorkDay = Math.min(bookingEndMinutes, workDayEnd)
          
          for (let minute = startInWorkDay; minute < endInWorkDay; minute++) {
            const index = minute - workDayStart
            if (index >= 0 && index < totalMinutes) {
              occupied[index] = true
            }
          }
        }
      })
      
      return occupied.every(isOccupied => isOccupied)
    }
    
    // Для столов (DESK, COMPUTER_DESK) - занято, если есть любое бронирование на эту дату
    return workstationBookings.length > 0
  }

  const isRoomBookedAtTime = (workstation, time) => {
    if (!selectedDate || !workstation || !time || !bookings.length) return false
    if (workstation.type !== 'MEETING_ROOM' && workstation.type !== 'CONFERENCE_ROOM') return false
    
    const [selectedHour, selectedMinute] = time.split(':').map(Number)
    const selectedDateTime = new Date(selectedDate)
    selectedDateTime.setHours(selectedHour, selectedMinute, 0, 0)
    
    return bookings.some(booking => {
      if (booking.workstation.id !== workstation.id || booking.status !== 'ACTIVE') return false
      
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      
      return isSameDate(selectedDateTime, bookingStart) && 
             selectedDateTime >= bookingStart && 
             selectedDateTime < bookingEnd
    })
  }

  const getRoomBookedTimes = (workstation) => {
    if (!selectedDate || !workstation || !bookings.length) return []
    if (workstation.type !== 'MEETING_ROOM' && workstation.type !== 'CONFERENCE_ROOM') return []
    
    const bookedTimes = []
    bookings.forEach(booking => {
      if (
        booking.workstation.id === workstation.id &&
        booking.status === 'ACTIVE' &&
        isSameDate(new Date(booking.startTime), selectedDate)
      ) {
        const start = new Date(booking.startTime)
        const end = new Date(booking.endTime)
        bookedTimes.push({
          id: booking.id,
          start: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
          end: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
          user: booking.user
        })
      }
    })
    return bookedTimes
  }

  // -----------------------------------------------------------------
  //  Рендер
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Загрузка планировки...
          </h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error}
          </h1>
          <button
            onClick={() => navigate('/map')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Вернуться к карте
          </button>
        </div>
      </div>
    )
  }

  if (floors.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Нет доступных этажей
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {selectedCoworking
              ? `В коворкинг-центре "${selectedCoworking.address}" пока нет настроенных этажей`
              : 'Коворкинг-центр не найден'}
          </p>
          <button
            onClick={() => navigate('/map')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Вернуться к карте
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Бронирование рабочего места
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            {selectedCoworking?.address || 'Коворкинг-центр'}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {currentFloor ? `Этаж ${currentFloor.level}` : 'Загрузка этажа...'}
          </p>
        </div>

        <div className="mb-6">
          <FloorSelector
            floors={floors}
            currentFloorIndex={currentFloorIndex}
            onFloorSelect={setCurrentFloorIndex}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Календарь */}
          <div className="lg:w-1/4">
            <CalendarPanel
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
              selectedWorkstation={selectedWorkstation}
              bookings={bookings}
              isRoomBookedAtTime={isRoomBookedAtTime}
              getRoomBookedTimes={getRoomBookedTimes}
              coworkingCenter={selectedCoworking}  
            />
          </div>

          {/* План */}
          <div className="lg:w-2/4">
            {currentFloor ? (
              <WorkspacePlan
                floor={currentFloor}
                colors={colors}
                selectedWorkstation={selectedWorkstation}
                onWorkstationSelect={setSelectedWorkstation}
                selectedDate={selectedDate}
                bookings={bookings}
                isWorkstationBooked={isWorkstationBooked}
                getRoomBookedTimes={getRoomBookedTimes}
              />
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-300">Этаж не найден</p>
              </div>
            )}
          </div>

          {/* Панель бронирования */}
          <div className="lg:w-1/4">
            <BookingPanel
              selectedWorkstation={selectedWorkstation}
              bookingDuration={bookingDuration}
              onDurationChange={setBookingDuration}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
              onBook={handleBook}
              isWorkstationBooked={isWorkstationBooked}
              isRoomBookedAtTime={isRoomBookedAtTime}
              coworkingCenterId={coworkingId}
              calculatedPrices={calculatedPrices}
              availabilityStatus={availabilityStatus}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceBooking