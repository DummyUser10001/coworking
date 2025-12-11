import prisma from '../prismaClient.js'

export class ColorSettingsService {
    async getColorSettings() {
        const settings = await prisma.workstationColorSettings.findFirst()
        
        if (!settings) {
            return {}
        }
        
        return settings.settings || {}
    }

    async updateColorSettings(colors) {
        let settings = await prisma.workstationColorSettings.findFirst()
        
        if (!settings) {
            settings = await prisma.workstationColorSettings.create({
                data: {
                    settings: colors
                }
            })
        } else {
            settings = await prisma.workstationColorSettings.update({
                where: { id: settings.id },
                data: {
                    settings: colors
                }
            })
        }
        
        return settings.settings
    }
}