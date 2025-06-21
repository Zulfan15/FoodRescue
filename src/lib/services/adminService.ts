import { prisma } from '@/lib/db'

type UserRole = 'DONOR' | 'RECIPIENT' | 'ADMIN'

export class AdminService {
  static async getDashboardStats() {
    const [
      totalUsers,
      totalDonations,
      totalReservations,
      totalReports,
      pendingVerifications,
      activeReservations,
      completedDonations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.foodDonation.count(),
      prisma.reservation.count(),
      prisma.report.count(),
      prisma.foodDonation.count({
        where: { isVerified: false, status: 'AVAILABLE' }
      }),
      prisma.reservation.count({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } }
      }),
      prisma.foodDonation.count({
        where: { status: 'COMPLETED' }
      }),
    ])

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    })

    const donationsByCategory = await prisma.foodDonation.groupBy({
      by: ['category'],
      _count: { category: true },
    })

    const recentActivity = await prisma.foodDonation.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        isVerified: true,
        createdAt: true,
        donor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return {
      overview: {
        totalUsers,
        totalDonations,
        totalReservations,
        totalReports,
        pendingVerifications,
        activeReservations,
        completedDonations,
      },
      usersByRole: usersByRole.reduce((acc: Record<string, number>, item: any) => {
        acc[item.role] = item._count.role
        return acc
      }, {}),
      donationsByCategory: donationsByCategory.reduce((acc: Record<string, number>, item: any) => {
        acc[item.category] = item._count.category
        return acc
      }, {}),
      recentActivity,
    }
  }

  static async getPendingVerifications(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [donations, total] = await Promise.all([
      prisma.foodDonation.findMany({
        where: { 
          isVerified: false,
          status: 'AVAILABLE',
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          quantity: true,
          unit: true,
          expiry: true,
          images: true,
          address: true,
          createdAt: true,
          donor: {
            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.foodDonation.count({
        where: { 
          isVerified: false,
          status: 'AVAILABLE',
        },
      }),
    ])

    return {
      donations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    }
  }

  static async verifyDonation(donationId: string, isApproved: boolean) {
    const updateData: any = { isVerified: true }
    
    if (!isApproved) {
      updateData.status = 'CANCELLED'
    }

    return await prisma.foodDonation.update({
      where: { id: donationId },
      data: updateData,
      select: {
        id: true,
        title: true,
        isVerified: true,
        status: true,
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  static async getReports(page = 1, limit = 10, status?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED') {
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (status) {
      where.status = status
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          reason: true,
          message: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          donation: {
            select: {
              id: true,
              title: true,
              donor: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where }),
    ])

    return {
      reports,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    }
  }

  static async updateReportStatus(
    reportId: string, 
    status: 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
  ) {
    const updateData: any = { 
      status,
      resolvedAt: status !== 'REVIEWED' ? new Date() : null,
    }

    return await prisma.report.update({
      where: { id: reportId },
      data: updateData,
      select: {
        id: true,
        reason: true,
        status: true,
        resolvedAt: true,
      },
    })
  }

  static async getUserManagement(page = 1, limit = 20, role?: UserRole) {
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              donations: true,
              reservations: true,
              reports: true,
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

  static async updateUserStatus(userId: string, isVerified: boolean) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isVerified },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    })
  }

  static async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: { id: userId },
    })
  }
}
