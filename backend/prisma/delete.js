import { PrismaClient } from '@prisma/client'
import { AuthService } from '../src/services/authService.js'
import { UserService } from '../src/services/userService.js'
import { CoworkingService } from '../src/services/coworkingService.js'
import { FloorService } from '../src/services/floorService.js'
import { WorkstationService } from '../src/services/workstationService.js'
import { LandmarkService } from '../src/services/landmarkService.js'
import { InventoryService } from '../src/services/inventoryService.js'
import { DiscountService } from '../src/services/discountService.js'
import { BookingService } from '../src/services/bookingService.js'
import { ColorSettingsService } from '../src/services/colorSettingsService.js'

const prisma = new PrismaClient()
const authService = new AuthService()
const userService = new UserService()
const coworkingService = new CoworkingService()
const floorService = new FloorService()
const workstationService = new WorkstationService()
const landmarkService = new LandmarkService()
const inventoryService = new InventoryService()
const discountService = new DiscountService()
const bookingService = new BookingService()
const colorSettingsService = new ColorSettingsService()

// Функция для удаления бронирования
async function deleteBooking(bookingId, userId) {
  try {
    await bookingService.deleteBooking(bookingId, userId)
    console.log(`Deleted booking ID: ${bookingId}`)
    return true
  } catch (error) {
    console.log(`Error deleting booking ${bookingId}:`, error.message)
    return false
  }
}

// Функция для удаления инвентаря
async function deleteInventoryItem(itemId) {
  try {
    await inventoryService.deleteInventoryItem(itemId)
    console.log(`Deleted inventory item ID: ${itemId}`)
    return true
  } catch (error) {
    console.log(`Error deleting inventory item ${itemId}:`, error.message)
    return false
  }
}

// Функция для удаления ориентира
async function deleteLandmark(landmarkId) {
  try {
    await landmarkService.deleteLandmark(landmarkId)
    console.log(`Deleted landmark ID: ${landmarkId}`)
    return true
  } catch (error) {
    console.log(`Error deleting landmark ${landmarkId}:`, error.message)
    return false
  }
}

// Функция для удаления рабочего места
async function deleteWorkstation(workstationId) {
  try {
    // Проверяем наличие бронирований
    const bookings = await prisma.booking.findMany({
      where: { workstationId }
    })
    
    if (bookings.length > 0) {
      console.log(`Cannot delete workstation ${workstationId}: has active bookings`)
      return false
    }
    
    await workstationService.deleteWorkstation(workstationId)
    console.log(`Deleted workstation ID: ${workstationId}`)
    return true
  } catch (error) {
    console.log(`Error deleting workstation ${workstationId}:`, error.message)
    return false
  }
}

// Функция для удаления этажа
async function deleteFloor(floorId) {
  try {
    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: { workstations: true, landmarks: true }
    })
    
    if (floor.workstations.length > 0 || floor.landmarks.length > 0) {
      console.log(`Cannot delete floor ${floorId}: has associated workstations or landmarks`)
      return false
    }
    
    await floorService.deleteFloor(floorId)
    console.log(`Deleted floor ID: ${floorId}, level: ${floor.level}`)
    return true
  } catch (error) {
    console.log(`Error deleting floor ${floorId}:`, error.message)
    return false
  }
}

// Функция для удаления скидки
async function deleteDiscount(discountId) {
  try {
    await discountService.deleteDiscount(discountId)
    console.log(`Deleted discount ID: ${discountId}`)
    return true
  } catch (error) {
    console.log(`Error deleting discount ${discountId}:`, error.message)
    return false
  }
}

// Функция для удаления пользователя
async function deleteUser(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { bookings: true }
    })
    
    if (!user) {
      console.log(`User ${userId} not found`)
      return false
    }
    
    if (user.bookings.length > 0) {
      console.log(`Cannot delete user ${userId}: has active bookings`)
      return false
    }
    
    await userService.deleteUser(userId)
    console.log(`Deleted user ID: ${userId}, email: ${user.email}`)
    return true
  } catch (error) {
    console.log(`Error deleting user ${userId}:`, error.message)
    return false
  }
}

// Функция для удаления коворкинга
async function deleteCoworkingCenter(centerId) {
  try {
    const center = await prisma.coworkingCenter.findUnique({
      where: { id: centerId },
      include: { 
        floors: { include: { workstations: { include: { bookings: true } } } },
        bookings: true
      }
    })
    
    if (!center) {
      console.log(`Coworking center ${centerId} not found`)
      return false
    }
    
    const hasActiveData = center.bookings.length > 0 || 
                         center.floors.some(floor => 
                           floor.workstations.some(ws => ws.bookings.length > 0)
                         )
    
    if (hasActiveData || center.floors.length > 0) {
      console.log(`Cannot delete coworking center ${centerId}: has active data or floors`)
      return false
    }
    
    await coworkingService.deleteCenter(centerId)
    console.log(`Deleted coworking center ID: ${centerId}`)
    return true
  } catch (error) {
    console.log(`Error deleting coworking center ${centerId}:`, error.message)
    return false
  }
}


async function main() {

  // Примеры вызова функций с конкретными ID
  await deleteBooking('booking_id', 'user_id')
  await deleteInventoryItem('inventory_item_id')
  await deleteLandmark('landmark_id')
  await deleteWorkstation('workstation_id')
  await deleteFloor('floor_id')
  await deleteDiscount('cmj40rv9g003apxas5kz8um5d')
  await deleteUser('user_id')
  await deleteCoworkingCenter('coworking_center')

  console.log('Delete operations completed!')
  console.log(`Remaining users: ${await prisma.user.count()}`)
  console.log(`Remaining coworking centers: ${await prisma.coworkingCenter.count()}`)
  console.log(`Remaining floors: ${await prisma.floor.count()}`)
  console.log(`Remaining workstations: ${await prisma.workstation.count()}`)
  console.log(`Remaining bookings: ${await prisma.booking.count()}`)
  console.log(`Remaining inventory items: ${await prisma.inventoryItem.count()}`)
  console.log(`Remaining discounts: ${await prisma.discount.count()}`)
}

main()
  .catch(e => {
    console.error('Delete failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })