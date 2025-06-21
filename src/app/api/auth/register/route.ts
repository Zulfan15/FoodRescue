import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, role, phone, address, latitude, longitude } = body;

    // Validate required fields
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: 'Email, name, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }    // Validate role
    const validRoles = ['DONOR', 'RECIPIENT', 'ADMIN'];
    const roleMapping = {
      'donor': 'DONOR',
      'recipient': 'RECIPIENT', 
      'admin': 'ADMIN',
      'DONOR': 'DONOR',
      'RECIPIENT': 'RECIPIENT',
      'ADMIN': 'ADMIN'
    };
    
    const mappedRole = roleMapping[role as keyof typeof roleMapping];
    if (!mappedRole) {
      return NextResponse.json(
        { error: 'Invalid role. Must be donor, recipient, or admin' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }    // Create user
    const user = await UserService.createUser({
      email,
      name,
      password,
      role: mappedRole as 'DONOR' | 'RECIPIENT' | 'ADMIN',
      phone,
      address,
      latitude,
      longitude,
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'User registered successfully',
      user,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}