import express from 'express'
import { CoworkingService } from '../services/coworkingService.js'

const router = express.Router()
const coworkingService = new CoworkingService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить все коворкинг-центры' */
  try {
    const centers = await coworkingService.getAllCenters(true)
    res.json(centers)
  } catch (error) {
    console.error('Error fetching coworking centers:', error)
    res.status(500).json({ error: 'Failed to fetch coworking centers' })
  }
})

router.get('/all', async (req, res) => {
  /* #swagger.summary = 'Получить все центры (включая неактивные) для менеджеров' */
  try {
    const centers = await coworkingService.getAllCenters(false)
    res.json(centers)
  } catch (error) {
    console.error('Error fetching all coworking centers:', error)
    res.status(500).json({ error: 'Failed to fetch all coworking centers' })
  }
})

router.get('/:id', async (req, res) => {
  /* #swagger.summary = 'Получить конкретный коворкинг-центр' */
  const { id } = req.params

  try {
    const center = await coworkingService.getCenterById(id)
    res.json(center)
  } catch (error) {
    console.error('Error fetching coworking center:', error)
    
    if (error.message === 'Coworking center not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch coworking center' })
    }
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать новый коворкинг-центр' */
  const { address, latitude, longitude, phone, email, openingTime, closingTime, amenities } = req.body

  try {
    const center = await coworkingService.createCenter({
      address,
      latitude,
      longitude,
      phone,
      email,
      openingTime,
      closingTime,
      amenities
    })
    
    res.status(201).json(center)
  } catch (error) {
    console.error('Error creating coworking center:', error)
    
    if (error.message.includes('Invalid amenity')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to create coworking center' })
    }
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить коворкинг-центр' */
  const { id } = req.params
  const { address, latitude, longitude, phone, email, openingTime, closingTime, amenities, isActive } = req.body

  try {
    const center = await coworkingService.updateCenter(id, {
      address,
      latitude,
      longitude,
      phone,
      email,
      openingTime,
      closingTime,
      amenities,
      isActive
    })
    
    res.json(center)
  } catch (error) {
    console.error('Error updating coworking center:', error)
    
    if (error.message.includes('Invalid amenity')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to update coworking center' })
    }
  }
})

router.delete('/:id', async (req, res) => {
  /* #swagger.summary = 'Удалить коворкинг-центр' */
  const { id } = req.params

  try {
    await coworkingService.deleteCenter(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting coworking center:', error)
    res.status(500).json({ error: 'Failed to delete coworking center' })
  }
})

export default router