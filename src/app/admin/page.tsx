'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3,
  Users,
  Package,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDonations: number;
  totalReservations: number;
  pendingVerifications: number;
  totalReports: number;
}

interface RecentActivity {
  recentDonations: Array<{
    id: string;
    title: string;
    createdAt: string;
    donor: {
      name: string;
      email: string;
    };
  }>;
  recentReservations: Array<{
    id: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    donation: {
      title: string;
    };
  }>;
}

interface Analytics {
  period: string;
  donationsCount: number;
  reservationsCount: number;
  newUsersCount: number;
  completedDonations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage and monitor FoodRescue platform</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingVerifications}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {analytics && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Monthly Analytics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{analytics.donationsCount}</p>
                <p className="text-sm text-gray-600">New Donations</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analytics.reservationsCount}</p>
                <p className="text-sm text-gray-600">New Reservations</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{analytics.newUsersCount}</p>
                <p className="text-sm text-gray-600">New Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{analytics.completedDonations}</p>
                <p className="text-sm text-gray-600">Completed Donations</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Donations */}
          {recentActivity?.recentDonations && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Donations</h3>
              <div className="space-y-4">
                {recentActivity.recentDonations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{donation.title}</p>
                      <p className="text-sm text-gray-600">by {donation.donor.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reservations */}
          {recentActivity?.recentReservations && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reservations</h3>
              <div className="space-y-4">
                {recentActivity.recentReservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.donation.title}</p>
                      <p className="text-sm text-gray-600">by {reservation.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(reservation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/verifications')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Verify Donations
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Users className="w-5 h-5" />
              Manage Users
            </button>
            <button
              onClick={() => router.push('/admin/reports')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              Handle Reports
            </button>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="flex items-center justify-center gap-2 p-4 border-2 border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
