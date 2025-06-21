import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { User } from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await User.findById(decoded.userId).select('+settings')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Default settings if not set
    const defaultSettings = {
      profileVisibility: 'public',
      showRealName: true,
      showContactInfo: false,
      emailNotifications: {
        newDonations: true,
        reservationUpdates: true,
        pickupReminders: true,
        systemUpdates: true,
        marketing: false
      },
      pushNotifications: {
        newDonations: true,
        reservationUpdates: true,
        pickupReminders: true,
        urgentAlerts: true
      },
      shareLocation: true,
      locationRadius: 5,
      autoLocation: true,
      language: 'id',
      theme: 'system',
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      dietaryRestrictions: [],
      preferredCategories: ['VEGETABLES', 'PREPARED_MEALS'],
      excludeExpired: true,
      minRating: 3,
      twoFactorAuth: false,
      sessionTimeout: 60,
      dataRetention: 90
    }

    return NextResponse.json({
      success: true,
      settings: { ...defaultSettings, ...user.settings }
    })

  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const { settings } = await request.json()

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: { settings } },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
