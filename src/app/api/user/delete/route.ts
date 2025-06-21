import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { User } from '@/models/User'
import { FoodDonation } from '@/models/FoodDonation'

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const authorization = request.headers.get('Authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Mark user donations as deleted/inactive instead of fully deleting
    if (user.role === 'donor') {
      await FoodDonation.updateMany(
        { donorId: decoded.userId },
        { $set: { status: 'DELETED', deletedAt: new Date() } }
      )
    }

    // Delete user account
    await User.findByIdAndDelete(decoded.userId)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
