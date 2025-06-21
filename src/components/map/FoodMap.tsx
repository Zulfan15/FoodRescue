'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const userIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
})

const foodIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGNTk4MGIiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0zIDEyaDNsMy0zaDZsMy4wMDEgM0gyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo=',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
})

L.Marker.prototype.options.icon = defaultIcon

interface Donation {
  _id: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  expiryDate?: string
  donor: {
    name: string
    organization?: string
  }
}

interface UserLocation {
  latitude: number
  longitude: number
  address: string
}

interface FoodMapProps {
  donations: Donation[]
  userLocation?: UserLocation
}

export default function FoodMap({ donations, userLocation }: FoodMapProps) {
  const mapRef = useRef<L.Map>(null)

  // Default center (can be user location or a default city)
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [40.7128, -74.0060] // New York City as default
  useEffect(() => {
    if (mapRef.current && userLocation && donations.length > 0) {
      // Fit map to show user location and all donations
      const allPoints: [number, number][] = [
        [userLocation.latitude, userLocation.longitude],
        ...donations.map(d => [d.location.latitude, d.location.longitude] as [number, number])
      ]
      const bounds = L.latLngBounds(allPoints)
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [donations, userLocation])

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'prepared': '#F59E0B',
      'packaged': '#10B981',
      'fresh': '#22C55E',
      'baked': '#F97316',
      'frozen': '#3B82F6',
      'other': '#6B7280'
    }
    return colors[category] || colors.other
  }

  const formatTimeUntilExpiry = (expiryDate: string): string => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 0) return 'Expired'
    if (diffHours < 24) return `${diffHours}h remaining`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d remaining`
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker and radius */}
      {userLocation && (
        <>
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]} 
            icon={userIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-600">Your Location</h3>
                <p className="text-sm text-gray-600">{userLocation.address}</p>
              </div>
            </Popup>
          </Marker>
          
          {/* 5km radius circle */}
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={5000} // 5km in meters
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 2
            }}
          />
        </>
      )}

      {/* Food donation markers */}
      {donations.map((donation) => (
        <Marker
          key={donation._id}
          position={[donation.location.latitude, donation.location.longitude]}
          icon={foodIcon}
        >
          <Popup maxWidth={300}>
            <div className="p-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {donation.title}
                </h3>
                <span 
                  className="text-xs px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: getCategoryColor(donation.category) }}
                >
                  {donation.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {donation.description}
              </p>
              
              <div className="space-y-1 text-xs text-gray-500">
                <div>Quantity: {donation.quantity} {donation.unit}</div>
                <div>By: {donation.donor.name}{donation.donor.organization && ` (${donation.donor.organization})`}</div>
                <div>Location: {donation.location.address}</div>
                {donation.expiryDate && (
                  <div className="text-orange-600 font-medium">
                    {formatTimeUntilExpiry(donation.expiryDate)}
                  </div>
                )}
              </div>
              
              <button className="w-full mt-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm">
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
