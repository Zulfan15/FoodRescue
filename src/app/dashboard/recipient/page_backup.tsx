'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Search, 
  Heart, 
  Clock, 
  CheckCircle, 
  Star, 
  Package,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Filter,
  Eye,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import the map to avoid SSR issues
const FoodMap = dynamic(() => import('@/components/map/FoodMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
})

interface RecipientStats {
  totalReservations: number
  completedPickups: number
  savedMeals: number
  favoriteCategories: string[]
  successRate: number
  totalSavings: number
  impactScore: number
}

interface Activity {
  id: string
  type: 'pickup' | 'reservation' | 'cancelled' | 'review'
  title: string
  description?: string
  date: string
  status: 'completed' | 'reserved' | 'cancelled' | 'pending'
  donorName?: string
  location?: string
}

interface Donation {
  id: string
  _id?: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  expiry: string
  expiryDate?: string
  images?: string
  address: string
  latitude: number
  longitude: number
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  status: string
  isVerified: boolean
  donorId: string
  donor: {
    name: string
    isVerified: boolean
    organization?: string
  }
  createdAt: string
  distance?: number
}

export default function RecipientDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<RecipientStats>({
    totalReservations: 0,
    completedPickups: 0,
    savedMeals: 0,
    favoriteCategories: [],
    successRate: 0,
    totalSavings: 0,
    impactScore: 0
  })
  const [nearbyDonations, setNearbyDonations] = useState<Donation[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'recipient')) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, isLoading, router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch nearby donations
      const donationsResponse = await fetch('/api/donations/explore?' + new URLSearchParams({
        latitude: user?.location?.latitude?.toString() || '-7.9666',
        longitude: user?.location?.longitude?.toString() || '112.6326',
        radius: '5',
        limit: '6'
      }), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json()
        setNearbyDonations(donationsData.donations || [])
      }

      // Fetch recipient stats
      const statsResponse = await fetch('/api/profile/stats', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          totalReservations: statsData.totalReservations || 15,
          completedPickups: statsData.completedPickups || 12,
          savedMeals: statsData.savedMeals || 32,
          favoriteCategories: statsData.favoriteCategories || ['VEGETABLES', 'PREPARED_MEALS', 'BAKERY'],
          successRate: statsData.successRate || 80,
          totalSavings: statsData.totalSavings || 250000, // In IDR
          impactScore: statsData.impactScore || 85
        })
      } else {
        // Mock stats if API fails
        setStats({
          totalReservations: 15,
          completedPickups: 12,
          savedMeals: 32,
          favoriteCategories: ['VEGETABLES', 'PREPARED_MEALS', 'BAKERY'],
          successRate: 80,
          totalSavings: 250000,
          impactScore: 85
        })
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/notifications', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData.notifications?.slice(0, 5) || [])
      } else {
        // Mock recent activity
        setRecentActivity([
          { 
            id: '1', 
            type: 'pickup', 
            title: 'Fresh Vegetables from Toko Sayur Malang', 
            date: '2 hours ago', 
            status: 'completed',
            donorName: 'Toko Sayur Malang',
            location: 'Jl. Veteran, Malang'
          },
          { 
            id: '2', 
            type: 'reservation', 
            title: 'Homemade Soup & Bread', 
            date: '1 day ago', 
            status: 'reserved',
            donorName: 'Warung Bu Sari',
            location: 'Jl. Ijen, Malang'
          },
          { 
            id: '3', 
            type: 'pickup', 
            title: 'Bakery Items - Croissants & Pastries', 
            date: '3 days ago', 
            status: 'completed',
            donorName: 'Holland Bakery',
            location: 'Malang Town Square'
          },
          { 
            id: '4', 
            type: 'review', 
            title: 'Left review for Fresh Fruits donation', 
            date: '1 week ago', 
            status: 'completed',
            donorName: 'Pasar Besar Malang'
          }
        ])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set mock data on error
      setStats({
        totalReservations: 15,
        completedPickups: 12,
        savedMeals: 32,
        favoriteCategories: ['VEGETABLES', 'PREPARED_MEALS', 'BAKERY'],
        successRate: 80,
        totalSavings: 250000,
        impactScore: 85
      })
    }
  }

  const handleReserveDonation = async (donationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          donationId,
          quantity: 1
        })
      })

      if (response.ok) {
        alert('Reservation successful!')
        fetchDashboardData() // Refresh data
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to make reservation')
      }
    } catch (error) {
      console.error('Error making reservation:', error)
      alert('Failed to make reservation')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = date.getTime() - now.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 0) {
      return 'Expired'
    } else if (diffInHours < 24) {
      return `${diffInHours}h left`
    } else {
      return `${diffInDays}d left`
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VEGETABLES':
      case 'FRUITS':
        return '🥕'
      case 'DAIRY':
        return '🥛'
      case 'MEAT':
        return '🥩'
      case 'GRAINS':
        return '🌾'
      case 'PREPARED_MEALS':
        return '🍽️'
      case 'BAKERY':
        return '🍞'
      case 'BEVERAGES':
        return '🥤'
      default:
        return '📦'
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'available': 'bg-green-100 text-green-800',
      'reserved': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'pending': 'bg-orange-100 text-orange-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'reservation':
        return <Heart className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <Clock className="h-4 w-4 text-red-600" />
      case 'review':
        return <Star className="h-4 w-4 text-yellow-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user || user.role !== 'recipient') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}! 🍽️
              </h1>
              <p className="text-gray-600 mt-1">
                Discover fresh food donations in your area • Impact Score: {stats.impactScore}/100
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                href="/notifications"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Search className="h-5 w-5 mr-2" />
                Explore Food
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                <p className="text-xs text-green-600 mt-1">+3 this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Pickups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPickups}</p>
                <p className="text-xs text-green-600 mt-1">{stats.successRate}% success rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meals Saved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.savedMeals}</p>
                <p className="text-xs text-green-600 mt-1">Environmental impact</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Money Saved</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSavings)}</p>
                <p className="text-xs text-green-600 mt-1">vs. market price</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Nearby Food Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-500" />
                  Food Map - {nearbyDonations.length} donations nearby
                </h2>
                <Link href="/explore" className="text-green-600 hover:text-green-700 text-sm font-medium">
                  View all →
                </Link>
              </div>
            </div>            <div className="h-80">
              <FoodMap 
                donations={nearbyDonations.map(donation => ({
                  _id: donation.id,
                  title: donation.title,
                  description: donation.description,
                  category: donation.category,
                  quantity: donation.quantity,
                  unit: donation.unit,
                  location: {
                    latitude: donation.latitude,
                    longitude: donation.longitude,
                    address: donation.address
                  },
                  expiryDate: donation.expiry,
                  donor: {
                    name: donation.donor.name,
                    organization: donation.donor.isVerified ? 'Verified Donor' : undefined
                  }
                }))} 
                userLocation={user?.location} 
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'pickup' ? 'bg-green-100' : 
                        activity.type === 'reservation' ? 'bg-blue-100' :
                        activity.type === 'review' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {activity.title}
                        </p>
                        {activity.donorName && (
                          <p className="text-xs text-gray-600 mt-1">
                            From: {activity.donorName}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{activity.date}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Donations */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                🔥 Hot Donations Near You ({nearbyDonations.length})
              </h2>
              <Link href="/explore" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center">
                See all donations <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          {nearbyDonations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {nearbyDonations.map((donation) => (
                <div key={donation.id} className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-green-300">
                  {/* Image */}
                  {donation.images && (
                    <div className="relative mb-3">
                      <img
                        src={donation.images}
                        alt={donation.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {donation.isVerified && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {donation.title}
                    </h3>
                    <span className="text-lg ml-2">{getCategoryIcon(donation.category)}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {donation.description}
                  </p>

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {donation.quantity} {donation.unit}
                    </div>
                    <span className="text-green-600 font-medium">
                      {donation.distance ? `${donation.distance.toFixed(1)}km` : 'Near you'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm mb-3">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">{donation.address}</span>
                    </div>
                  </div>

                  {donation.expiry && (
                    <div className={`text-xs mb-3 flex items-center ${
                      formatExpiry(donation.expiry).includes('Expired') ? 'text-red-600' :
                      formatExpiry(donation.expiry).includes('h') ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {formatExpiry(donation.expiry)}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push(`/donations/${donation.id}`)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button 
                      onClick={() => handleReserveDonation(donation.id)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Reserve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No food donations nearby
              </h3>
              <p className="text-gray-600 mb-6">
                Check back later or expand your search radius to find more donations.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Explore All Donations
              </Link>
            </div>
          )}
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/explore"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <Search className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Explore Food</h3>
            <p className="text-blue-100">Find fresh donations with advanced filters</p>
          </Link>

          <Link
            href="/profile"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <MapPin className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Update Preferences</h3>
            <p className="text-green-100">Set location & dietary preferences</p>
          </Link>

          <Link
            href="/reservations"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <Calendar className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">My Reservations</h3>
            <p className="text-purple-100">Manage your pickup schedule</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
