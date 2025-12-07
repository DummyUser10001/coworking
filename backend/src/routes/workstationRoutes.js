import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// GET /workstations - получить все рабочие места (с фильтрацией по этажу)
router.get('/', async (req, res) => {
  const { floorId } = req.query

  try {
    const workstations = await prisma.workstation.findMany({
      where: floorId ? { floorId } : {},
      include: {
        floor: {
          include: {
            coworkingCenter: true
          }
        },
        inventory: true
      }
    })
    
    res.json(workstations)
  } catch (error) {
    console.error('Error fetching workstations:', error)
    res.status(500).json({ error: 'Failed to fetch workstations' })
  }
})

// GET /workstations/:id - получить конкретное рабочее место
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const workstation = await prisma.workstation.findUnique({
      where: { id },
      include: {
        floor: {
          include: {
            coworkingCenter: true
          }
        },
        inventory: true
      }
    })
    
    if (!workstation) {
      return res.status(404).json({ error: 'Workstation not found' })
    }
    
    res.json(workstation)
  } catch (error) {
    console.error('Error fetching workstation:', error)
    res.status(500).json({ error: 'Failed to fetch workstation' })
  }
})

// POST /workstations - создать рабочее место
router.post('/', async (req, res) => {
  const { 
    number, 
    floorId, 
    type, 
    capacity, 
    basePricePerHour,
    basePricePerDay, 
    basePricePerWeek, 
    basePricePerMonth, 
    x, 
    y, 
    width, 
    height 
  } = req.body

  try {
    // Проверяем уникальность номера в пределах этажа
    const existingWorkstation = await prisma.workstation.findFirst({
      where: {
        number,
        floorId
      }
    })

    if (existingWorkstation) {
      return res.status(400).json({ error: 'Рабочее место с таким номером уже существует на этом этаже' })
    }

    // Валидация цен в зависимости от типа
    let priceData = {}
    
    if (type === 'DESK' || type === 'COMPUTER_DESK') {
      // Для столов должны быть дневные/недельные/месячные цены
      if (!basePricePerDay || !basePricePerWeek || !basePricePerMonth) {
        return res.status(400).json({ 
          error: 'Для столов должны быть указаны цены за день, неделю и месяц' 
        })
      }
      priceData = {
        basePricePerDay,
        basePricePerWeek, 
        basePricePerMonth,
        basePricePerHour: null // Принудительно null для столов
      }
    } else if (type === 'MEETING_ROOM' || type === 'CONFERENCE_ROOM') {
      // Для комнат должна быть только почасовая цена
      if (!basePricePerHour) {
        return res.status(400).json({ 
          error: 'Для комнат должна быть указана почасовая цена' 
        })
      }
      priceData = {
        basePricePerHour,
        basePricePerDay: null, // Принудительно null для комнат
        basePricePerWeek: null,
        basePricePerMonth: null
      }
    }

    const workstation = await prisma.workstation.create({
      data: {
        number,
        floorId,
        type,
        capacity,
        ...priceData,
        x,
        y,
        width: width || 1,
        height: height || 1
      },
      include: {
        floor: {
          include: {
            coworkingCenter: true
          }
        },
        inventory: true
      }
    })
    
    res.status(201).json(workstation)
  } catch (error) {
    console.error('Error creating workstation:', error)
    
    // Обработка ошибки уникальности от Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Рабочее место с таким номером уже существует на этом этаже' })
    }
    
    res.status(500).json({ error: 'Failed to create workstation' })
  }
})

// PUT /workstations/:id - обновить рабочее место
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { 
    number, 
    type, 
    capacity, 
    basePricePerHour,
    basePricePerDay, 
    basePricePerWeek, 
    basePricePerMonth, 
    x, 
    y, 
    width, 
    height 
  } = req.body

  try {
    // Получаем текущее рабочее место чтобы узнать floorId
    const currentWorkstation = await prisma.workstation.findUnique({
      where: { id },
      include: {
        floor: true
      }
    })

    if (!currentWorkstation) {
      return res.status(404).json({ error: 'Workstation not found' })
    }

    // Если меняется номер, проверяем уникальность в пределах этажа
    if (number !== undefined && number !== currentWorkstation.number) {
      const existingWorkstation = await prisma.workstation.findFirst({
        where: {
          number,
          floorId: currentWorkstation.floorId
        }
      })

      if (existingWorkstation && existingWorkstation.id !== id) {
        return res.status(400).json({ error: 'Рабочее место с таким номером уже существует на этом этаже' })
      }
    }

    // Валидация цен в зависимости от типа
    let priceData = {}
    
    if (type === 'DESK' || type === 'COMPUTER_DESK') {
      // Для столов должны быть дневные/недельные/месячные цены
      if (!basePricePerDay || !basePricePerWeek || !basePricePerMonth) {
        return res.status(400).json({ 
          error: 'Для столов должны быть указаны цены за день, неделю и месяц' 
        })
      }
      priceData = {
        basePricePerDay,
        basePricePerWeek, 
        basePricePerMonth,
        basePricePerHour: null // Принудительно null для столов
      }
    } else if (type === 'MEETING_ROOM' || type === 'CONFERENCE_ROOM') {
      // Для комнат должна быть только почасовая цена
      if (!basePricePerHour) {
        return res.status(400).json({ 
          error: 'Для комнат должна быть указана почасовая цена' 
        })
      }
      priceData = {
        basePricePerHour,
        basePricePerDay: null, // Принудительно null для комнат
        basePricePerWeek: null,
        basePricePerMonth: null
      }
    }

    const workstation = await prisma.workstation.update({
      where: { id },
      data: {
        number,
        type,
        capacity,
        ...priceData,
        x,
        y,
        width: width || 1,
        height: height || 1
      },
      include: {
        floor: {
          include: {
            coworkingCenter: true
          }
        },
        inventory: true
      }
    })
    
    res.json(workstation)
  } catch (error) {
    console.error('Error updating workstation:', error)
    
    // Обработка ошибки уникальности от Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Рабочее место с таким номером уже существует на этом этаже' })
    }
    
    res.status(500).json({ error: 'Failed to update workstation' })
  }
})

// DELETE /workstations/:id - удалить рабочее место
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Сначала удаляем связанный инвентарь
    await prisma.inventoryItem.deleteMany({
      where: { workstationId: id }
    })

    await prisma.workstation.delete({
      where: { id }
    })
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting workstation:', error)
    res.status(500).json({ error: 'Failed to delete workstation' })
  }
})

// GET /workstations/floor/:floorId - получить все рабочие места на этаже
router.get('/floor/:floorId', async (req, res) => {
  const { floorId } = req.params

  try {
    const workstations = await prisma.workstation.findMany({
      where: { floorId },
      include: {
        floor: {
          include: {
            coworkingCenter: true
          }
        },
        inventory: true
      },
      orderBy: {
        number: 'asc'
      }
    })
    
    res.json(workstations)
  } catch (error) {
    console.error('Error fetching workstations for floor:', error)
    res.status(500).json({ error: 'Failed to fetch workstations' })
  }
})

// GET /workstations/availability/:id - проверить доступность рабочего места
router.get('/availability/:id', async (req, res) => {
  const { id } = req.params
  const { date, time } = req.query

  try {
    const workstation = await prisma.workstation.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: 'ACTIVE',
            startTime: {
              lte: new Date(`${date}T${time || '23:59:59'}`)
            },
            endTime: {
              gte: new Date(`${date}T${time || '00:00:00'}`)
            }
          }
        }
      }
    })

    if (!workstation) {
      return res.status(404).json({ error: 'Workstation not found' })
    }

    const isAvailable = workstation.bookings.length === 0
    
    res.json({
      isAvailable,
      workstation: {
        id: workstation.id,
        number: workstation.number,
        type: workstation.type,
        capacity: workstation.capacity
      },
      conflictingBookings: workstation.bookings
    })
  } catch (error) {
    console.error('Error checking workstation availability:', error)
    res.status(500).json({ error: 'Failed to check availability' })
  }
})

// PATCH /workstations/:id/inventory - обновить инвентарь рабочего места
router.patch('/:id/inventory', async (req, res) => {
  const { id } = req.params
  const { inventory } = req.body

  try {
    // Удаляем существующий инвентарь
    await prisma.inventoryItem.deleteMany({
      where: { workstationId: id }
    })

    // Создаем новый инвентарь
    if (inventory && inventory.length > 0) {
      await prisma.inventoryItem.createMany({
        data: inventory.map(item => ({
          ...item,
          workstationId: id
        }))
      })
    }

    const updatedWorkstation = await prisma.workstation.findUnique({
      where: { id },
      include: {
        inventory: true
      }
    })

    res.json(updatedWorkstation)
  } catch (error) {
    console.error('Error updating workstation inventory:', error)
    res.status(500).json({ error: 'Failed to update inventory' })
  }
})

export default router