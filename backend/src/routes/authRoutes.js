import express from 'express'
import { AuthService } from '../services/authService.js'

const router = express.Router()
const authService = new AuthService()

router.post('/register', async (req, res) => {
    /* #swagger.summary = 'Регистрация клиента' */
    const { 
        email, 
        password,
        firstName,
        lastName,
        middleName,
        role = 'CLIENT'
    } = req.body

    try {
        const result = await authService.register(email, password, firstName, lastName, middleName, role)
        res.json(result)
    } catch (err) {
        console.log('Registration error:', err.message)
        
        if (err.code === 'P2002' || err.message.includes("already exists")) { 
            return res.status(400).send({ message: "User with this email already exists" })
        }
        
        res.status(503).send({ 
            message: "Service unavailable", 
            error: err.message 
        })
    }
})


router.post('/login', async (req, res) => {
    /* #swagger.summary = 'Логин' */
    const { email, password } = req.body

    try {
        const result = await authService.login(email, password)
        res.json(result)
    } catch (err) {
        console.log(err.message)
        
        if (err.message === "User not found") { 
            return res.status(404).send({ message: "User not found" }) 
        }
        
        if (err.message === "Invalid password") { 
            return res.status(401).send({ message: "Invalid password" }) 
        }
        
        res.sendStatus(503)
    }
})

export default router