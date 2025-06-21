import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { User } from '@/models/User'
import { FoodDonation } from '@/models/FoodDonation'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }    // Gather all user data
    const userData = {
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        settings: user.settings
      },
      donations: [] as any[],
      reservations: [] as any[],
      exportDate: new Date().toISOString(),
      dataRetentionNotice: 'This data export includes all your personal information, donations, and reservations. Keep this file secure.'
    }

    // If user is a donor, include their donations
    if (user.role === 'donor') {
      const donations = await FoodDonation.find({ donorId: decoded.userId })
      userData.donations = donations
    }

    // Include reservations if user is a recipient
    if (user.role === 'recipient') {
      // This would need a Reservation model - for now just empty array
      userData.reservations = []
    }

    // Create JSON response
    const jsonData = JSON.stringify(userData, null, 2)
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="foodrescue-data-${user._id}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })

  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
