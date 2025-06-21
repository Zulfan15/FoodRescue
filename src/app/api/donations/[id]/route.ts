import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { DonationService } from '@/lib/services/donationService'
import { verifyAuth } from '@/lib/auth'

// GET /api/donations/[id] - Get donation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const donation = await DonationService.getDonationById(params.id, true)

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      donation
    })

  } catch (error) {
    console.error('Get donation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    )
  }
}

// PUT /api/donations/[id] - Update donation
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

    // Check if donation exists and user owns it
    const existingDonation = await DonationService.getDonationById(params.id)
    if (!existingDonation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    if (existingDonation.donorId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only update your own donations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      quantity,
      unit,
      expiry,
      images,
      address,
      latitude,
      longitude
    } = body

    const updateData: any = {}

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (category) updateData.category = category.toUpperCase()
    if (quantity) updateData.quantity = parseInt(quantity)
    if (unit) updateData.unit = unit
    if (expiry) {
      const expiryDate = new Date(expiry)
      if (expiryDate <= new Date()) {
        return NextResponse.json(
          { error: 'Expiry date must be in the future' },
          { status: 400 }
        )
      }
      updateData.expiry = expiryDate
    }
    if (images) updateData.images = images
    if (address) updateData.address = address
    if (latitude) updateData.latitude = parseFloat(latitude)
    if (longitude) updateData.longitude = parseFloat(longitude)

    const updatedDonation = await DonationService.updateDonation(params.id, updateData)

    return NextResponse.json({
      success: true,
      message: 'Donation updated successfully',
      donation: updatedDonation
    })

  } catch (error) {
    console.error('Update donation error:', error)
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}

// DELETE /api/donations/[id] - Delete donation
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

    // Check if donation exists and user owns it
    const existingDonation = await DonationService.getDonationById(params.id)
    if (!existingDonation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    if (existingDonation.donorId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only delete your own donations' },
        { status: 403 }
      )
    }

    // Check if there are active reservations
    if (existingDonation.reservations && existingDonation.reservations.length > 0) {
      const activeReservations = existingDonation.reservations.filter(
        (r: any) => ['PENDING', 'CONFIRMED'].includes(r.status)
      )
      
      if (activeReservations.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete donation with active reservations' },
          { status: 400 }
        )
      }
    }

    await DonationService.deleteDonation(params.id)

    return NextResponse.json({
      success: true,
      message: 'Donation deleted successfully'
    })

  } catch (error) {
    console.error('Delete donation error:', error)
    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    )
  }
}
