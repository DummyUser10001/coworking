import express from 'express'
import { LandmarkService } from '../services/landmarkService.js'

const router = express.Router()
const landmarkService = new LandmarkService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить все ориентиры (с фильтрацией по этажу)' */
  const { floorId } = req.query

  try {
    const landmarks = await landmarkService.getAllLandmarks(floorId)
    res.json(landmarks)
  } catch (error) {
    console.error('Error fetching landmarks:', error)
    res.status(500).json({ error: 'Failed to fetch landmarks' })
  }
})

router.get('/:id', async (req, res) => {
  /* #swagger.summary = 'Получить конкретный ориентир' */
  const { id } = req.params

  try {
    const landmark = await landmarkService.getLandmarkById(id)
    res.json(landmark)
  } catch (error) {
    console.error('Error fetching landmark:', error)
    
    if (error.message === 'Landmark not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch landmark' })
    }
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать новый ориентир' */
  const { floorId, type, x, y, name, rotation } = req.body

  try {
    const landmark = await landmarkService.createLandmark({ floorId, type, x, y, name, rotation })
    res.status(201).json(landmark)
  } catch (error) {
    console.error('Error creating landmark:', error)
    res.status(500).json({ error: 'Failed to create landmark' })
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить ориентир' */
  const { id } = req.params
  const { type, x, y, name, rotation } = req.body

  try {
    const landmark = await landmarkService.updateLandmark(id, { type, x, y, name, rotation })
    res.json(landmark)
  } catch (error) {
    console.error('Error updating landmark:', error)
    res.status(500).json({ error: 'Failed to update landmark' })
  }
})

router.delete('/:id', async (req, res) => {
  /* #swagger.summary = 'Удалить ориентир' */
  const { id } = req.params

  try {
    await landmarkService.deleteLandmark(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting landmark:', error)
    res.status(500).json({ error: 'Failed to delete landmark' })
  }
})

export default router