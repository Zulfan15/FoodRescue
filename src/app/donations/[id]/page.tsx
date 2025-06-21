'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MapPin, 
  Clock, 
  User, 
  Package, 
  Calendar,
  MessageSquare,
  Star,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

interface Donation {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  expiry: string;
  images?: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  isVerified: boolean;
  donor: {
    id: string;
    name: string;
    isVerified: boolean;
    phone?: string;
  };
  createdAt: string;
}

export default function DonationDetailPage() {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [reserveData, setReserveData] = useState({
    quantity: 1,
    message: '',
    pickupTime: '',
  });
  const router = useRouter();
  const params = useParams();
  const donationId = params.id as string;

  useEffect(() => {
    if (donationId) {
      fetchDonation();
    }
  }, [donationId]);

  const fetchDonation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/donations/${donationId}`, {
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
        throw new Error('Failed to fetch donation');
      }

      const data = await response.json();
      setDonation(data.donation);
      setReserveData(prev => ({
        ...prev,
        quantity: Math.min(1, data.donation.quantity),
      }));
    } catch (error) {
      console.error('Error fetching donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setReserving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          donationId,
          quantity: reserveData.quantity,
          message: reserveData.message,
          pickupTime: reserveData.pickupTime ? new Date(reserveData.pickupTime).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const data = await response.json();
      alert('Reservation created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      alert(error.message || 'Failed to create reservation');
    } finally {
      setReserving(false);
    }
  };

  const formatExpiry = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const now = new Date();
    const diffInHours = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return 'Expired';
    } else if (diffInHours < 24) {
      return `${diffInHours}h left`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `${diffInDays} days left`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      VEGETABLES: 'bg-green-100 text-green-800',
      FRUITS: 'bg-orange-100 text-orange-800',
      DAIRY: 'bg-blue-100 text-blue-800',
      MEAT: 'bg-red-100 text-red-800',
      GRAINS: 'bg-yellow-100 text-yellow-800',
      PREPARED_MEALS: 'bg-purple-100 text-purple-800',
      BAKERY: 'bg-pink-100 text-pink-800',
      BEVERAGES: 'bg-cyan-100 text-cyan-800',
      OTHERS: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.OTHERS;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation not found</h2>
          <button 
            onClick={() => router.push('/explore')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donation Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{donation.title}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(donation.category)}`}>
                      {donation.category.replace('_', ' ')}
                    </span>
                    {donation.isVerified && (
                      <span className="flex items-center gap-1 text-blue-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{donation.quantity}</p>
                  <p className="text-sm text-gray-600">{donation.unit}</p>
                </div>
              </div>

              {donation.images && (
                <div className="mb-6">
                  <img 
                    src={JSON.parse(donation.images)[0]} 
                    alt={donation.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{donation.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Expires</p>
                      <p className={`font-medium ${
                        new Date(donation.expiry) < new Date() ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {formatExpiry(donation.expiry)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Posted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{donation.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donor Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Donor Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{donation.donor.name}</p>
                    {donation.donor.isVerified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.8 (32 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">15 donations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reserve Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reserve This Donation</h3>
              
              {donation.status === 'AVAILABLE' ? (
                <>
                  {!showReserveForm ? (
                    <button
                      onClick={() => setShowReserveForm(true)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Reserve Now
                    </button>
                  ) : (
                    <form onSubmit={handleReserve} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity (max: {donation.quantity})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={donation.quantity}
                          value={reserveData.quantity}
                          onChange={(e) => setReserveData({ 
                            ...reserveData, 
                            quantity: parseInt(e.target.value) 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message to Donor (optional)
                        </label>
                        <textarea
                          value={reserveData.message}
                          onChange={(e) => setReserveData({ 
                            ...reserveData, 
                            message: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={3}
                          placeholder="Let the donor know when you plan to pick up..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Pickup Time (optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={reserveData.pickupTime}
                          onChange={(e) => setReserveData({ 
                            ...reserveData, 
                            pickupTime: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min={new Date().toISOString().slice(0, 16)}
                          max={new Date(donation.expiry).toISOString().slice(0, 16)}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReserveForm(false)}
                          className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={reserving}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {reserving ? 'Reserving...' : 'Confirm'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">This donation is no longer available</p>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {donation.status}
                  </span>
                </div>
              )}
            </div>

            {/* Contact Info */}
            {donation.donor.phone && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Phone:</p>
                  <p className="font-medium text-gray-900">{donation.donor.phone}</p>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Safety Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Meet in a public, well-lit location</li>
                <li>• Check food quality before accepting</li>
                <li>• Bring your own bags or containers</li>
                <li>• Confirm pickup details with the donor</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
