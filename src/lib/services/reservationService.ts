import { prisma } from '@/lib/db'

export interface CreateReservationData {
  userId: string
  donationId: string
  quantity: number
  message?: string
}

export class ReservationService {
  static async createReservation(data: CreateReservationData) {
    return await prisma.reservation.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        donation: {
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    })
  }

  static async getReservationById(id: string) {
    return await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        donation: {
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    })
  }

  static async getUserReservations(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where: { userId },
        include: {
          donation: {
            include: {
              donor: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reservation.count({
        where: { userId },
      }),
    ])

    return {
      reservations: reservations.map(reservation => ({
        ...reservation,
        donation: {
          ...reservation.donation,
          images: reservation.donation.images ? JSON.parse(reservation.donation.images) : [],
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

  static async getDonationReservations(donationId: string) {
    return await prisma.reservation.findMany({
      where: { donationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async updateReservationStatus(id: string, status: any, pickupTime?: Date) {
    const updateData: any = { status }
    
    if (pickupTime) {
      updateData.pickupTime = pickupTime
    }

    if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date()
    }

    return await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        donation: {
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    })
  }

  static async cancelReservation(id: string) {
    return await this.updateReservationStatus(id, 'CANCELLED')
  }

  static async confirmPickup(id: string) {
    const reservation = await this.updateReservationStatus(id, 'PICKED_UP')
    
    // Update donation status if all reservations are completed
    if (reservation) {
      const allReservations = await this.getDonationReservations(reservation.donationId)
      const activeReservations = allReservations.filter(
        r => ['PENDING', 'CONFIRMED'].includes(r.status)
      )
      
      if (activeReservations.length === 0) {
        await prisma.foodDonation.update({
          where: { id: reservation.donationId },
          data: { status: 'COMPLETED' },
        })
      }
    }

    return reservation
  }

  static async getReservationStats(userId: string) {
    const [
      totalReservations,
      confirmedReservations,
      pickedUpReservations,
      cancelledReservations,
    ] = await Promise.all([
      prisma.reservation.count({ where: { userId } }),
      prisma.reservation.count({ where: { userId, status: 'CONFIRMED' } }),
      prisma.reservation.count({ where: { userId, status: 'PICKED_UP' } }),
      prisma.reservation.count({ where: { userId, status: 'CANCELLED' } }),
    ])

    return {
      total: totalReservations,
      confirmed: confirmedReservations,
      pickedUp: pickedUpReservations,
      cancelled: cancelledReservations,
      successRate: totalReservations > 0 ? Math.round((pickedUpReservations / totalReservations) * 100) : 0,
    }
  }
}
