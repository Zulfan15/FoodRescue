'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { Shield, Users, Package, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalDonations: number
  pendingVerifications: number
  activeUsers: number
  totalMealsRescued: number
  successRate: number
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDonations: 0,
    pendingVerifications: 0,
    activeUsers: 0,
    totalMealsRescued: 0,
    successRate: 0
  })
  const [pendingDonations, setPendingDonations] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, isLoading, router])

  const fetchDashboardData = async () => {
    try {
      // Mock data for admin dashboard
      setStats({
        totalUsers: 2847,
        totalDonations: 1563,
        pendingVerifications: 23,
        activeUsers: 1205,
        totalMealsRescued: 8942,
        successRate: 94.2
      })

      setPendingDonations([
        {
          id: '1',
          title: 'Fresh Vegetable Surplus',
          donor: 'Green Garden Restaurant',
          category: 'fresh',
          quantity: 15,
          unit: 'kg',
          submittedAt: '2 hours ago',
          location: 'Downtown Area'
        },
        {
          id: '2',
          title: 'Baked Goods',
          donor: 'City Bakery',
          category: 'baked',
          quantity: 50,
          unit: 'pieces',
          submittedAt: '4 hours ago',
          location: 'Market District'
        },
        {
          id: '3',
          title: 'Prepared Meals',
          donor: 'Community Kitchen',
          category: 'prepared',
          quantity: 30,
          unit: 'servings',
          submittedAt: '6 hours ago',
          location: 'West Side'
        }
      ])

      setRecentActivity([
        { id: 1, type: 'approval', message: 'Approved donation from Mario\'s Pizza', time: '10 minutes ago' },
        { id: 2, type: 'user', message: 'New user registration: Sarah Chen (Recipient)', time: '25 minutes ago' },
        { id: 3, type: 'pickup', message: 'Successful pickup completed - Downtown Bakery', time: '45 minutes ago' },
        { id: 4, type: 'rejection', message: 'Rejected donation due to safety concerns', time: '1 hour ago' }
      ])

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error)
    }
  }

  const handleApproval = async (donationId: string, approved: boolean) => {
    try {
      // In real app, make API call to approve/reject donation
      console.log(`${approved ? 'Approved' : 'Rejected'} donation:`, donationId)
      
      // Remove from pending list
      setPendingDonations(prev => prev.filter(d => d.id !== donationId))
      
      // Add to recent activity
      const newActivity = {
        id: Date.now(),
        type: approved ? 'approval' : 'rejection',
        message: `${approved ? 'Approved' : 'Rejected'} donation`,
        time: 'Just now'
      }
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)])
      
    } catch (error) {
      console.error('Error processing donation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejection':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'user':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'pickup':
        return <Package className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-primary-500 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor platform activity and manage food donations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {stats.pendingVerifications > 0 && (
                <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {stats.pendingVerifications} pending verifications
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meals Rescued</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMealsRescued.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Verifications */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                Pending Verifications ({pendingDonations.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingDonations.length > 0 ? (
                pendingDonations.map((donation) => (
                  <div key={donation.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{donation.title}</h3>
                        <p className="text-sm text-gray-600">by {donation.donor}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{donation.quantity} {donation.unit}</span>
                          <span className="capitalize">{donation.category}</span>
                          <span>{donation.location}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Submitted {donation.submittedAt}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproval(donation.id, true)}
                        className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(donation.id, false)}
                        className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <XCircle className="h-4 w-4 inline mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">All donations verified!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 rounded-full bg-gray-100">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-left">
            <Users className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
            <p className="text-blue-100 text-sm">View and manage user accounts</p>
          </button>

          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-left">
            <Package className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Donations</h3>
            <p className="text-green-100 text-sm">View all platform donations</p>
          </button>

          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-left">
            <TrendingUp className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-purple-100 text-sm">Platform insights and metrics</p>
          </button>

          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-left">
            <AlertTriangle className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Reports</h3>
            <p className="text-orange-100 text-sm">Handle user reports and issues</p>
          </button>
        </div>
      </div>
    </div>
  )
}
