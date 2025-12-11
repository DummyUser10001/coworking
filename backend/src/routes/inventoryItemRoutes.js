import express from 'express'
import { InventoryService } from '../services/inventoryService.js'

const router = express.Router()
const inventoryService = new InventoryService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить весь инвентарь (с фильтрацией по рабочему месту и типу)' */
  const { workstationId, type } = req.query

  try {
    const inventory = await inventoryService.getAllInventory(workstationId, type)
    res.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    res.status(500).json({ error: 'Failed to fetch inventory items' })
  }
})

router.get('/available', async (req, res) => {
  /* #swagger.summary = 'Получить доступный инвентарь' */
  try {
    const availableInventory = await inventoryService.getAvailableInventory()

    // Если нет доступного инвентаря - возвращаем 404
    if (availableInventory.length === 0) {
      return res.status(404).json({ 
        error: 'No available inventory found',
        message: 'No inventory items available for assignment'
      })
    }

    res.json(availableInventory)
  } catch (error) {
    console.error('Error fetching available inventory:', error)
    res.status(500).json({ error: 'Failed to fetch available inventory' })
  }
})

router.get('/workstation/:workstationId', async (req, res) => {
  /* #swagger.summary = 'Получить инвентарь для конкретного рабочего места (комнаты)' */
  const { workstationId } = req.params

  try {
    const inventory = await inventoryService.getInventoryByWorkstation(workstationId)
    res.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory for workstation:', error)
    res.status(500).json({ error: 'Failed to fetch inventory for workstation' })
  }
})

router.get('/type/:type', async (req, res) => {
  /* #swagger.summary = 'Получить инвентарь по его типу' */
  const { type } = req.params

  try {
    const inventory = await inventoryService.getInventoryByType(type)
    res.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory by type:', error)
    res.status(500).json({ error: 'Failed to fetch inventory by type' })
  }
})

router.get('/:id', async (req, res) => {
  /* #swagger.summary = 'Получить конкретный инвентарь' */
  const { id } = req.params

  try {
    const item = await inventoryService.getInventoryById(id)
    res.json(item)
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    
    if (error.message === 'Inventory item not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch inventory item' })
    }
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать инвентарь' */
  const { workstationId, type, description, totalQuantity, reservedQuantity } = req.body

  try {
    const item = await inventoryService.createInventoryItem({
      workstationId,
      type,
      description,
      totalQuantity,
      reservedQuantity
    })

    res.status(201).json(item)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    
    if (error.message.includes('required') || 
        error.message.includes('Invalid') || 
        error.message.includes('must be') ||
        error.message.includes('cannot')) {
      return res.status(400).json({ error: error.message })
    }
    
    if (error.code === 'P2003') return res.status(400).json({ error: 'Invalid workstation ID' })
    res.status(500).json({ error: 'Failed to create inventory item' })
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить данные инвентаря' */
  const { id } = req.params
  const { workstationId, type, description, totalQuantity, reservedQuantity } = req.body

  try {
    const item = await inventoryService.updateInventoryItem(id, {
      workstationId,
      type,
      description,
      totalQuantity,
      reservedQuantity
    })

    res.json(item)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    
    if (error.message === 'Inventory item not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message.includes('Invalid') || 
               error.message.includes('must be') ||
               error.message.includes('cannot')) {
      res.status(400).json({ error: error.message })
    } else if (error.code === 'P2003') {
      res.status(400).json({ error: 'Invalid workstation ID' })
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Inventory item not found' })
    } else {
      res.status(500).json({ error: 'Failed to update inventory item' })
    }
  }
})

router.patch('/:id/quantity', async (req, res) => {
  /* #swagger.summary = 'Обновляет количество инвентаря' */
  const { id } = req.params
  const { totalQuantity, reservedQuantity } = req.body

  try {
    const item = await inventoryService.updateInventoryQuantity(id, totalQuantity, reservedQuantity)
    res.json(item)
  } catch (error) {
    console.error('Error updating inventory quantity:', error)
    
    if (error.message === 'Inventory item not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message.includes('must be') || error.message.includes('cannot')) {
      res.status(400).json({ error: error.message })
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Inventory item not found' })
    } else {
      res.status(500).json({ error: 'Failed to update inventory quantity' })
    }
  }
})

router.patch('/:id/workstation', async (req, res) => {
  /* #swagger.summary = 'Привязывает инвентарь к рабочему месту' */
  const { id } = req.params
  const { workstationId } = req.body

  try {
    const item = await inventoryService.updateInventoryWorkstation(id, workstationId)
    res.json(item)
  } catch (error) {
    console.error('Error updating inventory workstation:', error)
    
    if (error.message === 'Inventory item not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message === 'Workstation not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message === 'No available units') {
      res.status(400).json({ 
        error: error.message, 
        message: 'All units of this inventory item are already reserved' 
      })
    } else if (error.code === 'P2003') {
      res.status(400).json({ error: 'Invalid workstation ID' })
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Inventory item not found' })
    } else {
      res.status(500).json({ error: 'Failed to update inventory workstation' })
    }
  }
})

router.delete('/:id', async (req, res) => {
  /* #swagger.summary = 'Удалить инвентарь' */
  const { id } = req.params

  try {
    await inventoryService.deleteInventoryItem(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    
    if (error.message === 'Inventory item not found') {
      res.status(404).json({ error: error.message })
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Inventory item not found' })
    } else {
      res.status(500).json({ error: 'Failed to delete inventory item' })
    }
  }
})

router.get('/stats/summary', async (req, res) => {
  /* #swagger.summary = 'Получить статистику по инвентарю (общее количество, занятые/свободные единицы)' */
  try {
    const stats = await inventoryService.getInventoryStats()
    res.json(stats)
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    res.status(500).json({ error: 'Failed to fetch inventory statistics' })
  }
})

export default router