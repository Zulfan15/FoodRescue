import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ReservationService } from '@/lib/services/reservationService'
import { DonationService } from '@/lib/services/donationService'
import { verifyAuth } from '@/lib/auth'

// GET /api/reservations - Get user's reservations
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    await connectDB()

    const result = await ReservationService.getUserReservations(user.userId, page, limit)

    return NextResponse.json({
      success: true,
      reservations: result.reservations,
      pagination: result.pagination
    })

  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

// POST /api/reservations - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (user.role !== 'RECIPIENT') {
      return NextResponse.json(
        { error: 'Only recipients can make reservations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { donationId, quantity, message } = body

    // Validation
    if (!donationId || !quantity) {
      return NextResponse.json(
        { error: 'Donation ID and quantity are required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if donation exists and is available
    const donation = await DonationService.getDonationById(donationId, true)
    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    if (donation.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Donation is no longer available' },
        { status: 400 }
      )
    }

    // Check if user is not the donor
    if (donation.donorId === user.userId) {
      return NextResponse.json(
        { error: 'You cannot reserve your own donation' },
        { status: 400 }
      )
    }

    // Check if quantity is available
    const existingReservations = donation.reservations || []
    const totalReserved = existingReservations
      .filter((r: any) => ['PENDING', 'CONFIRMED'].includes(r.status))
      .reduce((sum: number, r: any) => sum + r.quantity, 0)

    if (totalReserved + quantity > donation.quantity) {
      return NextResponse.json(
        { error: 'Not enough quantity available' },
        { status: 400 }
      )
    }

    // Check if user already has a reservation for this donation
    const userReservation = existingReservations.find(
      (r: any) => r.userId === user.userId && ['PENDING', 'CONFIRMED'].includes(r.status)
    )

    if (userReservation) {
      return NextResponse.json(
        { error: 'You already have an active reservation for this donation' },
        { status: 400 }
      )
    }

    // Create reservation
    const reservation = await ReservationService.createReservation({
      userId: user.userId,
      donationId,
      quantity: parseInt(quantity),
      message
    })

    // Update donation status if fully reserved
    if (totalReserved + quantity >= donation.quantity) {
      await DonationService.updateDonationStatus(donationId, 'RESERVED')
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation created successfully',
      reservation
    }, { status: 201 })

  } catch (error) {
    console.error('Create reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}
