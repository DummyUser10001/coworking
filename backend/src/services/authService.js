import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

export class AuthService {
    async register(email, password, firstName, lastName, middleName, role = 'CLIENT') {
        // Проверяем, существует ли пользователь с таким email
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        })

        if (existingUser) {
            throw new Error("User with this email already exists")
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
        return { token }
    }

    async login(email, password) {
        const user = await prisma.user.findUnique({
            where: { email: email }
        })

        if (!user) {
            throw new Error("User not found")
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password)

        if (!passwordIsValid) {
            throw new Error("Invalid password")
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        return { token }
    }
}