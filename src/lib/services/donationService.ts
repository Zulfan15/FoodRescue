import { prisma } from '@/lib/db'
import { FoodCategory, DonationStatus, UserRole } from '@prisma/client'

export interface CreateDonationData {
  title: string
  description: string
  category: FoodCategory
  quantity: number
  unit: string
  expiry: Date
  images?: string[]
  address: string
  latitude: number
  longitude: number
  donorId: string
}

export interface DonationFilters {
  category?: FoodCategory
  status?: DonationStatus
  latitude?: number
  longitude?: number
  radius?: number // in kilometers
  search?: string
}

export class DonationService {
  static async createDonation(data: CreateDonationData) {
    return await prisma.foodDonation.create({
      data: {
        ...data,
        images: data.images ? JSON.stringify(data.images) : null,
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            reservations: true,
            reviews: true,
          },
        },
      },
    })
  }

  static async getDonationById(id: string, includeReservations = false) {
    return await prisma.foodDonation.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            isVerified: true,
          },
        },
        reservations: includeReservations ? {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
              },
            },
          },
        } : false,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            reservations: true,
            reviews: true,
          },
        },
      },
    })
  }

  static async searchDonations(filters: DonationFilters, page = 1, limit = 10) {
    const skip = (page - 1) * limit
    
    const where: any = {
      status: filters.status || 'AVAILABLE',
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // For location-based search, we'll use raw SQL for better performance
    let donations: any[] = []
    let total = 0

    if (filters.latitude && filters.longitude && filters.radius) {
      const radius = filters.radius || 5 // default 5km
      
      // Raw SQL query for distance calculation
      const sqlQuery = `
        SELECT fd.*, u.name as donor_name, u.phone as donor_phone, u.avatar as donor_avatar, u.isVerified as donor_verified,
        (6371 * acos(cos(radians(?)) * cos(radians(fd.latitude)) * cos(radians(fd.longitude) - radians(?)) + sin(radians(?)) * sin(radians(fd.latitude)))) AS distance
        FROM food_donations fd
        JOIN users u ON fd.donorId = u.id
        WHERE fd.status = ? AND (6371 * acos(cos(radians(?)) * cos(radians(fd.latitude)) * cos(radians(fd.longitude) - radians(?)) + sin(radians(?)) * sin(radians(fd.latitude)))) <= ?
        ${filters.category ? 'AND fd.category = ?' : ''}
        ${filters.search ? 'AND (fd.title LIKE ? OR fd.description LIKE ? OR fd.address LIKE ?)' : ''}
        ORDER BY distance
        LIMIT ? OFFSET ?
      `

      const params = [
        filters.latitude, filters.longitude, filters.latitude,
        filters.status || 'AVAILABLE',
        filters.latitude, filters.longitude, filters.latitude, radius
      ]

      if (filters.category) {
        params.push(filters.category)
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`
        params.push(searchTerm, searchTerm, searchTerm)
      }

      params.push(limit, skip)

      donations = await prisma.$queryRawUnsafe(sqlQuery, ...params) as any[]
      
      // Count query for total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM food_donations fd
        WHERE fd.status = ? AND (6371 * acos(cos(radians(?)) * cos(radians(fd.latitude)) * cos(radians(fd.longitude) - radians(?)) + sin(radians(?)) * sin(radians(fd.latitude)))) <= ?
        ${filters.category ? 'AND fd.category = ?' : ''}
        ${filters.search ? 'AND (fd.title LIKE ? OR fd.description LIKE ? OR fd.address LIKE ?)' : ''}
      `

      const countParams = [
        filters.status || 'AVAILABLE',
        filters.latitude, filters.longitude, filters.latitude, radius
      ]

      if (filters.category) {
        countParams.push(filters.category)
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`
        countParams.push(searchTerm, searchTerm, searchTerm)
      }

      const countResult = await prisma.$queryRawUnsafe(countQuery, ...countParams) as any[]
      total = countResult[0]?.total || 0

    } else {
      // Regular search without location
      const [donationsData, totalCount] = await Promise.all([
        prisma.foodDonation.findMany({
          where,
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                isVerified: true,
              },
            },
            _count: {
              select: {
                reservations: true,
                reviews: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.foodDonation.count({ where }),
      ])

      donations = donationsData
      total = totalCount
    }

    return {
      donations: donations.map((donation: any) => ({
        ...donation,
        images: donation.images ? JSON.parse(donation.images) : [],
        distance: donation.distance || null,
        donor: {
          id: donation.donorId,
          name: donation.donor_name || donation.donor?.name,
          phone: donation.donor_phone || donation.donor?.phone,
          avatar: donation.donor_avatar || donation.donor?.avatar,
          isVerified: donation.donor_verified || donation.donor?.isVerified,
        },
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    }
  }

  static async updateDonation(id: string, data: Partial<CreateDonationData>) {
    const updateData: any = { ...data }
    
    if (data.images) {
      updateData.images = JSON.stringify(data.images)
    }

    return await prisma.foodDonation.update({
      where: { id },
      data: updateData,
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    })
  }

  static async updateDonationStatus(id: string, status: DonationStatus) {
    return await prisma.foodDonation.update({
      where: { id },
      data: { status },
    })
  }

  static async verifyDonation(id: string, isVerified: boolean) {
    return await prisma.foodDonation.update({
      where: { id },
      data: { isVerified },
    })
  }

  static async deleteDonation(id: string) {
    return await prisma.foodDonation.delete({
      where: { id },
    })
  }

  static async getUserDonations(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [donations, total] = await Promise.all([
      prisma.foodDonation.findMany({
        where: { donorId: userId },
        include: {
          _count: {
            select: {
              reservations: true,
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.foodDonation.count({
        where: { donorId: userId },
      }),
    ])

    return {
      donations: donations.map(donation => ({
        ...donation,
        images: donation.images ? JSON.parse(donation.images) : [],
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    }
  }

  static async getDonationStats() {
    const [
      totalDonations,
      availableDonations,
      completedDonations,
      pendingVerifications,
      categoryStats,
    ] = await Promise.all([
      prisma.foodDonation.count(),
      prisma.foodDonation.count({ where: { status: 'AVAILABLE' } }),
      prisma.foodDonation.count({ where: { status: 'COMPLETED' } }),
      prisma.foodDonation.count({ where: { isVerified: false } }),
      prisma.foodDonation.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
    ])

    return {
      total: totalDonations,
      available: availableDonations,
      completed: completedDonations,
      pendingVerifications,
      byCategory: categoryStats.reduce((acc: any, stat) => {
        acc[stat.category] = stat._count.category
        return acc
      }, {}),
    }
  }
}
