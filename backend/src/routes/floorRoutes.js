import express from 'express'
import { FloorService } from '../services/floorService.js'

const router = express.Router()
const floorService = new FloorService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить все этажи (с фильтрацией по коворкинг-центру)' */
  const { coworkingCenterId } = req.query

  try {
    const floors = await floorService.getAllFloors(coworkingCenterId)
    res.json(floors)
  } catch (error) {
    console.error('Error fetching floors:', error)
    res.status(500).json({ error: 'Failed to fetch floors' })
  }
})

router.get('/:id', async (req, res) => {
  /* #swagger.summary = 'Получить конкретный этаж' */
  const { id } = req.params

  try {
    const floor = await floorService.getFloorById(id)
    res.json(floor)
  } catch (error) {
    console.error('Error fetching floor:', error)
    
    if (error.message === 'Floor not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch floor' })
    }
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать новый этаж' */
  const { name, level, width, height, coworkingCenterId } = req.body

  try {
    const floor = await floorService.createFloor({ name, level, width, height, coworkingCenterId })
    res.status(201).json(floor)
  } catch (error) {
    console.error('Error creating floor:', error)
    res.status(500).json({ error: 'Failed to create floor' })
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить этаж' */
  const { id } = req.params
  const { name, level, width, height } = req.body

  try {
    const floor = await floorService.updateFloor(id, { name, level, width, height })
    res.json(floor)
  } catch (error) {
    console.error('Error updating floor:', error)
    res.status(500).json({ error: 'Failed to update floor' })
  }
})

router.delete('/:id', async (req, res) => {
  /* #swagger.summary = 'Удалить этаж' */
  const { id } = req.params

  try {
    await floorService.deleteFloor(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting floor:', error)
    res.status(500).json({ error: 'Failed to delete floor' })
  }
})

export default router