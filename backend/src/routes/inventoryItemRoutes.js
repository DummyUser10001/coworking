import express from 'express'
import prisma from '../prismaClient.js'
//import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

//router.use(authMiddleware)

// GET /inventory-items - получить весь инвентарь (с фильтрацией по рабочему месту и типу)
router.get('/', async (req, res) => {
  const { workstationId, type } = req.query

  try {
    const where = {}
    if (workstationId) where.workstationId = workstationId
    if (type) where.type = type

    const inventory = await prisma.inventoryItem.findMany({
      where,
      include: {
        workstation: {
          include: {
            floor: {
              include: { coworkingCenter: true }
            }
          }
        }
      },
      orderBy: { type: 'asc' }
    })

    res.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    res.status(500).json({ error: 'Failed to fetch inventory items' })
  }
})

// ---------- НОВЫЙ МАРШРУТ ----------
/**
 * GET /inventory-items/available
 * Возвращает инвентарь, который:
 *   • не привязан к рабочему месту (workstationId = null)
 *   • имеет свободные единицы (reservedQuantity < totalQuantity)
 */



// GET /inventory-items/available
router.get('/available', async (req, res) => {
  try {
    const availableInventory = await prisma.inventoryItem.findMany({
      where: {
        workstationId: null,
        reservedQuantity: { 
          lt: prisma.inventoryItem.fields.totalQuantity 
        }
      },
      orderBy: { type: 'asc' }
    })

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

// GET /inventory-items/workstation/:workstationId
router.get('/workstation/:workstationId', async (req, res) => {
  const { workstationId } = req.params

  try {
    const inventory = await prisma.inventoryItem.findMany({
      where: { workstationId },
      include: {
        workstation: {
          include: {
            floor: {
              include: { coworkingCenter: true }
            }
          }
        }
      },
      orderBy: { type: 'asc' }
    })

    res.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory for workstation:', error)
    res.status(500).json({ error: 'Failed to fetch inventory for workstation' })
  }
})

// GET /inventory-items/type/:type
router.get('/type/:type', async (req, res) => {
  const { type } = req.params

  try {
    const inventory = await prisma.inventoryItem.findMany({
      where: { type },
      include: {
        workstation: {
          include: {
            floor: {
              include: { coworkingCenter: true }
            }
          }
        }
      },
      orderBy: { workstationId: 'asc' }
    })

    res.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory by type:', error)
    res.status(500).json({ error: 'Failed to fetch inventory by type' })
  }
})

// GET /inventory-items/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        workstation: {
          include: {
            floor: {
              include: { coworkingCenter: true }
            }
          }
        }
      }
    })

    if (!item) return res.status(404).json({ error: 'Inventory item not found' })
    res.json(item)
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    res.status(500).json({ error: 'Failed to fetch inventory item' })
  }
})

// POST /inventory-items
router.post('/', async (req, res) => {
  const { workstationId, type, description, totalQuantity, reservedQuantity } = req.body

  if (!type) return res.status(400).json({ error: 'Type is required' })

  const validTypes = ['MONITOR', 'PROJECTOR', 'WHITEBOARD', 'MICROPHONE', 'SPEAKERS', 'TABLE', 'LAPTOP']
  if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid inventory type' })

  const quantity = totalQuantity ?? 1
  if (quantity < 1) return res.status(400).json({ error: 'Total quantity must be at least 1' })

  const reserved = reservedQuantity ?? 0
  if (reserved < 0) return res.status(400).json({ error: 'Reserved quantity cannot be negative' })
  if (reserved > quantity) return res.status(400).json({ error: 'Reserved quantity cannot exceed total quantity' })

  try {
    if (workstationId) {
      const ws = await prisma.workstation.findUnique({ where: { id: workstationId } })
      if (!ws) return res.status(404).json({ error: 'Workstation not found' })
    }

    const item = await prisma.inventoryItem.create({
      data: {
        workstationId: workstationId || null,
        type,
        description: description || null,
        totalQuantity: quantity,
        reservedQuantity: reserved
      },
      include: {
        workstation: {
          include: {
            floor: { include: { coworkingCenter: true } }
          }
        }
      }
    })

    res.status(201).json(item)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    if (error.code === 'P2003') return res.status(400).json({ error: 'Invalid workstation ID' })
    res.status(500).json({ error: 'Failed to create inventory item' })
  }
})

// PUT /inventory-items/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { workstationId, type, description, totalQuantity, reservedQuantity } = req.body

  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Inventory item not found' })

    if (type) {
      const validTypes = ['MONITOR', 'PROJECTOR', 'WHITEBOARD', 'MICROPHONE', 'SPEAKERS', 'TABLE', 'LAPTOP']
      if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid inventory type' })
    }

    let finalTotal = existing.totalQuantity
    if (totalQuantity !== undefined) {
      if (totalQuantity < 1) return res.status(400).json({ error: 'Total quantity must be at least 1' })
      finalTotal = totalQuantity
    }

    let finalReserved = existing.reservedQuantity
    if (reservedQuantity !== undefined) {
      if (reservedQuantity < 0) return res.status(400).json({ error: 'Reserved quantity cannot be negative' })
      if (reservedQuantity > finalTotal) return res.status(400).json({ error: 'Reserved quantity cannot exceed total quantity' })
      finalReserved = reservedQuantity
    }

    if (workstationId !== undefined && workstationId) {
      const ws = await prisma.workstation.findUnique({ where: { id: workstationId } })
      if (!ws) return res.status(404).json({ error: 'Workstation not found' })
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(workstationId !== undefined && { workstationId: workstationId || null }),
        ...(type && { type }),
        ...(description !== undefined && { description: description || null }),
        totalQuantity: finalTotal,
        reservedQuantity: finalReserved
      },
      include: {
        workstation: {
          include: {
            floor: { include: { coworkingCenter: true } }
          }
        }
      }
    })

    res.json(item)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    if (error.code === 'P2003') return res.status(400).json({ error: 'Invalid workstation ID' })
    if (error.code === 'P2025') return res.status(404).json({ error: 'Inventory item not found' })
    res.status(500).json({ error: 'Failed to update inventory item' })
  }
})

// PATCH /inventory-items/:id/quantity
router.patch('/:id/quantity', async (req, res) => {
  const { id } = req.params
  const { totalQuantity, reservedQuantity } = req.body

  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Inventory item not found' })

    const updateData = {}

    if (totalQuantity !== undefined) {
      if (totalQuantity < 1) return res.status(400).json({ error: 'Total quantity must be at least 1' })
      updateData.totalQuantity = totalQuantity
      if (totalQuantity < existing.reservedQuantity) updateData.reservedQuantity = totalQuantity
    }

    if (reservedQuantity !== undefined) {
      if (reservedQuantity < 0) return res.status(400).json({ error: 'Reserved quantity cannot be negative' })
      const max = totalQuantity !== undefined ? totalQuantity : existing.totalQuantity
      if (reservedQuantity > max) return res.status(400).json({ error: 'Reserved quantity cannot exceed total quantity' })
      updateData.reservedQuantity = reservedQuantity
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: {
        workstation: {
          include: {
            floor: { include: { coworkingCenter: true } }
          }
        }
      }
    })

    res.json(item)
  } catch (error) {
    console.error('Error updating inventory quantity:', error)
    if (error.code === 'P2025') return res.status(404).json({ error: 'Inventory item not found' })
    res.status(500).json({ error: 'Failed to update inventory quantity' })
  }
})

// PATCH /inventory-items/:id/workstation
// PATCH /inventory-items/:id/workstation
router.patch('/:id/workstation', async (req, res) => {
  const { id } = req.params
  const { workstationId } = req.body

  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Inventory item not found' })

    if (workstationId) {
      const ws = await prisma.workstation.findUnique({ where: { id: workstationId } })
      if (!ws) return res.status(404).json({ error: 'Workstation not found' })

      // Проверяем, есть ли свободные единицы
      if (existing.reservedQuantity >= existing.totalQuantity) {
        return res.status(400).json({ 
          error: 'No available units', 
          message: 'All units of this inventory item are already reserved' 
        })
      }
    }

    const updateData = { 
      workstationId: workstationId || null 
    }

    // При добавлении в комнату увеличиваем reservedQuantity на 1
    if (workstationId && !existing.workstationId) {
      updateData.reservedQuantity = existing.reservedQuantity + 1
    }
    // При удалении из комнаты уменьшаем reservedQuantity на 1
    else if (!workstationId && existing.workstationId) {
      updateData.reservedQuantity = Math.max(0, existing.reservedQuantity - 1)
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: {
        workstation: {
          include: {
            floor: { include: { coworkingCenter: true } }
          }
        }
      }
    })

    res.json(item)
  } catch (error) {
    console.error('Error updating inventory workstation:', error)
    if (error.code === 'P2003') return res.status(400).json({ error: 'Invalid workstation ID' })
    if (error.code === 'P2025') return res.status(404).json({ error: 'Inventory item not found' })
    res.status(500).json({ error: 'Failed to update inventory workstation' })
  }
})

// DELETE /inventory-items/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'Inventory item not found' })

    await prisma.inventoryItem.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    if (error.code === 'P2025') return res.status(404).json({ error: 'Inventory item not found' })
    res.status(500).json({ error: 'Failed to delete inventory item' })
  }
})

// GET /inventory-items/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const totalItems = await prisma.inventoryItem.count()
    const itemsByType = await prisma.inventoryItem.groupBy({
      by: ['type'],
      _sum: { totalQuantity: true, reservedQuantity: true },
      _count: { id: true }
    })
    const generalCount = await prisma.inventoryItem.count({ where: { workstationId: null } })
    const assignedCount = await prisma.inventoryItem.count({ where: { workstationId: { not: null } } })

    const totalQuantity = itemsByType.reduce((s, i) => s + (i._sum.totalQuantity || 0), 0)
    const totalReserved = itemsByType.reduce((s, i) => s + (i._sum.reservedQuantity || 0), 0)

    res.json({
      totalItems,
      totalQuantity,
      totalReserved,
      availableQuantity: totalQuantity - totalReserved,
      itemsByType: itemsByType.map(i => ({
        type: i.type,
        totalQuantity: i._sum.totalQuantity,
        reservedQuantity: i._sum.reservedQuantity,
        availableQuantity: (i._sum.totalQuantity || 0) - (i._sum.reservedQuantity || 0),
        itemCount: i._count.id
      })),
      distribution: { general: generalCount, assigned: assignedCount }
    })
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    res.status(500).json({ error: 'Failed to fetch inventory statistics' })
  }
})

export default router