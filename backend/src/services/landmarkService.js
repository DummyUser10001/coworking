import prisma from '../prismaClient.js'

export class LandmarkService {
    async getAllLandmarks(floorId) {
        const landmarks = await prisma.landmark.findMany({
            where: floorId ? { floorId } : {}
        })
        return landmarks
    }

    async getLandmarkById(id) {
        const landmark = await prisma.landmark.findUnique({
            where: { id }
        })
        
        if (!landmark) {
            throw new Error('Landmark not found')
        }
        
        return landmark
    }

    async createLandmark(data) {
        const { floorId, type, x, y, name, rotation } = data

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
        
        return landmark
    }

    async updateLandmark(id, data) {
        const { type, x, y, name, rotation } = data

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
        
        return landmark
    }

    async deleteLandmark(id) {
        await prisma.landmark.delete({
            where: { id }
        })
    }
}