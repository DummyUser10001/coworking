import { PrismaClient } from '@prisma/client'
import { AuthService } from '../src/services/authService.js'
import { UserService } from '../src/services/userService.js'
import { CoworkingService } from '../src/services/coworkingService.js'

const prisma = new PrismaClient()
const authService = new AuthService()
const userService = new UserService()
const coworkingService = new CoworkingService()

async function main() {
  console.log('Starting seed...')

  console.log('Cleaning database...')
  // Удаляем в правильном порядке (от зависимых к независимым)
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
    { 
      email: 'ivan@example.com', 
      password, 
      firstName: 'Иван', 
      lastName: 'Иванов', 
      middleName: 'Иванович', 
      role: 'CLIENT' 
    },
    { 
      email: 'petr@example.com', 
      password, 
      firstName: 'Петр', 
      lastName: 'Петров', 
      middleName: 'Петрович', 
      role: 'CLIENT' 
    },
    { 
      email: 'maria@example.com', 
      password, 
      firstName: 'Мария', 
      lastName: 'Сидорова', 
      middleName: 'Алексеевна', 
      role: 'CLIENT' 
    },
    { 
      email: 'alexey@example.com', 
      password, 
      firstName: 'Алексей', 
      lastName: 'Кузнецов', 
      middleName: 'Сергеевич', 
      role: 'CLIENT' 
    },
    
    // Менеджеры
    { 
      email: 'olga.manager@example.com', 
      password, 
      firstName: 'Ольга', 
      lastName: 'Смирнова', 
      middleName: 'Владимировна', 
      role: 'MANAGER' 
    },
    { 
      email: 'dmitry.manager@example.com', 
      password, 
      firstName: 'Дмитрий', 
      lastName: 'Козлов', 
      middleName: 'Андреевич', 
      role: 'MANAGER' 
    },
    { 
      email: 'ekaterina.manager@example.com', 
      password, 
      firstName: 'Екатерина', 
      lastName: 'Морозова', 
      middleName: 'Сергеевна', 
      role: 'MANAGER' 
    },
    
    // Администратор
    { 
      email: 'admin@example.com', 
      password, 
      firstName: 'Админ', 
      lastName: 'Админов', 
      middleName: 'Админович', 
      role: 'ADMIN' 
    }
  ]

  const createdUsers = []
  for (const user of userData) {
    try {
      if (user.role === 'CLIENT') {
        const registeredUser = await authService.register(
          user.email,
          user.password,
          user.firstName,
          user.lastName,
          user.middleName,
          user.role
        )
        createdUsers.push(registeredUser)
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
      console.log(`✓ Created user: ${user.email} (${user.role})`)
    } catch (error) {
      console.log(`✗ Error creating user ${user.email}:`, error.message)
    }
  }

  console.log(`\nTotal users created: ${await prisma.user.count()}`)

  console.log('\nCreating coworking centers...')
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
    try {
      const center = await coworkingService.createCenter(centerData)
      createdCoworkingCenters.push(center)
      console.log(`✓ Created coworking center: ${center.address}`)
    } catch (error) {
      console.log(`✗ Error creating coworking center:`, error.message)
    }
  }

  console.log(`\nTotal coworking centers created: ${createdCoworkingCenters.length}`)

  console.log('\nSeed completed!')
  console.log('\n=== ТЕСТОВЫЕ ДАННЫЕ ===')
  console.log('\nКлиенты:')
  console.log('ivan@example.com / password123')
  console.log('petr@example.com / password123')
  console.log('maria@example.com / password123')
  console.log('alexey@example.com / password123')
  
  console.log('\nМенеджеры:')
  console.log('olga.manager@example.com / password123')
  console.log('dmitry.manager@example.com / password123')
  console.log('ekaterina.manager@example.com / password123')
  
  console.log('\nАдминистратор:')
  console.log('admin@example.com / password123')

  console.log('\n=== СТАТИСТИКА ===')
  console.log(`Всего пользователей: ${await prisma.user.count()}`)
  console.log(`Всего коворкинг-центров: ${await prisma.coworkingCenter.count()}`)
}

main()
  .catch(e => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })