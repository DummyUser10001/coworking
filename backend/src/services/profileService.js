import bcrypt from 'bcryptjs'
import prisma from '../prismaClient.js'

export class ProfileService {
    async getUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                email: true,
                role: true
            }
        })

        if (!user) {
            throw new Error('User not found')
        }

        return user
    }

    async updateUserProfile(userId, data) {
        const { firstName, lastName, middleName } = data

        // Проверяем существование пользователя
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!existingUser) {
            throw new Error('User not found')
        }

        // Обновляем данные пользователя
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                middleName: middleName || existingUser.middleName
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                email: true,
                role: true
            }
        })

        return updatedUser
    }

    async updateUserPassword(userId, currentPassword, newPassword) {
        // Проверяем существование пользователя
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            throw new Error('User not found')
        }

        // Проверяем текущий пароль
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect')
        }

        // Хешируем новый пароль
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        // Обновляем пароль
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        })

        return { message: 'Password updated successfully' }
    }
}