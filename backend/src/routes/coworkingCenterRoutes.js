import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// GET /coworking-centers - получить все коворкинг-центры
router.get('/', async (req, res) => {
  try {
    const centers = await prisma.coworkingCenter.findMany({
      where: {
        isActive: true // Показываем только активные центры
      },
      include: {
        floors: {
          include: {
            workstations: true,
            landmarks: true
          }
        }
      }
    })
    
    res.json(centers)
  } catch (error) {
    console.error('Error fetching coworking centers:', error)
    res.status(500).json({ error: 'Failed to fetch coworking centers' })
  }
})

// GET /coworking-centers/:id - получить конкретный коворкинг-центр (включая неактивные)
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const center = await prisma.coworkingCenter.findUnique({
      where: { id },
      include: {
        floors: {
          include: {
            workstations: {
              include: {
                inventory: true
              }
            },
            landmarks: true
          }
        }
      }
    })
    
    if (!center) {
      return res.status(404).json({ error: 'Coworking center not found' })
    }
    
    res.json(center)
  } catch (error) {
    console.error('Error fetching coworking center:', error)
    res.status(500).json({ error: 'Failed to fetch coworking center' })
  }
})

// GET /coworking-centers/all - получить все центры (включая неактивные) для админки
router.get('/admin/all', async (req, res) => {
  try {
    const centers = await prisma.coworkingCenter.findMany({
      include: {
        floors: {
          include: {
            workstations: true,
            landmarks: true
          }
        }
      }
    })
    
    res.json(centers)
  } catch (error) {
    console.error('Error fetching all coworking centers:', error)
    res.status(500).json({ error: 'Failed to fetch all coworking centers' })
  }
})

// POST /coworking-centers - создать новый коворкинг-центр
router.post('/', async (req, res) => {
  const { address, latitude, longitude, phone, email, openingTime, closingTime, amenities } = req.body

  // Валидация amenities
  if (amenities && Array.isArray(amenities)) {
    const validAmenities = ['WIFI', 'PARKING', 'COFFEE', 'TEA', 'SNACKS', 'LOCKERS']
    for (const amenity of amenities) {
      if (!validAmenities.includes(amenity)) {
        return res.status(400).json({ error: `Invalid amenity: ${amenity}` })
      }
    }
  }

  try {
    const center = await prisma.coworkingCenter.create({
      data: {
        address,
        latitude,
        longitude,
        phone,
        email,
        openingTime,
        closingTime,
        amenities: amenities || []
      }
    })
    
    res.status(201).json(center)
  } catch (error) {
    console.error('Error creating coworking center:', error)
    res.status(500).json({ error: 'Failed to create coworking center' })
  }
})

// PUT /coworking-centers/:id - обновить коворкинг-центр
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { address, latitude, longitude, phone, email, openingTime, closingTime, amenities, isActive } = req.body

  // Валидация amenities
  if (amenities && Array.isArray(amenities)) {
    const validAmenities = ['WIFI', 'PARKING', 'COFFEE', 'TEA', 'SNACKS', 'LOCKERS']
    for (const amenity of amenities) {
      if (!validAmenities.includes(amenity)) {
        return res.status(400).json({ error: `Invalid amenity: ${amenity}` })
      }
    }
  }

  try {
    const center = await prisma.coworkingCenter.update({
      where: { id },
      data: {
        address,
        latitude,
        longitude,
        phone,
        email,
        openingTime,
        closingTime,
        amenities: amenities || [],
        isActive
      }
    })
    
    res.json(center)
  } catch (error) {
    console.error('Error updating coworking center:', error)
    res.status(500).json({ error: 'Failed to update coworking center' })
  }
})

// DELETE /coworking-centers/:id - удалить коворкинг-центр
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await prisma.coworkingCenter.delete({
      where: { id }
    })
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting coworking center:', error)
    res.status(500).json({ error: 'Failed to delete coworking center' })
  }
})

export default router