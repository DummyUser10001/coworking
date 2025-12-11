import express from 'express'
import { ProfileService } from '../services/profileService.js'

const router = express.Router()
const profileService = new ProfileService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить данные пользователя' */
  try {
    const user = await profileService.getUserProfile(req.userId)
    res.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to fetch profile' })
    }
  }
})

router.put('/', async (req, res) => {
  /* #swagger.summary = 'Обновить данные пользователя' */
  const { firstName, lastName, middleName } = req.body

  try {
    const updatedUser = await profileService.updateUserProfile(req.userId, { firstName, lastName, middleName })
    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to update profile' })
    }
  }
})

router.put('/password', async (req, res) => {
  /* #swagger.summary = 'Изменить пароль' */
  const { currentPassword, newPassword } = req.body

  try {
    const result = await profileService.updateUserPassword(req.userId, currentPassword, newPassword)
    res.json(result)
  } catch (error) {
    console.error('Error updating password:', error)
    
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message === 'Current password is incorrect') {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to update password' })
    }
  }
})

export default router