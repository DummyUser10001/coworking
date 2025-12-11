import express from 'express'
import { WorkstationService } from '../services/workstationService.js'

const router = express.Router()
const workstationService = new WorkstationService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить все рабочие места (с фильтрацией по этажу)' */
  const { floorId } = req.query

  try {
    const workstations = await workstationService.getAllWorkstations(floorId)
    res.json(workstations)
  } catch (error) {
    console.error('Error fetching workstations:', error)
    res.status(500).json({ error: 'Failed to fetch workstations' })
  }
})

router.get('/:id', async (req, res) => {
  /* #swagger.summary = 'Получить конкретное рабочее место' */
  const { id } = req.params

  try {
    const workstation = await workstationService.getWorkstationById(id)
    res.json(workstation)
  } catch (error) {
    console.error('Error fetching workstation:', error)
    
    if (error.message === 'Workstation not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch workstation' })
    }
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать рабочее место' */
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
    const workstation = await workstationService.createWorkstation({
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
    })
    
    res.status(201).json(workstation)
  } catch (error) {
    console.error('Error creating workstation:', error)
    
    if (error.message.includes('уже существует') || error.message.includes('должны быть')) {
      res.status(400).json({ error: error.message })
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Рабочее место с таким номером уже существует на этом этаже' })
    } else {
      res.status(500).json({ error: 'Failed to create workstation' })
    }
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить рабочее место' */
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
    const workstation = await workstationService.updateWorkstation(id, {
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
    })
    
    res.json(workstation)
  } catch (error) {
    console.error('Error updating workstation:', error)
    
    if (error.message === 'Workstation not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message.includes('уже существует') || error.message.includes('должны быть')) {
      res.status(400).json({ error: error.message })
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Рабочее место с таким номером уже существует на этом этаже' })
    } else {
      res.status(500).json({ error: 'Failed to update workstation' })
    }
  }
})

router.delete('/:id', async (req, res) => {
  /* #swagger.summary = 'Удалить рабочее место' */
  const { id } = req.params

  try {
    await workstationService.deleteWorkstation(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting workstation:', error)
    res.status(500).json({ error: 'Failed to delete workstation' })
  }
})

router.get('/floor/:floorId', async (req, res) => {
  /* #swagger.summary = 'Получить все рабочие места на этаже' */
  const { floorId } = req.params

  try {
    const workstations = await workstationService.getWorkstationsByFloor(floorId)
    res.json(workstations)
  } catch (error) {
    console.error('Error fetching workstations for floor:', error)
    res.status(500).json({ error: 'Failed to fetch workstations' })
  }
})

router.get('/availability/:id', async (req, res) => {
  /* #swagger.summary = 'Проверить доступность рабочего места' */
  const { id } = req.params
  const { date, time } = req.query

  try {
    const result = await workstationService.checkWorkstationAvailability(id, date, time)
    res.json(result)
  } catch (error) {
    console.error('Error checking workstation availability:', error)
    
    if (error.message === 'Workstation not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to check availability' })
    }
  }
})

router.patch('/:id/inventory', async (req, res) => {
  /* #swagger.summary = 'Обновить инвентарь рабочего места' */
  const { id } = req.params
  const { inventory } = req.body

  try {
    const updatedWorkstation = await workstationService.updateWorkstationInventory(id, inventory)
    res.json(updatedWorkstation)
  } catch (error) {
    console.error('Error updating workstation inventory:', error)
    res.status(500).json({ error: 'Failed to update inventory' })
  }
})

export default router