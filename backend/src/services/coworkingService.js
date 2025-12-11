import prisma from '../prismaClient.js'

export class CoworkingService {
    async getAllCenters(activeOnly = true) {
        const centers = await prisma.coworkingCenter.findMany({
            where: activeOnly ? { isActive: true } : {},
            include: {
                floors: {
                    include: {
                        workstations: true,
                        landmarks: true
                    }
                }
            }
        })
        return centers
    }

    async getCenterById(id) {
        const center = await prisma.coworkingCenter.findUnique({
            where: { id },
            include: {
                floors: {
                    include: {
                        workstations: {
                            include: {
                                inventory: true
                            }
                        },
                        landmarks: true
                    }
                }
            }
        })
        
        if (!center) {
            throw new Error('Coworking center not found')
        }
        
        return center
    }

    async createCenter(data) {
        const { address, latitude, longitude, phone, email, openingTime, closingTime, amenities } = data

        // Валидация amenities
        if (amenities && Array.isArray(amenities)) {
            const validAmenities = ['WIFI', 'PARKING', 'COFFEE', 'TEA', 'SNACKS', 'LOCKERS']
            for (const amenity of amenities) {
                if (!validAmenities.includes(amenity)) {
                    throw new Error(`Invalid amenity: ${amenity}`)
                }
            }
        }

        const center = await prisma.coworkingCenter.create({
            data: {
                address,
                latitude,
                longitude,
                phone,
                email,
                openingTime,
                closingTime,
                amenities: amenities || []
            }
        })
        
        return center
    }

    async updateCenter(id, data) {
        const { address, latitude, longitude, phone, email, openingTime, closingTime, amenities, isActive } = data

        // Валидация amenities
        if (amenities && Array.isArray(amenities)) {
            const validAmenities = ['WIFI', 'PARKING', 'COFFEE', 'TEA', 'SNACKS', 'LOCKERS']
            for (const amenity of amenities) {
                if (!validAmenities.includes(amenity)) {
                    throw new Error(`Invalid amenity: ${amenity}`)
                }
            }
        }

        const center = await prisma.coworkingCenter.update({
            where: { id },
            data: {
                address,
                latitude,
                longitude,
                phone,
                email,
                openingTime,
                closingTime,
                amenities: amenities || [],
                isActive
            }
        })
        
        return center
    }

    async deleteCenter(id) {
        await prisma.coworkingCenter.delete({
            where: { id }
        })
    }
}