import prisma from '../prismaClient.js'

export class WorkstationService {
    async getAllWorkstations(floorId) {
        const workstations = await prisma.workstation.findMany({
            where: floorId ? { floorId } : {},
            include: {
                floor: {
                    include: {
                        coworkingCenter: true
                    }
                },
                inventory: true
            }
        })
        return workstations
    }

    async getWorkstationById(id) {
        const workstation = await prisma.workstation.findUnique({
            where: { id },
            include: {
                floor: {
                    include: {
                        coworkingCenter: true
                    }
                },
                inventory: true
            }
        })
        
        if (!workstation) {
            throw new Error('Workstation not found')
        }
        
        return workstation
    }

    async createWorkstation(data) {
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
        } = data

        // Проверяем уникальность номера в пределах этажа
        const existingWorkstation = await prisma.workstation.findFirst({
            where: {
                number,
                floorId
            }
        })

        if (existingWorkstation) {
            throw new Error('Рабочее место с таким номером уже существует на этом этаже')
        }

        // Валидация цен в зависимости от типа
        let priceData = {}
        
        if (type === 'DESK' || type === 'COMPUTER_DESK') {
            // Для столов должны быть дневные/недельные/месячные цены
            if (!basePricePerDay || !basePricePerWeek || !basePricePerMonth) {
                throw new Error('Для столов должны быть указаны цены за день, неделю и месяц')
            }
            priceData = {
                basePricePerDay,
                basePricePerWeek, 
                basePricePerMonth,
                basePricePerHour: null // Принудительно null для столов
            }
        } else if (type === 'MEETING_ROOM' || type === 'CONFERENCE_ROOM') {
            // Для комнат должна быть только почасовая цена
            if (!basePricePerHour) {
                throw new Error('Для комнат должна быть указана почасовая цена')
            }
            priceData = {
                basePricePerHour,
                basePricePerDay: null, // Принудительно null для комнат
                basePricePerWeek: null,
                basePricePerMonth: null
            }
        }

        const workstation = await prisma.workstation.create({
            data: {
                number,
                floorId,
                type,
                capacity,
                ...priceData,
                x,
                y,
                width: width || 1,
                height: height || 1
            },
            include: {
                floor: {
                    include: {
                        coworkingCenter: true
                    }
                },
                inventory: true
            }
        })
        
        return workstation
    }

    async updateWorkstation(id, data) {
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
        } = data

        // Получаем текущее рабочее место чтобы узнать floorId
        const currentWorkstation = await prisma.workstation.findUnique({
            where: { id },
            include: {
                floor: true
            }
        })

        if (!currentWorkstation) {
            throw new Error('Workstation not found')
        }

        // Если меняется номер, проверяем уникальность в пределах этажа
        if (number !== undefined && number !== currentWorkstation.number) {
            const existingWorkstation = await prisma.workstation.findFirst({
                where: {
                    number,
                    floorId: currentWorkstation.floorId
                }
            })

            if (existingWorkstation && existingWorkstation.id !== id) {
                throw new Error('Рабочее место с таким номером уже существует на этом этаже')
            }
        }

        // Валидация цен в зависимости от типа
        let priceData = {}
        
        if (type === 'DESK' || type === 'COMPUTER_DESK') {
            // Для столов должны быть дневные/недельные/месячные цены
            if (!basePricePerDay || !basePricePerWeek || !basePricePerMonth) {
                throw new Error('Для столов должны быть указаны цены за день, неделю и месяц')
            }
            priceData = {
                basePricePerDay,
                basePricePerWeek, 
                basePricePerMonth,
                basePricePerHour: null // Принудительно null для столов
            }
        } else if (type === 'MEETING_ROOM' || type === 'CONFERENCE_ROOM') {
            // Для комнат должна быть только почасовая цена
            if (!basePricePerHour) {
                throw new Error('Для комнат должна быть указана почасовая цена')
            }
            priceData = {
                basePricePerHour,
                basePricePerDay: null, // Принудительно null для комнат
                basePricePerWeek: null,
                basePricePerMonth: null
            }
        }

        const workstation = await prisma.workstation.update({
            where: { id },
            data: {
                number,
                type,
                capacity,
                ...priceData,
                x,
                y,
                width: width || 1,
                height: height || 1
            },
            include: {
                floor: {
                    include: {
                        coworkingCenter: true
                    }
                },
                inventory: true
            }
        })
        
        return workstation
    }

    async deleteWorkstation(id) {
        // Сначала удаляем связанный инвентарь
        await prisma.inventoryItem.deleteMany({
            where: { workstationId: id }
        })

        await prisma.workstation.delete({
            where: { id }
        })
    }

    async getWorkstationsByFloor(floorId) {
        const workstations = await prisma.workstation.findMany({
            where: { floorId },
            include: {
                floor: {
                    include: {
                        coworkingCenter: true
                    }
                },
                inventory: true
            },
            orderBy: {
                number: 'asc'
            }
        })
        
        return workstations
    }

    async checkWorkstationAvailability(id, date, time) {
        const workstation = await prisma.workstation.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: {
                        status: 'ACTIVE',
                        startTime: {
                            lte: new Date(`${date}T${time || '23:59:59'}`)
                        },
                        endTime: {
                            gte: new Date(`${date}T${time || '00:00:00'}`)
                        }
                    }
                }
            }
        })

        if (!workstation) {
            throw new Error('Workstation not found')
        }

        const isAvailable = workstation.bookings.length === 0
        
        return {
            isAvailable,
            workstation: {
                id: workstation.id,
                number: workstation.number,
                type: workstation.type,
                capacity: workstation.capacity
            },
            conflictingBookings: workstation.bookings
        }
    }

    async updateWorkstationInventory(id, inventory) {
        // Удаляем существующий инвентарь
        await prisma.inventoryItem.deleteMany({
            where: { workstationId: id }
        })

        // Создаем новый инвентарь
        if (inventory && inventory.length > 0) {
            await prisma.inventoryItem.createMany({
                data: inventory.map(item => ({
                    ...item,
                    workstationId: id
                }))
            })
        }

        const updatedWorkstation = await prisma.workstation.findUnique({
            where: { id },
            include: {
                inventory: true
            }
        })

        return updatedWorkstation
    }
}