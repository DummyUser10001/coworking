import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

// Register a new user endpoing /auth/register
// backend/src/routes/authRoutes.js
router.post('/register', async (req, res) => {
    const { 
        email, 
        password,
        firstName,
        lastName,
        middleName,
        role = 'CLIENT' // Добавляем значение по умолчанию
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

        // create a token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log('Registration error:', err.message)
        
        // Более детальная обработка ошибок
        if (err.code === 'P2002') { // Prisma unique constraint error
            return res.status(400).send({ message: "User with this email already exists" })
        }
        
        res.status(503).send({ 
            message: "Service unavailable", 
            error: err.message 
        })
    }
})

router.post('/login', async (req, res) => {
    // we get their email, and we look up the password associated with that email in the database
    // but we get it back and see it's encrypted, which means that we cannot compare it to the one the user just used trying to login
    // so what we can to do, is again, one way encrypt the password the user just entered

    const { email, password } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        // if we cannot find a user associated with that username, return out from the function
        if (!user) { return res.status(404).send({ message: "User not found" }) }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        // if the password does not match, return out of the function
        if (!passwordIsValid) { return res.status(401).send({ message: "Invalid password" }) }
        console.log(user)

        // then we have a successful authentication
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }

})


export default router