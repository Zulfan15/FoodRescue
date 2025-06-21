import { prisma } from '@/lib/db'
import { User, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class UserService {
  static async createUser(data: {
    email: string
    name: string
    password: string
    role: UserRole
    phone?: string
    address?: string
    latitude?: number
    longitude?: number
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    })
  }

  static async findUserByEmail(email: string, includePassword = false) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: includePassword,
        role: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    })
  }

  static async updateUser(id: string, data: Partial<Omit<User, 'id' | 'password'>>) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        avatar: true,
        isVerified: true,
        updatedAt: true,
      },
    })
  }

  static async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    return await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, updatedAt: true },
    })
  }

  static async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
  }

  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    })
  }

  static async getAllUsers(page = 1, limit = 10, role?: UserRole) {
    const skip = (page - 1) * limit
    
    const where = role ? { role } : {}
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              donations: true,
              reservations: true,
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    }
  }

  static async getUserStats(id: string) {
    const stats = await prisma.user.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            donations: true,
            reservations: true,
            reviews: true,
            givenReviews: true,
            notifications: true,
          },
        },
      },
    })

    return stats?._count || {
      donations: 0,
      reservations: 0,
      reviews: 0,
      givenReviews: 0,
      notifications: 0,
    }
  }
}
