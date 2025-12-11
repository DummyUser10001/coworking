import express from 'express'
import { DiscountService } from '../services/discountService.js'

const router = express.Router()
const discountService = new DiscountService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить все скидки' */
  const { isActive } = req.query

  try {
    const discounts = await discountService.getAllDiscounts(isActive)
    res.json(discounts)
  } catch (error) {
    console.error('Error fetching discounts:', error)
    res.status(500).json({ error: 'Failed to fetch discounts' })
  }
})

router.get('/:id', async (req, res) => {
  /* #swagger.summary = 'Получить конкретную скидку' */
  const { id } = req.params

  try {
    const discount = await discountService.getDiscountById(id)
    res.json(discount)
  } catch (error) {
    console.error('Error fetching discount:', error)
    
    if (error.message === 'Discount not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch discount' })
    }
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать скидку' */
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
    const discount = await discountService.createDiscount({
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
    })
    
    res.status(201).json(discount)
  } catch (error) {
    console.error('Error creating discount:', error)
    
    if (error.message.includes('обязательно') || 
        error.message.includes('не может') || 
        error.message.includes('Выберите') ||
        error.message.includes('существует')) {
      return res.status(400).json({ error: error.message })
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Скидка с таким названием уже существует' })
    }
    
    res.status(500).json({ error: 'Failed to create discount' })
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить скидку' */
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
    const discount = await discountService.updateDiscount(id, {
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
    })
    
    res.json(discount)
  } catch (error) {
    console.error('Error updating discount:', error)
    
    if (error.message === 'Discount not found') {
      return res.status(404).json({ error: error.message })
    }
    
    if (error.message.includes('обязательно') || 
        error.message.includes('не может') || 
        error.message.includes('Выберите') ||
        error.message.includes('существует')) {
      return res.status(400).json({ error: error.message })
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Скидка с таким названием уже существует' })
    }
    
    res.status(500).json({ error: 'Failed to update discount' })
  }
})

router.delete('/:id', async (req, res) => {
  /* #swagger.summary = 'Удалить скидку' */
  const { id } = req.params

  try {
    await discountService.deleteDiscount(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting discount:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Discount not found' })
    }
    
    res.status(500).json({ error: 'Failed to delete discount' })
  }
})

router.get('/status/active', async (req, res) => {
  /* #swagger.summary = 'Получить активные скидки' */
  try {
    const activeDiscounts = await discountService.getActiveDiscounts()
    res.json(activeDiscounts)
  } catch (error) {
    console.error('Error fetching active discounts:', error)
    res.status(500).json({ error: 'Failed to fetch active discounts' })
  }
})

router.get('/check/availability', async (req, res) => {
  /* #swagger.summary = 'Проверить доступность скидки по критериям' */
  const { date, time, dayOfWeek } = req.query

  try {
    const result = await discountService.checkDiscountAvailability(date, time, dayOfWeek)
    res.json(result)
  } catch (error) {
    console.error('Error checking discount availability:', error)
    res.status(500).json({ error: 'Failed to check discount availability' })
  }
})

export default router