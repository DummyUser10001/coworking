import express from 'express'
import { BookingService } from '../services/bookingService.js'

const router = express.Router()
const bookingService = new BookingService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить все бронирования пользователя' */
  try {
    const bookings = await bookingService.getUserBookings(req.userId)
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

router.get('/all', async (req, res) => {
  /* #swagger.summary = 'Получить все бронирования (для менеджеров)' */
  try {
    const bookings = await bookingService.getAllBookings(req.userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    
    if (error.message === 'Access denied') {
      res.status(403).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }
});

router.get('/:id', async (req, res) => {
  /* #swagger.summary = 'Получить конкретное бронирование' */
  const { id } = req.params
  try {
    const booking = await bookingService.getBookingById(id, req.userId)
    res.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    
    if (error.message === 'Booking not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message === 'Access denied') {
      res.status(403).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch booking' })
    }
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать новое бронирование' */
  const {
    coworkingCenterId,
    workstationId,
    startTime,
    endTime,
    bookingDuration,
    basePrice,
    discountPercentage = 0,
    finalPrice
  } = req.body
  
  try {
    const booking = await bookingService.createBooking(req.userId, {
      coworkingCenterId,
      workstationId,
      startTime,
      endTime,
      bookingDuration,
      basePrice,
      discountPercentage,
      finalPrice
    })
    
    if (booking.error) {
      return res.status(409).json({ 
        error: booking.error,
        conflictingBooking: booking.conflictingBooking
      })
    }
    
    res.status(201).json(booking)
    
  } catch (error) {
    console.error('Error creating booking:', error)
    
    if (error.message === 'Workstation not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to create booking' })
    }
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить статус бронирования' */
  const { id } = req.params
  const { status } = req.body
  try {
    const booking = await bookingService.updateBookingStatus(id, req.userId, status)
    res.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    
    if (error.message === 'Booking not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message === 'Access denied') {
      res.status(403).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to update booking' })
    }
  }
})
 
router.put('/:id/cancel', async (req, res) => {
  /* #swagger.summary = 'Отменить бронь ' */
  const { id } = req.params;

  try {
    const result = await bookingService.cancelBooking(id, req.userId);
    return res.json(result);

  } catch (error) {
    console.error('Ошибка при отмене брони:', error);
    
    if (error.message === 'Бронь не найдена') {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === 'Уже отменено') {
      return res.status(400).json({ error: error.message })
    }
    if (error.message === 'Доступ запрещён') {
      return res.status(403).json({ error: error.message })
    }
    if (error.message === 'Бронь уже завершена — отмена невозможна') {
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(500).json({ error: 'Ошибка сервера при отмене' });
  }
});

router.get('/check-availability/:workstationId', async (req, res) => {
  /* #swagger.summary = 'Проверить доступность рабочего места' */
  const { workstationId } = req.params
  const { startTime, endTime, excludeBookingId } = req.query

  try {
    const result = await bookingService.checkAvailability(workstationId, startTime, endTime, excludeBookingId)
    res.json(result)
  } catch (error) {
    console.error('Error checking availability:', error)
    
    if (error.message === 'Workstation not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to check availability' })
    }
  }
})

router.post('/calculate-price', async (req, res) => {
  /* #swagger.summary = 'Рассчитать стоимость со скидками' */
  const { workstationId, bookingDuration, startTime } = req.body;

  try {
    const result = await bookingService.calculatePrice(workstationId, bookingDuration, startTime);
    res.json(result);
  } catch (error) {
    console.error('Error calculating price:', error);
    
    if (error.message === 'Workstation not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to calculate price' });
    }
  }
});

router.get('/coworking/:coworkingCenterId', async (req, res) => {
  /* #swagger.summary = 'Получить бронирования для коворкинг-центра' */
  const { coworkingCenterId } = req.params
  const { date } = req.query

  try {
    const bookings = await bookingService.getCoworkingCenterBookings(coworkingCenterId, date)
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching coworking center bookings:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

router.get('/coworking/:coworkingCenterId/workstation/:workstationId', async (req, res) => {
  /* #swagger.summary = 'Получить бронирования конкретного рабочего места' */
  const { coworkingCenterId, workstationId } = req.params
  const { startDate, endDate } = req.query

  try {
    const bookings = await bookingService.getWorkstationBookings(coworkingCenterId, workstationId, startDate, endDate)
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching workstation bookings:', error)
    res.status(500).json({ error: 'Failed to fetch workstation bookings' })
  }
})

export default router