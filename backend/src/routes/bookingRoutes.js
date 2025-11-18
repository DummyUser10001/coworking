import express from 'express'
import prisma from '../prismaClient.js'
import calculateDiscountWithPriority from '../discountCalculation.js'
import { calculateRefund } from '../refundCalculation.js'

const router = express.Router()

// GET /bookings - получить все бронирования пользователя
router.get('/', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.userId
      },
      include: {
        coworkingCenter: {
          select: {
            id: true,
            address: true
          }
        },
        workstation: {
          select: {
            id: true,
            number: true,
            type: true,
            capacity: true
          }
        },
        payment: true // Добавляем платеж
      },
      orderBy: {
        startTime: 'desc'
      }
    })
   
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// GET /bookings/:id - получить конкретное бронирование
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        coworkingCenter: {
          select: {
            id: true,
            address: true,
            phone: true,
            email: true
          }
        },
        workstation: {
          select: {
            id: true,
            number: true,
            type: true,
            capacity: true,
            basePricePerDay: true,
            basePricePerWeek: true,
            basePricePerMonth: true
          }
        },
        payment: true // Добавляем платеж
      }
    })
   
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    if (booking.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }
   
    res.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

// POST /bookings - создать новое бронирование
router.post('/', async (req, res) => {
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
    // Проверяем существование рабочего места
    const workstation = await prisma.workstation.findUnique({
      where: { id: workstationId }
    })

    if (!workstation) {
      return res.status(404).json({ error: 'Workstation not found' })
    }

    // ПРОВЕРКА ДОСТУПНОСТИ НА ВЕСЬ ПЕРИОД
    const existingBooking = await prisma.booking.findFirst({
      where: {
        workstationId,
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) }
          }
        ],
        status: {
          in: ['ACTIVE']
        }
      }
    })

    if (existingBooking) {
      return res.status(409).json({ 
        error: 'Workstation is not available for the selected period',
        conflictingBooking: {
          id: existingBooking.id,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime
        }
      })
    }

    // Проверяем цены (опционально)
    let expectedBasePrice
    switch (bookingDuration) {
      case 'day': expectedBasePrice = workstation.basePricePerDay; break
      case 'week': expectedBasePrice = workstation.basePricePerWeek; break
      case 'month': expectedBasePrice = workstation.basePricePerMonth; break
      default: expectedBasePrice = workstation.basePricePerDay
    }

    if (Math.abs(basePrice - expectedBasePrice) > 0.01) {
      console.warn('Base price mismatch. Frontend:', basePrice, 'Expected:', expectedBasePrice)
    }

    // 1. Сначала создаем платеж
    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        basePrice: basePrice,
        discountPercentage: discountPercentage,
        finalPrice: finalPrice,
        currency: "RUB",
        status: 'COMPLETED'
      }
    })

    // 2. Затем создаем бронирование с привязкой к платежу
    const booking = await prisma.booking.create({
      data: {
        userId: req.userId,
        coworkingCenterId,
        workstationId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        paymentId: payment.id, // Обязательная привязка
        status: 'ACTIVE'
      },
      include: {
        coworkingCenter: { select: { address: true } },
        workstation: { select: { number: true, type: true } },
        payment: true // Включаем информацию о платеже
      }
    })

    console.log('Booking created with payment:', {
      bookingId: booking.id,
      paymentId: payment.id,
      finalPrice: finalPrice
    })

    res.status(201).json(booking)
    
  } catch (error) {
    console.error('Error creating booking:', error)
    
    // Если возникла ошибка после создания платежа, пытаемся его удалить
    if (error.message.includes('payment')) {
      try {
        // Здесь нужно найти и удалить созданный платеж
        // Но лучше использовать транзакцию в будущем
      } catch (cleanupError) {
        console.error('Error cleaning up payment:', cleanupError)
      }
    }
    
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// PUT /bookings/:id - обновить бронирование (только статус)
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  try {
    // Проверяем существование бронирования
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true }
    })
    
    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    
    if (existingBooking.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    // Обновляем только статус
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        coworkingCenter: {
          select: {
            address: true
          }
        },
        workstation: {
          select: {
            number: true,
            type: true
          }
        },
        payment: true
      }
    })

    // Если статус меняется на CANCELLED и есть оплата, обновляем статус платежа
    if (status === 'CANCELLED' && existingBooking.payment) {
      await prisma.payment.update({
        where: { id: existingBooking.payment.id },
        data: { status: 'REFUNDED' }
      })
    }
   
    res.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    res.status(500).json({ error: 'Failed to update booking' })
  }
})

// PUT /bookings/:id/cancel - отменить бронирование (универсальный роут)
// PUT /bookings/:id/cancel - отменить бронирование
// PUT /bookings/:id/cancel — отменить бронь (работает даже если уже началась)
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true }
    });

    if (!booking) return res.status(404).json({ error: 'Бронь не найдена' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'Уже отменено' });

    // Проверка прав
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const isManager = user.role === 'ADMIN' || user.role === 'MANAGER';
    const isOwner = booking.userId === req.userId;
    if (!isOwner && !isManager) return res.status(403).json({ error: 'Доступ запрещён' });

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    // Запрещаем отмену только если бронь УЖЕ ЗАКОНЧИЛАСЬ
    if (endTime <= now) {
      return res.status(400).json({ error: 'Бронь уже завершена — отмена невозможна' });
    }

    const cancelledBy = isManager ? 'manager' : 'user';

    // ←←← ВАЖНО: гарантируем, что refund всегда имеет refundAmount
    let refundResult;
    try {
      refundResult = calculateRefund(booking, now, cancelledBy);
    } catch (err) {
      refundResult = { refundAmount: 0 }; // на всякий случай
    }

    const refundAmount = Number(refundResult.refundAmount) || 0;

    // Обновляем бронь
    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Обновляем платёж — только если он был
    if (booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: refundAmount > 0 ? 'REFUNDED' : 'COMPLETED',
          refundAmount: refundAmount > 0 ? refundAmount : null // null если 0
        }
      });
    }

    // Формируем красивый ответ
    const message = refundAmount > 0
      ? (isManager
          ? `Отменено менеджером. Возврат ${refundAmount}₽ (3–5 дней).`
          : `Отменено. Возврат ${refundAmount}₽ (3–5 дней).`)
      : 'Отменено. Возврат не предусмотрен.';

    return res.json({
      message,
      cancelledBy,
      refund: { refundAmount }
    });

  } catch (error) {
    console.error('Ошибка при отмене брони:', error);
    return res.status(500).json({ error: 'Ошибка сервера при отмене' });
  }
});

// GET /bookings/check-availability/:workstationId - проверить доступность рабочего места
router.get('/check-availability/:workstationId', async (req, res) => {
  const { workstationId } = req.params
  const { startTime, endTime, excludeBookingId } = req.query

  try {
    const workstation = await prisma.workstation.findUnique({
      where: { id: workstationId }
    })

    if (!workstation) {
      return res.status(404).json({ error: 'Workstation not found' })
    }

    let whereClause = {
      workstationId,
      OR: [
        {
          startTime: { lt: new Date(endTime) },
          endTime: { gt: new Date(startTime) }
        }
      ],
      status: {
        in: ['ACTIVE']
      }
    }

    if (excludeBookingId) {
      whereClause.NOT = {
        id: excludeBookingId
      }
    }

    const existingBooking = await prisma.booking.findFirst({
      where: whereClause
    })

    const isAvailable = !existingBooking
    
    res.json({
      isAvailable,
      workstation: {
        id: workstation.id,
        number: workstation.number,
        type: workstation.type,
        capacity: workstation.capacity
      },
      conflictingBooking: existingBooking ? {
        id: existingBooking.id,
        startTime: existingBooking.startTime,
        endTime: existingBooking.endTime
      } : null
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    res.status(500).json({ error: 'Failed to check availability' })
  }
})

// POST /bookings/calculate-price - рассчитать стоимость со скидками
// POST /bookings/calculate-price - рассчитать стоимость со скидками
router.post('/calculate-price', async (req, res) => {
  const { workstationId, bookingDuration, startTime } = req.body;

  try {
    const workstation = await prisma.workstation.findUnique({
      where: { id: workstationId }
    });

    if (!workstation) {
      return res.status(404).json({ error: 'Workstation not found' });
    }

    let basePrice;
    
    if (workstation.type === 'MEETING_ROOM' || workstation.type === 'CONFERENCE_ROOM') {
      basePrice = workstation.basePricePerHour;
    } else {
      switch (bookingDuration) {
        case 'day': basePrice = workstation.basePricePerDay; break;
        case 'week': basePrice = workstation.basePricePerWeek; break;
        case 'month': basePrice = workstation.basePricePerMonth; break;
        default: basePrice = workstation.basePricePerDay;
      }
    }

    if (!basePrice || basePrice <= 0) {
      console.warn(`Invalid base price for workstation ${workstationId}, using default price`);
      basePrice = workstation.type === 'MEETING_ROOM' || workstation.type === 'CONFERENCE_ROOM' ? 1000 : 500;
    }

    const discounts = await prisma.discount.findMany({
      where: { isActive: true }
    });

    // Получаем детальную информацию о примененных скидках
    const result = calculateDiscountWithPriority(basePrice, discounts, new Date(startTime));

    res.json({
      basePrice: Number(basePrice.toFixed(2)),
      discountPercentage: result.discountPercentage,
      discountAmount: result.discountAmount,
      finalPrice: result.finalPrice,
      discountsApplied: result.discountsApplied,
      appliedDiscounts: result.appliedDiscounts, // Добавляем информацию о примененных скидках
      workstationType: workstation.type
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
});

// GET /bookings/coworking/:coworkingCenterId - получить бронирования для коворкинг-центра
router.get('/coworking/:coworkingCenterId', async (req, res) => {
  const { coworkingCenterId } = req.params
  const { date } = req.query

  try {
    let whereClause = {
      coworkingCenterId,
      status: {
        in: ['ACTIVE']
      }
    }

    if (date) {
      const startOfDay = new Date(date + 'T00:00:00.000Z')
      const endOfDay = new Date(date + 'T23:59:59.999Z')
      
      whereClause.OR = [
        {
          startTime: {
            lte: endOfDay,
            gte: startOfDay
          }
        },
        {
          endTime: {
            lte: endOfDay,
            gte: startOfDay
          }
        },
        {
          AND: [
            { startTime: { lte: startOfDay } },
            { endTime: { gte: endOfDay } }
          ]
        }
      ]
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        workstation: {
          select: {
            id: true,
            number: true,
            type: true
          }
        },
        payment: true // Добавляем платеж
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching coworking center bookings:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// GET /bookings/coworking/:coworkingCenterId/workstation/:workstationId - получить бронирования конкретного рабочего места
router.get('/coworking/:coworkingCenterId/workstation/:workstationId', async (req, res) => {
  const { coworkingCenterId, workstationId } = req.params
  const { startDate, endDate } = req.query

  try {
    let whereClause = {
      coworkingCenterId,
      workstationId,
      status: 'ACTIVE'
    }

    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00.000Z')
      const end = new Date(endDate + 'T23:59:59.999Z')
      
      whereClause.OR = [
        {
          startTime: {
            lte: end,
            gte: start
          }
        },
        {
          endTime: {
            lte: end,
            gte: start
          }
        },
        {
          AND: [
            { startTime: { lte: start } },
            { endTime: { gte: end } }
          ]
        }
      ]
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        payment: true // Добавляем платеж
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching workstation bookings:', error)
    res.status(500).json({ error: 'Failed to fetch workstation bookings' })
  }
})

// GET /bookings/admin/all - получить все бронирования (для менеджеров/админов)
router.get('/admin/all', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true
          }
        },
        coworkingCenter: {
          select: {
            id: true,
            address: true
          }
        },
        workstation: {
          select: {
            id: true,
            number: true,
            type: true,
            capacity: true
          }
        },
        payment: true // Добавляем платеж
      },
      orderBy: {
        startTime: 'desc'
      }
    });
   
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router