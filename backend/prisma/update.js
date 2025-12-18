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

// Функция для обновления пользователя
async function updateUser(userId, updateData) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })
    console.log(`Updated user: ${updatedUser.email}`)
    return updatedUser
  } catch (error) {
    console.log(`Error updating user ${userId}:`, error.message)
    return null
  }
}

// Функция для обновления коворкинга
async function updateCoworkingCenter(centerId, updateData) {
  try {
    const updatedCenter = await coworkingService.updateCenter(centerId, updateData)
    console.log(`Updated coworking center: ${updatedCenter?.address}`)
    return updatedCenter
  } catch (error) {
    console.log(`Error updating coworking center ${centerId}:`, error.message)
    return null
  }
}

// Функция для обновления этажа
async function updateFloor(floorId, updateData) {
  try {
    const updatedFloor = await floorService.updateFloor(floorId, updateData)
    console.log(`Updated floor level ${updatedFloor?.level}`)
    return updatedFloor
  } catch (error) {
    console.log(`Error updating floor ${floorId}:`, error.message)
    return null
  }
}

// Функция для обновления рабочего места
async function updateWorkstation(workstationId, updateData) {
  try {
    const updatedWs = await workstationService.updateWorkstation(workstationId, updateData)
    console.log(`Updated workstation ${updatedWs?.number}`)
    return updatedWs
  } catch (error) {
    console.log(`Error updating workstation ${workstationId}:`, error.message)
    return null
  }
}

// Функция для обновления ориентира
async function updateLandmark(landmarkId, updateData) {
  try {
    const updatedLandmark = await landmarkService.updateLandmark(landmarkId, updateData)
    console.log(`Updated landmark: ${updatedLandmark?.name}`)
    return updatedLandmark
  } catch (error) {
    console.log(`Error updating landmark ${landmarkId}:`, error.message)
    return null
  }
}

// Функция для обновления инвентаря
async function updateInventoryItem(itemId, updateData) {
  try {
    const updatedItem = await inventoryService.updateInventoryItem(itemId, updateData)
    console.log(`Updated inventory item: ${updatedItem?.description}`)
    return updatedItem
  } catch (error) {
    console.log(`Error updating inventory item ${itemId}:`, error.message)
    return null
  }
}

// Функция для обновления скидки
async function updateDiscount(discountId, updateData) {
  try {
    const updatedDiscount = await discountService.updateDiscount(discountId, updateData)
    console.log(`Updated discount: ${updatedDiscount?.name}`)
    return updatedDiscount
  } catch (error) {
    console.log(`Error updating discount ${discountId}:`, error.message)
    return null
  }
}

// Функция для обновления статуса бронирования
async function updateBookingStatus(bookingId, userId, status) {
  try {
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, userId, status)
    console.log(`Updated booking status to: ${updatedBooking?.status}`)
    return updatedBooking
  } catch (error) {
    console.log(`Error updating booking ${bookingId}:`, error.message)
    return null
  }
}

// Функция для обновления цветовых настроек
async function updateColorSettings(colorData) {
  try {
    await colorSettingsService.updateColorSettings(colorData)
    console.log('Updated color settings')
  } catch (error) {
    console.log(`Error updating color settings:`, error.message)
  }
}

async function main() {
  console.log('Starting update operations...')


  // Update User
  const updateUserUpdateData = {
    firstName: 'Обновленный Иван',
    lastName: 'Обновленный Иванов',
    middleName: 'Обновленный Иванович',
  }
  await updateUser('cmj3znd580000pxi8y4wb17mx', updateUserUpdateData)

  // Update Coworking Center
  const updateCoworkingCenterUpdateData = {
    address: 'г. Уфа, ул. Обновленная, 100',
    phone: '+7 (347) 999-88-77',
    email: 'updated.center@example.com',
    openingTime: '07:00',
    closingTime: '23:00',
    amenities: ['WIFI', 'COFFEE', 'SNACKS', 'PARKING', 'LOCKERS']
  }
  await updateCoworkingCenter('cmj3zndq7000bpxi8s7hq2mid', updateCoworkingCenterUpdateData)

  // Update Floor
  const updateFloorUpdateData = {
    width: 15,
    height: 12
  }
  await updateFloor('cmj3zndqk000jpxi80ixj4m84', updateFloorUpdateData)

  // Update Workstation
  const updateWorkstationUpdateData = {
    number: 100,
    basePricePerDay: 600,
    basePricePerWeek: 3000,
    basePricePerMonth: 10000
  }
  await updateWorkstation('cmj3zndr5000xpxi82t4n9ke3', updateWorkstationUpdateData)

  // Update Landmark
  const updateLandmarkUpdateData = {
    name: 'Обновленный вход',
    x: 1,
    y: 1
  }
  await updateLandmark('cmj3zndqn000lpxi859fw41ny', updateLandmarkUpdateData)

  // Update Inventory Item
  const updateInventoryItemUpdateData = {
    totalQuantity: 10,
    description: 'Обновленный монитор 27" 4K'
  }
  await updateInventoryItem('cmj3zndus0023pxi8wakfml5h', updateInventoryItemUpdateData)

  // Update Discount
  const updateDiscountUpdateData = {
    name: 'Неноябрьская скидка',
    percentage: 19,
    maxDiscountAmount: 700,
    usageLimit: 80
  }
  await updateDiscount('cmj40rv9g003apxas5kz8um5d', updateDiscountUpdateData)

  // Update Booking Status
  await updateBookingStatus('cmj3zndyg003spxi8ozjel9in', 'cmj3znd6v0001pxi8ic7n6zfn', 'ACTIVE') //bookingId, userId

  // Update Color Settings (не требует ID)
  const updateColorSettingsUpdateData = {
    workstations: {
      DESK: '#EF4444',
      COMPUTER_DESK: '#8B5CF6',
      MEETING_ROOM: '#10B981',
      CONFERENCE_ROOM: '#F59E0B'
    },
    landmarks: {
      ENTRANCE: '#3B82F6',
      TOILET: '#EC4899'
    }
  }
  await updateColorSettings(updateColorSettingsUpdateData)

  console.log('Update operations completed!')
  console.log(`Total users after updates: ${await prisma.user.count()}`)
  console.log(`Total coworking centers: ${await prisma.coworkingCenter.count()}`)
  console.log(`Total workstations: ${await prisma.workstation.count()}`)
}

main()
  .catch(e => {
    console.error('Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })