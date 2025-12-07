import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.createMany({
    data: [
      // Клиенты
      { role: 'CLIENT', firstName: 'Иван', lastName: 'Иванов', middleName: 'Иванович', email: 'ivan@example.com', password: hashedPassword },
      { role: 'CLIENT', firstName: 'Петр', lastName: 'Петров', middleName: 'Петрович', email: 'petr@example.com', password: hashedPassword },
      { role: 'CLIENT', firstName: 'Мария', lastName: 'Сидорова', middleName: 'Алексеевна', email: 'maria@example.com', password: hashedPassword },
      { role: 'CLIENT', firstName: 'Алексей', lastName: 'Кузнецов', middleName: 'Сергеевич', email: 'alexey@example.com', password: hashedPassword },
      
      // Менеджеры
      { role: 'MANAGER', firstName: 'Ольга', lastName: 'Смирнова', middleName: 'Владимировна', email: 'olga.manager@example.com', password: hashedPassword },
      { role: 'MANAGER', firstName: 'Дмитрий', lastName: 'Козлов', middleName: 'Андреевич', email: 'dmitry.manager@example.com', password: hashedPassword },
      { role: 'MANAGER', firstName: 'Екатерина', lastName: 'Морозова', middleName: 'Сергеевна', email: 'ekaterina.manager@example.com', password: hashedPassword },
      
      // Администратор
      { role: 'ADMIN', firstName: 'Админ', lastName: 'Админов', middleName: 'Админович', email: 'admin@example.com', password: hashedPassword }
    ]
  })

  console.log(`Created ${await prisma.user.count()} users`)


  console.log('Creating color settings...')
  await prisma.workstationColorSettings.create({
    data: {
      settings: {
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
      }
    }
  })

  console.log('Creating coworking centers...')
  const coworking1 = await prisma.coworkingCenter.create({
    data: {
      address: 'г. Уфа, ул. Ленина, 65',
      latitude: 54.734768,
      longitude: 55.957838,
      isActive: true,
      phone: '+7 (347) 123-45-67',
      email: 'coworking1@ufa.ru',
      openingTime: '08:00',
      closingTime: '22:00',
      amenities: ['WIFI', 'COFFEE', 'SNACKS']
    }
  })

  const coworking2 = await prisma.coworkingCenter.create({
    data: {
      address: 'г. Уфа, проспект Октября, 46',
      latitude: 54.791821,
      longitude: 56.050583,
      isActive: true,
      phone: '+7 (347) 234-56-78',
      email: 'coworking2@ufa.ru',
      openingTime: '09:00',
      closingTime: '21:00',
      amenities: ['WIFI', 'COFFEE', 'PARKING']
    }
  })

  const coworking3 = await prisma.coworkingCenter.create({
    data: {
      address: 'г. Уфа, ул. Революционная, 85',
      latitude: 54.721543,
      longitude: 55.930215,
      isActive: true,
      phone: '+7 (347) 345-67-89',
      email: 'coworking3@ufa.ru',
      openingTime: '07:30',
      closingTime: '23:00',
      amenities: ['WIFI', 'COFFEE', 'TEA', 'LOCKERS']
    }
  })


  console.log('Creating floors...')
  const floor1_1 = await prisma.floor.create({ data: { level: 1, width: 12, height: 10, coworkingCenterId: coworking1.id } })
  const floor1_2 = await prisma.floor.create({ data: { level: 2, width: 10, height: 8, coworkingCenterId: coworking1.id } })
  const floor2_1 = await prisma.floor.create({ data: { level: 1, width: 15, height: 12, coworkingCenterId: coworking2.id } })
  const floor3_1 = await prisma.floor.create({ data: { level: 1, width: 8, height: 6, coworkingCenterId: coworking3.id } })

  console.log('Creating landmarks...')
  await prisma.landmark.createMany({
    data: [
      { floorId: floor1_1.id, type: 'ENTRANCE', x: 0, y: 5, name: 'Главный вход', rotation: 0 },
      { floorId: floor1_1.id, type: 'TOILET', x: 11, y: 0, name: 'Туалет', rotation: 0 },
      
      { floorId: floor2_1.id, type: 'ENTRANCE', x: 0, y: 6, name: 'Главный вход', rotation: 0 },
      { floorId: floor2_1.id, type: 'TOILET', x: 14, y: 0, name: 'Туалет', rotation: 0 },
      
      { floorId: floor3_1.id, type: 'ENTRANCE', x: 0, y: 3, name: 'Главный вход', rotation: 0 },
      { floorId: floor3_1.id, type: 'TOILET', x: 7, y: 0, name: 'Туалет', rotation: 0 }
    ]
  })

  console.log('Creating workstations...')
  await prisma.workstation.createMany({
    data: [
      // Первый коворкинг — этаж 1
      { number: 1, floorId: floor1_1.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 500, basePricePerWeek: 2500, basePricePerMonth: 8000, x: 2, y: 2, width: 1, height: 1 },
      { number: 2, floorId: floor1_1.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 500, basePricePerWeek: 2500, basePricePerMonth: 8000, x: 4, y: 2, width: 1, height: 1 },
      { number: 3, floorId: floor1_1.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 500, basePricePerWeek: 2500, basePricePerMonth: 8000, x: 6, y: 2, width: 1, height: 1 },
      { number: 4, floorId: floor1_1.id, type: 'COMPUTER_DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 700, basePricePerWeek: 3500, basePricePerMonth: 12000, x: 2, y: 4, width: 1, height: 1 },
      { number: 5, floorId: floor1_1.id, type: 'COMPUTER_DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 700, basePricePerWeek: 3500, basePricePerMonth: 12000, x: 4, y: 4, width: 1, height: 1 },
      { number: 6, floorId: floor1_1.id, type: 'MEETING_ROOM', capacity: 4, basePricePerHour: 250, basePricePerDay: null, basePricePerWeek: null, basePricePerMonth: null, x: 8, y: 1, width: 3, height: 2 },
      { number: 7, floorId: floor1_1.id, type: 'CONFERENCE_ROOM', capacity: 10, basePricePerHour: 625, basePricePerDay: null, basePricePerWeek: null, basePricePerMonth: null, x: 8, y: 6, width: 4, height: 3 },
      
      // Первый коворкинг — этаж 2
      { number: 8, floorId: floor1_2.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 450, basePricePerWeek: 2200, basePricePerMonth: 7000, x: 1, y: 1, width: 1, height: 1 },
      { number: 9, floorId: floor1_2.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 450, basePricePerWeek: 2200, basePricePerMonth: 7000, x: 3, y: 1, width: 1, height: 1 },
      { number: 10, floorId: floor1_2.id, type: 'COMPUTER_DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 650, basePricePerWeek: 3200, basePricePerMonth: 11000, x: 5, y: 1, width: 1, height: 1 },
      { number: 11, floorId: floor1_2.id, type: 'MEETING_ROOM', capacity: 6, basePricePerHour: 300, basePricePerDay: null, basePricePerWeek: null, basePricePerMonth: null, x: 1, y: 4, width: 4, height: 3 },
      
      // Второй коворкинг
      { number: 12, floorId: floor2_1.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 600, basePricePerWeek: 3000, basePricePerMonth: 10000, x: 3, y: 3, width: 1, height: 1 },
      { number: 13, floorId: floor2_1.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 600, basePricePerWeek: 3000, basePricePerMonth: 10000, x: 5, y: 3, width: 1, height: 1 },
      { number: 14, floorId: floor2_1.id, type: 'COMPUTER_DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 800, basePricePerWeek: 4000, basePricePerMonth: 15000, x: 7, y: 3, width: 1, height: 1 },
      { number: 15, floorId: floor2_1.id, type: 'COMPUTER_DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 800, basePricePerWeek: 4000, basePricePerMonth: 15000, x: 9, y: 3, width: 1, height: 1 },
      { number: 16, floorId: floor2_1.id, type: 'MEETING_ROOM', capacity: 6, basePricePerHour: 375, basePricePerDay: null, basePricePerWeek: null, basePricePerMonth: null, x: 3, y: 7, width: 3, height: 2 },
      { number: 17, floorId: floor2_1.id, type: 'CONFERENCE_ROOM', capacity: 12, basePricePerHour: 750, basePricePerDay: null, basePricePerWeek: null, basePricePerMonth: null, x: 8, y: 7, width: 5, height: 3 },
      
      // Третий коворкинг
      { number: 18, floorId: floor3_1.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 550, basePricePerWeek: 2750, basePricePerMonth: 9000, x: 1, y: 1, width: 1, height: 1 },
      { number: 19, floorId: floor3_1.id, type: 'DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 550, basePricePerWeek: 2750, basePricePerMonth: 9000, x: 3, y: 1, width: 1, height: 1 },
      { number: 20, floorId: floor3_1.id, type: 'COMPUTER_DESK', capacity: 1, basePricePerHour: null, basePricePerDay: 750, basePricePerWeek: 3750, basePricePerMonth: 13000, x: 5, y: 1, width: 1, height: 1 },
      { number: 21, floorId: floor3_1.id, type: 'CONFERENCE_ROOM', capacity: 8, basePricePerHour: 450, basePricePerDay: null, basePricePerWeek: null, basePricePerMonth: null, x: 1, y: 3, width: 4, height: 2 }
    ]
  })


  console.log('Creating inventory...')


  console.log('Creating discounts...')


  console.log('Creating bookings and payments...')

  const users = await prisma.user.findMany({ where: { role: 'CLIENT' } })
  const workstations = await prisma.workstation.findMany({
    include: { floor: { select: { coworkingCenterId: true } } }
  })

  const desksForBooking = workstations.filter(ws => ['DESK', 'COMPUTER_DESK'].includes(ws.type))
  for (let i = 0; i < Math.min(3, desksForBooking.length); i++) {
    const ws = desksForBooking[i]
    const start = new Date(); start.setHours(9, 0, 0, 0)
    const end = new Date(); end.setHours(18, 0, 0, 0)

    const payment = await prisma.payment.create({
      data: {
        userId: users[i % users.length].id,
        basePrice: ws.basePricePerDay,
        discountPercentage: 0,
        finalPrice: ws.basePricePerDay,
        currency: 'RUB',
        status: 'COMPLETED',
        refundAmount: null
      }
    })

    // Затем создаем бронирование с привязкой к платежу
    await prisma.booking.create({
      data: {
        userId: users[i % users.length].id,
        coworkingCenterId: ws.floor.coworkingCenterId,
        workstationId: ws.id,
        startTime: start,
        endTime: end,
        paymentId: payment.id,
        status: 'ACTIVE'
      }
    })
  }

  for (let i = 0; i < Math.min(2, desksForBooking.length); i++) {
    const ws = desksForBooking[i]
    const start = new Date()
    start.setDate(start.getDate() - 1)
    start.setHours(10, 0, 0, 0)
    const end = new Date(start); end.setHours(17, 0, 0, 0)

    const finalPrice = ws.basePricePerDay * 0.9 // 10% скидка

    // Создаем платеж
    const payment = await prisma.payment.create({
      data: {
        userId: users[(i + 1) % users.length].id,
        basePrice: ws.basePricePerDay,
        discountPercentage: 10,
        finalPrice: finalPrice,
        currency: 'RUB',
        status: 'COMPLETED',
        refundAmount: null
      }
    })

    // Создаем бронирование
    await prisma.booking.create({
      data: {
        userId: users[(i + 1) % users.length].id,
        coworkingCenterId: ws.floor.coworkingCenterId,
        workstationId: ws.id,
        startTime: start,
        endTime: end,
        paymentId: payment.id,
        status: 'COMPLETED'
      }
    })
  }

  //  Отменённое бронирование с полным возвратом
  if (desksForBooking.length > 0) {
    const ws = desksForBooking[0]
    const start = new Date(); start.setDate(start.getDate() + 5); start.setHours(9, 0, 0, 0)
    const end = new Date(start); end.setHours(18, 0, 0, 0)

    // Создаем платеж с возвратом
    const payment = await prisma.payment.create({
      data: {
        userId: users[0].id,
        basePrice: ws.basePricePerDay,
        discountPercentage: 0,
        finalPrice: ws.basePricePerDay,
        currency: 'RUB',
        status: 'REFUNDED',
        refundAmount: ws.basePricePerDay // полный возврат
      }
    })

    // Создаем бронирование
    await prisma.booking.create({
      data: {
        userId: users[0].id,
        coworkingCenterId: ws.floor.coworkingCenterId,
        workstationId: ws.id,
        startTime: start,
        endTime: end,
        paymentId: payment.id,
        status: 'CANCELLED'
      }
    })
  }

  // 4. Пример частичного возврата - используем REFUNDED
  if (desksForBooking.length > 1) {
    const ws = desksForBooking[1]
    const start = new Date(); start.setDate(start.getDate() + 3); start.setHours(9, 0, 0, 0)
    const end = new Date(start); end.setHours(18, 0, 0, 0)

    const partialRefund = ws.basePricePerDay * 0.5 // 50% возврат

    // Создаем платеж с частичным возвратом
    const payment = await prisma.payment.create({
      data: {
        userId: users[1].id,
        basePrice: ws.basePricePerDay,
        discountPercentage: 0,
        finalPrice: ws.basePricePerDay,
        currency: 'RUB',
        status: 'REFUNDED', // ИСПРАВЛЕНО: только REFUNDED
        refundAmount: partialRefund
      }
    })

    // Создаем бронирование
    await prisma.booking.create({
      data: {
        userId: users[1].id,
        coworkingCenterId: ws.floor.coworkingCenterId,
        workstationId: ws.id,
        startTime: start,
        endTime: end,
        paymentId: payment.id,
        status: 'CANCELLED'
      }
    })
  }

  console.log(`Created ${await prisma.booking.count()} bookings`)
  console.log(`Created ${await prisma.payment.count()} payments`)

  console.log('Seed completed!')
  console.log(`Users: ${await prisma.user.count()}`)
  console.log(`Coworking Centers: ${await prisma.coworkingCenter.count()}`)
  console.log(`Workstations: ${await prisma.workstation.count()}`)
  console.log(`Inventory Items: ${await prisma.inventoryItem.count()}`)
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

  console.log('\n=== ИНФОРМАЦИЯ О ПЛАТЕЖАХ ===')
  console.log('- COMPLETED: обычные платежи (refundAmount = null)')
  console.log('- REFUNDED: возврат денег (refundAmount = сумма возврата)')
}

main()
  .catch(e => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })