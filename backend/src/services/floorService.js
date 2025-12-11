import prisma from '../prismaClient.js'

export class FloorService {
    async getAllFloors(coworkingCenterId) {
        const floors = await prisma.floor.findMany({
            where: coworkingCenterId ? { coworkingCenterId } : {},
            include: {
                workstations: true,
                landmarks: true
            }
        })
        return floors
    }

    async getFloorById(id) {
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
            throw new Error('Floor not found')
        }
        
        return floor
    }

    async createFloor(data) {
        const { name, level, width, height, coworkingCenterId } = data

        const floor = await prisma.floor.create({
            data: {
                name,
                level,
                width,
                height,
                coworkingCenterId
            }
        })
        
        return floor
    }

    async updateFloor(id, data) {
        const { name, level, width, height } = data

        const floor = await prisma.floor.update({
            where: { id },
            data: {
                name,
                level,
                width,
                height
            }
        })
        
        return floor
    }

    async deleteFloor(id) {
        await prisma.floor.delete({
            where: { id }
        })
    }
}