'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Menu, X, MapPin, Heart, Users, Bell } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">FoodRescue</span>
            </Link>
          </div>          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              <MapPin className="inline h-4 w-4 mr-1" />
              Explore
            </Link>            {user?.role === 'donor' && (
              <Link href="/donate" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Donate Food
              </Link>
            )}
            {user?.role === 'recipient' && (
              <Link href="/reservations" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                My Reservations
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Admin Panel
              </Link>
            )}
            <Link href="/about" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/notifications" className="text-gray-700 hover:text-primary-500 p-2">
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-500">
                    <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:block">{user.name}</span>
                  </button>
                    {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/dashboard/recipient" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-500 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/explore" className="block px-3 py-2 text-gray-700 hover:text-primary-500 text-base font-medium">
              Explore
            </Link>
            <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-primary-500 text-base font-medium">
              About
            </Link>
            <Link href="/how-it-works" className="block px-3 py-2 text-gray-700 hover:text-primary-500 text-base font-medium">
              How It Works
            </Link>
              {user ? (
              <>
                <Link href="/dashboard/recipient" className="block px-3 py-2 text-gray-700 hover:text-primary-500 text-base font-medium">
                  Dashboard
                </Link>
                <Link href="/profile" className="block px-3 py-2 text-gray-700 hover:text-primary-500 text-base font-medium">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-500 text-base font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-gray-700 hover:text-primary-500 text-base font-medium">
                  Sign In
                </Link>
                <Link href="/auth/register" className="block px-3 py-2 bg-primary-500 text-white rounded-md text-base font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
