import prisma from '../prismaClient.js'

export class DiscountService {
    async getAllDiscounts(isActive) {
        const discounts = await prisma.discount.findMany({
            where: isActive ? { isActive: isActive === 'true' } : {},
            orderBy: [
                { priority: 'desc' },
                { name: 'asc' }
            ]
        })
        return discounts
    }

    async getDiscountById(id) {
        const discount = await prisma.discount.findUnique({
            where: { id }
        })
        
        if (!discount) {
            throw new Error('Discount not found')
        }
        
        return discount
    }

    async createDiscount(data) {
        const { 
            name,
            description,
            percentage,
            maxDiscountAmount,
            usageLimit,
            startDate,
            endDate,
            applicableDays,
            applicableHours,
            isActive,
            priority
        } = data

        // Валидация обязательных полей
        if (!name || !name.trim()) {
            throw new Error('Название скидки обязательно')
        }

        if (!percentage || percentage <= 0) {
            throw new Error('Размер скидки должен быть положительным числом')
        }

        if (percentage > 50) {
            throw new Error('Размер скидки не может превышать 50%')
        }

        if (!startDate) {
            throw new Error('Дата начала обязательна')
        }

        if (!endDate) {
            throw new Error('Дата окончания обязательна')
        }

        if (new Date(endDate) < new Date(startDate)) {
            throw new Error('Дата окончания не может быть раньше даты начала')
        }

        if (!applicableDays || applicableDays.length === 0) {
            throw new Error('Выберите хотя бы один день недели')
        }

        // Проверяем уникальность названия скидки
        const existingDiscount = await prisma.discount.findFirst({
            where: { name }
        })

        if (existingDiscount) {
            throw new Error('Скидка с таким названием уже существует')
        }

        const discount = await prisma.discount.create({
            data: {
                name,
                description: description || '',
                percentage: parseFloat(percentage),
                maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                applicableDays,
                applicableHours: applicableHours || null,
                isActive: isActive !== undefined ? isActive : true,
                priority: priority ? parseInt(priority) : 0
            }
        })
        
        return discount
    }

    async updateDiscount(id, data) {
        const { 
            name,
            description,
            percentage,
            maxDiscountAmount,
            usageLimit,
            startDate,
            endDate,
            applicableDays,
            applicableHours,
            isActive,
            priority
        } = data

        // Проверяем существование скидки
        const currentDiscount = await prisma.discount.findUnique({
            where: { id }
        })

        if (!currentDiscount) {
            throw new Error('Discount not found')
        }

        // Валидация
        if (name && !name.trim()) {
            throw new Error('Название скидки обязательно')
        }

        if (percentage !== undefined) {
            if (percentage <= 0) {
                throw new Error('Размер скидки должен быть положительным числом')
            }
            
            if (percentage > 50) {
                throw new Error('Размер скидки не может превышать 50%')
            }
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            throw new Error('Дата окончания не может быть раньше даты начала')
        }

        if (applicableDays && applicableDays.length === 0) {
            throw new Error('Выберите хотя бы один день недели')
        }

        // Если меняется название, проверяем уникальность
        if (name !== undefined && name !== currentDiscount.name) {
            const existingDiscount = await prisma.discount.findFirst({
                where: { name }
            })

            if (existingDiscount && existingDiscount.id !== id) {
                throw new Error('Скидка с таким названием уже существует')
            }
        }

        const discount = await prisma.discount.update({
            where: { id },
            data: {
                name: name !== undefined ? name : currentDiscount.name,
                description: description !== undefined ? description : currentDiscount.description,
                percentage: percentage !== undefined ? parseFloat(percentage) : currentDiscount.percentage,
                maxDiscountAmount: maxDiscountAmount !== undefined 
                    ? (maxDiscountAmount ? parseFloat(maxDiscountAmount) : null)
                    : currentDiscount.maxDiscountAmount,
                usageLimit: usageLimit !== undefined 
                    ? (usageLimit ? parseInt(usageLimit) : null)
                    : currentDiscount.usageLimit,
                startDate: startDate ? new Date(startDate) : currentDiscount.startDate,
                endDate: endDate ? new Date(endDate) : currentDiscount.endDate,
                applicableDays: applicableDays !== undefined ? applicableDays : currentDiscount.applicableDays,
                applicableHours: applicableHours !== undefined ? applicableHours : currentDiscount.applicableHours,
                isActive: isActive !== undefined ? isActive : currentDiscount.isActive,
                priority: priority !== undefined ? parseInt(priority) : currentDiscount.priority
            }
        })
        
        return discount
    }

    async deleteDiscount(id) {
        await prisma.discount.delete({
            where: { id }
        })
    }

    async getActiveDiscounts() {
        const activeDiscounts = await prisma.discount.findMany({
            where: { 
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
            },
            orderBy: [
                { priority: 'desc' },
                { name: 'asc' }
            ]
        })
        
        return activeDiscounts
    }

    async checkDiscountAvailability(date, time, dayOfWeek) {
        const currentDate = date ? new Date(date) : new Date()
        const currentTime = time || ''
        const currentDay = dayOfWeek || currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

        const applicableDiscounts = await prisma.discount.findMany({
            where: { 
                isActive: true,
                startDate: { lte: currentDate },
                endDate: { gte: currentDate },
                applicableDays: { has: currentDay }
            },
            orderBy: { priority: 'desc' }
        })

        // Фильтруем по времени, если указано
        const filteredDiscounts = applicableDiscounts.filter(discount => {
            if (!discount.applicableHours) return true // Весь день
            
            const [start, end] = discount.applicableHours.split('-')
            if (!currentTime) return true // Если время не указано, возвращаем все
            
            return currentTime >= start && currentTime <= end
        })
        
        return {
            applicableDiscounts: filteredDiscounts,
            totalCount: filteredDiscounts.length
        }
    }
}