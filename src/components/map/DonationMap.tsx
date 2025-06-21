'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Donation {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: string;
  category: string;
  quantity: number;
  unit: string;
}

interface DonationMapProps {
  center: { lat: number; lng: number };
  donations: Donation[];
  zoom?: number;
  height?: string;
  onMarkerClick?: (donation: Donation) => void;
}

export default function DonationMap({ 
  center, 
  donations, 
  zoom = 13, 
  height = '400px',
  onMarkerClick 
}: DonationMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Custom marker icon for donations
  const donationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {donations.map((donation) => (
          <Marker
            key={donation.id}
            position={[donation.latitude, donation.longitude]}
            icon={donationIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(donation);
                }
              },
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">{donation.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {donation.quantity} {donation.unit} • {donation.category}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  donation.status === 'AVAILABLE' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {donation.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
