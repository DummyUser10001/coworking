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
import swaggerUi from "swagger-ui-express";
import fs from 'node:fs';

const app = express()
const PORT = process.env.PORT


app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

app.use(express.json())

//Swagger
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf8'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/coworking-centers', authMiddleware, coworkingCenterRoutes)
app.use('/api/color-settings', authMiddleware, colorSettingsRoutes)
app.use('/api/floors', authMiddleware, floorRoutes)
app.use('/api/workstations', authMiddleware, workstationRoutes)
app.use('/api/landmarks', authMiddleware, landmarkRoutes)
app.use('/api/inventory-items', authMiddleware, inventoryItemRoutes)
app.use('/api/bookings',  authMiddleware, bookingRoutes)
app.use('/api/discounts',authMiddleware, discountRoutes)
app.use('/api/profile', authMiddleware, profileRoutes)
app.use('/api/users', authMiddleware, usersRoutes)

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

// каждый час 
cron.schedule('0 * * * *', () => {
  console.log('[CRON] Running hourly booking status check')
  updateExpiredBookings()
})

// при старте сервера сразу проверить 
updateExpiredBookings()