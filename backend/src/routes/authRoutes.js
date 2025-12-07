import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

// Регистрация
router.post('/register', async (req, res) => {
    const { 
        email, 
        password,
        firstName,
        lastName,
        middleName,
        role = 'CLIENT'
    } = req.body

    // Проверяем, существует ли пользователь с таким email
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        })

        if (existingUser) {
            return res.status(400).send({ message: "User with this email already exists" })
        }

        // encrypt the password
        const hashedPassword = bcrypt.hashSync(password, 8)

        // save the new user and hashed password to the db
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                middleName,
                role
            }
        })


        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log('Registration error:', err.message)
        
        if (err.code === 'P2002') { 
            return res.status(400).send({ message: "User with this email already exists" })
        }
        
        res.status(503).send({ 
            message: "Service unavailable", 
            error: err.message 
        })
    }
})

router.post('/login', async (req, res) => {

    const { email, password } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) { return res.status(404).send({ message: "User not found" }) }

        const passwordIsValid = bcrypt.compareSync(password, user.password)

        if (!passwordIsValid) { return res.status(401).send({ message: "Invalid password" }) }
        console.log(user)

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }

})


export default router