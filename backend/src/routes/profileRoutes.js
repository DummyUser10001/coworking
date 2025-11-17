// backend/src/routes/profileRoutes.js
import express from 'express'
import prisma from '../prismaClient.js'
import bcrypt from 'bcryptjs'

const router = express.Router()

// GET /profile - получить данные пользователя
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PUT /profile - обновить данные пользователя
router.put('/', async (req, res) => {
  const { firstName, lastName, middleName } = req.body

  try {
    // Проверяем существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id: req.userId }
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Обновляем данные пользователя
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        middleName: middleName || existingUser.middleName
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        role: true
      }
    })

    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// PUT /profile/password - изменить пароль
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body

  try {
    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Хешируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Обновляем пароль
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedNewPassword }
    })

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

export default router