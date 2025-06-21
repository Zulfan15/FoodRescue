import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { UserService } from '@/lib/services/userService'

export async function GET(request: NextRequest) {
  try {
    const userPayload = verifyAuth(request)
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get fresh user data from database
    const user = await UserService.findUserById(userPayload.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )    }

    // Note: We could update last login here if needed
    // await UserService.updateUser(userPayload.userId, { lastLogin: new Date() })

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      avatar: user.avatar,
      createdAt: user.createdAt
    }

    return NextResponse.json(userResponse)

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    )
  }
}
