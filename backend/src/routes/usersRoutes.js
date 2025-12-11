import express from 'express'
import { UserService } from '../services/userService.js'

const router = express.Router()
const userService = new UserService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить всех пользователей' */
  try {
    const users = await userService.getAllUsers()
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.get('/managers', async (req, res) => {
  /* #swagger.summary = 'Получить только менеджеров' */
  try {
    const managers = await userService.getManagers()
    res.json(managers)
  } catch (error) {
    console.error('Error fetching managers:', error)
    res.status(500).json({ error: 'Failed to fetch managers' })
  }
})

router.get('/clients', async (req, res) => {
  /* #swagger.summary = 'Получить только клиентов' */
  try {
    const clients = await userService.getClients()
    res.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

router.post('/', async (req, res) => {
  /* #swagger.summary = 'Создать нового пользователя (для админов)' */
  const { 
    email, 
    password,
    firstName,
    lastName,
    middleName,
    role 
  } = req.body

  try {
    const user = await userService.createUser(email, password, firstName, lastName, middleName, role)
    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error.message.includes('required') || error.message.includes('Invalid role')) {
      res.status(400).json({ error: error.message })
    } else if (error.message.includes('already exists')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
})

router.put('/:id', async (req, res) => {
  /* #swagger.summary = 'Обновить пользователя' */
  const { id } = req.params
  const { 
    email,
    firstName,
    lastName,
    middleName,
    role 
  } = req.body

  try {
    const updatedUser = await userService.updateUser(id, email, firstName, lastName, middleName, role)
    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message.includes('already exists') || error.message.includes('Invalid role')) {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to update user' })
    }
  }
})

router.delete('/:id', async (req, res) => {
  /* #swagger.summary = 'Удалить пользователя' */
  const { id } = req.params

  try {
    await userService.deleteUser(id, req.userId)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting user:', error)
    
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message })
    } else if (error.message === 'Cannot delete your own account') {
      res.status(400).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Failed to delete user' })
    }
  }
})

export default router