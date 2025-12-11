import prisma from '../prismaClient.js'

export class InventoryService {
    async getAllInventory(workstationId, type) {
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

        return inventory
    }

    async getAvailableInventory() {
        const availableInventory = await prisma.inventoryItem.findMany({
            where: {
                workstationId: null,
                reservedQuantity: { 
                    lt: prisma.inventoryItem.fields.totalQuantity 
                }
            },
            orderBy: { type: 'asc' }
        })

        return availableInventory
    }

    async getInventoryByWorkstation(workstationId) {
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

        return inventory
    }

    async getInventoryByType(type) {
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

        return inventory
    }

    async getInventoryById(id) {
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

        if (!item) {
            throw new Error('Inventory item not found')
        }
        
        return item
    }

    async createInventoryItem(data) {
        const { workstationId, type, description, totalQuantity, reservedQuantity } = data

        if (!type) {
            throw new Error('Type is required')
        }

        const validTypes = ['MONITOR', 'PROJECTOR', 'WHITEBOARD', 'MICROPHONE', 'SPEAKERS', 'TABLE', 'LAPTOP']
        if (!validTypes.includes(type)) {
            throw new Error('Invalid inventory type')
        }

        const quantity = totalQuantity ?? 1
        if (quantity < 1) {
            throw new Error('Total quantity must be at least 1')
        }

        const reserved = reservedQuantity ?? 0
        if (reserved < 0) {
            throw new Error('Reserved quantity cannot be negative')
        }
        if (reserved > quantity) {
            throw new Error('Reserved quantity cannot exceed total quantity')
        }

        if (workstationId) {
            const ws = await prisma.workstation.findUnique({ where: { id: workstationId } })
            if (!ws) {
                throw new Error('Workstation not found')
            }
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

        return item
    }

    async updateInventoryItem(id, data) {
        const { workstationId, type, description, totalQuantity, reservedQuantity } = data

        const existing = await prisma.inventoryItem.findUnique({ where: { id } })
        if (!existing) {
            throw new Error('Inventory item not found')
        }

        if (type) {
            const validTypes = ['MONITOR', 'PROJECTOR', 'WHITEBOARD', 'MICROPHONE', 'SPEAKERS', 'TABLE', 'LAPTOP']
            if (!validTypes.includes(type)) {
                throw new Error('Invalid inventory type')
            }
        }

        let finalTotal = existing.totalQuantity
        if (totalQuantity !== undefined) {
            if (totalQuantity < 1) {
                throw new Error('Total quantity must be at least 1')
            }
            finalTotal = totalQuantity
        }

        let finalReserved = existing.reservedQuantity
        if (reservedQuantity !== undefined) {
            if (reservedQuantity < 0) {
                throw new Error('Reserved quantity cannot be negative')
            }
            if (reservedQuantity > finalTotal) {
                throw new Error('Reserved quantity cannot exceed total quantity')
            }
            finalReserved = reservedQuantity
        }

        if (workstationId !== undefined && workstationId) {
            const ws = await prisma.workstation.findUnique({ where: { id: workstationId } })
            if (!ws) {
                throw new Error('Workstation not found')
            }
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

        return item
    }

    async updateInventoryQuantity(id, totalQuantity, reservedQuantity) {
        const existing = await prisma.inventoryItem.findUnique({ where: { id } })
        if (!existing) {
            throw new Error('Inventory item not found')
        }

        const updateData = {}

        if (totalQuantity !== undefined) {
            if (totalQuantity < 1) {
                throw new Error('Total quantity must be at least 1')
            }
            updateData.totalQuantity = totalQuantity
            if (totalQuantity < existing.reservedQuantity) updateData.reservedQuantity = totalQuantity
        }

        if (reservedQuantity !== undefined) {
            if (reservedQuantity < 0) {
                throw new Error('Reserved quantity cannot be negative')
            }
            const max = totalQuantity !== undefined ? totalQuantity : existing.totalQuantity
            if (reservedQuantity > max) {
                throw new Error('Reserved quantity cannot exceed total quantity')
            }
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

        return item
    }

    async updateInventoryWorkstation(id, workstationId) {
        const existing = await prisma.inventoryItem.findUnique({ where: { id } })
        if (!existing) {
            throw new Error('Inventory item not found')
        }

        if (workstationId) {
            const ws = await prisma.workstation.findUnique({ where: { id: workstationId } })
            if (!ws) {
                throw new Error('Workstation not found')
            }

            // Проверяем, есть ли свободные единицы
            if (existing.reservedQuantity >= existing.totalQuantity) {
                throw new Error('No available units')
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

        return item
    }

    async deleteInventoryItem(id) {
        const existing = await prisma.inventoryItem.findUnique({ where: { id } })
        if (!existing) {
            throw new Error('Inventory item not found')
        }

        await prisma.inventoryItem.delete({ where: { id } })
    }

    async getInventoryStats() {
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

        return {
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
        }
    }
}