import express from 'express'
import prisma from '../prismaClient.js'
//import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Применяем middleware ко всем роутам
//router.use(authMiddleware)

// GET /color-settings - получить глобальные настройки цветов
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.workstationColorSettings.findFirst()
    
    if (!settings) {
      return res.json({})
    }
    
    res.json(settings.settings || {})
  } catch (error) {
    console.error('Error fetching color settings:', error)
    res.status(500).json({ error: 'Failed to fetch color settings' })
  }
})

// PUT /color-settings - обновить глобальные настройки цветов
router.put('/', async (req, res) => {
  const { colors } = req.body

  try {
    let settings = await prisma.workstationColorSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.workstationColorSettings.create({
        data: {
          settings: colors
        }
      })
    } else {
      settings = await prisma.workstationColorSettings.update({
        where: { id: settings.id },
        data: {
          settings: colors
        }
      })
    }
    
    res.json(settings.settings)
  } catch (error) {
    console.error('Error updating color settings:', error)
    res.status(500).json({ error: 'Failed to update color settings' })
  }
})

export default router