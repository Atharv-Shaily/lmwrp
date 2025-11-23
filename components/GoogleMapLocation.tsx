import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface GoogleMapLocationProps {
  onLocationChange: (location: any) => void;
}

export default function GoogleMapLocation({ onLocationChange }: GoogleMapLocationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([0, 0], 2);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setMarker(lat, lng);
      reverseGeocode(lat, lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.setView([lat, lng], 15);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LiveMart/1.0 (reverse geocoding)',
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      const addr = data.address || {};

      const street = [addr.road, addr.house_number].filter(Boolean).join(' ');
      const cityName = addr.city || addr.town || addr.village || '';
      const stateName = addr.state || '';
      const zip = addr.postcode || '';

      setAddress(street);
      setCity(cityName);
      setState(stateName);
      setZipCode(zip);

      onLocationChange({
        address: street,
        city: cityName,
        state: stateName,
        zipCode: zip,
        coordinates: {
          lat,
          lng,
        },
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const searchAddress = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        searchQuery
      )}&limit=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LiveMart/1.0 (search geocoding)',
          Accept: 'application/json',
        },
      });
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          setMarker(lat, lon);
          await reverseGeocode(lat, lon);
        }
      }
    } catch (error) {
      console.error('Search geocoding error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          id="autocomplete"
          type="text"
          placeholder="Search for an address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          type="button"
          onClick={searchAddress}
          className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm"
        >
          Search
        </button>
      </div>
      <div ref={mapRef} className="w-full h-64 rounded-md border border-gray-300" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Zip Code</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}

