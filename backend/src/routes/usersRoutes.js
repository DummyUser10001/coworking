import express from 'express'
import prisma from '../prismaClient.js'
import bcrypt from 'bcryptjs'

const router = express.Router()

// GET /users - получить всех пользователей (только для админов)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true
      },
      orderBy: { email: 'asc' } // Сортируем по email вместо createdAt
    })

    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET /users/managers - получить только менеджеров
router.get('/managers', async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true
      },
      orderBy: { email: 'asc' }
    })

    res.json(managers)
  } catch (error) {
    console.error('Error fetching managers:', error)
    res.status(500).json({ error: 'Failed to fetch managers' })
  }
})

router.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true
      },
      orderBy: { email: 'asc' }
    })

    res.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

// POST /users - создать нового пользователя (только для админов)
router.post('/', async (req, res) => {
  const { 
    email, 
    password,
    firstName,
    lastName,
    middleName,
    role 
  } = req.body

  // Валидация
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Email, password, firstName, lastName and role are required' })
  }

  // Проверка валидности роли
  const validRoles = ['CLIENT', 'MANAGER', 'ADMIN']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  try {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName: middleName || null,
        role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true
      }
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// PUT /users/:id - обновить пользователя
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { 
    email,
    firstName,
    lastName,
    middleName,
    role 
  } = req.body

  try {
    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Если меняется email, проверяем его уникальность
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      if (emailExists) {
        return res.status(400).json({ error: 'User with this email already exists' })
      }
    }

    // Проверка валидности роли
    if (role) {
      const validRoles = ['CLIENT', 'MANAGER', 'ADMIN']
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' })
      }
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: email || existingUser.email,
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        middleName: middleName !== undefined ? middleName : existingUser.middleName,
        role: role || existingUser.role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true
      }
    })

    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// DELETE /users/:id - удалить пользователя
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Не позволяем удалить самого себя
    if (id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    await prisma.user.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router