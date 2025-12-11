import prisma from '../prismaClient.js'
import calculateDiscountWithPriority from '../discountCalculation.js'
import { calculateRefund } from '../refundCalculation.js'

export class BookingService {
    async getUserBookings(userId) {
        const bookings = await prisma.booking.findMany({
            where: { userId: userId },
            include: {
                coworkingCenter: {
                    select: { id: true, address: true }
                },
                workstation: {
                    select: { id: true, number: true, type: true, capacity: true }
                },
                payment: true
            },
            orderBy: { startTime: 'desc' }
        })
        return bookings
    }

    async getBookingById(id, userId) {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                coworkingCenter: {
                    select: { id: true, address: true, phone: true, email: true }
                },
                workstation: {
                    select: { 
                        id: true, 
                        number: true, 
                        type: true, 
                        capacity: true,
                        basePricePerDay: true,
                        basePricePerWeek: true,
                        basePricePerMonth: true
                    }
                },
                payment: true
            }
        })
        
        if (!booking) {
            throw new Error('Booking not found')
        }
        
        if (booking.userId !== userId) {
            throw new Error('Access denied')
        }
        
        return booking
    }

    async createBooking(userId, bookingData) {
        const {
            coworkingCenterId,
            workstationId,
            startTime,
            endTime,
            bookingDuration,
            basePrice,
            discountPercentage = 0,
            finalPrice
        } = bookingData

        // Проверяем существование рабочего места
        const workstation = await prisma.workstation.findUnique({
            where: { id: workstationId }
        })

        if (!workstation) {
            throw new Error('Workstation not found')
        }

        // проверка доступности на весь период
        const existingBooking = await prisma.booking.findFirst({
            where: {
                workstationId,
                OR: [
                    {
                        startTime: { lt: new Date(endTime) },
                        endTime: { gt: new Date(startTime) }
                    }
                ],
                status: { in: ['ACTIVE'] }
            }
        })

        if (existingBooking) {
            return {
                error: 'Workstation is not available for the selected period',
                conflictingBooking: {
                    id: existingBooking.id,
                    startTime: existingBooking.startTime,
                    endTime: existingBooking.endTime
                }
            }
        }

        // Проверяем цены
        let expectedBasePrice
        switch (bookingDuration) {
            case 'day': expectedBasePrice = workstation.basePricePerDay; break
            case 'week': expectedBasePrice = workstation.basePricePerWeek; break
            case 'month': expectedBasePrice = workstation.basePricePerMonth; break
            default: expectedBasePrice = workstation.basePricePerDay
        }

        if (Math.abs(basePrice - expectedBasePrice) > 0.01) {
            console.warn('Base price mismatch. Frontend:', basePrice, 'Expected:', expectedBasePrice)
        }

        // 1. Сначала создаем платеж
        const payment = await prisma.payment.create({
            data: {
                userId: userId,
                basePrice: basePrice,
                discountPercentage: discountPercentage,
                finalPrice: finalPrice,
                currency: "RUB",
                status: 'COMPLETED'
            }
        })

        // 2. Затем создаем бронирование с привязкой к платежу
        const booking = await prisma.booking.create({
            data: {
                userId: userId,
                coworkingCenterId,
                workstationId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                paymentId: payment.id,
                status: 'ACTIVE'
            },
            include: {
                coworkingCenter: { select: { address: true } },
                workstation: { select: { number: true, type: true } },
                payment: true
            }
        })

        console.log('Booking created with payment:', {
            bookingId: booking.id,
            paymentId: payment.id,
            finalPrice: finalPrice
        })

        return booking
    }

    async updateBookingStatus(id, userId, status) {
        // Проверяем существование бронирования
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: { payment: true }
        })
        
        if (!existingBooking) {
            throw new Error('Booking not found')
        }
        
        if (existingBooking.userId !== userId) {
            throw new Error('Access denied')
        }
        
        // Обновляем только статус
        const booking = await prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                coworkingCenter: { select: { address: true } },
                workstation: { select: { number: true, type: true } },
                payment: true
            }
        })

        // Если статус меняется на CANCELLED и есть оплата, обновляем статус платежа
        if (status === 'CANCELLED' && existingBooking.payment) {
            await prisma.payment.update({
                where: { id: existingBooking.payment.id },
                data: { status: 'REFUNDED' }
            })
        }
        
        return booking
    }

    async cancelBooking(id, userId) {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { payment: true }
        });

        if (!booking) {
            throw new Error('Бронь не найдена')
        }
        if (booking.status === 'CANCELLED') {
            throw new Error('Уже отменено')
        }

        // Проверка прав
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const isManager = user.role === 'ADMIN' || user.role === 'MANAGER';
        const isOwner = booking.userId === userId;
        if (!isOwner && !isManager) {
            throw new Error('Доступ запрещён')
        }

        const now = new Date();
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);

        // Запрещаем отмену только если бронь уже закончилась
        if (endTime <= now) {
            throw new Error('Бронь уже завершена — отмена невозможна')
        }

        const cancelledBy = isManager ? 'manager' : 'user';

        // гарантируем, что refund всегда имеет refundAmount
        let refundResult;
        try {
            refundResult = calculateRefund(booking, now, cancelledBy);
        } catch (err) {
            refundResult = { refundAmount: 0 };
        }

        const refundAmount = Number(refundResult.refundAmount) || 0;

        // Обновляем бронь
        await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        // Обновляем платёж — только если он был
        if (booking.payment) {
            await prisma.payment.update({
                where: { id: booking.payment.id },
                data: {
                    status: refundAmount > 0 ? 'REFUNDED' : 'COMPLETED',
                    refundAmount: refundAmount > 0 ? refundAmount : null
                }
            });
        }

        // Формируем красивый ответ
        const message = refundAmount > 0
            ? (isManager
                ? `Отменено менеджером. Возврат ${refundAmount}₽ (3–5 дней).`
                : `Отменено. Возврат ${refundAmount}₽ (3–5 дней).`)
            : 'Отменено. Возврат не предусмотрен.';

        return {
            message,
            cancelledBy,
            refund: { refundAmount }
        };
    }

    async checkAvailability(workstationId, startTime, endTime, excludeBookingId) {
        const workstation = await prisma.workstation.findUnique({
            where: { id: workstationId }
        })

        if (!workstation) {
            throw new Error('Workstation not found')
        }

        let whereClause = {
            workstationId,
            OR: [
                {
                    startTime: { lt: new Date(endTime) },
                    endTime: { gt: new Date(startTime) }
                }
            ],
            status: { in: ['ACTIVE'] }
        }

        if (excludeBookingId) {
            whereClause.NOT = { id: excludeBookingId }
        }

        const existingBooking = await prisma.booking.findFirst({
            where: whereClause
        })

        const isAvailable = !existingBooking
        
        return {
            isAvailable,
            workstation: {
                id: workstation.id,
                number: workstation.number,
                type: workstation.type,
                capacity: workstation.capacity
            },
            conflictingBooking: existingBooking ? {
                id: existingBooking.id,
                startTime: existingBooking.startTime,
                endTime: existingBooking.endTime
            } : null
        }
    }

    async calculatePrice(workstationId, bookingDuration, startTime) {
        const workstation = await prisma.workstation.findUnique({
            where: { id: workstationId }
        });

        if (!workstation) {
            throw new Error('Workstation not found')
        }

        let basePrice;
        
        if (workstation.type === 'MEETING_ROOM' || workstation.type === 'CONFERENCE_ROOM') {
            basePrice = workstation.basePricePerHour;
        } else {
            switch (bookingDuration) {
                case 'day': basePrice = workstation.basePricePerDay; break;
                case 'week': basePrice = workstation.basePricePerWeek; break;
                case 'month': basePrice = workstation.basePricePerMonth; break;
                default: basePrice = workstation.basePricePerDay;
            }
        }

        if (!basePrice || basePrice <= 0) {
            console.warn(`Invalid base price for workstation ${workstationId}, using default price`);
            basePrice = workstation.type === 'MEETING_ROOM' || workstation.type === 'CONFERENCE_ROOM' ? 1000 : 500;
        }

        const discounts = await prisma.discount.findMany({
            where: { isActive: true }
        });

        const result = calculateDiscountWithPriority(basePrice, discounts, new Date(startTime));

        return {
            basePrice: Number(basePrice.toFixed(2)),
            discountPercentage: result.discountPercentage,
            discountAmount: result.discountAmount,
            finalPrice: result.finalPrice,
            discountsApplied: result.discountsApplied,
            appliedDiscounts: result.appliedDiscounts,
            workstationType: workstation.type
        };
    }

    async getCoworkingCenterBookings(coworkingCenterId, date) {
        let whereClause = {
            coworkingCenterId,
            status: { in: ['ACTIVE'] }
        }

        if (date) {
            const startOfDay = new Date(date + 'T00:00:00.000Z')
            const endOfDay = new Date(date + 'T23:59:59.999Z')
            
            whereClause.OR = [
                {
                    startTime: { lte: endOfDay, gte: startOfDay }
                },
                {
                    endTime: { lte: endOfDay, gte: startOfDay }
                },
                {
                    AND: [
                        { startTime: { lte: startOfDay } },
                        { endTime: { gte: endOfDay } }
                    ]
                }
            ]
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true }
                },
                workstation: {
                    select: { id: true, number: true, type: true }
                },
                payment: true
            },
            orderBy: { startTime: 'asc' }
        })
        
        return bookings
    }

    async getWorkstationBookings(coworkingCenterId, workstationId, startDate, endDate) {
        let whereClause = {
            coworkingCenterId,
            workstationId,
            status: 'ACTIVE'
        }

        if (startDate && endDate) {
            const start = new Date(startDate + 'T00:00:00.000Z')
            const end = new Date(endDate + 'T23:59:59.999Z')
            
            whereClause.OR = [
                {
                    startTime: { lte: end, gte: start }
                },
                {
                    endTime: { lte: end, gte: start }
                },
                {
                    AND: [
                        { startTime: { lte: start } },
                        { endTime: { gte: end } }
                    ]
                }
            ]
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
                user: {
                    select: { firstName: true, lastName: true }
                },
                payment: true
            },
            orderBy: { startTime: 'asc' }
        })
        
        return bookings
    }

    async getAllBookings(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            throw new Error('Access denied')
        }

        const bookings = await prisma.booking.findMany({
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true, middleName: true }
                },
                coworkingCenter: {
                    select: { id: true, address: true }
                },
                workstation: {
                    select: { id: true, number: true, type: true, capacity: true }
                },
                payment: true
            },
            orderBy: { startTime: 'desc' }
        });
        
        return bookings
    }
}