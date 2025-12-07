import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()


// GET /landmarks - получить все ориентиры (с фильтрацией по этажу)
router.get('/', async (req, res) => {
  const { floorId } = req.query

  try {
    const landmarks = await prisma.landmark.findMany({
      where: floorId ? { floorId } : {}
    })
    
    res.json(landmarks)
  } catch (error) {
    console.error('Error fetching landmarks:', error)
    res.status(500).json({ error: 'Failed to fetch landmarks' })
  }
})

// GET /landmarks/:id - получить конкретный ориентир
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const landmark = await prisma.landmark.findUnique({
      where: { id }
    })
    
    if (!landmark) {
      return res.status(404).json({ error: 'Landmark not found' })
    }
    
    res.json(landmark)
  } catch (error) {
    console.error('Error fetching landmark:', error)
    res.status(500).json({ error: 'Failed to fetch landmark' })
  }
})

// POST /landmarks - создать новый ориентир
router.post('/', async (req, res) => {
  const { floorId, type, x, y, name, rotation } = req.body

  try {
    const landmark = await prisma.landmark.create({
      data: {
        floorId,
        type,
        x,
        y,
        name,
        rotation
      }
    })
    
    res.status(201).json(landmark)
  } catch (error) {
    console.error('Error creating landmark:', error)
    res.status(500).json({ error: 'Failed to create landmark' })
  }
})

// PUT /landmarks/:id - обновить ориентир
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { type, x, y, name, rotation } = req.body

  try {
    const landmark = await prisma.landmark.update({
      where: { id },
      data: {
        type,
        x,
        y,
        name,
        rotation
      }
    })
    
    res.json(landmark)
  } catch (error) {
    console.error('Error updating landmark:', error)
    res.status(500).json({ error: 'Failed to update landmark' })
  }
})

// DELETE /landmarks/:id - удалить ориентир
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await prisma.landmark.delete({
      where: { id }
    })
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting landmark:', error)
    res.status(500).json({ error: 'Failed to delete landmark' })
  }
})

export default router