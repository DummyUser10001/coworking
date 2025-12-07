import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// GET /floors - получить все этажи (с фильтрацией по коворкинг-центру)
router.get('/', async (req, res) => {
  const { coworkingCenterId } = req.query

  try {
    const floors = await prisma.floor.findMany({
      where: coworkingCenterId ? { coworkingCenterId } : {},
      include: {
        workstations: true,
        landmarks: true
      }
    })
    
    res.json(floors)
  } catch (error) {
    console.error('Error fetching floors:', error)
    res.status(500).json({ error: 'Failed to fetch floors' })
  }
})

// GET /floors/:id - получить конкретный этаж
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        workstations: {
          include: {
            inventory: true
          }
        },
        landmarks: true
      }
    })
    
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' })
    }
    
    res.json(floor)
  } catch (error) {
    console.error('Error fetching floor:', error)
    res.status(500).json({ error: 'Failed to fetch floor' })
  }
})

// POST /floors - создать новый этаж
router.post('/', async (req, res) => {
  const { name, level, width, height, coworkingCenterId } = req.body

  try {
    const floor = await prisma.floor.create({
      data: {
        name,
        level,
        width,
        height,
        coworkingCenterId
      }
    })
    
    res.status(201).json(floor)
  } catch (error) {
    console.error('Error creating floor:', error)
    res.status(500).json({ error: 'Failed to create floor' })
  }
})

// PUT /floors/:id - обновить этаж
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name, level, width, height } = req.body

  try {
    const floor = await prisma.floor.update({
      where: { id },
      data: {
        name,
        level,
        width,
        height
      }
    })
    
    res.json(floor)
  } catch (error) {
    console.error('Error updating floor:', error)
    res.status(500).json({ error: 'Failed to update floor' })
  }
})

// DELETE /floors/:id - удалить этаж
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await prisma.floor.delete({
      where: { id }
    })
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting floor:', error)
    res.status(500).json({ error: 'Failed to delete floor' })
  }
})

export default router