import prisma from '../prismaClient.js'

const updateExpiredBookings = async () => {
  try {
    const now = new Date()

    const result = await prisma.booking.updateMany({
      where: {
        status: 'ACTIVE',
        endTime: {
          lt: now
        }
      },
      data: {
        status: 'COMPLETED'
      }
    })

    if (result.count > 0) {
      console.log(`[CRON] Updated ${result.count} booking(s) to COMPLETED at ${now.toISOString()}`)
    }
  } catch (error) {
    console.error('[CRON] Error updating expired bookings:', error)
  }
}

export default updateExpiredBookings