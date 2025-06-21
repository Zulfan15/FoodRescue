import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { DonationService } from '@/lib/services/donationService'
import { verifyAuth } from '@/lib/auth'

// GET /api/donations - Get user's donations
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

    const result = await DonationService.getUserDonations(user.userId, page, limit)

    return NextResponse.json({
      success: true,
      donations: result.donations,
      pagination: result.pagination
    })

  } catch (error) {
    console.error('Get donations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

// POST /api/donations - Create new donation
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (user.role !== 'DONOR') {
      return NextResponse.json(
        { error: 'Only donors can create donations' },
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

    // Validation
    if (!title || !description || !category || !quantity || !unit || !expiry || !address || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Validate expiry date
    const expiryDate = new Date(expiry)
    if (expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry date must be in the future' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    await connectDB()

    const donation = await DonationService.createDonation({
      title,
      description,
      category: category.toUpperCase(),
      quantity: parseInt(quantity),
      unit,
      expiry: expiryDate,
      images: images || [],
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      donorId: user.userId
    })

    return NextResponse.json({
      success: true,
      message: 'Donation created successfully',
      donation
    }, { status: 201 })

  } catch (error) {
    console.error('Create donation error:', error)
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}
