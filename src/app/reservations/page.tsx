'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Package, User, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Reservation {
  id: string;
  quantity: number;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PICKED_UP' | 'CANCELLED' | 'NO_SHOW';
  pickupTime?: string;
  pickedUpAt?: string;
  createdAt: string;
  donation: {
    id: string;
    title: string;
    category: string;
    unit: string;
    address: string;
    donor: {
      name: string;
      phone?: string;
    };
  };
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const router = useRouter();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/reservations', {
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
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(data.reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReservations(prev => 
          prev.filter(reservation => reservation.id !== reservationId)
        );
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Failed to cancel reservation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    if (filter === 'pending') return reservation.status === 'PENDING';
    if (filter === 'confirmed') return reservation.status === 'CONFIRMED';
    if (filter === 'completed') return ['PICKED_UP', 'CANCELLED', 'NO_SHOW'].includes(reservation.status);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-green-600" />
              My Reservations
            </h1>
            <p className="mt-2 text-gray-600">
              Track and manage your food reservations
            </p>

            {/* Filter */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({reservations.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({reservations.filter(r => r.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'confirmed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed ({reservations.filter(r => r.status === 'CONFIRMED').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed ({reservations.filter(r => ['PICKED_UP', 'CANCELLED', 'NO_SHOW'].includes(r.status)).length})
              </button>
            </div>
          </div>

          {/* Reservations List */}
          <div className="divide-y divide-gray-200">
            {filteredReservations.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reservations found
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? "You haven't made any reservations yet."
                    : `No ${filter} reservations found.`}
                </p>
                <button
                  onClick={() => router.push('/explore')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Explore Donations
                </button>
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {reservation.donation.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {reservation.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{reservation.quantity} {reservation.donation.unit} • {reservation.donation.category}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Donor: {reservation.donation.donor.name}</span>
                          {reservation.donation.donor.phone && (
                            <span className="text-green-600">
                              • {reservation.donation.donor.phone}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{reservation.donation.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Reserved: {new Date(reservation.createdAt).toLocaleString()}</span>
                        </div>

                        {reservation.pickupTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Pickup Time: {new Date(reservation.pickupTime).toLocaleString()}</span>
                          </div>
                        )}

                        {reservation.pickedUpAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Picked up: {new Date(reservation.pickedUpAt).toLocaleString()}</span>
                          </div>
                        )}

                        {reservation.message && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Message:</strong> {reservation.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {reservation.status === 'PENDING' && (
                        <button
                          onClick={() => cancelReservation(reservation.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/donations/${reservation.donation.id}`)}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
