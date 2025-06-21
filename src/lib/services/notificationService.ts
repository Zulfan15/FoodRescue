import { prisma } from '@/lib/db'

type NotificationType = 
  | 'DONATION_POSTED'
  | 'RESERVATION_MADE'
  | 'RESERVATION_CONFIRMED'
  | 'PICKUP_REMINDER'
  | 'REVIEW_RECEIVED'
  | 'SYSTEM_ALERT'

export class NotificationService {
  static async createNotification(data: {
    userId: string
    title: string
    message: string
    type: NotificationType
    data?: string
  }) {
    return await prisma.notification.create({
      data,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        data: true,
        createdAt: true,
      },
    })
  }

  static async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false
  ) {
    const skip = (page - 1) * limit
    const where: any = { userId }
    
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          data: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { userId, isRead: false } 
      }),
    ])

    return {
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
      unreadCount,
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.update({
      where: { 
        id: notificationId,
        userId, // Ensure user can only mark their own notifications
      },
      data: { isRead: true },
      select: {
        id: true,
        isRead: true,
      },
    })
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false,
      },
      data: { isRead: true },
    })
  }

  static async deleteNotification(notificationId: string, userId: string) {
    return await prisma.notification.delete({
      where: { 
        id: notificationId,
        userId, // Ensure user can only delete their own notifications
      },
    })
  }

  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { 
        userId,
        isRead: false,
      },
    })
  }

  // Helper functions for creating specific notification types
  static async notifyDonationPosted(donorId: string, donationTitle: string) {
    return this.createNotification({
      userId: donorId,
      title: 'Donation Posted',
      message: `Your donation "${donationTitle}" has been posted successfully.`,
      type: 'DONATION_POSTED',
    })
  }

  static async notifyReservationMade(donorId: string, recipientName: string, donationTitle: string, reservationId: string) {
    return this.createNotification({
      userId: donorId,
      title: 'New Reservation',
      message: `${recipientName} has reserved your donation "${donationTitle}".`,
      type: 'RESERVATION_MADE',
      data: JSON.stringify({ reservationId }),
    })
  }

  static async notifyReservationConfirmed(recipientId: string, donationTitle: string, reservationId: string) {
    return this.createNotification({
      userId: recipientId,
      title: 'Reservation Confirmed',
      message: `Your reservation for "${donationTitle}" has been confirmed.`,
      type: 'RESERVATION_CONFIRMED',
      data: JSON.stringify({ reservationId }),
    })
  }

  static async notifyPickupReminder(recipientId: string, donationTitle: string, pickupTime: Date) {
    return this.createNotification({
      userId: recipientId,
      title: 'Pickup Reminder',
      message: `Don't forget to pick up "${donationTitle}" at ${pickupTime.toLocaleString()}.`,
      type: 'PICKUP_REMINDER',
    })
  }

  static async notifyReviewReceived(userId: string, reviewerName: string, rating: number) {
    return this.createNotification({
      userId,
      title: 'New Review',
      message: `${reviewerName} gave you a ${rating}-star review.`,
      type: 'REVIEW_RECEIVED',
    })
  }
}
