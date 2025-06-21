import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  role: 'DONOR' | 'RECIPIENT' | 'ADMIN'
}

export function verifyAuth(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const payload = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret'
    ) as TokenPayload
    
    return payload
  } catch (error) {
    return null
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return (request: NextRequest) => {
    const user = verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },        { status: 403 }
      )
    }

    return null // No error, continue
  }
}
