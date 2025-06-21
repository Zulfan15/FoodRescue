'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  Filter, 
  Clock, 
  Package,
  Heart,
  Eye,
  CheckCircle,
  Users
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
  donorId: string;
  donor: {
    name: string;
    isVerified: boolean;
  };
  createdAt: string;
  distance?: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'newest' | 'expiry'>('distance');

  const categories = [
    'All Categories',
    'VEGETABLES',
    'FRUITS', 
    'DAIRY',
    'MEAT',
    'GRAINS',
    'PREPARED_MEALS',
    'BAKERY',
    'BEVERAGES',
    'OTHERS'
  ];

  useEffect(() => {
    fetchDonations();
    getUserLocation();
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, searchTerm, sortBy, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Malang city center
          setUserLocation({
            lat: -7.9666,
            lng: 112.6326
          });
        }
      );
    } else {
      // Default location
      setUserLocation({
        lat: -7.9666,
        lng: 112.6326
      });
    }
  };

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('sortBy', sortBy);
      if (userLocation) {
        params.append('latitude', userLocation.lat.toString());
        params.append('longitude', userLocation.lng.toString());
      }

      const response = await fetch(`/api/donations/explore?${params}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All Categories' || 
                           donation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleReserve = async (donationId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          donationId,
          quantity: 1, // Default quantity
        }),
      });

      if (response.ok) {
        alert('Reservation successful!');
        fetchDonations(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to make reservation');
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('Failed to make reservation');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 0) {
      return 'Expired';
    } else if (diffInHours < 24) {
      return `Expires in ${diffInHours}h`;
    } else {
      return `Expires in ${diffInDays}d`;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VEGETABLES':
      case 'FRUITS':
        return '🥕';
      case 'DAIRY':
        return '🥛';
      case 'MEAT':
        return '🥩';
      case 'GRAINS':
        return '🌾';
      case 'PREPARED_MEALS':
        return '🍽️';
      case 'BAKERY':
        return '🍞';
      case 'BEVERAGES':
        return '🥤';
      default:
        return '📦';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MapPin className="h-8 w-8 text-green-500 mr-3" />
                Explore Food Donations
              </h1>
              <p className="text-gray-600 mt-1">
                Find available food donations within your area
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Updated now
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {donations.length} donations
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search donations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'newest' | 'expiry')}
            >
              <option value="distance">Sort by Distance</option>
              <option value="newest">Sort by Newest</option>
              <option value="expiry">Sort by Expiry</option>
            </select>
          </div>
        </div>

        {/* Donations Grid */}
        {filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <div key={donation.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Image */}
                {donation.images && (
                  <div className="relative">
                    <img
                      src={donation.images}
                      alt={donation.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {donation.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4">
                  {/* Title and Category */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 flex-1">
                      {donation.title}
                    </h3>
                    <span className="text-2xl ml-2">{getCategoryIcon(donation.category)}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {donation.description}
                  </p>

                  {/* Quantity and Expiry */}
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Package className="h-4 w-4 mr-1" />
                      {donation.quantity} {donation.unit}
                    </div>
                    <div className={`flex items-center ${
                      formatExpiry(donation.expiry).includes('Expired') 
                        ? 'text-red-500' 
                        : formatExpiry(donation.expiry).includes('h')
                        ? 'text-orange-500'
                        : 'text-green-500'
                    }`}>
                      <Clock className="h-4 w-4 mr-1" />
                      {formatExpiry(donation.expiry)}
                    </div>
                  </div>

                  {/* Location and Distance */}
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{donation.address}</span>
                    {donation.distance && (
                      <span className="ml-auto text-green-600 font-medium">
                        {donation.distance.toFixed(1)}km
                      </span>
                    )}
                  </div>

                  {/* Donor Info */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <span>By {donation.donor.name}</span>
                      {donation.donor.isVerified && (
                        <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                      )}
                    </div>
                    <span className="text-gray-400">{formatTimeAgo(donation.createdAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/donations/${donation.id}`)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleReserve(donation.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No donations found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search filters to find more donations."
                : "No food donations are currently available in your area."}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSortBy('distance');
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
