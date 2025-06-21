import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ReservationService } from '@/lib/services/reservationService'
import { verifyAuth } from '@/lib/auth'

// PUT /api/reservations/[id] - Update reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()

    const reservation = await ReservationService.getReservationById(params.id)
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isDonor = reservation.donation.donorId === user.userId
    const isRecipient = reservation.userId === user.userId
    const isAdmin = user.role === 'ADMIN'

    if (!isDonor && !isRecipient && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to update this reservation' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, pickupTime } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status transitions
    const validStatuses = ['PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Business rules for status changes
    if (status === 'CONFIRMED' && !isDonor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the donor can confirm reservations' },
        { status: 403 }
      )
    }

    if (status === 'PICKED_UP' && !isDonor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the donor can mark as picked up' },
        { status: 403 }
      )
    }

    if (status === 'CANCELLED' && !isRecipient && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the recipient can cancel reservations' },
        { status: 403 }
      )
    }

    // Parse pickup time if provided
    let parsedPickupTime: Date | undefined
    if (pickupTime) {
      parsedPickupTime = new Date(pickupTime)
      if (parsedPickupTime <= new Date()) {
        return NextResponse.json(
          { error: 'Pickup time must be in the future' },
          { status: 400 }
        )
      }
    }

    const updatedReservation = await ReservationService.updateReservationStatus(
      params.id,
      status,
      parsedPickupTime
    )

    return NextResponse.json({
      success: true,
      message: 'Reservation updated successfully',
      reservation: updatedReservation
    })

  } catch (error) {
    console.error('Update reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

// DELETE /api/reservations/[id] - Cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectDB()

    const reservation = await ReservationService.getReservationById(params.id)
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isRecipient = reservation.userId === user.userId
    const isAdmin = user.role === 'ADMIN'

    if (!isRecipient && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only cancel your own reservations' },
        { status: 403 }
      )
    }

    // Check if reservation can be cancelled
    if (['PICKED_UP', 'CANCELLED'].includes(reservation.status)) {
      return NextResponse.json(
        { error: 'This reservation cannot be cancelled' },
        { status: 400 }
      )
    }

    const cancelledReservation = await ReservationService.cancelReservation(params.id)

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation: cancelledReservation
    })

  } catch (error) {
    console.error('Cancel reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    )
  }
}
