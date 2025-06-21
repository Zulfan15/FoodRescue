import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalDonations,
      totalUsers,
      totalDonors,
      totalRecipients,
      completedDonations,
      totalReservations,
    ] = await Promise.all([
      prisma.foodDonation.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'DONOR' } }),
      prisma.user.count({ where: { role: 'RECIPIENT' } }),
      prisma.foodDonation.count({ where: { status: 'COMPLETED' } }),
      prisma.reservation.count({ where: { status: 'PICKED_UP' } }),
    ]);

    // Calculate success rate
    const successRate = totalDonations > 0 
      ? Math.round((completedDonations / totalDonations) * 100)
      : 0;

    const stats = {
      totalDonations,
      totalUsers,
      totalDonors,
      totalRecipients,
      completedDonations,
      totalReservations,
      successRate,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
