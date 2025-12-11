import bcrypt from 'bcryptjs'
import prisma from '../prismaClient.js'

export class UserService {
    async getAllUsers() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                middleName: true,
                role: true
            },
            orderBy: { email: 'asc' }
        })
        return users
    }

    async getManagers() {
        const managers = await prisma.user.findMany({
            where: { role: 'MANAGER' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                middleName: true,
                role: true
            },
            orderBy: { email: 'asc' }
        })
        return managers
    }

    async getClients() {
        const clients = await prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                middleName: true,
                role: true
            },
            orderBy: { email: 'asc' }
        })
        return clients
    }

    async createUser(email, password, firstName, lastName, middleName, role) {
        // Валидация
        if (!email || !password || !firstName || !lastName || !role) {
            throw new Error('Email, password, firstName, lastName and role are required')
        }

        // Проверка валидности роли
        const validRoles = ['CLIENT', 'MANAGER', 'ADMIN']
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role')
        }

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10)

        // Создаем пользователя
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                middleName: middleName || null,
                role
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                middleName: true,
                role: true
            }
        })

        return user
    }

    async updateUser(id, email, firstName, lastName, middleName, role) {
        // Проверяем существование пользователя
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingUser) {
            throw new Error('User not found')
        }

        // Если меняется email, проверяем его уникальность
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email }
            })
            if (emailExists) {
                throw new Error('User with this email already exists')
            }
        }

        // Проверка валидности роли
        if (role) {
            const validRoles = ['CLIENT', 'MANAGER', 'ADMIN']
            if (!validRoles.includes(role)) {
                throw new Error('Invalid role')
            }
        }

        // Обновляем пользователя
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                email: email || existingUser.email,
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                middleName: middleName !== undefined ? middleName : existingUser.middleName,
                role: role || existingUser.role
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                middleName: true,
                role: true
            }
        })

        return updatedUser
    }

    async deleteUser(id, currentUserId) {
        // Проверяем существование пользователя
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingUser) {
            throw new Error('User not found')
        }

        // Не позволяем удалить самого себя
        if (id === currentUserId) {
            throw new Error('Cannot delete your own account')
        }

        await prisma.user.delete({
            where: { id }
        })
    }
}