import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import updateExpiredBookings from './jobs/bookingStatusJob.js'
import authMiddleware from './middleware/authMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import coworkingCenterRoutes from './routes/coworkingCenterRoutes.js'
import colorSettingsRoutes from './routes/colorSettingsRoutes.js'
import floorRoutes from './routes/floorRoutes.js'
import workstationRoutes from './routes/workstationRoutes.js'
import landmarkRoutes from './routes/landmarkRoutes.js'
import inventoryItemRoutes from './routes/inventoryItemRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import discountRoutes from './routes/discountRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import usersRoutes from './routes/usersRoutes.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/coworking-centers', authMiddleware, coworkingCenterRoutes)
app.use('/color-settings', authMiddleware, colorSettingsRoutes)
app.use('/floors', authMiddleware, floorRoutes)
app.use('/workstations', authMiddleware, workstationRoutes)
app.use('/landmarks', authMiddleware, landmarkRoutes)
app.use('/inventory-items', authMiddleware, inventoryItemRoutes)
app.use('/bookings',  authMiddleware, bookingRoutes)
app.use('/discounts',authMiddleware, discountRoutes)
app.use('/profile', authMiddleware, profileRoutes)
app.use('/users', authMiddleware, usersRoutes)

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

// === CRON: Каждый час (в 00 минут) ===
cron.schedule('0 * * * *', () => {
  console.log('⏰ [CRON] Running hourly booking status check...')
  updateExpiredBookings()
})

// Опционально: при старте сервера — сразу проверить (на случай перезапуска)
updateExpiredBookings()