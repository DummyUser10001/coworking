import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// GET /discounts - получить все скидки
router.get('/', async (req, res) => {
  const { isActive } = req.query

  try {
    const discounts = await prisma.discount.findMany({
      where: isActive ? { isActive: isActive === 'true' } : {},
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' }
      ]
    })
    
    res.json(discounts)
  } catch (error) {
    console.error('Error fetching discounts:', error)
    res.status(500).json({ error: 'Failed to fetch discounts' })
  }
})

// GET /discounts/:id - получить конкретную скидку
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const discount = await prisma.discount.findUnique({
      where: { id }
    })
    
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' })
    }
    
    res.json(discount)
  } catch (error) {
    console.error('Error fetching discount:', error)
    res.status(500).json({ error: 'Failed to fetch discount' })
  }
})

// POST /discounts - создать скидку
router.post('/', async (req, res) => {
  const { 
    name,
    description,
    percentage,
    maxDiscountAmount,
    usageLimit,
    startDate,
    endDate,
    applicableDays,
    applicableHours,
    isActive,
    priority
  } = req.body

  try {
    // Валидация обязательных полей
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название скидки обязательно' })
    }

    if (!percentage || percentage <= 0) {
      return res.status(400).json({ error: 'Размер скидки должен быть положительным числом' })
    }

    if (percentage > 50) {
      return res.status(400).json({ error: 'Размер скидки не может превышать 50%' })
    }

    if (!startDate) {
      return res.status(400).json({ error: 'Дата начала обязательна' })
    }

    if (!endDate) {
      return res.status(400).json({ error: 'Дата окончания обязательна' })
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: 'Дата окончания не может быть раньше даты начала' })
    }

    if (!applicableDays || applicableDays.length === 0) {
      return res.status(400).json({ error: 'Выберите хотя бы один день недели' })
    }

    // Проверяем уникальность названия скидки
    const existingDiscount = await prisma.discount.findFirst({
      where: { name }
    })

    if (existingDiscount) {
      return res.status(400).json({ error: 'Скидка с таким названием уже существует' })
    }

    const discount = await prisma.discount.create({
      data: {
        name,
        description: description || '',
        percentage: parseFloat(percentage),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        applicableDays,
        applicableHours: applicableHours || null,
        isActive: isActive !== undefined ? isActive : true,
        priority: priority ? parseInt(priority) : 0
      }
    })
    
    res.status(201).json(discount)
  } catch (error) {
    console.error('Error creating discount:', error)
    
    // Обработка ошибки уникальности от Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Скидка с таким названием уже существует' })
    }
    
    res.status(500).json({ error: 'Failed to create discount' })
  }
})

// PUT /discounts/:id - обновить скидку
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { 
    name,
    description,
    percentage,
    maxDiscountAmount,
    usageLimit,
    startDate,
    endDate,
    applicableDays,
    applicableHours,
    isActive,
    priority
  } = req.body

  try {
    // Проверяем существование скидки
    const currentDiscount = await prisma.discount.findUnique({
      where: { id }
    })

    if (!currentDiscount) {
      return res.status(404).json({ error: 'Discount not found' })
    }

    // Валидация
    if (name && !name.trim()) {
      return res.status(400).json({ error: 'Название скидки обязательно' })
    }

    if (percentage !== undefined) {
      if (percentage <= 0) {
        return res.status(400).json({ error: 'Размер скидки должен быть положительным числом' })
      }
      
      if (percentage > 50) {
        return res.status(400).json({ error: 'Размер скидки не может превышать 50%' })
      }
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: 'Дата окончания не может быть раньше даты начала' })
    }

    if (applicableDays && applicableDays.length === 0) {
      return res.status(400).json({ error: 'Выберите хотя бы один день недели' })
    }

    // Если меняется название, проверяем уникальность
    if (name !== undefined && name !== currentDiscount.name) {
      const existingDiscount = await prisma.discount.findFirst({
        where: { name }
      })

      if (existingDiscount && existingDiscount.id !== id) {
        return res.status(400).json({ error: 'Скидка с таким названием уже существует' })
      }
    }

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        name: name !== undefined ? name : currentDiscount.name,
        description: description !== undefined ? description : currentDiscount.description,
        percentage: percentage !== undefined ? parseFloat(percentage) : currentDiscount.percentage,
        maxDiscountAmount: maxDiscountAmount !== undefined 
          ? (maxDiscountAmount ? parseFloat(maxDiscountAmount) : null)
          : currentDiscount.maxDiscountAmount,
        usageLimit: usageLimit !== undefined 
          ? (usageLimit ? parseInt(usageLimit) : null)
          : currentDiscount.usageLimit,
        startDate: startDate ? new Date(startDate) : currentDiscount.startDate,
        endDate: endDate ? new Date(endDate) : currentDiscount.endDate,
        applicableDays: applicableDays !== undefined ? applicableDays : currentDiscount.applicableDays,
        applicableHours: applicableHours !== undefined ? applicableHours : currentDiscount.applicableHours,
        isActive: isActive !== undefined ? isActive : currentDiscount.isActive,
        priority: priority !== undefined ? parseInt(priority) : currentDiscount.priority
      }
    })
    
    res.json(discount)
  } catch (error) {
    console.error('Error updating discount:', error)
    
    // Обработка ошибки уникальности от Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Скидка с таким названием уже существует' })
    }
    
    res.status(500).json({ error: 'Failed to update discount' })
  }
})

// DELETE /discounts/:id - удалить скидку
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await prisma.discount.delete({
      where: { id }
    })
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting discount:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Discount not found' })
    }
    
    res.status(500).json({ error: 'Failed to delete discount' })
  }
})

// GET /discounts/active - получить активные скидки
router.get('/status/active', async (req, res) => {
  try {
    const activeDiscounts = await prisma.discount.findMany({
      where: { 
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' }
      ]
    })
    
    res.json(activeDiscounts)
  } catch (error) {
    console.error('Error fetching active discounts:', error)
    res.status(500).json({ error: 'Failed to fetch active discounts' })
  }
})

// GET /discounts/check/availability - проверить доступность скидки по критериям
router.get('/check/availability', async (req, res) => {
  const { date, time, dayOfWeek } = req.query

  try {
    const currentDate = date ? new Date(date) : new Date()
    const currentTime = time || ''
    const currentDay = dayOfWeek || currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    const applicableDiscounts = await prisma.discount.findMany({
      where: { 
        isActive: true,
        startDate: { lte: currentDate },
        endDate: { gte: currentDate },
        applicableDays: { has: currentDay }
      },
      orderBy: { priority: 'desc' }
    })

    // Фильтруем по времени, если указано
    const filteredDiscounts = applicableDiscounts.filter(discount => {
      if (!discount.applicableHours) return true // Весь день
      
      const [start, end] = discount.applicableHours.split('-')
      if (!currentTime) return true // Если время не указано, возвращаем все
      
      return currentTime >= start && currentTime <= end
    })
    
    res.json({
      applicableDiscounts: filteredDiscounts,
      totalCount: filteredDiscounts.length
    })
  } catch (error) {
    console.error('Error checking discount availability:', error)
    res.status(500).json({ error: 'Failed to check discount availability' })
  }
})

export default router