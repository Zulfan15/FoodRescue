import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { DonationService } from '@/lib/services/donationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = parseFloat(searchParams.get('radius') || '5') // Default 5km radius
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    await connectDB()

    // Build filters
    const filters: any = {
      status: 'AVAILABLE',
    }

    // Add category filter
    if (category && category !== '') {
      filters.category = category.toUpperCase()
    }

    // Add search filter
    if (search && search.trim() !== '') {
      filters.search = search.trim()
    }

    // Add location filter
    if (latitude && longitude) {
      filters.latitude = parseFloat(latitude)
      filters.longitude = parseFloat(longitude)
      filters.radius = radius
    }

    // Search donations using service
    const result = await DonationService.searchDonations(filters, page, limit)

    return NextResponse.json({
      success: true,
      donations: result.donations,
      pagination: result.pagination,
      filters: {
        category,
        search,
        latitude,
        longitude,
        radius
      }
    })

  } catch (error) {
    console.error('Explore API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch donations',
        donations: [],
        pagination: {
          total: 0,
          pages: 0,
          current: 1,
          limit: 10
        }
      },
      { status: 500 }
    )
  }
}
