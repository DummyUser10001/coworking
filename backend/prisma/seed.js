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

async function main() {
  console.log('Starting seed...')

  console.log('Cleaning database...')
  await prisma.booking.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.workstation.deleteMany()
  await prisma.landmark.deleteMany()
  await prisma.floor.deleteMany()
  await prisma.discount.deleteMany()
  await prisma.coworkingCenter.deleteMany()
  await prisma.user.deleteMany()
  await prisma.workstationColorSettings.deleteMany()

  console.log('Creating users...')
  const password = 'password123'
  
  // Создаем пользователей
  const userData = [
    // Клиенты
    { email: 'ivan@example.com', password, firstName: 'Иван', lastName: 'Иванов', middleName: 'Иванович', role: 'CLIENT' },
    { email: 'petr@example.com', password, firstName: 'Петр', lastName: 'Петров', middleName: 'Петрович', role: 'CLIENT' },
    { email: 'maria@example.com', password, firstName: 'Мария', lastName: 'Сидорова', middleName: 'Алексеевна', role: 'CLIENT' },
    { email: 'alexey@example.com', password, firstName: 'Алексей', lastName: 'Кузнецов', middleName: 'Сергеевич', role: 'CLIENT' },
    
    // Менеджеры
    { email: 'olga.manager@example.com', password, firstName: 'Ольга', lastName: 'Смирнова', middleName: 'Владимировна', role: 'MANAGER' },
    { email: 'dmitry.manager@example.com', password, firstName: 'Дмитрий', lastName: 'Козлов', middleName: 'Андреевич', role: 'MANAGER' },
    { email: 'ekaterina.manager@example.com', password, firstName: 'Екатерина', lastName: 'Морозова', middleName: 'Сергеевна', role: 'MANAGER' },
    
    // Администратор
    { email: 'admin@example.com', password, firstName: 'Админ', lastName: 'Админов', middleName: 'Админович', role: 'ADMIN' }
  ]

  const createdUsers = []
  for (const user of userData) {
    try {
      if (user.role === 'CLIENT') {
        await authService.register(
          user.email,
          user.password,
          user.firstName,
          user.lastName,
          user.middleName,
          user.role
        )
      } else {
        const createdUser = await userService.createUser(
          user.email,
          user.password,
          user.firstName,
          user.lastName,
          user.middleName,
          user.role
        )
        createdUsers.push(createdUser)
      }
      console.log(`Created user: ${user.email}`)
    } catch (error) {
      console.log(`User ${user.email} already exists or error:`, error.message)
    }
  }

  console.log(`Created ${await prisma.user.count()} users`)

  console.log('Creating color settings...')
  await colorSettingsService.updateColorSettings({
    workstations: {
      DESK: '#3B82F6',
      COMPUTER_DESK: '#10B981',
      MEETING_ROOM: '#8B5CF6',
      CONFERENCE_ROOM: '#F59E0B'
    },
    landmarks: {
      ENTRANCE: '#EF4444',
      TOILET: '#10B981'
    }
  })

  console.log('Creating coworking centers...')
  const coworkingCenters = [
    {
      address: 'г. Уфа, ул. Ленина, 65',
      latitude: 54.734768,
      longitude: 55.957838,
      phone: '+7 (347) 123-45-67',
      email: 'coworking1@ufa.ru',
      openingTime: '08:00',
      closingTime: '22:00',
      amenities: ['WIFI', 'COFFEE', 'SNACKS'],
      isActive: true
    },
    {
      address: 'г. Уфа, проспект Октября, 46',
      latitude: 54.791821,
      longitude: 56.050583,
      phone: '+7 (347) 234-56-78',
      email: 'coworking2@ufa.ru',
      openingTime: '09:00',
      closingTime: '21:00',
      amenities: ['WIFI', 'COFFEE', 'PARKING'],
      isActive: true
    },
    {
      address: 'г. Уфа, ул. Революционная, 85',
      latitude: 54.721543,
      longitude: 55.930215,
      phone: '+7 (347) 345-67-89',
      email: 'coworking3@ufa.ru',
      openingTime: '07:30',
      closingTime: '23:00',
      amenities: ['WIFI', 'COFFEE', 'TEA', 'LOCKERS'],
      isActive: true
    }
  ]

  const createdCoworkingCenters = []
  for (const centerData of coworkingCenters) {
    const center = await coworkingService.createCenter(centerData)
    createdCoworkingCenters.push(center)
    console.log(`Created coworking center: ${center.address}`)
  }

  console.log('Creating floors...')
  const floors = [
    { level: 1, width: 12, height: 10, coworkingCenterId: createdCoworkingCenters[0].id },
    { level: 2, width: 10, height: 8, coworkingCenterId: createdCoworkingCenters[0].id },
    { level: 1, width: 15, height: 12, coworkingCenterId: createdCoworkingCenters[1].id },
    { level: 1, width: 8, height: 6, coworkingCenterId: createdCoworkingCenters[2].id }
  ]

  const createdFloors = []
  for (const floorData of floors) {
    const floor = await floorService.createFloor(floorData)
    createdFloors.push(floor)
    console.log(`Created floor level ${floor.level} for center ${floor.coworkingCenterId}`)
  }

  console.log('Creating landmarks...')
  const landmarks = [
    { floorId: createdFloors[0].id, type: 'ENTRANCE', x: 0, y: 5, name: 'Главный вход', rotation: 0 },
    { floorId: createdFloors[0].id, type: 'TOILET', x: 11, y: 0, name: 'Туалет', rotation: 0 },
    { floorId: createdFloors[2].id, type: 'ENTRANCE', x: 0, y: 6, name: 'Главный вход', rotation: 0 },
    { floorId: createdFloors[2].id, type: 'TOILET', x: 14, y: 0, name: 'Туалет', rotation: 0 },
    { floorId: createdFloors[3].id, type: 'ENTRANCE', x: 0, y: 3, name: 'Главный вход', rotation: 0 },
    { floorId: createdFloors[3].id, type: 'TOILET', x: 7, y: 0, name: 'Туалет', rotation: 0 }
  ]

  for (const landmarkData of landmarks) {
    await landmarkService.createLandmark(landmarkData)
  }

  console.log('Creating workstations...')
  const workstations = [
    // Первый коворкинг — этаж 1
    { number: 1, floorId: createdFloors[0].id, type: 'DESK', capacity: 1, basePricePerDay: 500, basePricePerWeek: 2500, basePricePerMonth: 8000, x: 2, y: 2, width: 1, height: 1 },
    { number: 2, floorId: createdFloors[0].id, type: 'DESK', capacity: 1, basePricePerDay: 500, basePricePerWeek: 2500, basePricePerMonth: 8000, x: 4, y: 2, width: 1, height: 1 },
    { number: 3, floorId: createdFloors[0].id, type: 'DESK', capacity: 1, basePricePerDay: 500, basePricePerWeek: 2500, basePricePerMonth: 8000, x: 6, y: 2, width: 1, height: 1 },
    { number: 4, floorId: createdFloors[0].id, type: 'COMPUTER_DESK', capacity: 1, basePricePerDay: 700, basePricePerWeek: 3500, basePricePerMonth: 12000, x: 2, y: 4, width: 1, height: 1 },
    { number: 5, floorId: createdFloors[0].id, type: 'COMPUTER_DESK', capacity: 1, basePricePerDay: 700, basePricePerWeek: 3500, basePricePerMonth: 12000, x: 4, y: 4, width: 1, height: 1 },
    { number: 6, floorId: createdFloors[0].id, type: 'MEETING_ROOM', capacity: 4, basePricePerHour: 250, x: 8, y: 1, width: 3, height: 2 },
    { number: 7, floorId: createdFloors[0].id, type: 'CONFERENCE_ROOM', capacity: 10, basePricePerHour: 625, x: 8, y: 6, width: 4, height: 3 },
    
    // Первый коворкинг — этаж 2
    { number: 8, floorId: createdFloors[1].id, type: 'DESK', capacity: 1, basePricePerDay: 450, basePricePerWeek: 2200, basePricePerMonth: 7000, x: 1, y: 1, width: 1, height: 1 },
    { number: 9, floorId: createdFloors[1].id, type: 'DESK', capacity: 1, basePricePerDay: 450, basePricePerWeek: 2200, basePricePerMonth: 7000, x: 3, y: 1, width: 1, height: 1 },
    { number: 10, floorId: createdFloors[1].id, type: 'COMPUTER_DESK', capacity: 1, basePricePerDay: 650, basePricePerWeek: 3200, basePricePerMonth: 11000, x: 5, y: 1, width: 1, height: 1 },
    { number: 11, floorId: createdFloors[1].id, type: 'MEETING_ROOM', capacity: 6, basePricePerHour: 300, x: 1, y: 4, width: 4, height: 3 },
    
    // Второй коворкинг
    { number: 12, floorId: createdFloors[2].id, type: 'DESK', capacity: 1, basePricePerDay: 600, basePricePerWeek: 3000, basePricePerMonth: 10000, x: 3, y: 3, width: 1, height: 1 },
    { number: 13, floorId: createdFloors[2].id, type: 'DESK', capacity: 1, basePricePerDay: 600, basePricePerWeek: 3000, basePricePerMonth: 10000, x: 5, y: 3, width: 1, height: 1 },
    { number: 14, floorId: createdFloors[2].id, type: 'COMPUTER_DESK', capacity: 1, basePricePerDay: 800, basePricePerWeek: 4000, basePricePerMonth: 15000, x: 7, y: 3, width: 1, height: 1 },
    { number: 15, floorId: createdFloors[2].id, type: 'COMPUTER_DESK', capacity: 1, basePricePerDay: 800, basePricePerWeek: 4000, basePricePerMonth: 15000, x: 9, y: 3, width: 1, height: 1 },
    { number: 16, floorId: createdFloors[2].id, type: 'MEETING_ROOM', capacity: 6, basePricePerHour: 375, x: 3, y: 7, width: 3, height: 2 },
    { number: 17, floorId: createdFloors[2].id, type: 'CONFERENCE_ROOM', capacity: 12, basePricePerHour: 750, x: 8, y: 7, width: 5, height: 3 },
    
    // Третий коворкинг
    { number: 18, floorId: createdFloors[3].id, type: 'DESK', capacity: 1, basePricePerDay: 550, basePricePerWeek: 2750, basePricePerMonth: 9000, x: 1, y: 1, width: 1, height: 1 },
    { number: 19, floorId: createdFloors[3].id, type: 'DESK', capacity: 1, basePricePerDay: 550, basePricePerWeek: 2750, basePricePerMonth: 9000, x: 3, y: 1, width: 1, height: 1 },
    { number: 20, floorId: createdFloors[3].id, type: 'COMPUTER_DESK', capacity: 1, basePricePerDay: 750, basePricePerWeek: 3750, basePricePerMonth: 13000, x: 5, y: 1, width: 1, height: 1 },
    { number: 21, floorId: createdFloors[3].id, type: 'CONFERENCE_ROOM', capacity: 8, basePricePerHour: 450, x: 1, y: 3, width: 4, height: 2 }
  ]

  const createdWorkstations = []
  for (const wsData of workstations) {
    try {
      const workstation = await workstationService.createWorkstation(wsData)
      createdWorkstations.push(workstation)
      console.log(`Created workstation ${workstation.number} of type ${workstation.type}`)
    } catch (error) {
      console.log(`Error creating workstation:`, error.message)
    }
  }

  console.log('Creating inventory...')
  const inventoryItems = [
    // Мониторы для компьютерных столов
    { workstationId: createdWorkstations[3].id, type: 'MONITOR', description: '27" 4K монитор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[4].id, type: 'MONITOR', description: '27" 4K монитор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[9].id, type: 'MONITOR', description: '24" Full HD монитор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[13].id, type: 'MONITOR', description: '27" 4K монитор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[14].id, type: 'MONITOR', description: '27" 4K монитор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[19].id, type: 'MONITOR', description: '24" Full HD монитор', totalQuantity: 1, reservedQuantity: 1 },
    
    // Проекторы для переговорных
    { workstationId: createdWorkstations[5].id, type: 'PROJECTOR', description: 'Full HD проектор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[6].id, type: 'PROJECTOR', description: '4K проектор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[10].id, type: 'PROJECTOR', description: 'HD проектор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[15].id, type: 'PROJECTOR', description: 'Full HD проектор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[16].id, type: 'PROJECTOR', description: '4K проектор', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[20].id, type: 'PROJECTOR', description: 'Full HD проектор', totalQuantity: 1, reservedQuantity: 1 },
    
    // Доски для переговорных
    { workstationId: createdWorkstations[5].id, type: 'WHITEBOARD', description: 'Большая маркерная доска', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[6].id, type: 'WHITEBOARD', description: 'Интерактивная доска', totalQuantity: 1, reservedQuantity: 1 },
    { workstationId: createdWorkstations[10].id, type: 'WHITEBOARD', description: 'Маркерная доска', totalQuantity: 1, reservedQuantity: 1 },
    
    // Микрофоны для конференц-залов
    { workstationId: createdWorkstations[6].id, type: 'MICROPHONE', description: 'Конференц-микрофон', totalQuantity: 5, reservedQuantity: 5 },
    { workstationId: createdWorkstations[16].id, type: 'MICROPHONE', description: 'Конференц-микрофон', totalQuantity: 8, reservedQuantity: 8 },
    { workstationId: createdWorkstations[20].id, type: 'MICROPHONE', description: 'Конференц-микрофон', totalQuantity: 6, reservedQuantity: 6 },
    
    // Свободные ноутбуки
    { type: 'LAPTOP', description: 'Ноутбук Dell XPS 13', totalQuantity: 5, reservedQuantity: 0 },
    { type: 'LAPTOP', description: 'Ноутбук MacBook Pro', totalQuantity: 3, reservedQuantity: 0 },
    
    // Запасные проекторы
    { type: 'PROJECTOR', description: 'Запасной HD проектор', totalQuantity: 2, reservedQuantity: 0 },
    
    // Запасные мониторы
    { type: 'MONITOR', description: 'Запасной 24" монитор', totalQuantity: 3, reservedQuantity: 0 }
  ]

  for (const itemData of inventoryItems) {
    try {
      await inventoryService.createInventoryItem(itemData)
    } catch (error) {
      console.log(`Error creating inventory item:`, error.message)
    }
  }

  console.log('Creating discounts...')
  const discounts = [
    {
      name: 'Ноябрьская скидка',
      description: 'Скидка для ранних пташек',
      percentage: 29,
      maxDiscountAmount: 500,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // через год
      applicableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      applicableHours: '08:00-12:00',
      isActive: true,
      priority: 10
    },
    {
      name: 'Декабрьская скидка',
      description: 'Скидка для ранних пташек',
      percentage: 15,
      maxDiscountAmount: 500,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // через год
      applicableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      applicableHours: '08:00-12:00',
      isActive: true,
      priority: 10
    },
    {
      name: 'Выходной день',
      description: 'Скидка в выходные дни',
      percentage: 20,
      maxDiscountAmount: 800,
      usageLimit: null,
      startDate: '2025-12-15',
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      applicableDays: ['saturday', 'sunday'],
      applicableHours: null,
      isActive: true,
      priority: 5
    },
    {
      name: 'Долгосрочная аренда',
      description: 'Скидка при бронировании на месяц',
      percentage: 25,
      maxDiscountAmount: 2000,
      usageLimit: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // через полгода
      applicableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      applicableHours: null,
      isActive: true,
      priority: 8
    }
  ]

  for (const discountData of discounts) {
    try {
      await discountService.createDiscount(discountData)
    } catch (error) {
      console.log(`Error creating discount:`, error.message)
    }
  }

  console.log('Creating bookings and payments...')
  const users = await prisma.user.findMany({ where: { role: 'CLIENT' } })
  
  // Фильтруем только столы
  const desksForBooking = createdWorkstations.filter(ws => ['DESK', 'COMPUTER_DESK'].includes(ws.type))
  
  // Создаем активные бронирования на сегодня
  for (let i = 0; i < Math.min(3, desksForBooking.length); i++) {
    const ws = desksForBooking[i]
    const user = users[i % users.length]
    
    const startTime = new Date()
    startTime.setHours(9, 0, 0, 0)
    
    const endTime = new Date()
    endTime.setHours(18, 0, 0, 0)
    
    try {
      const bookingData = {
        coworkingCenterId: ws.floor.coworkingCenterId,
        workstationId: ws.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookingDuration: 'day',
        basePrice: ws.basePricePerDay,
        discountPercentage: 0,
        finalPrice: ws.basePricePerDay
      }
      
      await bookingService.createBooking(user.id, bookingData)
      console.log(`Created active booking for user ${user.email} at workstation ${ws.number}`)
    } catch (error) {
      console.log(`Error creating booking:`, error.message)
    }
  }

  // Создаем завершенные бронирования на вчера
  for (let i = 0; i < Math.min(2, desksForBooking.length); i++) {
    const ws = desksForBooking[i]
    const user = users[(i + 1) % users.length]
    
    const startTime = new Date()
    startTime.setDate(startTime.getDate() - 1)
    startTime.setHours(10, 0, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(17, 0, 0, 0)
    
    const finalPrice = ws.basePricePerDay * 0.9 // 10% скидка
    
    try {
      const bookingData = {
        coworkingCenterId: ws.floor.coworkingCenterId,
        workstationId: ws.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookingDuration: 'day',
        basePrice: ws.basePricePerDay,
        discountPercentage: 10,
        finalPrice: finalPrice
      }
      
      const booking = await bookingService.createBooking(user.id, bookingData)
      
      // Обновляем статус на COMPLETED
      await bookingService.updateBookingStatus(booking.id, user.id, 'COMPLETED')
      console.log(`Created completed booking for user ${user.email} at workstation ${ws.number}`)
    } catch (error) {
      console.log(`Error creating completed booking:`, error.message)
    }
  }

  // Создаем отмененное бронирование с полным возвратом
  if (desksForBooking.length > 0) {
    const ws = desksForBooking[0]
    const user = users[0]
    
    const startTime = new Date()
    startTime.setDate(startTime.getDate() + 5)
    startTime.setHours(9, 0, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(18, 0, 0, 0)
    
    try {
      const bookingData = {
        coworkingCenterId: ws.floor.coworkingCenterId,
        workstationId: ws.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        bookingDuration: 'day',
        basePrice: ws.basePricePerDay,
        discountPercentage: 0,
        finalPrice: ws.basePricePerDay
      }
      
      const booking = await bookingService.createBooking(user.id, bookingData)
      
      // Отменяем бронирование
      await bookingService.cancelBooking(booking.id, user.id)
      console.log(`Created cancelled booking with full refund for user ${user.email}`)
    } catch (error) {
      console.log(`Error creating cancelled booking:`, error.message)
    }
  }

  console.log(`Created ${await prisma.booking.count()} bookings`)
  console.log(`Created ${await prisma.payment.count()} payments`)

  console.log('Seed completed!')
  console.log(`Users: ${await prisma.user.count()}`)
  console.log(`Coworking Centers: ${createdCoworkingCenters.length}`)
  console.log(`Floors: ${createdFloors.length}`)
  console.log(`Workstations: ${createdWorkstations.length}`)
  console.log(`Landmarks: ${landmarks.length}`)
  console.log(`Inventory Items: ${inventoryItems.length}`)
  console.log(`Discounts: ${discounts.length}`)
  console.log(`Bookings: ${await prisma.booking.count()}`)
  console.log(`Payments: ${await prisma.payment.count()}`)
  
  console.log('\n=== ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ ===')
  console.log('Клиенты:')
  console.log('- ivan@example.com / password123')
  console.log('- petr@example.com / password123')
  console.log('- maria@example.com / password123')
  console.log('- alexey@example.com / password123')
  
  console.log('\nМенеджеры:')
  console.log('- olga.manager@example.com / password123')
  console.log('- dmitry.manager@example.com / password123')
  console.log('- ekaterina.manager@example.com / password123')
  
  console.log('\nАдминистратор:')
  console.log('- admin@example.com / password123')

  
  // Тестируем сервис пользователей
  const allUsers = await userService.getAllUsers()
  console.log(`\nВсего пользователей в системе: ${allUsers.length}`)
  
  // Тестируем сервис коворкингов
  const activeCenters = await coworkingService.getAllCenters(true)
  console.log(`Активных коворкингов: ${activeCenters.length}`)
  
  // Тестируем сервис скидок
  const activeDiscounts = await discountService.getActiveDiscounts()
  console.log(`Активных скидок: ${activeDiscounts.length}`)
  
  // Тестируем сервис инвентаря
  const inventoryStats = await inventoryService.getInventoryStats()
  console.log(`Всего предметов инвентаря: ${inventoryStats.totalItems}`)
  console.log(`Доступно для бронирования: ${inventoryStats.availableQuantity}`)
}

main()
  .catch(e => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })