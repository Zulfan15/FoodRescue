'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address: string) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
      
      // Reverse geocoding would go here
      // For now, we'll use a placeholder address
      const address = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`
      onLocationSelect(e.latlng.lat, e.latlng.lng, address)
    },
    locationfound(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
      map.flyTo(e.latlng, map.getZoom())
      
      const address = `Current Location: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
      onLocationSelect(e.latlng.lat, e.latlng.lng, address)
    },
  })

  useEffect(() => {
    // Try to get user's current location
    map.locate()
  }, [map])

  return position === null ? null : (
    <Marker position={position} />
  )
}

export default function LocationPicker({ onLocationSelect, initialLat = -7.2575, initialLng = 112.7521 }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="h-full w-full">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          📍 Click on the map to select pickup location, or allow location access to use your current position
        </p>
      </div>
      
      <MapContainer
        center={[initialLat, initialLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  )
}
