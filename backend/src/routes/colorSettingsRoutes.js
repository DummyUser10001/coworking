import express from 'express'
import { ColorSettingsService } from '../services/colorSettingsService.js'

const router = express.Router()
const colorSettingsService = new ColorSettingsService()

router.get('/', async (req, res) => {
  /* #swagger.summary = 'Получить глобальные настройки цветов рабочих мест на плане' */
  try {
    const settings = await colorSettingsService.getColorSettings()
    res.json(settings)
  } catch (error) {
    console.error('Error fetching color settings:', error)
    res.status(500).json({ error: 'Failed to fetch color settings' })
  }
})

router.put('/', async (req, res) => {
  /* #swagger.summary = 'Обновить глобальные настройки цветов рабочих мест на плане' */
  const { colors } = req.body

  try {
    const settings = await colorSettingsService.updateColorSettings(colors)
    res.json(settings)
  } catch (error) {
    console.error('Error updating color settings:', error)
    res.status(500).json({ error: 'Failed to update color settings' })
  }
})

export default router